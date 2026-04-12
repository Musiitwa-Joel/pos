import { registryPool } from "../../../config/config.js";
import { GraphQLError } from "graphql";

const HQ_ROLE = "hq-ceo";

const checkHqAccess = (user) => {
    if (!user || user.role !== HQ_ROLE) {
        throw new GraphQLError("ACCESS_DENIED: TredPOS HQ privilege required for Website configuration.", {
            extensions: { code: "FORBIDDEN" },
        });
    }
};

const DEFAULT_PRICING = {
    planName: "TREDPOS POWER",
    basePrice: "20K USH",
    billingInterval: "/MONTH",
    subLabel: "UNIFIED LICENSE TIER",
    calculatorBaseRate: 20000.0,
    calculatorHeadline: "SCALE YOUR YIELD",
    features: [
        { title: "Industrial Profit Auditing", description: "Stop revenue leaks with forensic ledger matching and real-time reconciliation." },
        { title: "Global Node Inventory", description: "Synchronize unlimited warehouses with sub-second stock accuracy." },
        { title: "Customer Loyalty Engine", description: "Build elite revenue momentum with automated rewards and promotions." },
        { title: "Military-Grade Security", description: "FIPS-compliant biometric authentication for every register terminal." },
        { title: "Multi-Store Command Hub", description: "Manage your entire retail empire from a single high-innovation dashboard." },
        { title: "Predictive Yield AI", description: "Forecast demand and optimize stock with the TredPOS momentum engine." }
    ]
};

export default {
    Query: {
        getWebsitePricing: async (_, __, { user }) => {
            try {
                // Fetch live ecosystem stats: Filter out HQ Root Node and internal test nodes
                const [tenants] = await registryPool.query(
                    "SELECT name FROM tenants WHERE status = 'active' AND id != 'HQ_VANGUARD_CORE' ORDER BY created_at DESC LIMIT 10"
                );
                const [[{ count }]] = await registryPool.query(
                    "SELECT COUNT(*) as count FROM tenants WHERE status = 'active' AND id != 'HQ_VANGUARD_CORE'"
                );

                const [rows] = await registryPool.query(
                    "SELECT config_value, updated_at FROM website_config WHERE config_key = 'pricing_plans' LIMIT 1"
                );

                let data = DEFAULT_PRICING;
                let updatedAt = new Date().toISOString();

                if (rows.length > 0) {
                    data = JSON.parse(rows[0].config_value);
                    updatedAt = rows[0].updated_at?.toISOString();
                }

                return {
                    ...data,
                    onboardedCount: count,
                    onboardedTenants: tenants.map(t => t.name),
                    updatedAt
                };
            } catch (err) {
                console.error("[Pricing Resolver] Discovery failed:", err.message);
                return {
                    ...DEFAULT_PRICING,
                    onboardedCount: 0,
                    onboardedTenants: [],
                    updatedAt: new Date().toISOString()
                };
            }
        }
    },

    Mutation: {
        updateWebsitePricing: async (_, { input }, { user }) => {
            checkHqAccess(user);

            try {
                // Ensure features is never null to prevent downstream UI crashes
                if (!input.features) input.features = [];

                const configValue = JSON.stringify(input);

                // 1. Update Website Marketing View
                await registryPool.query(
                    `INSERT INTO website_config (config_key, config_value, updated_at) 
                     VALUES ('pricing_plans', ?, NOW()) 
                     ON DUPLICATE KEY UPDATE config_value = ?, updated_at = NOW()`,
                    [configValue, configValue]
                );

                // 2. 🛡️ Vanguard Sync: Update Registry Billing Hub
                // Extracts numeric USH from strings like "100K USH" or "20,000"
                const rawPrice = input.basePrice || "0";
                const isK = rawPrice.toLowerCase().includes('k');
                const numericPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) * (isK ? 1000 : 1);

                // Flatten complex feature objects into a Registry audit string
                const serialFeatures = input.features.map(f => f.title).join(', ');

                await registryPool.query(
                    `INSERT INTO billing_plans (id, name, monthly_fee, features, created_at)
                     VALUES ('plan_power', ?, ?, ?, NOW())
                     ON DUPLICATE KEY UPDATE name = ?, monthly_fee = ?, features = ?`,
                    [input.planName, numericPrice, serialFeatures, input.planName, numericPrice, serialFeatures]
                );

                const [rows] = await registryPool.query(
                    "SELECT config_value, updated_at FROM website_config WHERE config_key = 'pricing_plans' LIMIT 1"
                );

                const data = JSON.parse(rows[0].config_value);
                return {
                    ...data,
                    updatedAt: rows[0].updated_at?.toISOString()
                };
            } catch (err) {
                console.error("[Pricing Registry Error] Protocol Failure:", err.message);

                // Return a human-readable error based on common failure modes
                if (err.message.includes("ECONNREFUSED")) {
                    throw new Error("REGISTRY_OFFLINE: Connection to the TredPOS Registry was refused.");
                }
                if (err.message.includes("Data too long")) {
                    throw new Error("PAYLOAD_LIMIT: The pricing metadata exceeds allowed storage limits.");
                }

                throw new Error(`REGISTRY_SYNC_FAIL: ${err.message}`);
            }
        }
    }
};
