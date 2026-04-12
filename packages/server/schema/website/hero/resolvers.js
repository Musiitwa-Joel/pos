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

const DEFAULT_HERO = {
    blackPart1: "TRADE",
    orangePart: "WITHOUT",
    blackPart2: "LIMITS.",
    description: "The most powerful POS system for modern traders. Built for speed, scale, and absolute reliability.",
    primaryCta: "START FREE TRIAL",
    secondaryCta: "VIEW DEMO",
    marqueeItems: [
        "Forensic Financial Reporting",
        "Client Onboarding Logic",
        "Real-Time Stock Synchronization",
        "HR & Payroll Orchestration",
        "Real-Time Settlement Reports",
        "Secure Multi-Layer Access",
        "Dynamic Ledger Synchronization",
        "Enterprise Hub Architecture",
        "AI-Driven Business Insights",
        "High-Velocity POS Terminal"
    ],
    marqueeSpeed: 20
};

export default {
    Query: {
        getHeroSection: async (_, __, { user }) => {
            try {
                const [rows] = await registryPool.query(
                    "SELECT config_value, updated_at FROM website_config WHERE config_key = 'hero_section' LIMIT 1"
                );

                if (rows.length === 0) {
                    return {
                        ...DEFAULT_HERO,
                        updatedAt: new Date().toISOString()
                    };
                }

                const data = JSON.parse(rows[0].config_value);
                return {
                    ...data,
                    updatedAt: rows[0].updated_at?.toISOString()
                };
            } catch (err) {
                console.error("[Hero Resolver] Discovery failed:", err.message);
                return {
                    ...DEFAULT_HERO,
                    updatedAt: new Date().toISOString()
                };
            }
        }
    },

    Mutation: {
        updateHeroSection: async (_, { input }, { user }) => {
            checkHqAccess(user);

            try {
                const configValue = JSON.stringify(input);

                await registryPool.query(
                    `INSERT INTO website_config (config_key, config_value, updated_at) 
                     VALUES ('hero_section', ?, NOW()) 
                     ON DUPLICATE KEY UPDATE config_value = ?, updated_at = NOW()`,
                    [configValue, configValue]
                );

                const [rows] = await registryPool.query(
                    "SELECT config_value, updated_at FROM website_config WHERE config_key = 'hero_section' LIMIT 1"
                );

                const data = JSON.parse(rows[0].config_value);
                return {
                    ...data,
                    updatedAt: rows[0].updated_at?.toISOString()
                };
            } catch (err) {
                console.error("[Hero Registry Error] Protocol Failure:", err.message);
                throw new Error(`REGISTRY_SYNC_FAIL: ${err.message}`);
            }
        }
    }
};
