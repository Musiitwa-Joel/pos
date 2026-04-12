import { db } from './packages/server/config/config.js';

try {
  const [cols] = await db.query("DESCRIBE users;");
  console.log("Users Table Columns:", JSON.stringify(cols.map(c => ({ field: c.Field, type: c.Type })), null, 2));
  
  const [admins] = await db.query("SELECT username, role, employee_id FROM users WHERE role = 'admin'");
  console.log("Admin Users Found:", JSON.stringify(admins, null, 2));
  
  process.exit(0);
} catch (err) {
  console.error("Diagnostic failed:", err.message);
  process.exit(1);
}
