import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { registryPool, getTenantPool } from "../config/config.js";

/**
 * HSM v2.4 Institutional Registry Hub
 * This utility manages the global mapping of operators to their dedicated databases.
 */

export const REGISTRY_SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS billing_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    monthly_fee DECIMAL(15,2) NOT NULL,
    features TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS platform_blog_posts (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS platform_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    company VARCHAR(255),
    content TEXT NOT NULL,
    avatar_url TEXT,
    rating INT DEFAULT 5,
    impact VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS platform_case_studies (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS platform_about_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_type ENUM('TIMELINE', 'TEAM', 'HERO', 'VALUE', 'GENERAL') NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    content TEXT,
    image_url TEXT,
    icon_name VARCHAR(255),
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS platform_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    location VARCHAR(255),
    type VARCHAR(50),
    description TEXT,
    requirements TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS platform_careers_perks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_name VARCHAR(255),
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS platform_press_releases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(512) NOT NULL,
    source VARCHAR(255),
    link TEXT,
    excerpt TEXT,
    published_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS platform_inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('pending', 'read', 'archived') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS website_config (
    config_key VARCHAR(255) PRIMARY KEY,
    config_value LONGTEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    physical_location VARCHAR(255),
    support_email VARCHAR(255),
    support_phone VARCHAR(50),
    db_name VARCHAR(100) NOT NULL UNIQUE,
    owner_email VARCHAR(255),
    plan_id VARCHAR(50),
    payment_status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
    status ENUM('active', 'suspended', 'provisioning') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_owner (owner_email),
    INDEX idx_db (db_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS system_payments (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    period_label VARCHAR(50), -- e.g. "April 2026"
    recorded_by VARCHAR(50),
    status ENUM('pending', 'paid', 'failed') DEFAULT 'paid',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS operator_mappings (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    role VARCHAR(50) DEFAULT 'staff',
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_email (email),
    UNIQUE KEY (email, tenant_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role ENUM('admin', 'manager', 'cashier', 'staff', 'hq-ceo') DEFAULT 'staff',
    employee_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    status ENUM('active', 'terminated') DEFAULT 'active',
    joined_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS registry_lifecycle_events (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50),
    event_type VARCHAR(50) NOT NULL,
    description TEXT,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant (tenant_id),
    INDEX idx_event (event_type)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS platform_kb_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    type ENUM('HELP', 'API', 'SECURITY') NOT NULL,
    icon_name VARCHAR(255),
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (slug, type)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS platform_kb_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    kb_type ENUM('HELP', 'API', 'SECURITY') NOT NULL,
    icon_name VARCHAR(255),
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES platform_kb_categories(id) ON DELETE SET NULL,
    UNIQUE KEY (slug, kb_type)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS platform_status_components (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('OPERATIONAL', 'DEGRADED', 'PARTIAL_OUTAGE', 'MAJOR_OUTAGE') DEFAULT 'OPERATIONAL',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS platform_status_incidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED') DEFAULT 'INVESTIGATING',
    impact ENUM('NONE', 'MINOR', 'MAJOR', 'CRITICAL') DEFAULT 'NONE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS otp_replay_ledger (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_hash (email, code_hash),
    INDEX idx_expires (expires_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
];

export const initializeRegistry = async () => {
  console.log("[Registry Hub] Initializing Institutional Gateway...");
  try {
    for (const sql of REGISTRY_SCHEMA_SQL) {
      await registryPool.query(sql);
    }

    // 🛠️ Atomic Patch: Ensure 'is_used' column exists in otp_replay_ledger
    const [otpCols] = await registryPool.query("SHOW COLUMNS FROM otp_replay_ledger LIKE 'is_used'");
    if (otpCols.length === 0) {
      console.log("[Registry Hub] Patching 'otp_replay_ledger': Adding is_used flag...");
      await registryPool.query("ALTER TABLE otp_replay_ledger ADD COLUMN is_used BOOLEAN DEFAULT FALSE AFTER code_hash");
    }

    // 🛠️ Atomic Patch: Ensure the 'employee_id' column exists for login join stability
    const [cols] = await registryPool.query("SHOW COLUMNS FROM users LIKE 'employee_id'");
    if (cols.length === 0) {
      console.log("[Registry Hub] Critical Patch: Adding missing 'employee_id' column to users...");
      await registryPool.query("ALTER TABLE users ADD COLUMN employee_id VARCHAR(50) AFTER role");
    }

    // 🛠️ Atomic Patch: Ensure 'payment_status' column exists in tenants
    const [tCols] = await registryPool.query("SHOW COLUMNS FROM tenants LIKE 'payment_status'");
    if (tCols.length === 0) {
      await registryPool.query("ALTER TABLE tenants ADD COLUMN payment_status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending' AFTER plan_id");
    }

    // 🛠️ Atomic Patch: Ensure 'status' column exists in system_payments
    const [pCols] = await registryPool.query("SHOW COLUMNS FROM system_payments LIKE 'status'");
    if (pCols.length === 0) {
      await registryPool.query("ALTER TABLE system_payments ADD COLUMN status ENUM('pending', 'paid', 'failed') DEFAULT 'paid' AFTER period_label");
    }

    // 🛠️ Atomic Patch: Relax 'owner_email' constraint for Discovery migration
    console.log("[Registry Hub] Patching 'tenants' schema: Relaxing owner_email constraint...");
    await registryPool.query("ALTER TABLE tenants MODIFY COLUMN owner_email VARCHAR(255) NULL");

    // 👑 Master Identity Sync: Provision/Update CEO Root Account
    console.log("[Registry Hub] Synchronizing Master CEO Identity...");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('vanguard720', salt);

    await registryPool.query(
      `INSERT INTO users (id, username, email, password_hash, role) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password_hash = ?, role = ?`,
      ['VANGUARD_CEO_ROOT', 'ceo@tredpos.com', 'ceo@tredpos.com', hash, 'hq-ceo', hash, 'hq-ceo']
    );

    // Also seed the HQ Tenant mapping
    await registryPool.query(
      "INSERT IGNORE INTO tenants (id, name, owner_email, db_name, status, payment_status) VALUES (?, ?, ?, ?, ?, ?)",
      ['HQ_VANGUARD_CORE', 'Tred Industries Headquarters', 'ceo@tredpos.com', 'tredpos_registry', 'active', 'paid']
    );

    // 🏛️ Infrastructure Governance: Seed initial settings from environment if empty
    const [existingSettings] = await registryPool.query("SELECT COUNT(*) as count FROM system_settings");
    if (existingSettings[0].count === 0) {
      console.log("[Registry Hub] Infrastructure Seeding: Migrating environment variables to database...");
      const initialSettings = [
        ['DB_HOST', process.env.DB_HOST],
        ['DB_USER', process.env.DB_USER],
        ['DB_PASSWORD', process.env.DB_PASSWORD],
        ['DB_NAME', 'tred_hardware'],
        ['PRIVATE_KEY', process.env.PRIVATE_KEY || 'tredpos_standard_node@2025'],
        ['GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID],
        ['SMTP_USER', process.env.SMTP_USER],
        ['SMTP_PASS', process.env.SMTP_PASS],
        ['FROM_EMAIL', process.env.FROM_EMAIL],
      ];

      for (const [key, val] of initialSettings) {
        await registryPool.query(
          "INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES (?, ?)",
          [key, val]
        );
      }
    }

    // 🛠️ Atomic Patch: Ensure SMTP Carrier Host/Port exist for legacy nodes
    await registryPool.query(
      "INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES (?, ?), (?, ?)",
      ['SMTP_HOST', 'smtp.gmail.com', 'SMTP_PORT', '465']
    );

    // 🚀 GLOBAL DISCOVERY: Identify and register pre-existing institutional terminals
    console.log("[Registry Hub] 🚀 Executing Global Node Discovery Protocol...");
    try {
      const [allDBs] = await registryPool.query("SHOW DATABASES WHERE `Database` LIKE 'tred_%'");
      const institutionalDBs = allDBs
        .map(r => r.Database)
        .filter(db => db !== 'tredpos_registry' && db !== 'tredumo_lower');

      if (institutionalDBs.length === 0) {
        console.log("[Registry Hub] Analysis: No legacy institutional nodes found.");
      } else {
        console.log(`[Registry Hub] Discovery: Identified ${institutionalDBs.length} potential business terminal(s).`);

        for (const dbName of institutionalDBs) {
          // 🧐 Identity Extraction: Peer into the node to get real business data
          const storeDb = getTenantPool(dbName);
          let bizName = '';
          let bizEmail = 'legacy-terminal@tredpos.com';
          let bizPhone = '';
          let bizLoc = '';

          try {
            const [settings] = await storeDb.query("SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('COMPANY_NAME', 'CONTACT_EMAIL', 'LOCATION', 'SUPPORT_PHONE')");
            const sMap = Object.fromEntries(settings.map(s => [s.setting_key, s.setting_value]));
            bizName = sMap.COMPANY_NAME;
            bizEmail = sMap.CONTACT_EMAIL || bizEmail;
            bizPhone = sMap.SUPPORT_PHONE;
            bizLoc = sMap.LOCATION;
          } catch (e) {
            console.warn(`[Registry Hub] Deep Scan Warning: Could not extract identity for ${dbName}. Falling back to naming protocol.`);
          }

          const finalName = bizName || dbName
            .replace(/^tred_/, '')
            .replace(/_hw$/, '')
            .split('_')
            .filter(s => isNaN(Number(s)))
            .join(' ')
            .toUpperCase();

          // Check if this DB is already registered
          const [exists] = await registryPool.query("SELECT id FROM tenants WHERE db_name = ?", [dbName]);

          if (exists.length === 0) {
            console.log(`[Registry Hub] Self-Registration: Mapping '${finalName}' to Vanguard Registry...`);
            await registryPool.query(
              "INSERT INTO tenants (id, name, db_name, status, payment_status, owner_email, physical_location, support_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [randomUUID().slice(0, 8), finalName, dbName, 'active', 'paid', bizEmail, bizLoc, bizPhone]
            );
          } else {
            // Identity Sync: Update existing record with fresh scan data
            await registryPool.query(
              "UPDATE tenants SET name = ?, physical_location = ?, owner_email = ?, support_phone = ?, updated_at = NOW() WHERE db_name = ?",
              [finalName, bizLoc, bizEmail, bizPhone, dbName]
            );
          }

          // 📡 [HSM v2.4] Staff Identity Pulse
          // Map all operators within this business to the global Registry Hub
          try {
            const [tenantRows] = await registryPool.query("SELECT id FROM tenants WHERE db_name = ? LIMIT 1", [dbName]);
            const tenantId = tenantRows[0]?.id;

            if (tenantId) {
              const [dbUsers] = await storeDb.query("SELECT email, role FROM users WHERE email IS NOT NULL");
              for (const u of dbUsers) {
                await registryPool.query(
                  `INSERT INTO operator_mappings (id, email, tenant_id, role) 
                   VALUES (?, ?, ?, ?) 
                   ON DUPLICATE KEY UPDATE tenant_id = VALUES(tenant_id), role = VALUES(role)`,
                  [randomUUID().slice(0, 8), u.email.toLowerCase(), tenantId, u.role]
                );
              }
            }
          } catch (staffScanErr) {
            console.warn(`[Registry Hub] Staff Scan Warning for ${dbName}: ${staffScanErr.message}`);
          }
        }
      }
    } catch (discoveryErr) {
      console.error("[Registry Hub] Discovery Protocol Failure:", discoveryErr.message);
    }
  } catch (err) {
    console.error("[Registry Hub] Initialization Failure:", err.message);
    // Auto-detect if database doesn't exist and log guidance
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.warn("[Registry Hub] Critical: 'tredpos_registry' database does not exist. Please create it manually.");
    }
    throw err;
  }
};

export { registryPool };
