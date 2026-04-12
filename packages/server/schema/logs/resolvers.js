import { getTenantPool } from "../../config/config.js";

const LOGS_SCHEMA_SQL = [
    `CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_timestamp (user_id, timestamp),
    INDEX idx_action (action),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=MyISAM`
];

/**
 * HSM v2.4 Institutional Audit Dispatcher
 * Automatically routes telemetry to the correct institutional shell.
 */
export const logUserAction = async ({ userId, action, details, context, db: providedDb }) => {
    try {
        const db = providedDb || context?.db;
        if (!db) {
            console.error("[Audit Gateway] No database pool provided for logging.");
            return;
        }
        const ipAddress = context?.ip || "unknown";
        await db.query(
            "INSERT INTO logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)",
            [userId || context?.user?.id || null, action, details || null, ipAddress]
        );
    } catch (err) {
        console.error("[Audit Gateway] Log Dispatch Failure:", err.message);
    }
};

export default {
    Query: {
        logs: async (_, { limit = 100, offset = 0 }, { db }) => {
            const [rows] = await db.query(
                "SELECT * FROM logs ORDER BY timestamp DESC LIMIT ? OFFSET ?",
                [limit, offset]
            );
            return rows.map(row => ({
                id: row.id,
                userId: row.user_id,
                action: row.action,
                details: row.details,
                ipAddress: row.ip_address,
                timestamp: row.timestamp?.toISOString()
            }));
        },
    },
    Mutation: {
        initializeLogsDatabase: async (_, __, { db }) => {
            try {
                for (const sql of LOGS_SCHEMA_SQL) {
                    await db.query(sql);
                }
                return "Logs database initialized successfully";
            } catch (error) {
                throw new Error(`Failed to initialize logs database: ${error.message}`);
            }
        },
    }
};
