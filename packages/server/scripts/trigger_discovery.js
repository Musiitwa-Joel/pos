import { initializeRegistry } from '../utils/registry.js';

async function triggerDiscovery() {
  console.log("🚀 [Vanguard Hub] Forcing Institutional Node Discovery...");
  try {
    await initializeRegistry();
    console.log("✅ [Vanguard Hub] Discovery Sequence Executed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ [Vanguard Hub] Discovery Trigger Failure:", err.message);
    process.exit(1);
  }
}

triggerDiscovery();
