import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function migrateAll() {
  const masterConnection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  console.log("[HSM v2.4] Initiating Platform-Wide RBAC & Schema Hardening...");

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
          }
          console.log("   -> Standardizing 'roles' collation to utf8mb4_unicode_ci...");
          await masterConnection.query("ALTER TABLE roles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        }

        // 2. Users Table
        const [usersItems] = await masterConnection.query("SHOW TABLES LIKE 'users'");
        if (usersItems.length > 0) {
          const [usersColumns] = await masterConnection.query("SHOW COLUMNS FROM users");
          const columnNames = usersColumns.map(c => c.Field.toLowerCase());

          if (!columnNames.includes('name')) {
            console.log("   -> Patching 'users': Adding 'name'...");
            await masterConnection.query("ALTER TABLE users ADD COLUMN name VARCHAR(255) AFTER id");
          }
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
          if (!columnNames.includes('employee_id')) {
            console.log("   -> Patching 'users': Adding 'employee_id'...");
            await masterConnection.query("ALTER TABLE users ADD COLUMN employee_id VARCHAR(50) AFTER role");
          }
          
          // Modify role to VARCHAR(100) to support dynamic and uppercase role names
          console.log("   -> Modifying 'users.role' to VARCHAR(100)...");
          await masterConnection.query("ALTER TABLE users MODIFY COLUMN role VARCHAR(100) DEFAULT 'PENDING_ASSIGNMENT'");

          console.log("   -> Standardizing 'users' collation to utf8mb4_unicode_ci...");
          await masterConnection.query("ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        }

        // 3. Employees Table
        const [empItems] = await masterConnection.query("SHOW TABLES LIKE 'employees'");
        if (empItems.length === 0) {
          console.log("   -> Creating missing 'employees' table...");
          await masterConnection.query(`
            CREATE TABLE IF NOT EXISTS employees (
              id VARCHAR(50) PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              role VARCHAR(100) NOT NULL,
              phone VARCHAR(20) NOT NULL,
              email VARCHAR(255),
              salary DECIMAL(10, 2) DEFAULT 0.00,
              status ENUM('active', 'on_leave', 'terminated') DEFAULT 'active',
              joined_date DATE NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_role (role),
              INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `);
        } else {
          console.log("   -> Standardizing 'employees' collation to utf8mb4_unicode_ci...");
          await masterConnection.query("ALTER TABLE employees CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        }

        // 4. Attendance Table
        const [attItems] = await masterConnection.query("SHOW TABLES LIKE 'attendance'");
        if (attItems.length === 0) {
          console.log("   -> Creating missing 'attendance' table...");
          await masterConnection.query(`
            CREATE TABLE IF NOT EXISTS attendance (
              id INT AUTO_INCREMENT PRIMARY KEY,
              employee_id VARCHAR(50) NOT NULL,
              date DATE NOT NULL,
              check_in DATETIME NOT NULL,
              check_out DATETIME,
              status ENUM('present', 'late', 'absent') DEFAULT 'present',
              FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
              INDEX idx_emp_date (employee_id, date),
              INDEX idx_date (date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `);
        } else {
          console.log("   -> Standardizing 'attendance' collation to utf8mb4_unicode_ci...");
          await masterConnection.query("ALTER TABLE attendance CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        }

        // 5. Payroll Records Table
        const [payItems] = await masterConnection.query("SHOW TABLES LIKE 'payroll_records'");
        if (payItems.length === 0) {
          console.log("   -> Creating missing 'payroll_records' table...");
          await masterConnection.query(`
            CREATE TABLE IF NOT EXISTS payroll_records (
              id INT AUTO_INCREMENT PRIMARY KEY,
              employee_id VARCHAR(50) NOT NULL,
              period_month TINYINT NOT NULL,
              period_year SMALLINT NOT NULL,
              gross_salary DECIMAL(10, 2) NOT NULL,
              tax_deductions DECIMAL(10, 2) DEFAULT 0.00,
              net_salary DECIMAL(10, 2) NOT NULL,
              processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `);
        } else {
          console.log("   -> Standardizing 'payroll_records' collation to utf8mb4_unicode_ci...");
          await masterConnection.query("ALTER TABLE payroll_records CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        }

        console.log(`   -> Cluster [${dbName}] successfully hardened.`);
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
