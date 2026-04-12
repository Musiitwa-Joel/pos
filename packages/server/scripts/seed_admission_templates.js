import { db } from "../config/config.js";
import { v7 as uuidv7 } from "uuid";

const templates = [
  {
    name: "Default School Admission Letter",
    content: `<div style='font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;'>
  <div style='text-align: center; margin-bottom: 30px;'>
    <h1 style='color: #2c3e50; margin-bottom: 10px;'>{school_name}</h1>
    <h2 style='color: #34495e;'>{academic_year} ACADEMIC YEAR ADMISSION LETTER</h2>
  </div>

  <div style='margin-bottom: 20px;'>
    <p><strong>STUDENT NUMBER:</strong> {student_number}</p>
    <p><strong>NAME:</strong> {student_name}</p>
    <p><strong>NATIONALITY:</strong> {nationality}</p>
    <p><strong>STUDY TIME:</strong> {study_time}</p>
    <p><strong>CLASS ADMITTED TO:</strong> {class_admitted}</p>
  </div>

  <div style='margin-bottom: 20px; text-align: right;'>
    <p><strong>DATE:</strong> {print_date}</p>
    <p><strong>INTAKE:</strong> {intake} {academic_year}</p>
    <p><strong>CAMPUS:</strong> {campus}</p>
    <p><strong>SECTION:</strong> {school_section}</p>
  </div>

  <div style='margin-bottom: 20px;'>
    <p><strong>CLASS ADMITTED TO:</strong> {class_admmitted_to}</p>
  </div>

  <div style='margin-bottom: 30px;'>
    <p>Dear Mr./Mrs./Ms. {parent_last_name},</p>
  </div>

  <div style='margin-bottom: 30px; text-align: justify;'>
    <p>On behalf of the administration, teachers, and entire community of {school_name}, it is my pleasure to warmly welcome your child, {student_names}, to our school family.</p>

    <p>After reviewing the submitted documents and assessing the learner's readiness, we are delighted to offer official admission to [Class/Level] for the [Academic Year/Term].</p>

    <p>At [School Name], we believe every child carries unique potential. Our role is to nurture that potential with care, discipline, and holistic education that prepares students for academic excellence and strong character development.</p>
  </div>

  <div style='margin-bottom: 30px;'>
    <h3>2. REPORTING DATE</h3>
    <p>The date of reporting for {study_session} students shall be on {reporting_date}.</p>
  </div>

  <div style='margin-bottom: 30px;'>
    <h3>3. REGISTRATION</h3>
    <p>Full registration is subject to satisfactory verification of the qualifications stated in your application form by the Office of the Head Teacher, upon payment of all the prescribed fees each term. For purposes of registration, you are required to present original and a copy of the following:</p>
    <ul>
      <li>i. Admission Letter</li>
      <li>ii. Receipt(s) of the fees payment</li>
      <li>iii. Academic documents, including:-
        <ul>
          <li>e. Identity card for the previous school plus a Passport for foreign students</li>
          <li>f. Four passport size photographs</li>
          <li>g. Birth Certificate</li>
        </ul>
      </li>
      <li>iv. Refugee students should, in addition to the above, present proof of refugee status.</li>
    </ul>

    <p><strong>NOTE. 1.</strong> Your admission will AUTOMATICALLY be CANCELLED for IMPERSONATION, FALSIFICATION OF DOCUMENTS or giving FALSE/INCOMPLETE information whenever discovered either at registration or afterwards.</p>
  </div>

  <div style='margin-bottom: 30px;'>
    <h3>4. FEES PAYMENT PER TERM</h3>
    <table style='width: 100%; border-collapse: collapse; border: 1px solid #ddd;'>
      <thead>
        <tr style='background-color: #f5f5f5;'>
          <th style='border: 1px solid #ddd; padding: 8px; text-align: left;'>CLASS</th>
          <th style='border: 1px solid #ddd; padding: 8px; text-align: left;'>Tuition</th>
          <th style='border: 1px solid #ddd; padding: 8px; text-align: left;'>Functional fees</th>
          <th style='border: 1px solid #ddd; padding: 8px; text-align: left;'>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style='border: 1px solid #ddd; padding: 8px;'>{class_code}</td>
          <td style='border: 1px solid #ddd; padding: 8px;'>{tuition}</td>
          <td style='border: 1px solid #ddd; padding: 8px;'>{functional_fees}</td>
          <td style='border: 1px solid #ddd; padding: 8px;'>{total_fees_amount}/=</td>
        </tr>
      </tbody>
    </table>

    <p>You are required to pay at least 60% fees before registration. The Fees Structure applicable for your duration of study is as shown above. Please note that nonpayment of fees will deny you access to all School facilities, including examinations. All fees are payable to {school_name} through the bank or school pay. You may use your cell phone to pay and generate payment codes by dialing *272*6# and follow prompts. Payments by Bank Draft or Electronic Bank Transfers should be made known to the University for crediting to the correct student Codes. NO SCHOOL STAFF IS AUTHORIZED TO RECEIVE CASH PAYMENTS FROM STUDENTS ON BEHALF OF THE UNIVERSITY.</p>

    <p><strong>NOTE:</strong> The School reserves the right to amend the fees structure, with the approval of the Governing Council. The amendment takes effect on the date promulgated and all previous agreements shall become null and void.</p>
  </div>

  <div style='margin-bottom: 30px;'>
    <h3>5. OTHER INFORMATION</h3>
    <p>Enclosed herewith is a guide for new students, it is important that you acquaint yourself with the regulations governing your stay at the School, as well as your obligations and entitlements as a student of {school_name}.</p>

    <p>Finally, I congratulate you on your admission and wish you success in your studies at {school_name}.</p>
  </div>

  <div style='margin-bottom: 40px; text-align: center;'>
    <p>{motto}</p>
    <br><br>
    <p>{signature}</p>
    <br><br>
    <p><strong>{head_teacher_name}</strong></p>
    <p>HEAD TEACHER</p>
  </div>
</div>`,
    layout_width: "210mm",
    layout_height: "297mm",
    reporting_dates: "January 15, 2025",
    registration_dates: "January 15-20, 2025",
    lecture_dates: "January 22, 2025",
  },
];

async function seedAdmissionTemplates() {
  try {
    console.log("Seeding admission letter templates...");

    for (const template of templates) {
      // Check if template already exists
      const [existing] = await db.execute(
        `SELECT id FROM admission_letters WHERE name = ? AND deleted = 0`,
        [template.name]
      );

      if (existing && existing.length > 0) {
        // Update existing template
        await db.execute(
          `UPDATE admission_letters SET
           content = ?,
           layout_width = ?,
           layout_height = ?,
           reporting_dates = ?,
           registration_dates = ?,
           lecture_dates = ?,
           last_modified_on = ?,
           last_modified_by = ?
           WHERE id = ?`,
          [
            template.content,
            template.layout_width,
            template.layout_height,
            template.reporting_dates,
            template.registration_dates,
            template.lecture_dates,
            new Date(),
            "system",
            existing[0].id,
          ]
        );
        console.log(`✓ Updated template: ${template.name}`);
      } else {
        // Create new template
        const id = uuidv7();
        const data = {
          id,
          name: template.name,
          content: template.content,
          layout_width: template.layout_width,
          layout_height: template.layout_height,
          reporting_dates: template.reporting_dates,
          registration_dates: template.registration_dates,
          lecture_dates: template.lecture_dates,
          created_on: new Date(),
          created_by: "system",
          last_modified_on: new Date(),
          last_modified_by: "system",
        };

        await db.execute(
          `INSERT INTO admission_letters
           (id, name, content, layout_width, layout_height, reporting_dates, registration_dates, lecture_dates, created_on, created_by, last_modified_on, last_modified_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.id,
            data.name,
            data.content,
            data.layout_width,
            data.layout_height,
            data.reporting_dates,
            data.registration_dates,
            data.lecture_dates,
            data.created_on,
            data.created_by,
            data.last_modified_on,
            data.last_modified_by,
          ]
        );

        console.log(`✓ Created template: ${template.name}`);
      }
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding templates:", error);
  } finally {
    process.exit(0);
  }
}

seedAdmissionTemplates();
