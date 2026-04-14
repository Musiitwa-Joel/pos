import { getTenantPool } from "../../config/config.js";

const LOGS_SCHEMA_SQL = [
    `CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(255) NOT NULL,
    target VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_timestamp (user_id, created_at),
    INDEX idx_action (action)
  ) ENGINE=MyISAM`
];

import { v7 as uuidv7 } from "uuid";

/**
 * HSM v2.4 Institutional Audit Dispatcher
 * Autonomous Self-Healing: Automatically synchronizes schema during the logging handshake.
 */
export const logUserAction = async ({ userId, action, target, details, context, db: providedDb }) => {
    try {
        const db = providedDb || context?.db;
        if (!db) {
            console.error("[Audit Gateway] No database pool provided for logging.");
            return;
        }

        // 🛡️ Autonomous Self-Healing Guard: Ensure audit_logs is correctly harmonized
        await db.query(LOGS_SCHEMA_SQL[0]);
        
        // Surgical Check for Forensic Columns (Self-healing legacy clusters)
        const [targetCols] = await db.query("SHOW COLUMNS FROM audit_logs LIKE 'target'");
        if (targetCols.length === 0) {
            await db.query("ALTER TABLE audit_logs ADD COLUMN target VARCHAR(255) NULL AFTER action");
        } else {
            // Ensure target is NULLable if it's already there
            await db.query("ALTER TABLE audit_logs MODIFY COLUMN target VARCHAR(255) NULL");
        }
        
        const [detailsCols] = await db.query("SHOW COLUMNS FROM audit_logs LIKE 'details'");
        if (detailsCols.length === 0) {
            await db.query("ALTER TABLE audit_logs ADD COLUMN details TEXT NULL AFTER target");
        } else {
            // Ensure details is NULLable
            await db.query("ALTER TABLE audit_logs MODIFY COLUMN details TEXT NULL");
        }

        const [ipCols] = await db.query("SHOW COLUMNS FROM audit_logs LIKE 'ip_address'");
        if (ipCols.length === 0) {
            await db.query("ALTER TABLE audit_logs ADD COLUMN ip_address VARCHAR(45)");
        }

        const [createdCols] = await db.query("SHOW COLUMNS FROM audit_logs LIKE 'created_at'");
        if (createdCols.length === 0) {
            // Check if it has the old 'timestamp' name and rename it, or just add created_at
            const [timestampCols] = await db.query("SHOW COLUMNS FROM audit_logs LIKE 'timestamp'");
            if (timestampCols.length > 0) {
                await db.query("ALTER TABLE audit_logs CHANGE COLUMN timestamp created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
            } else {
                await db.query("ALTER TABLE audit_logs ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
            }
        }

        const ipAddress = context?.ip || "unknown";
        const id = uuidv7();
        await db.query(
            "INSERT INTO audit_logs (id, user_id, action, target, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)",
            [id, userId || context?.user?.id || null, action, target || null, details || null, ipAddress]
        );
    } catch (err) {
        console.error("[Audit Gateway] Log Dispatch Failure:", err.message);
    }
};

export default {
    Query: {
        logs: async (_, { limit = 100, offset = 0 }, { db }) => {
            // Ensure table exists for query
            await db.query(LOGS_SCHEMA_SQL[0]);
            
            const [rows] = await db.query(
                "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?",
                [limit, offset]
            );
            return rows.map(row => ({
                id: row.id,
                userId: row.user_id,
                action: row.action,
                details: row.details,
                ipAddress: row.ip_address,
                timestamp: row.created_at?.toISOString()
            }));
        },
    },
    Mutation: {
        initializeLogsDatabase: async (_, __, { db }) => {
            try {
                for (const sql of LOGS_SCHEMA_SQL) {
                    await db.query(sql);
                }
                return "Audit repository initialized successfully";
            } catch (error) {
                throw new Error(`Failed to initialize audit repository: ${error.message}`);
            }
        },
    }
};
