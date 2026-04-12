
import { db } from "../config/config.js";

const createTable = async () => {
    try {
        console.log("Creating system_logs table...");
        await db.execute(`
            CREATE TABLE IF NOT EXISTS system_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                action_type VARCHAR(50) NOT NULL,
                module VARCHAR(50) NOT NULL,
                description TEXT,
                ip_address VARCHAR(45),
                user_agent VARCHAR(255),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=MyISAM;
        `);
        console.log("Table system_logs created successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Failed to create table:", error);
        process.exit(1);
    }
};

createTable();
