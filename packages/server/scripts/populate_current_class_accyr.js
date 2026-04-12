#!/usr/bin/env node
import { db } from "../config/config.js";

async function main() {
  console.log(
    "Populating current_class and current_acc_yr in students table..."
  );
  try {
    const sql = `
      UPDATE students s
      LEFT JOIN classes c ON s.class_id = c.id AND c.deleted = 0
      LEFT JOIN acc_yrs ay ON s.acc_yr_id = ay.id AND ay.deleted = 0
      SET s.current_class = COALESCE(c.class_title, s.class_title),
          s.current_acc_yr = COALESCE(ay.acc_yr_title, s.acc_yr_title)
      WHERE s.deleted = 0 AND (s.class_id IS NOT NULL OR s.acc_yr_id IS NOT NULL)
    `;

    const [result] = await db.execute(sql);
    console.log(
      "Update complete. Rows affected:",
      result.affectedRows ?? result.affectedRows === 0
        ? result.affectedRows
        : JSON.stringify(result)
    );
    process.exit(0);
  } catch (e) {
    console.error("Error updating students table:", e);
    process.exit(1);
  }
}

main();
