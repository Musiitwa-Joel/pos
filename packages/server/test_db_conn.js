import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);

async function test() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "root",
      database: process.env.DB_NAME || "hardware",
      password: process.env.DB_PASSWORD || "",
    });
    console.log("Connection SUCCESS!");
    await db.end();
  } catch (err) {
    console.error("Connection FAILED:", err);
  }
}

test();
