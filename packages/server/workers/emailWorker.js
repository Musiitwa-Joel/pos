import { createWorker } from "../utils/queue.js";
import { sendMail } from "../utils/mailer.js";

// Processor for email jobs. Job data should include to, subject, html, text, cc, bcc, fromName
const processor = async (job) => {
  const data = job.data || {};
  const { to, subject, html, text, fromName, cc, bcc, fromEmail } = data;
  try {
    await sendMail({ to, subject, html, text, fromName, fromEmail, cc, bcc });
    console.log(`[emailWorker] sent job ${job.id} to ${to}`);
    return { ok: true };
  } catch (err) {
    console.error(
      `[emailWorker] failed job ${job.id} to ${to}:`,
      err?.message || err
    );
    throw err; // allow BullMQ to handle retries according to job options
  }
};

// Instantiate worker for 'email' queue
const worker = createWorker("email", processor, {
  // concurrency can be tuned via env
  concurrency: process.env.EMAIL_WORKER_CONCURRENCY
    ? Number(process.env.EMAIL_WORKER_CONCURRENCY)
    : 5,
});

export default worker;
