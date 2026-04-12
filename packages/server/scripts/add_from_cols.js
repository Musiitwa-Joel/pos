import { db } from "../config/config.js";

async function migrate() {
  try {
    console.log("[migration] Adding branding columns to mail_queue...");
    await db.execute("ALTER TABLE mail_queue ADD COLUMN from_name VARCHAR(255) AFTER subject, ADD COLUMN from_email VARCHAR(255) AFTER from_name");
    console.log("[migration] Branding columns added successfully ✅");
    process.exit(0);
  } catch (err) {
    console.warn("[migration] Columns might already exist or migration failed:", err.message);
    process.exit(1);
  }
}

migrate();
