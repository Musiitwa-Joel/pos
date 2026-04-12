import { registryPool } from './packages/server/config/config.js';

async function createLifecycleTable() {
  console.log('Initializing Registry Lifecycle Table...');
  try {
    await registryPool.query(`
      CREATE TABLE IF NOT EXISTS registry_lifecycle_events (
        id VARCHAR(36) PRIMARY KEY,
        tenant_id VARCHAR(36) NOT NULL,
        event_type ENUM('GENESIS', 'SETTLEMENT', 'STATUS_CHANGE', 'AUDIT') NOT NULL,
        description TEXT,
        metadata JSON,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_tenant_lifecycle (tenant_id)
      )
    `);
    console.log('Table registry_lifecycle_events created/verified.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

createLifecycleTable();
