import { db } from "../config/config.js";

/**
 * HSM v2.4 Reliable Mail Queue Provider
 * Enqueues an email for background dispatch to avoid blocking sales transactions.
 * This ensures notifications survive SMTP provider timeouts or connection refused errors.
 */
export const enqueueMail = async ({
  to,
  subject,
  html,
  text,
  attachments,
  fromName,
  fromEmail,
  dbPool = null,
}) => {
  try {
    // 1. Identify Target Registry
    // If no dbPool is provided, we fallback to the default global pool (legacy support)
    const targetDb = dbPool || db;

    // 2. Normalize Recipients
    const toAddress = Array.isArray(to) ? to.join(", ") : String(to);

    // 3. Serialize Attachments (Buffer -> Base64) for DB storage
    let serializedAttachments = null;
    if (Array.isArray(attachments) && attachments.length) {
      serializedAttachments = JSON.stringify(attachments.map(item => {
        if (!item) return null;
        const copy = { ...item };
        // If content is a Buffer, convert to base64 for JSON serialization
        if (copy.content && Buffer.isBuffer(copy.content)) {
          copy.content = copy.content.toString("base64");
          copy._isBase64 = true; // Metatag for dispatcher deserialization
        }
        return copy;
      }).filter(Boolean));
    }

    // 🛡️ Self-Healing Pre-flight: Ensure mail_queue table exists in this institution
    try {
      await targetDb.query(`
        CREATE TABLE IF NOT EXISTS mail_queue (
          id INT AUTO_INCREMENT PRIMARY KEY,
          to_address TEXT NOT NULL,
          subject VARCHAR(255) NOT NULL,
          from_name VARCHAR(255),
          from_email VARCHAR(255),
          html_body LONGTEXT,
          text_body LONGTEXT,
          attachments JSON,
          status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
          retry_count INT DEFAULT 0,
          last_error TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (e) { /* ignore if already exists */ }

    // 4. Insert into Institutional Registry
    await targetDb.execute(
      `INSERT INTO mail_queue (to_address, subject, from_name, from_email, html_body, text_body, attachments, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [toAddress, subject, fromName || null, fromEmail || null, html || null, text || null, serializedAttachments]
    );

    return { queued: true };
  } catch (error) {
    console.error("[mailQueue] Failed to enqueue mail:", error.message);
    return { queued: false, error: error.message };
  }
};

export default { enqueueMail };
