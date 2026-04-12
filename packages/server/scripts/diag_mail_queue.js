import { enqueueMail } from "../utils/mailQueue.js";
import { db } from "../config/config.js";

async function diag() {
  try {
    console.log("[diag] Testing Resilience Layer: Enqueuing Test Notification...");
    
    const result = await enqueueMail({
      to: "test@example.com",
      subject: "HEARTBEAT - Reliable Mail Queue Test",
      fromName: "HSM V2.4 DIAGNOSTIC",
      html: "<h1>System Resilient</h1><p>This email was staged successfully.</p>",
      text: "System Resilient - This email was staged successfully."
    });

    if (result.queued) {
      console.log("[diag] Step 1: Enqueue Success ✅");
      
      const [rows] = await db.query("SELECT * FROM mail_queue WHERE subject LIKE '%HEARTBEAT%' ORDER BY id DESC LIMIT 1");
      if (rows.length > 0) {
        console.log("[diag] Step 2: Persistence Verified in DB ✅");
        console.log("[diag] Payload Summary:", {
          id: rows[0].id,
          to: rows[0].to_address,
          status: rows[0].status,
          cluster: rows[0].db_cluster
        });
      } else {
        console.error("[diag] Step 2: Failed - Record not found in DB ❌");
      }
    } else {
      console.error("[diag] Step 1: Failed to enqueue ❌", result.error);
    }
    
    process.exit(0);
  } catch (err) {
    console.error("[diag] Critical Diagnostic Failure:", err.message);
    process.exit(1);
  }
}

diag();
