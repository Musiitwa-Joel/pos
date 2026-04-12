import { GraphQLError } from "graphql";
import { v7 as uuidv7 } from "uuid";
import { registryPool, getTenantPool } from "../../config/config.js";
import { sendMail } from "../../utils/mailer.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const HQ_ROLE = "hq-ceo";

const checkHqAccess = (user) => {
    if (!user || user.role !== HQ_ROLE) {
        throw new GraphQLError("ACCESS_DENIED: TredPOS Ind. privilege required for CEO operation.", {
            extensions: { code: "FORBIDDEN" },
        });
    }
};

const syncPhysicalEnv = async () => {
    try {
        const [allSettings] = await registryPool.query("SELECT * FROM system_settings");
        let envContent = "# TredPOS Industrial Governance Protocol - AUTO_GENERATED\n";
        
        envContent += `GENERATED_AT="${new Date().toISOString()}"\n\n`;

        for (const row of allSettings) {
            const sanitizedValue = (row.setting_value || "").toString().replace(/"/g, '\\"');
            envContent += `${row.setting_key.toUpperCase()}="${sanitizedValue}"\n`;
        }

        const envPath = fileURLToPath(new URL("../../.env", import.meta.url));
        fs.writeFileSync(envPath, envContent, 'utf8');
        console.log(`[Governance Hub] Physical Sync Complete: Recreated .env at ${envPath}`);
        return true;
    } catch (err) {
        console.error("[Governance Hub] Physical Sync Failed:", err.message);
        return false;
    }
};

export default {
    Query: {
        allInstitutionsHq: async (_, __, { user }) => {
            // 🛡️ Security Guard: CEO ONLY
            checkHqAccess(user);

            const [rows] = await registryPool.query(`
                SELECT 
                    t.*,
                    p.name as plan_name,
                    p.monthly_fee as plan_fee,
                    p.features as plan_features,
                    (SELECT MAX(payment_date) FROM system_payments WHERE tenant_id = t.id) as last_payment_date
                FROM tenants t
                LEFT JOIN billing_plans p ON COALESCE(t.plan_id, 'plan_power') = p.id
                ORDER BY t.created_at DESC
            `);

            // 👑 Institutional Staff Discovery (Active Ops)
            const resolvedRows = await Promise.all(rows.map(async (row) => {
                let operators = [];
                let totalStaff = 0;
                let storageUsage = 0;
                let pulseVelocity = 0;
                let complianceScore = 95; // Base score
                let lastSaleAt = null;

                try {
                    const tenantPool = getTenantPool(row.db_name);

                    // 1. 📊 Telemetry: Infrastructure Audit (Real Storage)
                    const [[{ size_mb }]] = await tenantPool.query(`
                        SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb 
                        FROM information_schema.tables 
                        WHERE table_schema = ?`,
                        [row.db_name]
                    );
                    storageUsage = size_mb || 0.1; // Default min trace

                    // 2. ⚡ Telemetry: Pulse Audit (Transaction Velocity)
                    const [[{ activity_count }]] = await tenantPool.query(
                        "SELECT COUNT(*) as activity_count FROM sales WHERE created_at > (NOW() - INTERVAL 1 DAY)"
                    );
                    pulseVelocity = Math.min(100, (activity_count / 50) * 100);

                    const [[latestSale]] = await tenantPool.query(
                        "SELECT created_at FROM sales ORDER BY created_at DESC LIMIT 1"
                    );
                    lastSaleAt = latestSale?.created_at?.toISOString() || null;

                    // 3. 🛡️ Forensic Audit: Security Score
                    const [suspensions] = await registryPool.query(
                        "SELECT COUNT(*) as count FROM registry_lifecycle_events WHERE tenant_id = ? AND event_type = 'SUSPENDED'",
                        [row.id]
                    );
                    if (suspensions[0]?.count > 0) complianceScore -= 15;

                    // Discovery for staff footprint
                    const [userRows] = await tenantPool.query(
                        "SELECT id, username, role FROM users WHERE role IN ('admin', 'manager', 'staff') LIMIT 6"
                    );
                    operators = userRows;

                    const [countRows] = await tenantPool.query("SELECT COUNT(*) as exact_total FROM users");
                    totalStaff = countRows[0]?.exact_total || 0;
                    if (totalStaff === 0) complianceScore -= 5;

                } catch (err) {
                    console.warn(`[Registry Hub] Telemetry Failure for ${row.db_name}: ${err.message}`);
                    complianceScore = 50; // Critical warning score if node is unreachable
                }

                return {
                    id: row.id,
                    name: row.name,
                    physicalLocation: row.physical_location,
                    supportEmail: row.support_email,
                    supportPhone: row.support_phone,
                    dbName: row.db_name,
                    ownerEmail: row.owner_email,
                    paymentStatus: row.payment_status,
                    status: row.status,
                    createdAt: row.created_at?.toISOString(),
                    operators,
                    totalStaff,
                    storageUsage,
                    pulseVelocity,
                    complianceScore,
                    lastSaleAt,
                    plan: {
                        id: row.plan_id || 'plan_power',
                        name: row.plan_name || 'TREDPOS POWER',
                        monthlyFee: row.plan_fee || 0,
                        features: row.plan_features || ''
                    }
                };
            }));

            return resolvedRows;
        },

        getRegistrySettings: async (_, __, { user }) => {
            checkHqAccess(user);
            const [rows] = await registryPool.query("SELECT setting_key as 'key', setting_value as 'value' FROM system_settings");
            return rows;
        }
    },

    Mutation: {
        updateInstitutionStatus: async (_, { id, status }, { user }) => {
            checkHqAccess(user);

            // 1. Fetch info for the notification
            const [rows] = await registryPool.query("SELECT * FROM tenants WHERE id = ? LIMIT 1", [id]);
            const tenant = rows[0];
            if (!tenant) throw new Error("Institution not found.");

            await registryPool.query(
                "UPDATE tenants SET status = ?, updated_at = NOW() WHERE id = ?",
                [status, id]
            );

            // Log Lifecycle Event: STATUS_CHANGE
            await registryPool.query(
                `INSERT INTO registry_lifecycle_events (id, tenant_id, event_type, description, metadata) 
                 VALUES (?, ?, 'STATUS_CHANGE', ?, ?)`,
                [uuidv7(), id, `Institutional state transitioned to: ${status.toUpperCase()}`, JSON.stringify({ status, timestamp: new Date().toISOString() })]
            );

            // 3. Automated Notification Protocol
            if (status === 'suspended') {
                try {
                    await sendMail({
                        to: tenant.owner_email,
                        subject: `URGENT_NOTICE: Business Account Suspension for ${tenant.name}`,
                        html: `
                            <div style="font-family: sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px;">
                                <h2 style="color: #ef4444; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #fee2e2; padding-bottom: 10px;">Account Suspension Notice</h2>
                                <p>Dear <b>${tenant.name} Administration</b>,</p>
                                <p>We hope this message finds you well.</p>
                                <p>We are writing to inform you that your business account on the <b>TREDPOS Platform</b> has been temporarily suspended due to outstanding payment obligations that remain unresolved at this time.</p>
                                <p>This action has been taken in accordance with our service terms to ensure compliance with agreed financial commitments. The suspension may limit access to certain features and services on the platform until the matter is addressed.</p>
                                <p>We kindly request that you review your account and settle any pending balances at your earliest convenience. Once the outstanding obligations are cleared, your account access will be promptly restored.</p>
                                <p>If you believe this action has been taken in error or if you require clarification regarding your account status, please do not hesitate to contact our support team for assistance.</p>
                                <p>We value your partnership and look forward to resolving this matter so we can continue supporting your business operations.</p>
                                <p>Thank you for your understanding and cooperation.</p>
                                <br/>
                                <p>Warm regards,</p>
                                <p><b>Tred Industries HQ</b><br/><span style="font-size: 10px; color: #94a3b8;">TredPOS Global Discovery Protocol | Registry Auth System</span></p>
                            </div>
                        `,
                        db: null
                    });
                    console.log(`[Registry Hub] Suspension protocol executed for ${tenant.name}. Notice dispatched.`);
                } catch (emailErr) {
                    console.error("[Registry Hub] Failed to send suspension notice:", emailErr.message);
                }
            }

            return true;
        },

        updateRegistrySetting: async (_, { key, value }, { user }) => {
            checkHqAccess(user);

            // 1. Persist to Registry Database
            await registryPool.query(
                "INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
                [key, value, value]
            );

            // 2. Physical .env Sync
            await syncPhysicalEnv();

            return true;
        },

        forceRegistrySync: async (_, __, { user }) => {
            checkHqAccess(user);
            return await syncPhysicalEnv();
        }
    }
};
