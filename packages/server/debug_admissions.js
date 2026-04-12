
import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tredumo_lower',
};

async function checkAdmissions() {
    try {
        const conn = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const [tables] = await conn.execute('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log('Tables found:', tableNames);

        if (tableNames.includes('students')) {
            console.log('--- STUDENTS TABLE FOUND ---');
            const [sRows] = await conn.execute(`SELECT student_number FROM students ORDER BY student_number DESC LIMIT 20`);
            console.table(sRows);
        } else {
            console.log('--- NO STUDENTS TABLE ---');
        }

        const [rows] = await conn.execute(
            `SELECT student_number, deleted, created_at FROM admissions ORDER BY created_at DESC LIMIT 50`
        );

        console.log('--- RECENT ADMISSIONS ---');
        rows.forEach(r => {
            console.log(`${r.student_number} | Deleted: ${r.deleted} | Created: ${r.created_at}`);
        });

        console.log('--- DUPLICATE CHECK ---');
        const [dupes] = await conn.execute(`
        SELECT student_number, COUNT(*) as c 
        FROM admissions 
        GROUP BY student_number 
        HAVING c > 1
    `);

        if (dupes.length === 0) {
            console.log("No exact duplicates found.");
        } else {
            console.table(dupes);
        }

        await conn.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkAdmissions();
