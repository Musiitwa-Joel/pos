import { registryPool } from "../../../config/config.js";

export default {
  Query: {
    getChangelogs: async () => {
      try {
        const [rows] = await registryPool.execute(
          "SELECT * FROM platform_changelogs ORDER BY released_at DESC, id DESC"
        );
        return rows.map(row => ({
          ...row,
          released_at: row.released_at ? new Date(row.released_at).toISOString() : null,
          created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
        }));
      } catch (err) {
        console.error("[Changelog Resolver] Query Failure:", err.message);
        throw new Error("FAILED_TO_RETRIEVE_CHANGELOGS");
      }
    },
    getLatestChangelog: async () => {
      try {
        const [rows] = await registryPool.execute(
          "SELECT * FROM platform_changelogs ORDER BY released_at DESC, id DESC LIMIT 1"
        );
        return rows[0] || null;
      } catch (err) {
        console.error("[Changelog Resolver] Latest Query Failure:", err.message);
        return null;
      }
    },
  },
  Mutation: {
    createChangelog: async (_, { input }) => {
      const { version, title, category, content, released_at } = input;
      try {
        const [result] = await registryPool.execute(
          `INSERT INTO platform_changelogs (version, title, category, content, released_at) 
           VALUES (?, ?, ?, ?, ?)`,
          [version, title, category, content, released_at || new Date()]
        );
        
        const [newLog] = await registryPool.execute(
          "SELECT * FROM platform_changelogs WHERE id = ?",
          [result.insertId]
        );
        
        return newLog[0];
      } catch (err) {
        console.error("[Changelog Resolver] Mutation Failure:", err.message);
        throw new Error("FAILED_TO_PROVISION_CHANGELOG");
      }
    },
    deleteChangelog: async (_, { id }) => {
      try {
        const [result] = await registryPool.execute(
          "DELETE FROM platform_changelogs WHERE id = ?",
          [id]
        );
        return result.affectedRows > 0;
      } catch (err) {
        console.error("[Changelog Resolver] Deletion Failure:", err.message);
        throw new Error("FAILED_TO_DECOMMISSION_CHANGELOG");
      }
    },
    updateChangelog: async (_, { id, input }) => {
      const { version, title, category, content, released_at } = input;
      const updates = [];
      const values = [];

      if (version !== undefined) { updates.push("version = ?"); values.push(version); }
      if (title !== undefined) { updates.push("title = ?"); values.push(title); }
      if (category !== undefined) { updates.push("category = ?"); values.push(category); }
      if (content !== undefined) { updates.push("content = ?"); values.push(content); }
      if (released_at !== undefined) { updates.push("released_at = ?"); values.push(released_at); }

      if (updates.length === 0) {
        const [existing] = await registryPool.execute("SELECT * FROM platform_changelogs WHERE id = ?", [id]);
        return existing[0];
      }

      try {
        await registryPool.execute(
          `UPDATE platform_changelogs SET ${updates.join(", ")} WHERE id = ?`,
          [...values, id]
        );

        const [updated] = await registryPool.execute(
          "SELECT * FROM platform_changelogs WHERE id = ?",
          [id]
        );
        return updated[0];
      } catch (err) {
        console.error("[Changelog Resolver] Update Failure:", err.message);
        throw new Error("FAILED_TO_UPDATE_CHANGELOG");
      }
    },
  },
};
