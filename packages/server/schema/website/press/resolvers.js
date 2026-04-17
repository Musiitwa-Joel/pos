import { registryPool } from "../../../config/config.js";

export const resolvers = {
  Query: {
    getPressReleases: async () => {
      try {
        const [rows] = await registryPool.execute("SELECT * FROM platform_press_releases ORDER BY published_date DESC, created_at DESC");
        return rows;
      } catch (err) {
        console.error("[Press Resolver] Query Failure:", err.message);
        throw new Error("FAILED_TO_RETRIEVE_PRESS_RELEASES");
      }
    },
  },
  Mutation: {
    createPressRelease: async (_, { input }) => {
      const { title, source, link, excerpt, published_date } = input;
      try {
        const [result] = await registryPool.execute(
          `INSERT INTO platform_press_releases (title, source, link, excerpt, published_date) 
           VALUES (?, ?, ?, ?, ?)`,
          [title, source, link, excerpt, published_date || null]
        );
        const [newEntry] = await registryPool.execute("SELECT * FROM platform_press_releases WHERE id = ?", [result.insertId]);
        return newEntry[0];
      } catch (err) {
        console.error("[Press Resolver] Creation Failure:", err.message);
        throw new Error("FAILED_TO_PROVISION_PRESS_RELEASE");
      }
    },
    updatePressRelease: async (_, { id, input }) => {
      const fields = [];
      const values = [];
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });
      if (fields.length === 0) {
        const [existing] = await registryPool.execute("SELECT * FROM platform_press_releases WHERE id = ?", [id]);
        return existing[0];
      }
      try {
        await registryPool.execute(`UPDATE platform_press_releases SET ${fields.join(", ")} WHERE id = ?`, [...values, id]);
        const [updated] = await registryPool.execute("SELECT * FROM platform_press_releases WHERE id = ?", [id]);
        return updated[0];
      } catch (err) {
        console.error("[Press Resolver] Update Failure:", err.message);
        throw new Error("FAILED_TO_UPDATE_PRESS_RELEASE");
      }
    },
    deletePressRelease: async (_, { id }) => {
      try {
        const [result] = await registryPool.execute("DELETE FROM platform_press_releases WHERE id = ?", [id]);
        return result.affectedRows > 0;
      } catch (err) {
        console.error("[Press Resolver] Deletion Failure:", err.message);
        throw new Error("FAILED_TO_DECOMMISSION_PRESS_RELEASE");
      }
    },
  },
};
