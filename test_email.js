import { sendMail } from './packages/server/utils/mailer.js';

async function testMail() {
  console.log("Testing email transport...");
  try {
    const info = await sendMail({
      to: 'musiitwajoel@gmail.com',
      subject: 'HARDWARE POS - TEST NOTIFICATION',
      text: 'This is a test to verify if the SMTP configuration is working.',
      html: '<h1>TEST SUCCESSFUL</h1><p>Your POS email system is working.</p>'
    });
    console.log("SUCCESS! Message sent:", info.messageId);
    if (info.accepted) console.log("Accepted for delivery:", info.accepted);
    process.exit(0);
  } catch (err) {
    console.error("CRITICAL SMTP FAILURE:", err.message);
    process.exit(1);
  }
}

testMail();
