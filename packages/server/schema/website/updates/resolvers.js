import { registryPool } from "../../../config/config.js";

export const resolvers = {
  Query: {
    getUpdates: async () => {
      try {
        const [rows] = await registryPool.execute("SELECT * FROM platform_updates ORDER BY published_at DESC");
        return rows;
      } catch (err) {
        console.error("[Updates Resolver] Query Failure:", err.message);
        throw new Error("FAILED_TO_RETRIEVE_UPDATES");
      }
    },
    getLatestUpdate: async () => {
      try {
        const [rows] = await registryPool.execute("SELECT * FROM platform_updates ORDER BY published_at DESC LIMIT 1");
        return rows[0] || null;
      } catch (err) {
        console.error("[Updates Resolver] Latest Query Failure:", err.message);
        return null;
      }
    },
  },
  Mutation: {
    createUpdate: async (_, { input }) => {
      const { title, summary, content, image_url, category, published_at } = input;
      try {
        const [result] = await registryPool.execute(
          `INSERT INTO platform_updates (title, summary, content, image_url, category, published_at) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [title, summary, content, image_url, category || 'ANNOUNCEMENT', published_at || new Date()]
        );
        const [newEntry] = await registryPool.execute("SELECT * FROM platform_updates WHERE id = ?", [result.insertId]);
        return newEntry[0];
      } catch (err) {
        console.error("[Updates Resolver] Creation Failure:", err.message);
        throw new Error("FAILED_TO_PROVISION_UPDATE");
      }
    },
    updateUpdate: async (_, { id, input }) => {
      const fields = [];
      const values = [];
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });
      if (fields.length === 0) {
        const [existing] = await registryPool.execute("SELECT * FROM platform_updates WHERE id = ?", [id]);
        return existing[0];
      }
      try {
        await registryPool.execute(`UPDATE platform_updates SET ${fields.join(", ")} WHERE id = ?`, [...values, id]);
        const [updated] = await registryPool.execute("SELECT * FROM platform_updates WHERE id = ?", [id]);
        return updated[0];
      } catch (err) {
        console.error("[Updates Resolver] Update Failure:", err.message);
        throw new Error("FAILED_TO_UPDATE_UPDATE_ENTRY");
      }
    },
    deleteUpdate: async (_, { id }) => {
      try {
        const [result] = await registryPool.execute("DELETE FROM platform_updates WHERE id = ?", [id]);
        return result.affectedRows > 0;
      } catch (err) {
        console.error("[Updates Resolver] Deletion Failure:", err.message);
        throw new Error("FAILED_TO_DECOMMISSION_UPDATE_ENTRY");
      }
    },
  },
};
