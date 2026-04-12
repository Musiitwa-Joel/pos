import { PRIVATE_KEY, getTenantPool, registryPool } from "../../config/config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { randomUUID } from "crypto";
import { provisionInstitution } from "../../utils/provisioner.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const USER_SCHEMA_SQL = [
    `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role ENUM('admin', 'manager', 'cashier', 'staff') DEFAULT 'staff',
    employee_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_employee (employee_id),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
  ) ENGINE=MyISAM`
];

export const setUserOnline = async (id, db) => {
    await db.query("UPDATE users SET is_active = 1 WHERE id = ?", [id]);
};
export const setUserOffline = async (id, db) => {
    await db.query("UPDATE users SET is_active = 0 WHERE id = ?", [id]);
};

export default {
    Query: {
        me: async (_, __, { db, user }) => {
            if (!user) return null;
            const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [user.id]);
            if (rows.length === 0) return null;
            const dbUser = rows[0];
            return {
                id: dbUser.id,
                username: dbUser.username,
                role: dbUser.role,
                isActive: dbUser.is_active,
                employeeId: dbUser.employee_id,
                tenantStatus: user.tenantStatus || 'active',
                createdAt: dbUser.created_at?.toISOString(),
                updatedAt: dbUser.updated_at?.toISOString()
            };
        },
        users: async (_, __, { db }) => {
            const [rows] = await db.query("SELECT * FROM users");
            return rows.map(row => ({
                id: row.id,
                username: row.username,
                role: row.role,
                isActive: row.is_active,
                employeeId: row.employee_id,
                createdAt: row.created_at?.toISOString(),
                updatedAt: row.updated_at?.toISOString()
            }));
        },
    },
    Mutation: {
        login: async (_, { username, password }) => {
            const normalizedEmail = username.toLowerCase();

            // 🛡️ [HSM v2.4] Institutional Identity Discovery
            // Universal Lookup: Match by owner_email OR by operator_mappings
            const [tenantRows] = await registryPool.query(`
                SELECT t.* FROM tenants t 
                LEFT JOIN operator_mappings om ON t.id = om.tenant_id
                WHERE t.owner_email = ? OR om.email = ? 
                LIMIT 1`,
                [normalizedEmail, normalizedEmail]
            );

            let tenant = tenantRows[0] || null;


            // [TredPOS v2.4] Federated Identity Discovery
            if (!tenant) {
                console.log(`[TredPOS Discovery] Registry Miss: ${normalizedEmail}. Starting Federated Search...`);
                const [allTenants] = await registryPool.query("SELECT id, db_name, status FROM tenants WHERE status != 'decommissioned'");

                for (const t of allTenants) {
                    try {
                        const tPool = getTenantPool(t.db_name);
                        // Case-Insensitive Canonical Verification
                        const [uRows] = await tPool.query("SELECT id FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?", [normalizedEmail, normalizedEmail]);
                        if (uRows.length > 0) {
                            console.log(`[TredPOS Discovery] Cluster Match: Found ${normalizedEmail} in ${t.db_name}. Auto-Mapping...`);
                            // Auto-Repair Registry mapping for persistence
                            await registryPool.query("INSERT IGNORE INTO operator_mappings (tenant_id, email) VALUES (?, ?)", [t.id, normalizedEmail]);
                            tenant = t;
                            break;
                        }
                    } catch (e) {
                        // Log warning but continue scanning other clusters to prevent a single DB failure from blocking the user
                        console.error(`[TredPOS Discovery] Cluster Scan Failed (${t.db_name}): ${e.message}`);
                    }
                }

                // If still no tenant and not HQ CEO in the system DB, reject.
                if (!tenant) {
                    const sysPool = getTenantPool("tred_hardware");
                    const [sysUserRows] = await sysPool.query("SELECT role FROM users WHERE username = ? OR email = ?", [username.toLowerCase(), username.toLowerCase()]);
                    if (!sysUserRows[0] || sysUserRows[0].role !== 'hq-ceo') {
                        throw new Error("ACCESS_DENIED: Critical identity mapping failure. Your account must be associated with a valid institutional cluster. Please contact Tred Industries HQ.");
                    }
                }
            }

            // 🔒 [Suspension Protocol] Central Enforcement (Moved to catch Federated Discoveries)
            if (tenant && tenant.status === 'suspended') {
                throw new Error("ACCESS_DENIED: Your business account on the TREDPOS Platform has been temporarily suspended due to unresolved payment obligations. Please contact Tred Industries HQ for assistance.");
            }

            const targetDbName = tenant ? tenant.db_name : "tred_hardware";
            const targetPool = getTenantPool(targetDbName);

            const query = `
                SELECT u.*, e.name as display_name, e.status as employment_status
                FROM \`${targetDbName}\`.users u 
                LEFT JOIN \`${targetDbName}\`.employees e ON u.employee_id = e.id 
                WHERE u.username = ? OR u.id = ? OR u.email = ?
            `;
            const [userRows] = await targetPool.query(query, [username.toLowerCase(), username, username.toLowerCase()]);

            if (userRows.length === 0) throw new Error("User identity not found in institutional database");

            const user = userRows[0];

            // Block terminated employees
            if (user.employment_status === 'terminated') {
                throw new Error("ACCESS_DENIED: Your employment contract has been terminated. Please seek Human Resources for assistance.");
            }

            if (!user.password_hash) {
                throw new Error("Account encryption protocol not found. This account may be managed by an external provider.");
            }

            const isValid = await bcrypt.compare(password, user.password_hash);
            if (!isValid) throw new Error("Invalid Security Key (Password)");

            // Session lasts 12 hours
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    tenantId: tenant ? tenant.id : null,
                    tenantStatus: tenant ? tenant.status : 'active',
                    dbName: targetDbName,
                    name: user.display_name || user.username
                },
                PRIVATE_KEY,
                { expiresIn: "12h" }
            );

            return token;
        },
        googleLogin: async (_, { idToken }) => {
            try {
                let email, name, googleId;

                try {
                    const ticket = await client.verifyIdToken({
                        idToken,
                        audience: process.env.GOOGLE_CLIENT_ID,
                    });
                    const payload = ticket.getPayload();
                    if (!payload) throw new Error("Invalid Google Token Payload");
                    email = payload.email;
                    name = payload.name;
                    googleId = payload.sub;
                } catch (idError) {
                    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${idToken}`);
                    if (!response.ok) throw new Error("Identity Handshake Failed: Invalid Google Token");
                    const data = await response.json();
                    email = data.email;
                    name = data.name;
                    googleId = data.sub;
                }

                if (!email) throw new Error("Verification Failed: Google email identity not found.");
                const normalizedEmail = email.toLowerCase();

                // 🛡️ [HSM v2.4] Institutional Identity Discovery
                // Universal Lookup: Match by owner_email OR by operator_mappings
                const [tenantRows] = await registryPool.query(`
                    SELECT t.* FROM tenants t 
                    LEFT JOIN operator_mappings om ON t.id = om.tenant_id
                    WHERE t.owner_email = ? OR om.email = ? 
                    LIMIT 1`,
                    [normalizedEmail, normalizedEmail]
                );

                let tenant = tenantRows[0] || null;


                // [TredPOS v2.4] Federated Identity Discovery
                if (!tenant) {
                    console.log(`[TredPOS Discovery] Registry Miss: ${normalizedEmail}. Starting Federated Search...`);
                    const [allTenants] = await registryPool.query("SELECT id, db_name, status FROM tenants WHERE status != 'decommissioned'");

                    for (const t of allTenants) {
                        try {
                            const tPool = getTenantPool(t.db_name);
                            // Case-Insensitive Canonical Verification
                            const [uRows] = await tPool.query("SELECT id FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?", [normalizedEmail, normalizedEmail]);
                            if (uRows.length > 0) {
                                console.log(`[TredPOS Discovery] Cluster Match: Found ${normalizedEmail} in ${t.db_name}. Auto-Mapping...`);
                                await registryPool.query("INSERT IGNORE INTO operator_mappings (tenant_id, email) VALUES (?, ?)", [t.id, normalizedEmail]);
                                tenant = t;
                                break;
                            }
                        } catch (e) {
                            // Log warning but continue scanning other clusters
                            console.error(`[TredPOS Discovery] Cluster Scan Failed (${t.db_name}): ${e.message}`);
                        }
                    }

                    if (!tenant) {
                        const sysPool = getTenantPool("tred_hardware");
                        const [sysUserRows] = await sysPool.query("SELECT role FROM users WHERE email = ?", [normalizedEmail]);
                        if (!sysUserRows[0] || sysUserRows[0].role !== 'hq-ceo') {
                            throw new Error("ACCESS_DENIED: Critical identity mapping failure. Your account must be associated with a valid institutional cluster. Please contact Tred Industries HQ.");
                        }
                    }
                }

                // 🔒 [Suspension Protocol] Central Enforcement (Moved to catch Federated Discoveries)
                if (tenant && tenant.status === 'suspended') {
                    throw new Error("ACCESS_DENIED: Your business account on the TREDPOS Platform has been temporarily suspended due to unresolved payment obligations. Please contact Tred Industries HQ for assistance.");
                }

                let user;
                let targetDb = tenant ? tenant.db_name : "tred_hardware";

                // Connect to the specific institutional database
                const tenantPool = getTenantPool(targetDb);

                // Find user in the specific database
                let [userRows] = await tenantPool.query(
                    "SELECT u.*, e.name as display_name FROM users u LEFT JOIN employees e ON u.employee_id = e.id WHERE u.email = ? OR u.username = ?",
                    [normalizedEmail, normalizedEmail]
                );

                if (userRows.length === 0) {
                    if (tenant) {
                        // Provision staff account in existing tenant
                        const newUserId = randomUUID();
                        await tenantPool.query(
                            "INSERT INTO users (id, username, email, role) VALUES (?, ?, ?, 'staff')",
                            [newUserId, normalizedEmail, normalizedEmail]
                        );

                        // 📡 [TredPOS v2.4] Auto-Registry Mapping
                        await registryPool.query(
                            "INSERT IGNORE INTO operator_mappings (tenant_id, email) VALUES (?, ?)",
                            [tenant.id, normalizedEmail]
                        );
                        console.log(`[TredPOS Registry] Auto-Mapped new Google subordinate: ${normalizedEmail}`);
                        user = { id: newUserId, username: normalizedEmail, role: 'staff', display_name: name };
                    } else if (targetDb === "tred_hardware") {
                        // Check for HQ admin login (already verified role above)
                        user = userRows[0];
                    } else {
                        // Mark for onboarding if no tenant exists
                        user = { id: 'pending', username: normalizedEmail, role: 'guest' };
                    }
                } else {
                    user = userRows[0];
                }

                // Generate HSM v2.4 Institutional JWT
                const token = jwt.sign(
                    {
                        id: user.id,
                        username: user.username,
                        role: user.role,
                        name: user.display_name || name || user.username,
                        tenantId: tenant?.id || null,
                        tenantStatus: tenant?.status || 'active',
                        dbName: targetDb,
                        needsOnboarding: !tenant
                    },
                    PRIVATE_KEY,
                    { expiresIn: "12h" }
                );

                return token;
            } catch (err) {
                console.error("Institutional Identity Failure:", err.message);
                throw new Error(`Identity Handshake Failed: ${err.message}`);
            }
        },
        googleRegisterInstitution: async (_, { name, location, phone, email }) => {
            try {
                const tenantId = randomUUID();
                const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                const sanitizedPhone = phone.replace(/[^0-9]/g, '');
                const dbName = `tred_${sanitizedName}_${sanitizedPhone}_hw`;

                await registryPool.query(
                    "INSERT INTO tenants (id, name, physical_location, support_phone, owner_email, db_name, payment_status) VALUES (?, ?, ?, ?, ?, ?, 'pending')",
                    [tenantId, name, location, sanitizedPhone, email.toLowerCase(), dbName]
                );

                return { id: tenantId, db_name: dbName };
            } catch (err) {
                throw new Error(`Institutional Registry Failed: ${err.message}`);
            }
        },
        googleDecommissionRegistry: async (_, { tenantId }) => {
            try {
                // Remove the tenant record if deployment failed or was cancelled
                await registryPool.query("DELETE FROM tenants WHERE id = ? AND payment_status = 'pending'", [tenantId]);
                return true;
            } catch (err) {
                throw new Error(`Registry Decommissioning Failed: ${err.message}`);
            }
        },
        googleFinalizeProvisioning: async (_, { tenantId, password }) => {
            try {
                const [rows] = await registryPool.query("SELECT * FROM tenants WHERE id = ?", [tenantId]);
                const tenant = rows[0];
                if (!tenant) throw new Error("Institutional Record Not Found.");

                // Trigger the Provisioning Factory with the security key
                await provisionInstitution(tenant, password);

                // Activate Tenant
                await registryPool.query("UPDATE tenants SET status = 'active', payment_status = 'paid' WHERE id = ?", [tenantId]);

                return true;
            } catch (err) {
                throw new Error(`Factory Provisioning Failed: ${err.message}`);
            }
        },
        initializeUserDatabase: async (_, __, { db }) => {
            try {
                for (const sql of USER_SCHEMA_SQL) {
                    await db.query(sql);
                }
                return "User database initialized successfully";
            } catch (error) {
                throw new Error(`Failed to initialize user database: ${error.message}`);
            }
        },
    }
};
