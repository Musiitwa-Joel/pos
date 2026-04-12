import { db } from "../config/config.js";
import bcrypt from "bcrypt";
import { v7 as uuidv7 } from "uuid";

const HR_SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    salary DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('active', 'on_leave', 'terminated') DEFAULT 'active',
    joined_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=MyISAM`,
];

const USER_SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'cashier', 'staff') DEFAULT 'staff',
    employee_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_employee (employee_id),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
  ) ENGINE=MyISAM`
];

async function createAdmin() {
  try {
    console.log("Ensuring tables exist with MyISAM engine to bypass MariaDB corruption...");
    for (const sql of HR_SCHEMA_SQL) {
      await db.query(sql);
    }
    for (const sql of USER_SCHEMA_SQL) {
      await db.query(sql);
    }
    console.log("Tables created successfully.");

    const employeeId = uuidv7();
    const userId = uuidv7();
    const username = "admin@example.com";
    const password = "password123";

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create a dummy employee
    await db.query(
      "INSERT IGNORE INTO employees (id, name, role, phone, email, status, joined_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        employeeId,
        "System Admin",
        "Admin",
        "0000000000",
        username,
        "active",
        new Date().toISOString().split("T")[0],
      ]
    );

    // Check if user already exists
    const [existing] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (existing.length === 0) {
        // Create the admin user
        await db.query(
        "INSERT INTO users (id, username, password_hash, role, employee_id) VALUES (?, ?, ?, ?, ?)",
        [userId, username, passwordHash, "admin", employeeId]
        );
        console.log("Admin user created successfully!");
        console.log("Username: " + username);
        console.log("Password: " + password);
    } else {
        console.log("Admin user already exists with username: " + username);
    }
  } catch (error) {
    console.error("Error creating admin:", error.message);
  } finally {
    process.exit(0);
  }
}

createAdmin();
