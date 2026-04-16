import cron from "node-cron";
import { getTenantPool, registryPool } from "../config/config.js";
import { sendMail } from "../utils/mailer.js";

/**
 * HSM v2.4 Multi-Tenant Institutional Mail Dispatcher
 * Background worker that iterates through all business clusters,
 * processing their local mail_queue registries and handling SMTP retries.
 * 
 * DESIGN VANGUARD: This worker ensures institutional isolation by never 
 * mixing communications between different business registries.
 */
export const startMailDispatcher = () => {
  console.log("[mailDispatcher] Decentralized Worker Activated 🚀 (Scanning All Institutions every 60s)");

  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      // 1. Identify all active Institutional Registry Clusters
      const [tenants] = await registryPool.query(
        "SELECT id, db_name, name FROM tenants WHERE status = 'active'"
      );

      if (!tenants.length) return;

      for (const tenant of tenants) {
        try {
          const tenantDb = getTenantPool(tenant.db_name);

          // 2. Fetch pending or failed (up to 5 retries) emails from this institution's localized registry
          const [rows] = await tenantDb.query(
            `SELECT * FROM mail_queue 
             WHERE status IN ('pending', 'failed') AND retry_count < 5 
             ORDER BY created_at ASC LIMIT 10`
          );

          if (!rows.length) continue;

          console.log(`[mailDispatcher] [${tenant.name}] Processing ${rows.length} institutional emails...`);

          for (const mail of rows) {
            try {
              // 3. Prepare Attachments (Base64 string from DB -> Buffer)
              let attachments = [];
              if (mail.attachments) {
                try {
                  const parsed = typeof mail.attachments === 'string' ? JSON.parse(mail.attachments) : mail.attachments;
                  attachments = parsed.map(item => {
                    if (item && item.content && item._isBase64) {
                      item.content = Buffer.from(item.content, "base64");
                      delete item._isBase64;
                    }
                    return item;
                  });
                } catch (err) {
                  console.warn(`[mailDispatcher] [${tenant.name}] Attachment failure for mail ${mail.id}:`, err.message);
                }
              }

              // 4. Attempt Dispatch via core mailer (inherits SMTP settings from tenantDb)
              await sendMail({
                to: mail.to_address,
                subject: mail.subject,
                fromName: mail.from_name,
                fromEmail: mail.from_email,
                html: mail.html_body,
                text: mail.text_body,
                attachments,
                db: tenantDb
              });

              // 🛡️ [VANGUARD] ATOMIC PURGE PROTOCOL:
              // Immediately delete from institutional registry upon successful dispatch.
              await tenantDb.execute("DELETE FROM mail_queue WHERE id = ?", [mail.id]);
              console.log(`[mailDispatcher] [${tenant.name}] Successfully dispatched and PURGED mail ${mail.id}`);

            } catch (error) {
              console.error(`[mailDispatcher] [${tenant.name}] Dispatch failure for mail ${mail.id}:`, error.message);
              
              // 5. Failure Management: Increment local retry count and log telemetry
              await tenantDb.execute(
                `UPDATE mail_queue SET status = 'failed', retry_count = retry_count + 1, last_error = ? WHERE id = ?`,
                [error.message || 'UNKNOWN_SMTP_ERROR', mail.id]
              );
            }
          }
        } catch (tenantErr) {
          if (tenantErr.code === 'ER_NO_SUCH_TABLE') {
            // Institutional Registry not yet provisioned; wait for first auto-provisioning event
            continue;
          }
          console.error(`[mailDispatcher] Cluster error for ${tenant.db_name}:`, tenantErr.message);
        }
      }
    } catch (err) {
      console.error("[mailDispatcher] Critical Institutional Discovery Failure:", err.message);
    }
  });
};

export default startMailDispatcher;
