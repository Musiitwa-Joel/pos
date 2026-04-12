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
    // 1. Identify Cluster DB for tenant SMTP isolation
    let dbCluster = 'default';
    if (dbPool && dbPool.pool && dbPool.pool.config && dbPool.pool.config.connectionConfig) {
      dbCluster = dbPool.pool.config.connectionConfig.database || 'default';
    }

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

    // 4. Insert into Master Queue using the master DB pool
    await db.execute(
      `INSERT INTO mail_queue (to_address, subject, from_name, from_email, html_body, text_body, attachments, db_cluster, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [toAddress, subject, fromName || null, fromEmail || null, html || null, text || null, serializedAttachments, dbCluster]
    );

    return { queued: true };
  } catch (error) {
    console.error("[mailQueue] Failed to enqueue mail:", error.message);
    // This is a failure of the persistence layer itself (e.g. DB full)
    return { queued: false, error: error.message };
  }
};

export default { enqueueMail };
