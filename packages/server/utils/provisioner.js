import { db, getTenantPool } from "../config/config.js";
import { INVENTORY_SCHEMA_SQL } from "./schema.js";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { sendMail } from "./mailer.js";

/**
 * HSM v2.4 Institutional Provisioner Factory
 * Deploying dedicated infrastructures for new TredPOS Institutions.
 */

export const provisionInstitution = async (tenantData, password) => {
  const { id, name, db_name, owner_email } = tenantData;
  console.log(`[Tredpos Factory] Initializing Institutional Setup for: ${name} (${db_name})`);

  try {
    // 1. Create the dedicated database
    await db.query(`CREATE DATABASE IF NOT EXISTS \`${db_name}\``);
    console.log(`[Tredpos Factory] Database Provisioned: ${db_name}`);

    // 2. Get the new tenant pool to run schemas
    const tenantPool = getTenantPool(db_name);

    // 3. Deploy Mandatory Schemas (Institutional Blueprint)
    const SCHEMAS = [
      ...INVENTORY_SCHEMA_SQL,
      `CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        authorized_modules TEXT
      ) ENGINE=MyISAM`,
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
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        role VARCHAR(100) DEFAULT 'PENDING_ASSIGNMENT',
        employee_id VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        authorized_modules TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_employee (employee_id),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
      ) ENGINE=MyISAM`,
      `CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=MyISAM`,
      `CREATE TABLE IF NOT EXISTS cashier_shifts (
        id VARCHAR(50) PRIMARY KEY,
        cashier_id VARCHAR(50),
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        opening_cash DECIMAL(10,2) DEFAULT 0.00,
        expected_cash DECIMAL(10,2) DEFAULT 0.00,
        actual_cash DECIMAL(10,2) DEFAULT 0.00,
        variance DECIMAL(10,2) DEFAULT 0.00,
        status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN'
      ) ENGINE=MyISAM`,
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50),
        action VARCHAR(255) NOT NULL,
        target VARCHAR(255),
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=MyISAM`,
      `CREATE TABLE IF NOT EXISTS sale_returns (
        id VARCHAR(50) PRIMARY KEY,
        sale_id VARCHAR(50) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        quantity INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        reason TEXT,
        authorized_by VARCHAR(50),
        shift_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=MyISAM`,
      `CREATE TABLE IF NOT EXISTS customer_payments (
        id VARCHAR(50) PRIMARY KEY,
        customer_id VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        referenced_sale_id VARCHAR(50),
        shift_id VARCHAR(50),
        recorded_by VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=MyISAM`,
      `CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(512) NOT NULL,
        slug VARCHAR(512) UNIQUE NOT NULL,
        content LONGTEXT NOT NULL,
        image_url TEXT,
        excerpt TEXT,
        author VARCHAR(255),
        category VARCHAR(255),
        is_draft BOOLEAN DEFAULT TRUE,
        published_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_published (published_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        company VARCHAR(255),
        content TEXT NOT NULL,
        avatar_url TEXT,
        rating INT DEFAULT 5,
        impact VARCHAR(255),
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_featured (is_featured)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS case_studies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(512) NOT NULL,
        slug VARCHAR(512) UNIQUE NOT NULL,
        client_name VARCHAR(255),
        industry VARCHAR(255),
        metric VARCHAR(255),
        metric_label VARCHAR(255),
        content LONGTEXT NOT NULL,
        image_url TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_featured (is_featured)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS about_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        section_type ENUM('TIMELINE', 'TEAM', 'HERO', 'VALUE', 'GENERAL') NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        content TEXT,
        image_url TEXT,
        icon_name VARCHAR(255),
        order_index INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order (order_index)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS press_releases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(512) NOT NULL,
        source VARCHAR(255),
        link TEXT,
        excerpt TEXT,
        published_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_date (published_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    ];

    for (const sql of SCHEMAS) {
      await tenantPool.query(sql);
    }
    console.log(`[Tredpos Factory] Institutional Schema Deployed.`);

    // 4. Institutional Identity Seeding (Strict Isolation)
    try {
      // 🛡️ [VANGUARD] Institutional Hardening: Only provision the Master ADMIN role. 
      // Zero-cloning protocol ensures no data leak between business clusters.
      const adminRoleId = uuidv7();
      const allModules = ['dashboard', 'pos', 'inventory', 'credit', 'hr', 'sales', 'reports', 'suppliers', 'expenses', 'returns', 'settings'];
      
      await tenantPool.query(
        `INSERT INTO \`${db_name}\`.roles (id, name, description, authorized_modules) VALUES (?, ?, ?, ?)`,
        [adminRoleId, 'ADMIN', 'Institutional Administrator with full access rights', JSON.stringify(allModules)]
      );

      console.log(`[Tredpos Factory] Institutional Admin Identity Provisioned and Isolated.`);
    } catch (err) {
      console.warn(`[Tredpos Factory] Identity Seeding Warning: ${err.message}`);
    }

    // 5. Provision the Master Institutional Administrator
    const adminId = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    await tenantPool.query(
      `INSERT INTO \`${db_name}\`.users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, 'ADMIN')`,
      [adminId, owner_email, owner_email, passwordHash]
    );
    console.log(`[Tredpos Factory] Institutional Administrator Provisioned.`);

    // 5.5 Seed Institutional Metadata into Settings (Institutional Identity Core)
    const { physical_location, support_phone } = tenantData;
    const settingsToSeed = [
      ['COMPANY_NAME', name],
      ['LOCATION', physical_location || ''],
      ['SUPPORT_PHONE', support_phone || ''],
      ['CONTACT_EMAIL', owner_email],
      ['CURRENCY', 'UGX'],
      ['CURRENCY_SYMBOL', 'UGX (UGANDAN SHILLING)']
    ];

    for (const [key, val] of settingsToSeed) {
      await tenantPool.query(
        "INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
        [key, val, val]
      );
    }
    console.log(`[Tredpos Factory] Institutional Metadata Seeded.`);

    // 6. Send Tredpos Welcome Communication
    try {
      await sendMail({
        to: owner_email,
        subject: "Welcome to TREDPOS Industries - Institutional Deployment Complete",
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
            <div style="background: #000; padding: 20px; text-align: center;">
              <h1 style="color: #FF6B00; margin: 0; text-transform: uppercase; letter-spacing: 2px;">TREDPOS Industries</h1>
            </div>
            <div style="padding: 20px;">
              <p>Dear <strong>${name}</strong>,</p>
              <p>We are pleased to warmly welcome you to <strong>TREDPOS Industries</strong>.</p>
              <p>Thank you for choosing to partner with us. We are excited to have your business onboard and look forward to supporting your operations with efficient, reliable, and innovative solutions tailored to your needs.</p>
              <p>At TREDPOS Industries, our goal is to streamline your business processes—particularly in areas such as sales management, inventory tracking, and financial reporting—so you can focus on growth and delivering value to your customers.</p>
              <p>Our team is committed to ensuring a smooth onboarding experience. Should you require any assistance, guidance, or customization, please do not hesitate to reach out. We are here to support you every step of the way.</p>
              <p>Once again, welcome to TREDPOS Industries. We look forward to a successful and long-lasting partnership.</p>
              <p>Warm regards,<br>The Tredpos Deployment Team</p>
            </div>
            <div style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 10px; color: #999;">
              This is an automated system communication from HSM v2.4 Tredpos Factory.
            </div>
          </div>
        `
      });
      console.log(`[Tredpos Factory] Welcome Communication Dispatched to ${owner_email}.`);
    } catch (mailErr) {
      console.error(`[Tredpos Factory] Communication Failure:`, mailErr.message);
    }

    return { success: true, db_name };
  } catch (err) {
    console.error(`[Tredpos Factory] Institutional Deployment Critical Failure:`, err.message);
    throw new Error(`Factory Failure: ${err.message}`);
  }
};
