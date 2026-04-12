import { db } from "./config/config.js";
import { archiveOldResults } from "./jobs/archive_results_job.js";
import { ensureAccYrsTable } from "./schema/setup/acc_yrs/resolvers.js";
import { v7 as uuidv7 } from "uuid";

const runVerification = async () => {
    console.log("Starting verification of archive job...");
    await ensureAccYrsTable();
    const connection = await db.getConnection();

    try {
        // 1. Create a dummy academic year that is older than 5 years
        const oldAccYrId = uuidv7();
        const oldStartDate = new Date();
        oldStartDate.setFullYear(oldStartDate.getFullYear() - 6); // 6 years ago
        const oldEndDate = new Date();
        oldEndDate.setFullYear(oldEndDate.getFullYear() - 5); // 5 years ago

        console.log(`Creating test academic year: ${oldAccYrId} (Start: ${oldStartDate.toISOString()})`);

        await connection.execute(
            "INSERT INTO acc_yrs (id, acc_yr_title, start_date, end_date, is_active, deleted) VALUES (?, ?, ?, ?, 0, 0)",
            [oldAccYrId, "Test Old Year", oldStartDate, oldEndDate]
        );

        // 2. Create a dummy student result for this year
        const resultId = uuidv7();
        const studentId = uuidv7(); // Dummy student ID (doesn't need to exist in students table for this test if FKs allow, but let's check FKs)

        // Check if we need valid FKs. The schema has FKs.
        // We need a valid student, intake, campus, class, subject, exam_category.
        // This is getting complicated to seed.
        // Let's try to find existing valid IDs first.

        const [students] = await connection.execute("SELECT id FROM students LIMIT 1");
        const [intakes] = await connection.execute("SELECT id FROM intakes LIMIT 1");
        const [campuses] = await connection.execute("SELECT id FROM campuses LIMIT 1");
        const [classes] = await connection.execute("SELECT id FROM classes LIMIT 1");
        const [subjects] = await connection.execute("SELECT id FROM subjects LIMIT 1");
        const [exams] = await connection.execute("SELECT id FROM exams_categories LIMIT 1");

        if (!students.length || !intakes.length || !campuses.length || !classes.length || !subjects.length || !exams.length) {
            console.log("Not enough seed data to run verification. Skipping.");
            return;
        }

        const testStudentId = students[0].id;
        const testIntakeId = intakes[0].id;
        const testCampusId = campuses[0].id;
        const testClassId = classes[0].id;
        const testSubjectId = subjects[0].id;
        const testExamId = exams[0].id;

        console.log(`Inserting test result record for student ${testStudentId} in old year...`);

        await connection.execute(`
      INSERT INTO student_results(
    id, student_id, acc_yr_id, intake_id, campus_id, exam_category_id,
    class_id, subject_id, exam_mark, grade, remark
) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            resultId, testStudentId, oldAccYrId, testIntakeId, testCampusId, testExamId,
            testClassId, testSubjectId, 85, 'A', 'Test Archive'
        ]);

        // 3. Run the archive function manually
        console.log("Triggering archive function...");
        await archiveOldResults();

        // 4. Verify results
        const [mainRows] = await connection.execute("SELECT id FROM student_results WHERE id = ?", [resultId]);
        const [archiveRows] = await connection.execute("SELECT id FROM student_results_archive WHERE id = ?", [resultId]);

        console.log("Verification Results:");
        console.log(`- Exists in main table: ${mainRows.length > 0} (Expected: false)`);
        console.log(`- Exists in archive table: ${archiveRows.length > 0} (Expected: true)`);

        if (mainRows.length === 0 && archiveRows.length === 1) {
            console.log("SUCCESS: Record was correctly moved to archive.");
        } else {
            console.error("FAILURE: Record was not moved correctly.");
        }

        // Cleanup
        console.log("Cleaning up test data...");
        await connection.execute("DELETE FROM student_results_archive WHERE id = ?", [resultId]);
        await connection.execute("DELETE FROM acc_yrs WHERE id = ?", [oldAccYrId]);

    } catch (e) {
        console.error("Verification failed:", e);
    } finally {
        connection.release();
        process.exit();
    }
};

runVerification();
