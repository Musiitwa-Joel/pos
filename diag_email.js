import { db } from './packages/server/config/config.js';

try {
  const [rows] = await db.query("SELECT * FROM system_settings WHERE `key` = 'CONTACT_EMAIL'");
  console.log("Settings Found:", JSON.stringify(rows, null, 2));
  
  if (rows.length === 0) {
    console.log("CRITICAL: CONTACT_EMAIL is MISSING from settings.");
  } else if (!rows[0].value || rows[0].value.includes('example.com')) {
    console.log("WARNING: CONTACT_EMAIL is still set to placeholder:", rows[0].value);
  } else {
    console.log("Target Email:", rows[0].value);
  }
  process.exit(0);
} catch (err) {
  console.error("Diagnostic failed:", err.message);
  process.exit(1);
}
