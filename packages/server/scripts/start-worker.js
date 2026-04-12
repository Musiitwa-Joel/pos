#!/usr/bin/env node
// Simple runner to start server workers in a separate process.
// Usage: node scripts/start-worker.js

// Defer loading heavy modules until runtime to avoid interfering with app startup
import path from "path";
import { fileURLToPath } from "url";
import net from "net";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  console.log("Starting workers...");
  try {
    // Wait for Redis to be available before importing the worker.
    // This avoids tight ECONNREFUSED spam in logs when Redis is not running.
    const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
    const REDIS_PORT = process.env.REDIS_PORT
      ? Number(process.env.REDIS_PORT)
      : 6379;

    console.log(`Configured Redis: ${REDIS_HOST}:${REDIS_PORT}`);
    console.log(
      "If Redis isn't running, start it with `brew services start redis` or `docker run -p 6379:6379 -d redis:7`."
    );

    // default to fewer attempts and a lower max backoff so dev feedback is faster
    const waitForRedis = async (maxAttempts = 5) => {
      let attempt = 0;
      while (attempt < maxAttempts) {
        attempt += 1;
        try {
          // lightweight socket connect attempt
          await new Promise((resolve, reject) => {
            const socket = new net.Socket();
            socket.setTimeout(2000);
            socket.once("error", (err) => {
              socket.destroy();
              reject(err);
            });
            socket.once("timeout", () => {
              socket.destroy();
              reject(new Error("timeout"));
            });
            socket.connect(REDIS_PORT, REDIS_HOST, () => {
              socket.end();
              resolve(true);
            });
          });
          console.log(`Redis reachable at ${REDIS_HOST}:${REDIS_PORT}`);
          return;
        } catch (err) {
          // exponential backoff with a cap of 5000ms for faster dev feedback
          const backoffMs = Math.min(5000, 500 * 2 ** attempt);
          console.log(
            `Redis not reachable (attempt ${attempt}/${maxAttempts}), retrying in ${backoffMs}ms...`
          );
          await new Promise((r) => setTimeout(r, backoffMs));
        }
      }
      throw new Error(`Redis not reachable after ${maxAttempts} attempts`);
    };

    await waitForRedis();

    // import the worker module which registers with BullMQ
    const workerModulePath = path.join(
      __dirname,
      "..",
      "workers",
      "emailWorker.js"
    );
    const worker = await import(workerModulePath);
    console.log("Worker module loaded.");
    // keep process alive
    process.stdin.resume();
    process.on("SIGINT", () => {
      console.log("Shutting down workers...");
      process.exit(0);
    });
  } catch (err) {
    console.error("Failed to start workers:", err?.message || err);
    process.exit(1);
  }
}

start();
