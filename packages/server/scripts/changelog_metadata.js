import { registryPool } from "../config/config.js";

async function migrate() {
  console.log("[Registry Migration] Initializing Change Log Architecture...");
  
  try {
    await registryPool.execute(`
      CREATE TABLE IF NOT EXISTS platform_changelogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        version VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category ENUM('FEATURE', 'FIX', 'SECURITY', 'ARCHITECTURE') NOT NULL DEFAULT 'FEATURE',
        content TEXT NOT NULL,
        released_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("[Registry Migration] SUCCESS: 'platform_changelogs' registry provisioned.");
  } catch (err) {
    console.error("[Registry Migration] FAILURE:", err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
