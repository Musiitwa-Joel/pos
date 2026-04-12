import { db } from './packages/server/config/config.js';

try {
  const [rows] = await db.query("SELECT setting_key as 'key', setting_value as 'value' FROM system_settings WHERE setting_key = 'CONTACT_EMAIL'");
  console.log("Settings Found:", JSON.stringify(rows, null, 2));
  
  if (rows.length === 0) {
    console.log("CRITICAL: CONTACT_EMAIL is MISSING from system_settings.");
    
    // Check what keys DO exist
    const [allKeys] = await db.query("SELECT setting_key FROM system_settings LIMIT 10");
    console.log("Existing keys (sample):", allKeys.map(k => k.setting_key).join(', '));
  } else {
    console.log("Target Email:", rows[0].value);
  }
  process.exit(0);
} catch (err) {
  console.error("Diagnostic failed:", err.message);
  process.exit(1);
}
