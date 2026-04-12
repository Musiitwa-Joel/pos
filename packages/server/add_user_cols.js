import { db } from './config/config.js';

const run = async () => {
    try {
        // Check if columns exist first to avoid error if re-run, or just try ADD and catch error
        // Using try-catch for simplicity as ADD COLUMN will fail if exists
        try {
            await db.execute("ALTER TABLE users ADD COLUMN last_logged_in DATETIME DEFAULT NULL");
            console.log("Added last_logged_in");
        } catch (e) { console.log("last_logged_in might exist:", e.message); }

        try {
            await db.execute("ALTER TABLE users ADD COLUMN last_active DATETIME DEFAULT NULL");
            console.log("Added last_active");
        } catch (e) { console.log("last_active might exist:", e.message); }

    } catch (e) {
        console.error("Critical error:", e);
    }
    process.exit();
};
run();
