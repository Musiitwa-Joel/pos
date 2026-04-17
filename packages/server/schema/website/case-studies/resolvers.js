import { registryPool } from "../../../config/config.js";

export const resolvers = {
  Query: {
    getCaseStudies: async () => {
      try {
        const [rows] = await registryPool.execute("SELECT * FROM platform_case_studies ORDER BY created_at DESC");
        return rows;
      } catch (err) {
        console.error("[CaseStudies Resolver] Query Failure:", err.message);
        throw new Error("FAILED_TO_RETRIEVE_CASE_STUDIES");
      }
    },
    getCaseStudyBySlug: async (_, { slug }) => {
      try {
        const [rows] = await registryPool.execute("SELECT * FROM platform_case_studies WHERE slug = ?", [slug]);
        return rows[0] || null;
      } catch (err) {
        console.error("[CaseStudies Resolver] Slug Query Failure:", err.message);
        return null;
      }
    },
    getFeaturedCaseStudies: async () => {
      try {
        const [rows] = await registryPool.execute("SELECT * FROM platform_case_studies WHERE is_featured = TRUE ORDER BY created_at DESC");
        return rows;
      } catch (err) {
        console.error("[CaseStudies Resolver] Featured Query Failure:", err.message);
        throw new Error("FAILED_TO_RETRIEVE_FEATURED_CASE_STUDIES");
      }
    },
  },
  Mutation: {
    createCaseStudy: async (_, { input }) => {
      const { title, slug, client_name, industry, summary, content, results, metric, metric_label, image_url, is_featured } = input;
      try {
        const [result] = await registryPool.execute(
          `INSERT INTO platform_case_studies (title, slug, client_name, industry, summary, content, results, metric, metric_label, image_url, is_featured) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [title, slug, client_name, industry, summary, content, results, metric, metric_label, image_url, is_featured || false]
        );
        const [newEntry] = await registryPool.execute("SELECT * FROM platform_case_studies WHERE id = ?", [result.insertId]);
        return newEntry[0];
      } catch (err) {
        console.error("[CaseStudies Resolver] Creation Failure:", err.message);
        throw new Error("FAILED_TO_PROVISION_CASE_STUDY");
      }
    },
    updateCaseStudy: async (_, { id, input }) => {
      const fields = [];
      const values = [];
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });
      if (fields.length === 0) {
        const [existing] = await registryPool.execute("SELECT * FROM platform_case_studies WHERE id = ?", [id]);
        return existing[0];
      }
      try {
        await registryPool.execute(`UPDATE platform_case_studies SET ${fields.join(", ")} WHERE id = ?`, [...values, id]);
        const [updated] = await registryPool.execute("SELECT * FROM platform_case_studies WHERE id = ?", [id]);
        return updated[0];
      } catch (err) {
        console.error("[CaseStudies Resolver] Update Failure:", err.message);
        throw new Error("FAILED_TO_UPDATE_CASE_STUDY");
      }
    },
    deleteCaseStudy: async (_, { id }) => {
      try {
        const [result] = await registryPool.execute("DELETE FROM platform_case_studies WHERE id = ?", [id]);
        return result.affectedRows > 0;
      } catch (err) {
        console.error("[CaseStudies Resolver] Deletion Failure:", err.message);
        throw new Error("FAILED_TO_DECOMMISSION_CASE_STUDY");
      }
    },
  },
};
