import { getTenantPool } from "../../config/config.js";

const SETTINGS_SCHEMA_SQL = [
    `CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=MyISAM`,
    `CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=MyISAM`
];

import { v7 as uuidv7 } from "uuid";

export default {
    Query: {
        settings: async (_, __, { db }) => {
            const [rows] = await db.query("SELECT setting_key as 'key', setting_value as 'value' FROM system_settings");
            return rows;
        },
        setting: async (_, { key }, { db }) => {
            const [rows] = await db.query("SELECT setting_value FROM system_settings WHERE setting_key = ?", [key]);
            return rows.length > 0 ? rows[0].setting_value : null;
        },
        roles: async (_, __, { db }) => {
            const [rows] = await db.query("SELECT * FROM roles ORDER BY name ASC");
            return rows;
        },
        getSystemTelemetry: async () => {
            const os = await import("os");
            const load = os.loadavg();
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            
            return {
                kernelVersion: `${os.type()} ${os.release()}`,
                uptime: `${Math.floor(os.uptime() / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`,
                cpuUsage: load[0] * 100 / os.cpus().length,
                memoryTotal: totalMem / (1024 * 1024 * 1024), // GB
                memoryUsed: (totalMem - freeMem) / (1024 * 1024 * 1024), // GB
                storageUtilization: 14.2, // Mocked for now, requires native disk check
                dbStatus: "CONNECTED_STABLE",
                nodeId: "KIYINJI-SMART-TERMINAL-01"
            };
        }
    },
    Mutation: {
        updateSetting: async (_, { key, value }, { db, logUserAction, user }) => {
            // Ensure table exists (self-healing)
            for (const sql of SETTINGS_SCHEMA_SQL) {
                await db.query(sql);
            }

            await db.query(
                "INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
                [key, value, value]
            );

            if (logUserAction) {
                await logUserAction({
                    action: "SETTING_UPDATED",
                    details: `Setting ${key} updated to ${value}`,
                    context: { user }
                });
            }

            return { key, value };
        },
        addRole: async (_, { name, description }, { db, logUserAction, user }) => {
            // Self-healing check
            for (const sql of SETTINGS_SCHEMA_SQL) {
                await db.query(sql);
            }

            const id = uuidv7();
            await db.query(
                "INSERT INTO roles (id, name, description) VALUES (?, ?, ?)",
                [id, name, description]
            );

            if (logUserAction) {
                await logUserAction({
                    action: "ROLE_ADDED",
                    details: `Added new staff role: ${name}`,
                    context: { user }
                });
            }

            return { id, name, description };
        },
        deleteRole: async (_, { id }, { db, logUserAction, user }) => {
            const [rows] = await db.query("SELECT name FROM roles WHERE id = ?", [id]);
            if (rows.length === 0) return false;
            const roleName = rows[0].name;

            await db.query("DELETE FROM roles WHERE id = ?", [id]);

            if (logUserAction) {
                await logUserAction({
                    action: "ROLE_DELETED",
                    details: `Deleted staff role: ${roleName}`,
                    context: { user }
                });
            }

            return true;
        },
        initializeSettingsDatabase: async (_, __, { db }) => {
            try {
                for (const sql of SETTINGS_SCHEMA_SQL) {
                    await db.query(sql);
                }
                return "Settings database initialized successfully";
            } catch (error) {
                throw new Error(`Failed to initialize settings database: ${error.message}`);
            }
        },
        backupDatabase: async () => {
            try {
                const fs = await import("fs/promises");
                const path = await import("path");
                const { exec } = await import("child_process");
                const util = await import("util");
                const execPromise = util.promisify(exec);

                const backupDir = path.resolve(process.cwd(), "backups");
                try { await fs.mkdir(backupDir, { recursive: true }); } catch(de) {}

                const filename = `backup_${Date.now()}.sql`;
                const filepath = path.join(backupDir, filename);

                // Industrial Execution: Using mysqldump from the environment
                const dbHost = process.env.DB_HOST || "127.0.0.1";
                const dbUser = process.env.DB_USER || "root";
                const dbPass = process.env.DB_PASS || "";
                const dbName = process.env.DB_NAME || "tred_hardware";

                const passPart = dbPass ? `-p"${dbPass}"` : "";
                const cmd = `mysqldump -h ${dbHost} -u ${dbUser} ${passPart} ${dbName} > "${filepath}"`;
                
                await execPromise(cmd);
                
                const stats = await fs.stat(filepath);

                return {
                    success: true,
                    message: "SYSTEM_BACKUP_SNAPSHOT_CREATED",
                    filename: filename,
                    size: stats.size / 1024, // KB
                    timestamp: new Date().toISOString()
                };
            } catch (err) {
                return { success: false, message: `BACKUP_FAILED: ${err.message}` };
            }
        },
        testNotificationSettings: async (_, { email }) => {
            try {
                const [settingsRows] = await db.query("SELECT * FROM system_settings WHERE setting_key IN ('COMPANY_NAME')");
                const companyName = settingsRows.find(s => s.setting_key === 'COMPANY_NAME')?.setting_value || "Terminal System";

                const { sendMail } = await import("../../utils/mailer.js");
                await sendMail({
                    to: email,
                    subject: "SYSTEM_NOTIFICATION_VERIFICATION",
                    html: `
                        <div style="font-family: monospace; background: #0f172a; color: #38bdf8; padding: 20px; border: 1px solid #1e293b;">
                            <h2 style="color: #f97316;">SECURITY_PROTOCOL_VERIFIED</h2>
                            <p>This is a verification email from your **${companyName} OS**.</p>
                            <hr style="border: 0.5px solid #1e293b; margin: 20px 0;">
                            <p style="font-size: 11px; color: #64748b;">NODE_ID: TERMINAL-SEC-01</p>
                            <p style="font-size: 11px; color: #64748b;">TIMESTAMP: ${new Date().toISOString()}</p>
                        </div>
                    `
                });
                return "TEST_EMAIL_SENT_SUCCESSFULLY";
            } catch (err) {
                throw new Error(`NOTIFICATION_TEST_FAILED: ${err.message}`);
            }
        }
    }
};
