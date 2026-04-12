import { initializeRegistry } from "./packages/server/utils/registry.js";
import { registryPool } from "./packages/server/config/config.js";

console.log("📡 [Vanguard HQ] Manual Identity Pulse Triggered...");

try {
  await initializeRegistry();
  console.log("✅ [Vanguard HQ] Institutional Identity Pulse Completed Successfully.");
  process.exit(0);
} catch (err) {
  console.error("❌ [Vanguard HQ] Identity Pulse Failed:", err.message);
  process.exit(1);
}
