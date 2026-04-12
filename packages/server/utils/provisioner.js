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
  console.log(`[Vanguard Factory] Initializing Institutional Setup for: ${name} (${db_name})`);

  try {
    // 1. Create the dedicated database
    await db.query(`CREATE DATABASE IF NOT EXISTS \`${db_name}\``);
    console.log(`[Vanguard Factory] Database Provisioned: ${db_name}`);

    // 2. Get the new tenant pool to run schemas
    const tenantPool = getTenantPool(db_name);

    // 3. Deploy Mandatory Schemas (Institutional Blueprint)
    const SCHEMAS = [
      ...INVENTORY_SCHEMA_SQL,
      `CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT
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
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        role ENUM('admin', 'manager', 'cashier', 'staff') DEFAULT 'staff',
        employee_id VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
      ) ENGINE=MyISAM`
    ];

    for (const sql of SCHEMAS) {
      await tenantPool.query(sql);
    }
    console.log(`[Vanguard Factory] Institutional Schema Deployed.`);

    // 4. Institutional Role Migration (Pre-approved Static Data)
    try {
      // Migrate from current 'tred_hardware' database - ensures standard security groups are available
      await tenantPool.query(`INSERT IGNORE INTO \`${db_name}\`.roles (id, name, description) SELECT id, name, description FROM \`tred_hardware\`.roles`);
      console.log(`[Vanguard Factory] Institutional Roles Synchronized.`);
    } catch (err) {
      console.warn(`[Vanguard Factory] Role Migration Warning: ${err.message}`);
    }

    // 5. Provision the Master Institutional Administrator
    const adminId = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    
    await tenantPool.query(
      `INSERT INTO \`${db_name}\`.users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, 'admin')`,
      [adminId, owner_email, owner_email, passwordHash]
    );
    console.log(`[Vanguard Factory] Institutional Administrator Provisioned.`);

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
    console.log(`[Vanguard Factory] Institutional Metadata Seeded.`);

    // 6. Send Vanguard Welcome Communication
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
              <p>Warm regards,<br>The Vanguard Deployment Team</p>
            </div>
            <div style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 10px; color: #999;">
              This is an automated system communication from HSM v2.4 Vanguard Factory.
            </div>
          </div>
        `
      });
      console.log(`[Vanguard Factory] Welcome Communication Dispatched to ${owner_email}.`);
    } catch (mailErr) {
      console.error(`[Vanguard Factory] Communication Failure:`, mailErr.message);
    }

    return { success: true, db_name };
  } catch (err) {
    console.error(`[Vanguard Factory] Institutional Deployment Critical Failure:`, err.message);
    throw new Error(`Factory Failure: ${err.message}`);
  }
};
