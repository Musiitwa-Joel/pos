import { getTenantPool } from "./packages/server/config/config.js";

async function checkKiyinji() {
    console.log("📡 [Vanguard HQ] Inspecting 'kiyinji' schema for Mukono General identity...");
    try {
        const pool = getTenantPool("kiyinji");
        const [users] = await pool.query("SELECT * FROM users WHERE email = 'musiitwajoel@gmail.com' LIMIT 1");
        
        if (users.length > 0) {
            console.log("✅ [Vanguard HQ] FOUND! 'musiitwajoel@gmail.com' identified in 'kiyinji' database.");
            const [settings] = await pool.query("SELECT setting_value FROM system_settings WHERE setting_key = 'COMPANY_NAME' LIMIT 1");
            console.log("📍 [Vanguard HQ] Business Name Identified:", settings[0]?.setting_value || "Unknown");
        } else {
            console.log("❌ [Vanguard HQ] Identity not found in 'kiyinji' database.");
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ [Vanguard HQ] Inspection Failed:", err.message);
        process.exit(1);
    }
}
checkKiyinji();
