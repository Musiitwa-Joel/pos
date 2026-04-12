import { sendMail } from "./packages/server/utils/mailer.js";

async function test() {
  console.log("Starting SMTP Diagnostic test...");
  try {
    const res = await sendMail({
      to: "jmusiitwa.std@nkumbauniversity.ac.ug",
      subject: "HSM v2.4 SMTP Diagnostic Test",
      html: "<h1>SMTP Diagnostics</h1><p>If you see this, the HSM v2.4 Vanguard Factory communication matrix is 100% operational.</p>"
    });
    console.log("Diagnostic Success:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Diagnostic Failure:", err.message);
  }
  process.exit(0);
}

test();
