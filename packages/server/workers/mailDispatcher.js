import cron from "node-cron";
import { db, getTenantPool } from "../config/config.js";
import { sendMail } from "../utils/mailer.js";

/**
 * HSM v2.4 Reliable Mail Dispatcher
 * Background worker that processes the mail_queue and handles SMTP retries.
 * 
 * This worker ensures that even if SMTP connection is refused (ECONNREFUSED),
 * the notification is eventually delivered when connectivity is restored.
 */
export const startMailDispatcher = () => {
  console.log("[mailDispatcher] Background worker activated 🚀 (Scanning every 60s)");

  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      // 1. Fetch pending or failed (up to 5 retries) emails
      // We process in small batches to avoid memory spikes
      const [rows] = await db.query(
        `SELECT * FROM mail_queue 
         WHERE status IN ('pending', 'failed') AND retry_count < 5 
         ORDER BY created_at ASC LIMIT 15`
      );

      if (!rows.length) return;

      console.log(`[mailDispatcher] Processing ${rows.length} staged emails...`);

      for (const mail of rows) {
        try {
          // 2. Prepare Attachments (Base64 string from DB -> Buffer)
          let attachments = [];
          if (mail.attachments) {
            try {
              const parsed = JSON.parse(mail.attachments);
              attachments = parsed.map(item => {
                if (item && item.content && item._isBase64) {
                  item.content = Buffer.from(item.content, "base64");
                  // No need to keep the flag in the final mail options
                  delete item._isBase64;
                }
                return item;
              });
            } catch (err) {
              console.warn(`[mailDispatcher] Failed to parse attachments for mail ${mail.id}:`, err.message);
            }
          }

          // 3. Resolve Institutional Context
          // We pass the institutional pool to mailer.js so it can fetch the correct SMTP settings
          const institutionalPool = getTenantPool(mail.db_cluster);

          // 4. Attempt Dispatch via core mailer
          await sendMail({
            to: mail.to_address,
            subject: mail.subject,
            fromName: mail.from_name,
            fromEmail: mail.from_email,
            html: mail.html_body,
            text: mail.text_body,
            attachments,
            db: institutionalPool
          });

          // 5. Success: Mark as sent
          await db.execute(
            `UPDATE mail_queue SET status = 'sent' WHERE id = ?`,
            [mail.id]
          );
          console.log(`[mailDispatcher] Successfully dispatched staged email ${mail.id} to ${mail.to_address}`);

        } catch (error) {
          console.error(`[mailDispatcher] Dispatch attempt failed for mail ${mail.id}:`, error.message);
          
          // 6. Failure Management: Increment retry count and log telemetry
          await db.execute(
            `UPDATE mail_queue SET status = 'failed', retry_count = retry_count + 1, last_error = ? WHERE id = ?`,
            [error.message || 'UNKNOWN_SMTP_ERROR', mail.id]
          );
        }
      }

      // 7. Automated Housekeeping: Delete sent records older than 7 days
      const [cleanup] = await db.execute(
        `DELETE FROM mail_queue WHERE status = 'sent' AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`
      );
      if (cleanup.affectedRows > 0) {
        console.log(`[mailDispatcher] Pruned ${cleanup.affectedRows} archived mail records.`);
      }

    } catch (err) {
      console.error("[mailDispatcher] Critical polling error:", err.message);
    }
  });
};

export default startMailDispatcher;
