import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function migrateAll() {
  const masterConnection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  console.log("[HSM v2.4] Initiating Platform-Wide RBAC Hardening...");

  try {
    const [databases] = await masterConnection.query("SHOW DATABASES");
    const targets = databases
      .map(db => db.Database)
      .filter(name => name.startsWith("tred_") || name === "tredpos_registry");

    console.log(`-> Detected Clusters: ${targets.join(", ")}`);

    for (const dbName of targets) {
      console.log(`\n-- Hardening Cluster: [${dbName}] --`);
      try {
        await masterConnection.query(`USE \`${dbName}\``);

        // 1. Roles Table
        const [rolesItems] = await masterConnection.query("SHOW TABLES LIKE 'roles'");
        if (rolesItems.length > 0) {
          const [rolesColumns] = await masterConnection.query("SHOW COLUMNS FROM roles LIKE 'authorized_modules'");
          if (rolesColumns.length === 0) {
            console.log("   -> Patching 'roles': Adding 'authorized_modules'...");
            await masterConnection.query("ALTER TABLE roles ADD COLUMN authorized_modules TEXT");
            console.log("      [SUCCESS]");
          } else {
            console.log("   -> 'roles' already hardened.");
          }
        }

        // 2. Users Table
        const [usersItems] = await masterConnection.query("SHOW TABLES LIKE 'users'");
        if (usersItems.length > 0) {
          const [usersColumns] = await masterConnection.query("SHOW COLUMNS FROM users");
          const columnNames = usersColumns.map(c => c.Field.toLowerCase());

          if (!columnNames.includes('authorized_modules')) {
            console.log("   -> Patching 'users': Adding 'authorized_modules'...");
            await masterConnection.query("ALTER TABLE users ADD COLUMN authorized_modules TEXT AFTER role");
          }
          if (!columnNames.includes('profile_picture')) {
            console.log("   -> Patching 'users': Adding 'profile_picture'...");
            await masterConnection.query("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) AFTER authorized_modules");
          }
          if (!columnNames.includes('otp_secret')) {
            console.log("   -> Patching 'users': Adding 'otp_secret'...");
            await masterConnection.query("ALTER TABLE users ADD COLUMN otp_secret VARCHAR(255) AFTER password_hash");
          }
          console.log("   -> 'users' table check complete.");
        }
      } catch (dbErr) {
        console.error(`   !! Cluster [${dbName}] failed:`, dbErr.message);
      }
    }

  } catch (err) {
    console.error("!! Global Hardening Failed:", err.message);
  } finally {
    await masterConnection.end();
    console.log("\n[HSM v2.4] Platform-Wide Hardening Concluded.");
  }
}

migrateAll();
