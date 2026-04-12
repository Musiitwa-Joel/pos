import { db } from "./config/config.js";

async function testAdmissionLetter() {
  try {
    // Get a sample student
    const [students] = await db.execute(
      "SELECT id, student_number FROM admissions WHERE deleted = 0 LIMIT 1"
    );
    if (!students.length) {
      console.log("No students found");
      return;
    }

    const studentId = students[0].id;
    console.log("Testing with student ID:", studentId);

    // Simulate the print_admission_letters function
    const studentSql = `
      SELECT
        a.id,
        a.student_number,
        a.admission_number,
        a.surname,
        a.othernames as other_names,
        a.admission_date,
        a.intake_id,
        a.acc_yr_id,
        a.class_id,
        a.campus_id,
        a.nationality,
        COALESCE(a.guardian_name, a.father_name, a.mother_name, '') as parent_last_name
      FROM admissions a
      WHERE a.id = ? AND a.deleted = 0
    `;

    const [studentData] = await db.execute(studentSql, [studentId]);
    console.log("Student data retrieved:", !!studentData.length);

    if (studentData && studentData.length > 0) {
      const studentInfo = studentData[0];
      console.log("Student info:", {
        id: studentInfo.id,
        student_number: studentInfo.student_number,
        nationality: studentInfo.nationality,
        parent_last_name: studentInfo.parent_last_name,
      });

      // Test nationality extraction
      const nationality = studentInfo.nationality || "";
      console.log("Nationality:", nationality);

      // Test school info
      const [schoolData] = await db.execute(
        "SELECT university_title, university_tagline FROM university_details WHERE deleted = 0 LIMIT 1"
      );
      const schoolName =
        schoolData && schoolData.length > 0
          ? schoolData[0].university_title || "School Name"
          : "School Name";
      const schoolMotto =
        schoolData && schoolData.length > 0
          ? schoolData[0].university_tagline || "Excellence in Education"
          : "Excellence in Education";

      console.log("School info:", { schoolName, schoolMotto });
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    process.exit(0);
  }
}

testAdmissionLetter();
