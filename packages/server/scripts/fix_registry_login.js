import { registryPool } from '../utils/registry.js';
import bcrypt from 'bcrypt';

async function fixRegistryLogin() {
  console.log("🚀 [Vanguard Hub] Starting Institutional Identity Migration...");

  try {
    // 🛠️ 1. Create Employees Table (Required for Login JOIN)
    console.log("- Provisioning Employees Registry...");
    await registryPool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(255),
        status ENUM('active', 'terminated') DEFAULT 'active',
        joined_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 🛠️ 2. Fix Users Table Schema (Add employee_id)
    console.log("- Patching Users Schema...");
    // We try to add the column. If it exists, it will throw, so we check first.
    const [columns] = await registryPool.query("SHOW COLUMNS FROM users LIKE 'employee_id'");
    if (columns.length === 0) {
      await registryPool.query("ALTER TABLE users ADD COLUMN employee_id VARCHAR(50) AFTER role");
      console.log("  [SUCCESS] Column 'employee_id' added.");
    } else {
      console.log("  [INFO] Column 'employee_id' already exists.");
    }

    // 🛠️ 3. Seed Master CEO Account
    console.log("- Seeding CEO Mastery Identity...");
    const ceoId = 'VANGUARD_CEO_ROOT';
    const email = 'ceo@tredpos.com';
    const password = 'vanguard720';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await registryPool.query(`
      INSERT INTO users (id, username, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE role = 'hq-ceo', password_hash = ?
    `, [ceoId, email, email, hash, 'hq-ceo', hash]);

    console.log("✅ [Vanguard Hub] Migration Complete. CEO Login Is Now Stable.");
    process.exit(0);
  } catch (err) {
    console.error("❌ [Vanguard Hub] Migration Failure:", err.message);
    process.exit(1);
  }
}

fixRegistryLogin();
