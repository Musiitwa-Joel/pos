import { PRIVATE_KEY, getTenantPool, registryPool } from "../../config/config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { randomUUID, createHash, randomInt } from "crypto";
import { provisionInstitution } from "../../utils/provisioner.js";
import { sendMail } from "../../utils/mailer.js";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

// 🔐 TOTP Configuration Constants for institutional stability
const TOTP_OPTIONS = { 
    step: 300,   // 5 minute window (RFC 6238 period)
    window: 1    // Allow ±1 period (300s before/after)
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const DEFAULT_ADMIN_MODULES = ['dashboard', 'pos', 'inventory', 'credit', 'hr', 'sales', 'reports', 'suppliers', 'expenses', 'returns'];

/**
 * 🔐 Stateful Identity Audit Protocol
 * Transitioned from algorithmic TOTP to Pure Stateful Ledger (Registry Hub).
 * Anchors recovery lifecycle in the database to eliminate clock drift dependencies.
 */
async function storeOTP(email, code) {
    const codeHash = createHash('sha256').update(email.toLowerCase() + code).digest('hex');
    await registryPool.query(
        "INSERT INTO otp_replay_ledger (email, code_hash, is_used, expires_at) VALUES (?, ?, FALSE, DATE_ADD(NOW(), INTERVAL 15 MINUTE))",
        [email.toLowerCase(), codeHash]
    );
}

async function verifyStatefulOTP(email, code) {
    const codeHash = createHash('sha256').update(email.toLowerCase() + code).digest('hex');
    const [existing] = await registryPool.query(
        "SELECT id FROM otp_replay_ledger WHERE email = ? AND code_hash = ? AND is_used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1", 
        [email.toLowerCase(), codeHash]
    );
    return existing.length > 0;
}

async function consumeOTP(email, code) {
    const codeHash = createHash('sha256').update(email.toLowerCase() + code).digest('hex');
    await registryPool.query(
        "UPDATE otp_replay_ledger SET is_used = TRUE WHERE email = ? AND code_hash = ? AND is_used = FALSE",
        [email.toLowerCase(), codeHash]
    );
}

const USER_SCHEMA_SQL = [
    `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    otp_secret VARCHAR(255),
    role VARCHAR(100) DEFAULT 'PENDING_ASSIGNMENT',
    employee_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    authorized_modules TEXT,
    profile_picture VARCHAR(255),
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
            // 🛡️ Deep Identity Bridge: Joint lookup across users, employees, and roles
            const [rows] = await db.query(`
                SELECT 
                    u.*, 
                    e.role as employee_role,
                    r.authorized_modules as primary_role_modules,
                    er.authorized_modules as fallback_role_modules
                FROM users u 
                LEFT JOIN employees e ON u.employee_id = e.id 
                LEFT JOIN roles r ON LOWER(u.role) = LOWER(r.name) 
                LEFT JOIN roles er ON LOWER(e.role) = LOWER(er.name)
                WHERE u.id = ?`, [user.id]).catch(async (err) => {
                    if (err.message.includes("profile_picture")) {
                        // Fallback: Fetch without the new column during transition
                        return db.query(`
                            SELECT 
                                u.id, u.username, u.role, u.employee_id, u.is_active, u.authorized_modules, u.created_at, u.updated_at,
                                e.role as employee_role,
                                r.authorized_modules as primary_role_modules,
                                er.authorized_modules as fallback_role_modules
                            FROM users u 
                            LEFT JOIN employees e ON u.employee_id = e.id 
                            LEFT JOIN roles r ON LOWER(u.role) = LOWER(r.name) 
                            LEFT JOIN roles er ON LOWER(e.role) = LOWER(er.name)
                            WHERE u.id = ?`, [user.id]);
                    }
                    throw err;
                });
            if (rows.length === 0) return null;
            const dbUser = rows[0];
            
            // 📡 Modular Union Protocol: Combine primary, fallback, and override permissions
            let modules = [];
            try {
                const primaryModules = dbUser.primary_role_modules ? JSON.parse(dbUser.primary_role_modules) : [];
                const fallbackModules = dbUser.fallback_role_modules ? JSON.parse(dbUser.fallback_role_modules) : [];
                const userOverrides = dbUser.authorized_modules ? JSON.parse(dbUser.authorized_modules) : [];
                
                // Use primary role modules, otherwise fallback to employee assignment
                const baseModules = primaryModules.length > 0 ? primaryModules : fallbackModules;
                modules = [...new Set([...baseModules, ...userOverrides])];
                
                // 🛡️ Institutional Default Fallback (Restores access for legacy admins)
                if (modules.length === 0 && (dbUser.role?.toUpperCase() === 'ADMIN' || dbUser.employee_role?.toUpperCase() === 'ADMIN')) {
                    modules = DEFAULT_ADMIN_MODULES;
                }
            } catch (e) {
                console.error("Failed to parse module permissions:", e);
            }

            return {
                id: dbUser.id,
                username: dbUser.username,
                role: dbUser.role || dbUser.employee_role || 'staff',
                isActive: dbUser.is_active,
                employeeId: dbUser.employee_id,
                tenantStatus: user.tenantStatus || 'active',
                authorizedModules: modules,
                profilePicture: dbUser.profile_picture,
                createdAt: dbUser.created_at?.toISOString(),
                updatedAt: dbUser.updated_at?.toISOString()
            };
        },
        users: async (_, __, { db }) => {
            const [rows] = await db.query(`
                SELECT u.*, r.authorized_modules as role_modules 
                FROM users u 
                LEFT JOIN roles r ON LOWER(u.role) = LOWER(r.name)`
            ).catch(async (err) => {
                if (err.message.includes("profile_picture")) {
                    return db.query(`
                        SELECT u.id, u.username, u.role, u.employee_id, u.is_active, u.authorized_modules, u.created_at, u.updated_at,
                        r.authorized_modules as role_modules 
                        FROM users u 
                        LEFT JOIN roles r ON LOWER(u.role) = LOWER(r.name)`);
                }
                throw err;
            });
            return rows.map(dbUser => {
                let modules = [];
                try {
                    const roleModules = dbUser.role_modules ? JSON.parse(dbUser.role_modules) : [];
                    const userModules = dbUser.authorized_modules ? JSON.parse(dbUser.authorized_modules) : [];
                    modules = [...new Set([...roleModules, ...userModules])];

                    // 🛡️ Institutional Default Fallback (Synchronizes registry view for legacy admins)
                    if (modules.length === 0 && dbUser.role?.toUpperCase() === 'ADMIN') {
                        modules = DEFAULT_ADMIN_MODULES;
                    }
                } catch (e) {}

                return {
                    id: dbUser.id,
                    username: dbUser.username,
                    role: dbUser.role,
                    isActive: dbUser.is_active,
                    employeeId: dbUser.employee_id,
                    employeeId: dbUser.employee_id,
                    authorizedModules: modules,
                    profilePicture: dbUser.profile_picture,
                    createdAt: dbUser.created_at?.toISOString(),
                    updatedAt: dbUser.updated_at?.toISOString()
                };
            });
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
                SELECT 
                    u.*, 
                    e.name as display_name, 
                    e.status as employment_status,
                    e.role as employee_role,
                    r.authorized_modules as primary_role_modules,
                    er.authorized_modules as fallback_role_modules
                FROM \`${targetDbName}\`.users u 
                LEFT JOIN \`${targetDbName}\`.employees e ON u.employee_id = e.id 
                LEFT JOIN \`${targetDbName}\`.roles r ON LOWER(u.role) = LOWER(r.name) 
                LEFT JOIN \`${targetDbName}\`.roles er ON LOWER(e.role) = LOWER(er.name)
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

            // Calculate initial modules for flicker-free login
            let initialModules = [];
            try {
                const primary = user.primary_role_modules ? JSON.parse(user.primary_role_modules) : [];
                const fallback = user.fallback_role_modules ? JSON.parse(user.fallback_role_modules) : [];
                const overrides = user.authorized_modules ? JSON.parse(user.authorized_modules) : [];
                const base = primary.length > 0 ? primary : fallback;
                initialModules = [...new Set([...base, ...overrides])];

                // 🛡️ Institutional Default Fallback (Restores access for legacy admins during login)
                if (initialModules.length === 0 && (user.role?.toUpperCase() === 'ADMIN' || user.employee_role?.toUpperCase() === 'ADMIN')) {
                    initialModules = DEFAULT_ADMIN_MODULES;
                }
            } catch (e) {
                console.error("Token module calculation failure:", e);
            }

            // Session lasts 24 hours for institutional stability
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    role: user.role || user.employee_role || 'staff',
                    authorizedModules: initialModules,
                    tenantId: tenant ? tenant.id : null,
                    tenantStatus: tenant ? tenant.status : 'active',
                    dbName: targetDbName,
                    name: user.display_name || user.username
                },
                PRIVATE_KEY,
                { expiresIn: "24h" }
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

                // 🛡️ Deep Identity Bridge: Joint lookup for federated token hydration
                let [userRows] = await tenantPool.query(`
                    SELECT 
                        u.*, 
                        e.name as display_name,
                        e.role as employee_role,
                        r.authorized_modules as primary_role_modules,
                        er.authorized_modules as fallback_role_modules
                    FROM users u 
                    LEFT JOIN employees e ON u.employee_id = e.id 
                    LEFT JOIN roles r ON LOWER(u.role) = LOWER(r.name) 
                    LEFT JOIN roles er ON LOWER(e.role) = LOWER(er.name)
                    WHERE u.email = ? OR u.username = ?`,
                    [normalizedEmail, normalizedEmail]
                );

                if (userRows.length === 0) {
                    if (tenant) {
                        // Provision account in existing tenant - Role remains NULL until assigned in HR
                        const newUserId = randomUUID();
                        await tenantPool.query(
                            "INSERT INTO users (id, username, email) VALUES (?, ?, ?)",
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

                // Calculate initial modules for flicker-free login
                let initialModules = [];
                try {
                    const primary = user.primary_role_modules ? JSON.parse(user.primary_role_modules) : [];
                    const fallback = user.fallback_role_modules ? JSON.parse(user.fallback_role_modules) : [];
                    const overrides = user.authorized_modules ? JSON.parse(user.authorized_modules) : [];
                    const base = primary.length > 0 ? primary : fallback;
                    initialModules = [...new Set([...base, ...overrides])];

                // 🛡️ Institutional Default Fallback (Restores access for legacy admins during Google login)
                if (initialModules.length === 0 && (user.role?.toUpperCase() === 'ADMIN' || user.employee_role?.toUpperCase() === 'ADMIN')) {
                    initialModules = DEFAULT_ADMIN_MODULES;
                }
            } catch (e) {
                console.error("Federated token module calculation failure:", e);
            }

                // Generate HSM v2.4 Institutional JWT
                const token = jwt.sign(
                    {
                        id: user.id,
                        username: user.username,
                        role: user.role || user.employee_role || 'staff',
                        authorizedModules: initialModules,
                        name: user.display_name || name || user.username,
                        tenantId: tenant?.id || null,
                        tenantStatus: tenant?.status || 'active',
                        dbName: targetDb,
                        needsOnboarding: !tenant
                    },
                    PRIVATE_KEY,
                    { expiresIn: "24h" }
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
        requestPasswordReset: async (_, { email }) => {
            const normalizedEmail = email.toLowerCase();
            console.log(`[Identity Protocol] Initiating Recovery for: ${normalizedEmail}`);

            // 🛡️ [Federated Discovery] Scan institutional clusters
            const [allTenants] = await registryPool.query("SELECT db_name FROM tenants WHERE status != 'decommissioned'");
            
            // Deduplicate and filter out the registry core itself
            const uniqueClusters = Array.from(new Set([
                "tred_hardware", 
                ...allTenants.map(t => t.db_name)
            ])).filter(dbName => dbName !== 'tredpos_registry');

            let targetPool = null;
            let user = null;

            for (const dbName of uniqueClusters) {
                try {
                    const pool = getTenantPool(dbName);
                    // Identity scan across the current institutional horizon
                    const [rows] = await pool.query("SELECT id, username, email, otp_secret FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?", [normalizedEmail, normalizedEmail]);
                    if (rows.length > 0) {
                        targetPool = pool;
                        user = rows[0];
                        console.log(`[Identity Protocol] Identity found in cluster: ${dbName}`);
                        break;
                    }
                } catch (e) { 
                    console.warn(`[Identity Protocol] Cluster scan failure on ${dbName}: ${e.message}`);
                    continue; 
                }
            }

            if (!user) {
                // Return true to prevent identity enumeration
                return true;
            }

            // Provision OTP Secret if missing (Base32 encoded random string)
            let secret = user.otp_secret;
            if (!secret) {
                secret = generateSecret();
                await targetPool.query("UPDATE users SET otp_secret = ? WHERE id = ?", [secret, user.id]);
            }
            // Infrastructure: Random Cryptographic OTP (Stateful)
            const code = randomInt(100000, 999999).toString();
            
            // Persist to Stateful Identity Ledger
            await storeOTP(normalizedEmail, code);
            
            console.log(`[Identity Protocol] Recovery authorized for ${normalizedEmail}. Dispatching 6-digit handshake.`);

            // Dispatch Institutional Recovery Payload
            try {
                const info = await sendMail({
                    to: normalizedEmail,
                    subject: "TREDPOS: Identity Recovery Authorization",
                    text: `
Hello,

We received a request to reset the password associated with an account.

To proceed, please enter the verification code below:

${code}

This code is valid for 15 minutes and can only be used once. For your security, please do not share this code with anyone.

If you are having trouble, ensure that you enter the code exactly as shown and within the valid time period.

If you did not initiate this request, no further action is required. However, if you have concerns about your account security, we recommend reviewing your account activity or contacting support.

For further assistance, please contact the support team through the appropriate channels.

Thank you,
Support Team
                    `
                });
                console.log(`[Identity Protocol] Recovery payload dispatched successfully. MessageID: ${info?.messageId}`);
            } catch (mailErr) {
                console.error(`[Identity Protocol] CRITICAL: Recovery dispatch failed: ${mailErr.message}`);
                throw new Error("Security Protocol Error: Institutional communication channel is currently unavailable.");
            }

            return true;
        },
        verifyPasswordResetCode: async (_, { email, code }) => {
            const normalizedEmail = email.toLowerCase();
            
            // Federated Discovery
            const [allTenants] = await registryPool.query("SELECT db_name FROM tenants WHERE status != 'decommissioned'");
            const uniqueClusters = Array.from(new Set([
                "tred_hardware", 
                ...allTenants.map(t => t.db_name)
            ])).filter(dbName => dbName !== 'tredpos_registry');

            let user = null;
            for (const dbName of uniqueClusters) {
                try {
                    const pool = getTenantPool(dbName);
                    const [rows] = await pool.query("SELECT id, otp_secret FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?", [normalizedEmail, normalizedEmail]);
                    if (rows.length > 0) {
                        user = rows[0];
                        break;
                    }
                } catch (e) { continue; }
            }

            if (!user || !user.otp_secret) throw new Error("Recovery Authorization Failed: Session Expired or Identity Invalid.");

            try {
                // 🛡️ Forensic Stateful Audit
                const isValid = await verifyStatefulOTP(normalizedEmail, code);
                if (!isValid) {
                    throw new Error("Security Verification Failed: The authorization code provided is invalid, already used, or has expired.");
                }

                console.log(`[Identity Protocol] Handshake Verification for ${normalizedEmail}: ACCEPTED`);
                return true;
            } catch (err) {
                console.error(`[Identity Protocol] Handshake Verification Failure: ${err.message}`);
                if (err.message.includes('Unknown column')) {
                    throw new Error("Institutional Schema Mismatch: This business terminal requires a maintenance update. Please contact Tred Industries.");
                }
                throw err;
            }
        },
        finalizePasswordReset: async (_, { email, code, newPassword }) => {
            try {
                const normalizedEmail = email.toLowerCase();
            
            // Federated Discovery
            const [allTenants] = await registryPool.query("SELECT db_name FROM tenants WHERE status != 'decommissioned'");
            const uniqueClusters = Array.from(new Set([
                "tred_hardware", 
                ...allTenants.map(t => t.db_name)
            ])).filter(dbName => dbName !== 'tredpos_registry');

            let targetPool = null;
            let user = null;

            for (const dbName of uniqueClusters) {
                try {
                    const pool = getTenantPool(dbName);
                    const [rows] = await pool.query("SELECT id, otp_secret, password_hash FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?", [normalizedEmail, normalizedEmail]);
                    if (rows.length > 0) {
                        targetPool = pool;
                        user = rows[0];
                        break;
                    }
                } catch (e) { continue; }
            }

            if (!user || !user.otp_secret) throw new Error("Recovery Authorization Failed: Session Expired or Identity Invalid.");

            // 🛡️ Forensic Stateful Audit: Block reuse for password commitment
            const isValid = await verifyStatefulOTP(normalizedEmail, code);
            if (!isValid) {
                throw new Error("Security Verification Failed: This authorization code has already been consumed and cannot be reused for security finalization.");
            }

            console.log(`[Identity Protocol] Final Handshake Verification for ${normalizedEmail}: ACCEPTED`);

            // Security Guardrail: Prevent Reuse of Current Password
            const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
            if (isSamePassword) {
                throw new Error("Security Policy: Your new password cannot be the same as your current password. Please choose a distinct one.");
            }

            // Finalize Recovery: Re-hash and Persist
            const password_hash = await bcrypt.hash(newPassword, 12);
            await targetPool.query("UPDATE users SET password_hash = ? WHERE id = ?", [password_hash, user.id]);

            // 🏁 🔐 Consume Identity Ledger Record
            await consumeOTP(normalizedEmail, code);

            console.log(`[Identity Protocol] Recovery SUCCESS for ${normalizedEmail} [Cluster: ${targetPool.config?.connectionConfig?.database}]`);

            return true;
        } catch (err) {
            console.error(`[Identity Protocol] Recovery Finalization Failure: ${err.message}`);
            // Map technical errors to friendly messages
            if (err.message.includes('data and hash')) {
                throw new Error("Security System Error: Failed to retrieve current identity state. Please try requesting a new code.");
            }
            if (err.message.includes('Unknown column')) {
                throw new Error("Institutional Schema Mismatch: The database for this business requires a maintenance update. Please contact support.");
            }
            throw err;
        }
    },
        initializeUserDatabase: async (_, __, { db }) => {
            try {
                // Ensure profile_picture column exists (Forensic Migration)
                try {
                    await db.query("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) AFTER authorized_modules");
                } catch (e) {}

                // Ensure otp_secret column exists (Recovery Migration)
                try {
                    await db.query("ALTER TABLE users ADD COLUMN otp_secret VARCHAR(255) AFTER password_hash");
                } catch (e) {}

                for (const sql of USER_SCHEMA_SQL) {
                    await db.query(sql);
                }
                return "User database initialized successfully";
            } catch (error) {
                throw new Error(`Failed to initialize user database: ${error.message}`);
            }
        },
        updateProfilePicture: async (_, { file }, { db, user }) => {
            if (!user) throw new Error("UNAUTHORIZED: Identity required for avatar uplink.");

            // 🛡️ [Atomic Schema Healing] Ensure column existence before persistence
            try {
                // Ensure we are operating on the correct tenant database
                await db.query(`ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) AFTER authorized_modules`);
                console.log("[TredPOS Migration] Profile picture column provisioned successfully.");
            } catch (e) {
                if (!e.message.includes("Duplicate column name")) {
                    console.error("[TredPOS Migration Failure] Could not provision column:", e.message);
                }
            }

            const { createReadStream, filename, mimetype } = await file;

            if (!mimetype || !mimetype.startsWith('image/')) {
                throw new Error("SECURITY_VIOLATION: Only high-integrity image payloads are authorized.");
            }

            const extension = path.extname(filename) || '.jpg';
            const storedFileName = `${user.id}-${Date.now()}${extension}`;
            const uploadsDir = path.join(__dirname, "../../public/uploads/avatars");
            const filePath = path.join(uploadsDir, storedFileName);

            // 🚀 [Vanguard Optimization] Stream & Circular Compress
            const stream = createReadStream();
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);

            await sharp(buffer)
                .resize(200, 200, { fit: 'cover' })
                .toFile(filePath);

            const publicUrl = `/uploads/avatars/${storedFileName}`;

            // Persist to institutional database
            await db.query("UPDATE users SET profile_picture = ? WHERE id = ?", [publicUrl, user.id]);

            // Return hydrated user identity
            const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [user.id]);
            const updatedUser = rows[0];

            return {
                id: updatedUser.id,
                username: updatedUser.username,
                role: updatedUser.role,
                profilePicture: updatedUser.profile_picture,
                isActive: updatedUser.is_active,
                employeeId: updatedUser.employee_id
            };
        },
    }
};
