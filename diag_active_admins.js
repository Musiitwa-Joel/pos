import { db } from './packages/server/config/config.js';

try {
  const [admins] = await db.query("SELECT username, role, is_active FROM users WHERE role = 'admin'");
  console.log("Admin Users Status:", JSON.stringify(admins, null, 2));
  
  if (admins.length === 0) {
    console.log("CRITICAL: No admins found at all.");
  } else {
    const active = admins.filter(a => a.is_active === 1 || a.is_active === true);
    console.log("Active Admins Count:", active.length);
  }
  process.exit(0);
} catch (err) {
  console.error("Diagnostic failed:", err.message);
  process.exit(1);
}
