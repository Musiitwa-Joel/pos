import { registryPool } from "../../../config/config.js";

export const resolvers = {
  Query: {
    getAboutSections: async () => {
      try {
        const [rows] = await registryPool.execute("SELECT * FROM platform_about_sections WHERE is_active = TRUE ORDER BY order_index ASC");
        return rows;
      } catch (err) {
        console.error("[About Resolver] Query Failure:", err.message);
        throw new Error("FAILED_TO_RETRIEVE_ABOUT_SECTIONS");
      }
    },
  },
  Mutation: {
    createAboutSection: async (_, { input }) => {
      const { title, subtitle, content, image_url, icon_name, order_index, section_type, is_active } = input;
      try {
        const [result] = await registryPool.execute(
          `INSERT INTO platform_about_sections (title, subtitle, content, image_url, icon_name, order_index, section_type, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [title, subtitle, content, image_url, icon_name, order_index || 0, section_type || 'GENERAL', is_active !== undefined ? is_active : true]
        );
        const [newSection] = await registryPool.execute("SELECT * FROM platform_about_sections WHERE id = ?", [result.insertId]);
        return newSection[0];
      } catch (err) {
        console.error("[About Resolver] Creation Failure:", err.message);
        throw new Error("FAILED_TO_PROVISION_ABOUT_SECTION");
      }
    },
    updateAboutSection: async (_, { id, input }) => {
      const fields = [];
      const values = [];
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });
      if (fields.length === 0) {
        const [existing] = await registryPool.execute("SELECT * FROM platform_about_sections WHERE id = ?", [id]);
        return existing[0];
      }
      try {
        await registryPool.execute(`UPDATE platform_about_sections SET ${fields.join(", ")} WHERE id = ?`, [...values, id]);
        const [updated] = await registryPool.execute("SELECT * FROM platform_about_sections WHERE id = ?", [id]);
        return updated[0];
      } catch (err) {
        console.error("[About Resolver] Update Failure:", err.message);
        throw new Error("FAILED_TO_UPDATE_ABOUT_SECTION");
      }
    },
    deleteAboutSection: async (_, { id }) => {
      try {
        const [result] = await registryPool.execute("DELETE FROM platform_about_sections WHERE id = ?", [id]);
        return result.affectedRows > 0;
      } catch (err) {
        console.error("[About Resolver] Deletion Failure:", err.message);
        throw new Error("FAILED_TO_DECOMMISSION_ABOUT_SECTION");
      }
    },
  },
};
