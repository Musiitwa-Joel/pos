import { getTenantPool } from "../../config/config.js";
import { sendMail } from "../../utils/mailer.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { v7 as uuidv7 } from "uuid";

console.log("[DEBUG] HR_RESOLVERS_LOADED_V4_UUIDV7");

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
    `CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    check_in DATETIME NOT NULL,
    check_out DATETIME,
    status ENUM('present', 'late', 'absent') DEFAULT 'present',
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
  ) ENGINE=MyISAM`,
    `CREATE TABLE IF NOT EXISTS payroll_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    period_month TINYINT NOT NULL,
    period_year SMALLINT NOT NULL,
    gross_salary DECIMAL(10, 2) NOT NULL,
    tax_deductions DECIMAL(10, 2) DEFAULT 0.00,
    net_salary DECIMAL(10, 2) NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
  ) ENGINE=MyISAM`
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

/**
 * Universal Schema Guard - HSM v2.4 (TredPOS v3.0)
 * Replaces 'CREATE TABLE IF NOT EXISTS' with active column synchronization
 * to ensure older businesses (tenants) are seamlessly upgraded.
 */
const SchemaGuard = async (db, tableName, columns) => {
    // 1. Ensure the table exists
    const [createResults] = await db.query(`SHOW TABLES LIKE '${tableName}'`);
    if (createResults.length === 0) {
        console.log(`[Schema Guard] Creating missing table: ${tableName}`);
        // Create full table if missing (use the first schema script that matches this table)
        const sql = [...HR_SCHEMA_SQL, ...USER_SCHEMA_SQL].find(s => s.includes(`CREATE TABLE IF NOT EXISTS ${tableName}`));
        if (sql) await db.query(sql);
        return;
    }

    // 2. Sync columns if table already exists
    const [existingColumns] = await db.query(`DESCRIBE ${tableName}`);
    const existingFieldNames = existingColumns.map(c => c.Field.toLowerCase());

    const missingFields = columns.filter(col => !existingFieldNames.includes(col.name.toLowerCase()));

    for (const field of missingFields) {
        console.log(`[Schema Guard] Table '${tableName}' missing column: ${field.name}. Injecting...`);
        try {
            await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${field.name} ${field.type} ${field.extra || ''}`);
        } catch (err) {
            console.error(`[Schema Guard] Failed to inject column '${field.name}':`, err.message);
        }
    }
};

export default {
    Query: {
        employees: async (_, __, { db }) => {
            const [rows] = await db.query("SELECT * FROM employees ORDER BY created_at DESC");
            return rows.map(row => ({
                ...row,
                joinedDate: row.joined_date ? row.joined_date.toISOString() : null,
                createdAt: row.created_at ? row.created_at.toISOString() : null,
                updatedAt: row.updated_at ? row.updated_at.toISOString() : null,
            }));
        },
        employee: async (_, { id }, { db }) => {
            const [rows] = await db.query("SELECT * FROM employees WHERE id = ?", [id]);
            if (rows.length === 0) return null;
            const row = rows[0];
            return {
                ...row,
                joinedDate: row.joined_date ? row.joined_date.toISOString() : null,
            };
        },
        attendanceLogs: async (_, { employeeId }, { db }) => {
            let query = "SELECT * FROM attendance";
            let params = [];
            if (employeeId) {
                query += " WHERE employee_id = ?";
                params.push(employeeId);
            }
            query += " ORDER BY date DESC, check_in DESC";
            const [rows] = await db.query(query, params);
            return rows.map(row => ({
                ...row,
                employeeId: row.employee_id,
                checkIn: row.check_in ? row.check_in.toISOString() : null,
                checkOut: row.check_out ? row.check_out.toISOString() : null,
            }));
        },
    },

    Mutation: {
        initializeHRDatabase: async (_, __, { db }) => {
            try {
                for (const sql of HR_SCHEMA_SQL) {
                    await db.query(sql);
                }
                return "HR database initialized successfully";
            } catch (error) {
                throw new Error(`Failed to initialize HR database: ${error.message}`);
            }
        },
        addEmployee: async (_, args, { db, logUserAction }) => {
            const { name, role, phone, email, salary, status } = args;
            const employeeId = uuidv7();
            const joinedDate = new Date().toISOString().split('T')[0];

            // 0. Universal Schema Guard Injection (Self-Healing)
            await SchemaGuard(db, 'employees', [
                { name: 'role', type: 'VARCHAR(100)', extra: 'NOT NULL' },
                { name: 'phone', type: 'VARCHAR(20)', extra: 'NOT NULL' },
                { name: 'email', type: 'VARCHAR(255)' },
                { name: 'salary', type: 'DECIMAL(10,2)', extra: 'DEFAULT 0.00' },
                { name: 'status', type: "ENUM('active', 'on_leave', 'terminated')", extra: "DEFAULT 'active'" },
                { name: 'joined_date', type: 'DATE', extra: 'NOT NULL' },
                { name: 'created_at', type: 'TIMESTAMP', extra: 'DEFAULT CURRENT_TIMESTAMP' },
                { name: 'updated_at', type: 'TIMESTAMP', extra: 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
            ]);
            await SchemaGuard(db, 'users', [
                { name: 'email', type: 'VARCHAR(255)' },
                { name: 'role', type: "ENUM('admin', 'manager', 'cashier', 'staff')", extra: "DEFAULT 'staff'" },
                { name: 'employee_id', type: 'VARCHAR(50)' },
                { name: 'updated_at', type: 'TIMESTAMP', extra: 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
            ]);

            const connection = await db.getConnection();
            try {
                await connection.beginTransaction();

                // 1. Fetch Company Info for Onboarding
                const [settingsRows] = await connection.query("SELECT * FROM system_settings WHERE setting_key IN ('COMPANY_NAME', 'LOCATION', 'CONTACT_EMAIL', 'SUPPORT_PHONE')");
                const sets = {};
                settingsRows.forEach(s => sets[s.setting_key] = s.setting_value);
                const companyName = sets.COMPANY_NAME || "Institutional Terminal";
                const companyLocation = sets.LOCATION || "Authorized Branch Location";
                const companyContact = sets.CONTACT_EMAIL || "administrative-support";
                const companyPhone = sets.SUPPORT_PHONE || "N/A";

                // 2. Create Employee Record
                await connection.query(
                    "INSERT INTO employees (id, name, role, phone, email, salary, status, joined_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [employeeId, name, role, phone, email, salary, status || 'active', joinedDate]
                );

                // 3. Automated Onboarding: Create System User
                const tempPassword = crypto.randomBytes(4).toString('hex'); // 8 characters
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(tempPassword, salt);
                const username = email.toLowerCase();
                const userId = uuidv7();

                await connection.query(
                    "INSERT INTO users (id, username, password_hash, role, employee_id) VALUES (?, ?, ?, ?, ?)",
                    [userId, username, passwordHash, role === 'Admin' ? 'admin' : 'staff', employeeId]
                );

                // 📡 [TredPOS v2.4] Universal Registry Onboarding
                // Automatically map the new staff member to this institution in the central registry
                const { registryPool } = await import("../../config/config.js");
                const [tenantRows] = await registryPool.query("SELECT id FROM tenants WHERE db_name = (SELECT DATABASE()) OR id = ?", [process.env.DB_NAME]);
                const currentTenantId = tenantRows[0]?.id;

                if (currentTenantId) {
                    await registryPool.query(
                        "INSERT IGNORE INTO operator_mappings (tenant_id, email) VALUES (?, ?)",
                        [currentTenantId, username]
                    );
                    console.log(`[TredPOS Registry] Auto-Mapped new subordinate: ${username}`);
                }

                // 4. Send Onboarding Emails
                if (email) {
                    try {
                        // Email 1: Welcome Email
                        await sendMail({
                            to: email,
                            fromName: companyName,
                            subject: `Welcome to the Team, ${name}!`,
                            html: `
                                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                                    <p>Dear ${name},</p>
                                    <p>Welcome!</p>
                                    <p>Your account has been successfully created. You will shortly receive a separate email containing your login credentials, including your username and a temporary password.</p>
                                    <p>Once you receive the login details, please follow these steps:</p>
                                    <ol>
                                        <li>Visit the login page.</li>
                                        <li>Enter the provided username and password.</li>
                                        <li>You will be prompted to change your password for security purposes.</li>
                                    </ol>
                                    <p>If you do not receive the login details within a few minutes, please check your spam or junk folder. In case you still cannot find the email, feel free to contact our support team for assistance at ${companyContact}.</p>
                                    <p>We’re excited to have you on board!</p>
                                    <p>Best regards,<br>${companyName}<br>${companyLocation}</p>
                                </div>
                            `
                        });

                        // Email 2: Credentials Email
                        await sendMail({
                            to: email,
                            fromName: companyName,
                            subject: `Your ${companyName} HMS Security Credentials`,
                            html: `
                                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; border-top: 4px solid #f97316;">
                                    <h1 style="color: #f97316; font-size: 18px;">Security Credentials Generated</h1>
                                    <p>Use your <strong>Email Address</strong> and the following temporary password to initialize your session:</p>
                                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 4px; border: 1px dashed #cbd5e1; margin: 20px 0;">
                                        <p style="margin: 5px 0; font-family: monospace; font-size: 14px;"><strong>Identity:</strong> ${username}</p>
                                        <p style="margin: 5px 0; font-family: monospace; font-size: 14px;"><strong>Protocol Code:</strong> ${tempPassword}</p>
                                    </div>
                                    <p style="font-size: 11px; color: #64748b;">This code is for authorized personnel only. Please update your security protocol (password) immediately upon access.</p>
                                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                                    <p style="font-size: 10px; color: #94a3b8; text-align: center;">${companyName} &bull; Security Operations Center<br>${companyLocation} &bull; ${companyPhone}</p>
                                </div>
                            `
                        });
                    } catch (mailErr) {
                        // Rollback DB if mail fails
                        throw new Error(`Onboarding failed during email delivery: ${mailErr.message}. DB changes rolled back.`);
                    }
                }

                await connection.commit();

                // 5. Log Action after successful commit
                if (logUserAction) {
                    await logUserAction({
                        action: "ADD_EMPLOYEE",
                        details: `Created employee ${name} (${role}) and system user ${username}`
                    });
                }

                return {
                    id: employeeId, name, role, phone, email, salary, status: status || 'active', joinedDate
                };
            } catch (error) {
                await connection.rollback();
                console.error("ADD_EMPLOYEE_TRANSACTION_FAILED:", error.message);
                throw error;
            } finally {
                connection.release();
            }
        },
        updateEmployee: async (_, args, { db }) => {
            const { id, ...updates } = args;
            const fields = Object.keys(updates);
            const values = Object.values(updates);
            if (fields.length === 0) throw new Error("No fields provided for update");

            const setClause = fields.map(f => `${f.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)} = ?`).join(", ");
            await db.query(`UPDATE employees SET ${setClause} WHERE id = ?`, [...values, id]);

            const [rows] = await db.query("SELECT * FROM employees WHERE id = ?", [id]);
            return {
                ...rows[0],
                joinedDate: rows[0].joined_date ? rows[0].joined_date.toISOString() : null,
            };
        },
        recordAttendance: async (_, args, { db }) => {
            const { employeeId, checkIn, checkOut, status } = args;
            const date = new Date(checkIn).toISOString().split('T')[0];
            const [result] = await db.query(
                "INSERT INTO attendance (employee_id, date, check_in, check_out, status) VALUES (?, ?, ?, ?, ?)",
                [employeeId, date, checkIn, checkOut, status || 'present']
            );
            const [rows] = await db.query("SELECT * FROM attendance WHERE id = ?", [result.insertId]);
            return {
                ...rows[0],
                employeeId: rows[0].employee_id,
                checkIn: rows[0].check_in ? rows[0].check_in.toISOString() : null,
                checkOut: rows[0].check_out ? rows[0].check_out.toISOString() : null,
            };
        },
    },
};
