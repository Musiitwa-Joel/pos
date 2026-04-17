import { registryPool } from "../../../config/config.js";

export const resolvers = {
  Query: {
    getReviews: async () => {
      try {
        const [rows] = await registryPool.execute("SELECT * FROM platform_reviews ORDER BY created_at DESC");
        return rows;
      } catch (err) {
        console.error("[Reviews Resolver] Query Failure:", err.message);
        throw new Error("FAILED_TO_RETRIEVE_REVIEWS");
      }
    },
    getFeaturedReviews: async () => {
      try {
        const [rows] = await registryPool.execute("SELECT * FROM platform_reviews WHERE is_featured = TRUE ORDER BY created_at DESC");
        return rows;
      } catch (err) {
        console.error("[Reviews Resolver] Featured Query Failure:", err.message);
        throw new Error("FAILED_TO_RETRIEVE_FEATURED_REVIEWS");
      }
    },
  },
  Mutation: {
    createReview: async (_, { input }) => {
      const { name, role, company, content, rating, impact, avatar_url, is_featured } = input;
      try {
        const [result] = await registryPool.execute(
          `INSERT INTO platform_reviews (name, role, company, content, rating, impact, avatar_url, is_featured) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [name, role, company, content, rating || 5, impact, avatar_url, is_featured || false]
        );
        
        const [newReview] = await registryPool.execute("SELECT * FROM platform_reviews WHERE id = ?", [result.insertId]);
        return newReview[0];
      } catch (err) {
        console.error("[Reviews Resolver] Creation Failure:", err.message);
        throw new Error("FAILED_TO_PROVISION_REVIEW");
      }
    },
    updateReview: async (_, { id, input }) => {
      const fields = [];
      const values = [];
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (fields.length === 0) {
        const [existing] = await registryPool.execute("SELECT * FROM platform_reviews WHERE id = ?", [id]);
        return existing[0];
      }

      try {
        await registryPool.execute(
          `UPDATE platform_reviews SET ${fields.join(", ")} WHERE id = ?`,
          [...values, id]
        );
        const [updated] = await registryPool.execute("SELECT * FROM platform_reviews WHERE id = ?", [id]);
        return updated[0];
      } catch (err) {
        console.error("[Reviews Resolver] Update Failure:", err.message);
        throw new Error("FAILED_TO_UPDATE_REVIEW");
      }
    },
    deleteReview: async (_, { id }) => {
      try {
        const [result] = await registryPool.execute("DELETE FROM platform_reviews WHERE id = ?", [id]);
        return result.affectedRows > 0;
      } catch (err) {
        console.error("[Reviews Resolver] Deletion Failure:", err.message);
        throw new Error("FAILED_TO_DECOMMISSION_REVIEW");
      }
    },
  },
};
