/**
 * Migration Script: Update Missing Registration Numbers
 * 
 * This script updates admission_number (registration number) for students
 * that were approved from bulk upload but don't have registration numbers.
 * 
 * Run with: node packages/server/scripts/update-registration-numbers.js
 */

const { v7: uuidv7 } = require('uuid');
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tredumo_lower',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Generate unique registration number
async function generateRegistrationNumber(connection) {
    try {
        let registrationNumber;
        let attempts = 0;

        do {
            // Generate a random 11-digit number
            const randomNum = Math.floor(Math.random() * 90000000000) + 10000000000; // 11 digits
            registrationNumber = `REG${randomNum}`;

            // Check if this registration number already exists
            const [studentsCheck] = await connection.execute(
                `SELECT id FROM students WHERE admission_number = ? AND deleted = 0 LIMIT 1`,
                [registrationNumber]
            );

            const [uploadedCheck] = await connection.execute(
                `SELECT id FROM uploaded_students WHERE registration_no = ? LIMIT 1`,
                [registrationNumber]
            );

            if ((!studentsCheck || !studentsCheck[0]) && (!uploadedCheck || !uploadedCheck[0])) {
                return registrationNumber;
            }

            attempts++;
        } while (attempts < 100);

        // Fallback: use timestamp-based number
        const timestamp = Date.now().toString().slice(-11);
        return `REG${timestamp}`;
    } catch (e) {
        console.error("Error generating registration number:", e);
        // Fallback: use UUID-based number
        return `REG${uuidv7().replace(/-/g, "").slice(0, 11)}`;
    }
}

async function updateRegistrationNumbers() {
    let connection;

    try {
        console.log('🔄 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);

        console.log('✅ Connected to database');
        console.log('🔍 Finding students without registration numbers...\n');

        // Find students without admission_number
        const [students] = await connection.execute(`
      SELECT id, student_number, surname, other_names 
      FROM students 
      WHERE (admission_number IS NULL OR admission_number = '') 
        AND deleted = 0
    `);

        if (students.length === 0) {
            console.log('✅ All students already have registration numbers!');
            return;
        }

        console.log(`📋 Found ${students.length} student(s) without registration numbers\n`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const student of students) {
            try {
                // Check if this student exists in uploaded_students with a registration_no
                const [uploadedRows] = await connection.execute(
                    `SELECT registration_no FROM uploaded_students 
           WHERE student_no = ? AND registration_no IS NOT NULL 
           LIMIT 1`,
                    [student.student_number]
                );

                let registrationNo;

                if (uploadedRows && uploadedRows[0] && uploadedRows[0].registration_no) {
                    // Use existing registration_no from uploaded_students
                    registrationNo = uploadedRows[0].registration_no;
                    console.log(`📝 ${student.surname} ${student.other_names} (${student.student_number})`);
                    console.log(`   → Using existing: ${registrationNo}`);
                } else {
                    // Generate new registration number
                    registrationNo = await generateRegistrationNumber(connection);
                    console.log(`📝 ${student.surname} ${student.other_names} (${student.student_number})`);
                    console.log(`   → Generated new: ${registrationNo}`);
                }

                // Update student record
                await connection.execute(
                    `UPDATE students SET admission_number = ? WHERE id = ?`,
                    [registrationNo, student.id]
                );

                updatedCount++;
            } catch (error) {
                console.error(`   ❌ Error updating student ${student.student_number}:`, error.message);
                skippedCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Update Summary:');
        console.log(`   ✅ Successfully updated: ${updatedCount} student(s)`);
        if (skippedCount > 0) {
            console.log(`   ⚠️  Skipped (errors): ${skippedCount} student(s)`);
        }
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run the migration
updateRegistrationNumbers()
    .then(() => {
        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Migration failed:', error);
        process.exit(1);
    });
