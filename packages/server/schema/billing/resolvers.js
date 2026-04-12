import { v7 as uuidv7 } from "uuid";
import { registryPool } from "../../config/config.js";
import { sendMail } from "../../utils/mailer.js";
import { GraphQLError } from "graphql";

const HQ_ROLE = "hq-ceo";

const checkHqAccess = (user) => {
    if (!user || user.role !== HQ_ROLE) {
        throw new GraphQLError("ACCESS_DENIED: Tredpos HQ privilege required for CEO operation.", {
            extensions: { code: "FORBIDDEN" },
        });
    }
};

const mapSystemPayment = (row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    amount: row.amount,
    paymentDate: row.payment_date?.toISOString(),
    paymentMethod: row.payment_method,
    periodLabel: row.period_label,
    recordedBy: row.recorded_by,
    notes: row.notes,
    createdAt: row.created_at?.toISOString()
});

export default {
    Query: {
        billingPlans: async (_, __, { user }) => {
            checkHqAccess(user);
            const [rows] = await registryPool.query("SELECT * FROM billing_plans ORDER BY monthly_fee ASC");
            return rows.map(row => ({
                id: row.id,
                name: row.name,
                monthlyFee: row.monthly_fee,
                features: row.features,
                createdAt: row.created_at?.toISOString()
            }));
        },

        recentSystemPayments: async (_, { limit = 20 }, { user }) => {
            checkHqAccess(user);
            const [rows] = await registryPool.query(
                "SELECT * FROM system_payments ORDER BY payment_date DESC LIMIT ?",
                [limit]
            );
            return rows.map(mapSystemPayment);
        },

        institutionPayments: async (_, { tenantId }, { user }) => {
            checkHqAccess(user);
            const [rows] = await registryPool.query(
                "SELECT * FROM system_payments WHERE tenant_id = ? ORDER BY payment_date DESC",
                [tenantId]
            );
            return rows.map(mapSystemPayment);
        },

        getInstitutionInsights: async (_, { tenantId }, { user }) => {
            checkHqAccess(user);

            const [rows] = await registryPool.query("SELECT * FROM tenants WHERE id = ? LIMIT 1", [tenantId]);
            const tenant = rows[0];
            if (!tenant) throw new Error("Institution node not found in registry.");

            try {
                const [payRows] = await registryPool.query(
                    "SELECT SUM(amount) as total, COUNT(*) as count FROM system_payments WHERE tenant_id = ?",
                    [tenantId]
                );

                const [staffRows] = await registryPool.query(
                    "SELECT COUNT(*) as st_count FROM operator_mappings WHERE tenant_id = ?",
                    [tenantId]
                );

                const createdAt = new Date(tenant.created_at);
                const ageDays = Math.floor((new Date().getTime() - createdAt.getTime()) / (1000 * 3600 * 24));

                return {
                    totalPaidAmount: payRows[0]?.total || 0,
                    paymentCount: payRows[0]?.count || 0,
                    activeStaffCount: staffRows[0]?.st_count || 0,
                    accountAgeDays: ageDays,
                    subscriptionIntensity: tenant.payment_status === 'paid' ? 'High' : 'Low',
                    lastRegistryAudit: new Date().toISOString()
                };
            } catch (err) {
                console.error(`[Institutional Intelligence] Registry discovery failed for ${tenant.name}:`, err.message);
                return null;
            }
        },

        getInstitutionLifecycleEvents: async (_, { tenantId }, { user }) => {
            checkHqAccess(user);
            const [rows] = await registryPool.query(
                "SELECT * FROM registry_lifecycle_events WHERE tenant_id = ? ORDER BY recorded_at DESC",
                [tenantId]
            );
            return rows.map(row => ({
                id: row.id,
                tenantId: row.tenant_id,
                eventType: row.event_type,
                description: row.description,
                metadata: row.metadata ? JSON.stringify(row.metadata) : null,
                recordedAt: row.recorded_at?.toISOString()
            }));
        }
    },

    Mutation: {
        recordSystemPayment: async (_, { payload }, { user }) => {
            checkHqAccess(user);
            const id = uuidv7();
            const { tenantId, amount, paymentDate, paymentMethod, periodLabel, notes } = payload;
            const parsedDate = new Date(paymentDate);

            await registryPool.query(
                `INSERT INTO system_payments (id, tenant_id, amount, payment_date, payment_method, period_label, recorded_by, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, tenantId, amount, parsedDate, paymentMethod, periodLabel, user.username, notes]
            );

            await registryPool.query(
                "UPDATE tenants SET payment_status = 'paid', updated_at = NOW() WHERE id = ?",
                [tenantId]
            );

            // Log Lifecycle Event: SETTLEMENT
            await registryPool.query(
                `INSERT INTO registry_lifecycle_events (id, tenant_id, event_type, description, metadata) 
                 VALUES (?, ?, 'SETTLEMENT', ?, ?)`,
                [uuidv7(), tenantId, `Permanent settlement recorded: ${amount} USh for ${periodLabel}`, JSON.stringify({ amount, periodLabel, method: paymentMethod })]
            );

            const [rows] = await registryPool.query("SELECT * FROM system_payments WHERE id = ?", [id]);
            return mapSystemPayment(rows[0]);
        },

        createBillingPlan: async (_, { name, monthlyFee, features }, { user }) => {
            checkHqAccess(user);
            const id = uuidv7();
            await registryPool.query(
                "INSERT INTO billing_plans (id, name, monthly_fee, features) VALUES (?, ?, ?, ?)",
                [id, name, monthlyFee, features]
            );
            const [rows] = await registryPool.query("SELECT * FROM billing_plans WHERE id = ?", [id]);
            return {
                id: rows[0].id,
                name: rows[0].name,
                monthlyFee: rows[0].monthly_fee,
                features: rows[0].features,
                createdAt: rows[0].created_at?.toISOString()
            };
        },

        sendBillingReminder: async (_, { tenantId }, { user }) => {
            checkHqAccess(user);

            const [rows] = await registryPool.query(
                "SELECT * FROM tenants WHERE id = ? LIMIT 1",
                [tenantId]
            );
            const tenant = rows[0];
            if (!tenant) throw new Error("Institution not found in registry.");

            const [planRows] = await registryPool.query(
                "SELECT * FROM billing_plans WHERE id = ? LIMIT 1",
                [tenant.plan_id]
            );
            const plan = planRows[0];

            try {
                await sendMail({
                    to: tenant.owner_email,
                    subject: `BILLING_PROTOCOL: Monthly System Fee for ${tenant.name}`,
                    html: `
                        <div style="font-family: sans-serif; color: #1e293b; padding: 20px;">
                            <h2 style="color: #ea580c; text-transform: uppercase; letter-spacing: 2px;">TredPOS Industries Hub</h2>
                            <p>Greetings from Tred Industries HQ.</p>
                            <p>This is a formal reminder regarding your institutional system fee for <b>${tenant.name}</b>.</p>
                            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase;">Payment Outstanding</p>
                                <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${plan?.monthly_fee || '---'} UGX</p>
                                <p style="font-size: 12px;"><b>Plan:</b> ${plan?.name || 'Standard'}</p>
                            </div>
                            <p>Please ensure payment is processed to avoid service interruptions.</p>
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                            <p style="font-size: 11px; color: #94a3b8;">Tred Industries  | Multi-Tenant ERP Architecture</p>
                        </div>
                    `,
                    db: null
                });

                await registryPool.query(
                    "UPDATE tenants SET payment_status = 'pending' WHERE id = ?",
                    [tenantId]
                );

                return true;
            } catch (err) {
                console.error("[Hq Billing] Failed to send reminder email:", err);
                return false;
            }
        },

        updateMasterPricing: async (_, { monthlyFee }, { user }) => {
            checkHqAccess(user);

            const [plans] = await registryPool.query("SELECT * FROM billing_plans ORDER BY created_at ASC LIMIT 1");

            if (plans.length > 0) {
                const planId = plans[0].id;
                await registryPool.query(
                    "UPDATE billing_plans SET monthly_fee = ?, updated_at = NOW() WHERE id = ?",
                    [monthlyFee, planId]
                );

                const [updated] = await registryPool.query("SELECT * FROM billing_plans WHERE id = ?", [planId]);
                return {
                    id: updated[0].id,
                    name: updated[0].name,
                    monthlyFee: updated[0].monthly_fee,
                    features: updated[0].features,
                    createdAt: updated[0].created_at?.toISOString()
                };
            } else {
                const id = uuidv7();
                await registryPool.query(
                    "INSERT INTO billing_plans (id, name, monthly_fee, features, created_at) VALUES (?, ?, ?, ?, NOW())",
                    [id, "Tredpos Master", monthlyFee, "Full Ecosystem Access // Unrestricted"]
                );

                return {
                    id,
                    name: "Tredpos Master",
                    monthlyFee,
                    features: "Full Ecosystem Access // Unrestricted",
                    createdAt: new Date().toISOString()
                };
            }
        }
    }
};
