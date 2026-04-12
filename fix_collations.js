import { db } from './packages/server/config/config.js';

async function migrate() {
  try {
    console.log('Harmonizing database collations for audit_logs...');
    
    // Fix the collation to match the broader project standard (general_ci)
    await db.query(`
      ALTER TABLE audit_logs 
      CONVERT TO CHARACTER SET utf8mb4 
      COLLATE utf8mb4_general_ci
    `);
    
    console.log('Migration successful. utf8mb4_general_ci applied.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
