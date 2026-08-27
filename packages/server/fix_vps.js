import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { INVENTORY_SCHEMA_SQL } from "./utils/schema.js";

dotenv.config();

async function fixVpsArchitecture() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  console.log("🚀 [TredPOS Production Fix] Initiating Structural Repair...");

  try {
    const [databases] = await connection.query("SHOW DATABASES");
    const targets = databases
      .map(db => db.Database)
      .filter(name => name.startsWith("tred_") || name === "tredpos_registry");

    console.log(`📡 Detected Clusters: ${targets.join(", ")}`);

    for (const dbName of targets) {
      console.log(`\n🛠️  Repairing Cluster: [${dbName}]`);
      await connection.query(`USE \`${dbName}\``);

      // 1. Provision Missing Tables (Repairing broken clusters like 'tredumo')
      console.log("   -> Checking for missing tables...");
      const CORE_TABLES = [
        ...INVENTORY_SCHEMA_SQL,
        `CREATE TABLE IF NOT EXISTS roles (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          authorized_modules TEXT
        ) ENGINE=MyISAM`,
        `CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255),
          username VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) UNIQUE,
          password_hash VARCHAR(255),
          otp_secret VARCHAR(255),
          role VARCHAR(100) DEFAULT 'PENDING_ASSIGNMENT',
          employee_id VARCHAR(50),
          is_active BOOLEAN DEFAULT TRUE,
          authorized_modules TEXT,
          profile_picture VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=MyISAM`,
        `CREATE TABLE IF NOT EXISTS system_settings (
          setting_key VARCHAR(100) PRIMARY KEY,
          setting_value TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=MyISAM`
      ];

      for (const sql of CORE_TABLES) {
        try {
          await connection.query(sql);
        } catch (err) {
          console.warn(`      ! Schema warning in ${dbName}: ${err.message}`);
        }
      }

      // 2. Patch Existing Tables (Adding missing columns)
      console.log("   -> Patching user and role columns...");
      const [usersColumns] = await connection.query("SHOW COLUMNS FROM users");
      const userColNames = usersColumns.map(c => c.Field.toLowerCase());

      if (!userColNames.includes('authorized_modules')) {
        await connection.query("ALTER TABLE users ADD COLUMN authorized_modules TEXT AFTER role");
      }
      if (!userColNames.includes('profile_picture')) {
        await connection.query("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) AFTER authorized_modules");
      }
      if (!userColNames.includes('otp_secret')) {
        await connection.query("ALTER TABLE users ADD COLUMN otp_secret VARCHAR(255) AFTER password_hash");
      }

      const [rolesColumns] = await connection.query("SHOW COLUMNS FROM roles");
      const roleColNames = rolesColumns.map(c => c.Field.toLowerCase());
      if (!roleColNames.includes('authorized_modules')) {
        await connection.query("ALTER TABLE roles ADD COLUMN authorized_modules TEXT");
      }

      console.log(`   ✅ Cluster [${dbName}] is now operational.`);
    }

  } catch (err) {
    console.error("❌ Critical Fix Failure:", err.message);
  } finally {
    await connection.end();
    console.log("\n🚀 [TredPOS Production Fix] Structural Repair Concluded.");
  }
}

fixVpsArchitecture();
