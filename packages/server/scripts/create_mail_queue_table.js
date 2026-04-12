import { db } from "../config/config.js";

async function migrate() {
  try {
    console.log("[migration] Creating mail_queue table...");
    
    // Using a raw query to ensure consistency with existing HSM v2.4 patterns
    await db.execute(`
      CREATE TABLE IF NOT EXISTS mail_queue (
        id INT AUTO_INCREMENT PRIMARY KEY,
        to_address TEXT NOT NULL,
        subject TEXT NOT NULL,
        html_body LONGTEXT,
        text_body TEXT,
        attachments LONGTEXT, -- Stores JSON stringified base64 objects
        status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
        retry_count INT DEFAULT 0,
        last_error TEXT,
        db_cluster VARCHAR(255), -- Identifies the tenant institutional pool
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status_retry (status, retry_count)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("[migration] mail_queue table created successfully ✅");
    process.exit(0);
  } catch (err) {
    console.error("[migration] Failed to create mail_queue table:", err.message);
    process.exit(1);
  }
}

migrate();
