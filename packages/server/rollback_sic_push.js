
import { db } from './config/config.js';

async function rollbackPush() {
    const conn = await db.getConnection();
    await conn.beginTransaction();
    try {
        // The admission ID from the logs
        const admissionId = "019b7435-c55a-72e5-bc00-a756f30fbbe9";

        console.log(`Checking for admission: ${admissionId}`);

        const [admissions] = await conn.execute("SELECT student_number FROM admissions WHERE id = ?", [admissionId]);

        if (admissions.length === 0) {
            console.log("Admission record not found.");
            process.exit(0);
        }

        const studentNumber = admissions[0].student_number;
        console.log(`Targeting student number: ${studentNumber}`);

        // Delete from students table
        const [res] = await conn.execute("DELETE FROM students WHERE student_number = ?", [studentNumber]);
        console.log(`Deleted ${res.affectedRows} student record(s).`);

        // Reset admission status
        await conn.execute("UPDATE admissions SET verified_and_sic_bound = 0 WHERE id = ?", [admissionId]);
        console.log("Reset admission verified_and_sic_bound flag.");

        await conn.commit();
        console.log("Rollback complete.");
        process.exit(0);
    } catch (error) {
        await conn.rollback();
        console.error("Rollback failed:", error);
        process.exit(1);
    } finally {
        conn.release();
    }
}

rollbackPush();
