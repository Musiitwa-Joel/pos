import { db } from "../config/config.js";

const updateResultsSections = async () => {
    console.log("Starting update of NULL section_ids in student_results...");

    try {
        const connection = await db.getConnection();

        try {
            const sql = `
        UPDATE student_results r
        JOIN students s ON r.student_id = s.id
        SET r.section_id = s.section_id
        WHERE r.section_id IS NULL AND s.section_id IS NOT NULL
      `;

            const [result] = await connection.execute(sql);

            console.log(`Successfully updated ${result.affectedRows} rows.`);

        } catch (error) {
            console.error("Error executing update query:", error);
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Database connection failed:", error);
    } finally {
        process.exit(0);
    }
};

updateResultsSections();
