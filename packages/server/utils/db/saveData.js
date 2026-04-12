import { db } from "../../config/config.js";
import { GraphQLError } from "graphql";

const saveData = async ({ table, id, data, idColumn = "id", connection }) => {
  const conn = connection || (await db.getConnection());
  let acquiredConnection = !connection;
  try {
    // Handle array case separately
    if (Array.isArray(data)) {
      // Assuming you want to insert multiple rows for array data
      let columns = Object.keys(data[0]); // Columns from the first object in the array
      let placeholders = columns.map(() => "?").join(", ");
      let sql = `INSERT INTO ${table} (${columns.join(
        ", "
      )}) VALUES (${placeholders})`;

      const promises = data.map((row) => {
        let values = Object.values(row);
        return conn.execute(sql, values);
      });

      const results = await Promise.all(promises);

      return results.map((result) => result[0].insertId); // Returning array of insertIds
    }

    // Handle object case (existing logic)
    let columns = Object.keys(data);
    let values = Object.values(data);

    console.log("saveData called with:", { table, id, data, columns, values });

    if (id) {
      let setClause = columns.map((col) => `${col} = ?`).join(", ");
      let sql = `UPDATE ${table} SET ${setClause} WHERE ${idColumn} = ?`;

      values.push(id); // Append the id to the values array for the WHERE clause

      console.log("Executing UPDATE:", { sql, values });

      const [results] = await conn.execute(sql, values);

      // If no rows were updated, fall back to inserting the row instead of
      // throwing an error. This is helpful when the client supplies a UUID
      // that doesn't yet exist in the DB (e.g., migrations haven't run or
      // the default row was removed). We'll attempt an INSERT using the
      // provided id so the operation succeeds idempotently.
      if (!results.affectedRows) {
        // Build an insert payload using the same columns and include the id
        const insertData = { ...data };
        // Ensure the id column key is present in the data object
        insertData[idColumn] = id;

        let insertCols = Object.keys(insertData);
        let insertPlaceholders = insertCols.map(() => "?").join(", ");
        let insertSql = `INSERT INTO ${table} (${insertCols.join(
          ", "
        )}) VALUES (${insertPlaceholders})`;
        let insertValues = Object.values(insertData);

        console.log("Executing INSERT (fallback):", {
          insertSql,
          insertValues,
        });

        const [insertResults] = await conn.execute(insertSql, insertValues);

        // Return the provided id (UUID) so callers can rely on it.
        return id;
      }

      return id;
    } else {
      // Insert
      let placeholders = columns.map(() => "?").join(", ");
      let sql = `INSERT INTO ${table} (${columns.join(
        ", "
      )}) VALUES (${placeholders})`;

      console.log("Executing INSERT:", { sql, values });

      const [results, fields] = await conn.execute(sql, values);

      // If caller provided an 'id' in the data object (e.g., UUID), return it so callers
      // can rely on the id they used instead of the numeric insertId.
      if (Object.prototype.hasOwnProperty.call(data, idColumn)) {
        return data[idColumn];
      }

      return results.insertId;
    }
  } catch (error) {
    console.log("saveData error:", error.message);
    console.log("saveData error stack:", error.stack);
    throw new GraphQLError(error.message);
  } finally {
    if (acquiredConnection && conn) {
      conn.release();
    }
  }
};

export default saveData;
