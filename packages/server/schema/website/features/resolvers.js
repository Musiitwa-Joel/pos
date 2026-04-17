import { registryPool } from "../../../config/config.js";

export const resolvers = {
  Query: {
    getFeatures: async () => {
      try {
        const [rows] = await registryPool.execute("SELECT * FROM platform_features ORDER BY order_index ASC, created_at DESC");
        return rows;
      } catch (err) {
        console.error("[Features Resolver] Query Failure:", err.message);
        throw new Error("FAILED_TO_RETRIEVE_FEATURES");
      }
    },
  },
  Mutation: {
    createFeature: async (_, { input }) => {
      const { title, description, icon, color, order_index } = input;
      try {
        const [result] = await registryPool.execute(
          `INSERT INTO platform_features (title, description, icon, color, order_index) 
           VALUES (?, ?, ?, ?, ?)`,
          [title, description, icon || 'Zap', color || 'bg-neo-orange', order_index || 0]
        );
        const [newEntry] = await registryPool.execute("SELECT * FROM platform_features WHERE id = ?", [result.insertId]);
        return newEntry[0];
      } catch (err) {
        console.error("[Features Resolver] Creation Failure:", err.message);
        throw new Error("FAILED_TO_PROVISION_FEATURE");
      }
    },
    updateFeature: async (_, { id, input }) => {
      const fields = [];
      const values = [];
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });
      if (fields.length === 0) {
        const [existing] = await registryPool.execute("SELECT * FROM platform_features WHERE id = ?", [id]);
        return existing[0];
      }
      try {
        await registryPool.execute(`UPDATE platform_features SET ${fields.join(", ")} WHERE id = ?`, [...values, id]);
        const [updated] = await registryPool.execute("SELECT * FROM platform_features WHERE id = ?", [id]);
        return updated[0];
      } catch (err) {
        console.error("[Features Resolver] Update Failure:", err.message);
        throw new Error("FAILED_TO_UPDATE_FEATURE");
      }
    },
    deleteFeature: async (_, { id }) => {
      try {
        const [result] = await registryPool.execute("DELETE FROM platform_features WHERE id = ?", [id]);
        return result.affectedRows > 0;
      } catch (err) {
        console.error("[Features Resolver] Deletion Failure:", err.message);
        throw new Error("FAILED_TO_DECOMMISSION_FEATURE");
      }
    },
  },
};
