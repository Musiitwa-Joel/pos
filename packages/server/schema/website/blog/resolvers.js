import { registryPool } from "../../../config/config.js";

export const resolvers = {
  Query: {
    getBlogPosts: async () => {
      try {
        const [rows] = await registryPool.execute("SELECT * FROM platform_blog_posts ORDER BY created_at DESC");
        return rows;
      } catch (err) {
        console.error("[Blog Resolver] Query Failure:", err.message);
        throw new Error("FAILED_TO_RETRIEVE_BLOG_POSTS");
      }
    },
    getBlogPostBySlug: async (_, { slug }) => {
      try {
        const [rows] = await registryPool.execute("SELECT * FROM platform_blog_posts WHERE slug = ?", [slug]);
        return rows[0] || null;
      } catch (err) {
        console.error("[Blog Resolver] Slug Query Failure:", err.message);
        return null;
      }
    },
    getPublishedBlogPosts: async () => {
      try {
        const [rows] = await registryPool.execute("SELECT * FROM platform_blog_posts WHERE is_draft = FALSE ORDER BY published_at DESC");
        return rows;
      } catch (err) {
        console.error("[Blog Resolver] Published Posts Query Failure:", err.message);
        throw new Error("FAILED_TO_RETRIEVE_PUBLISHED_POSTS");
      }
    },
  },
  Mutation: {
    createBlogPost: async (_, { input }) => {
      const { title, slug, author, category, excerpt, content, image_url, is_draft } = input;
      try {
        const published_at = is_draft === false ? new Date() : null;
        const [result] = await registryPool.execute(
          `INSERT INTO platform_blog_posts (title, slug, author, category, excerpt, content, image_url, is_draft, published_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [title, slug, author, category, excerpt, content, image_url, is_draft !== undefined ? is_draft : true, published_at]
        );
        const [newPost] = await registryPool.execute("SELECT * FROM platform_blog_posts WHERE id = ?", [result.insertId]);
        return newPost[0];
      } catch (err) {
        console.error("[Blog Resolver] Creation Failure:", err.message);
        throw new Error("FAILED_TO_PROVISION_BLOG_POST");
      }
    },
    updateBlogPost: async (_, { id, input }) => {
      const fields = [];
      const values = [];
      
      // Handle automatic published_at transition
      if (input.is_draft === false) {
        const [current] = await registryPool.execute("SELECT is_draft, published_at FROM platform_blog_posts WHERE id = ?", [id]);
        if (current[0] && current[0].is_draft === 1 && !current[0].published_at) {
          fields.push("published_at = ?");
          values.push(new Date());
        }
      }

      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });
      if (fields.length === 0) {
        const [existing] = await registryPool.execute("SELECT * FROM platform_blog_posts WHERE id = ?", [id]);
        return existing[0];
      }
      try {
        await registryPool.execute(`UPDATE platform_blog_posts SET ${fields.join(", ")} WHERE id = ?`, [...values, id]);
        const [updated] = await registryPool.execute("SELECT * FROM platform_blog_posts WHERE id = ?", [id]);
        return updated[0];
      } catch (err) {
        console.error("[Blog Resolver] Update Failure:", err.message);
        throw new Error("FAILED_TO_UPDATE_BLOG_POST");
      }
    },
    deleteBlogPost: async (_, { id }) => {
      try {
        const [result] = await registryPool.execute("DELETE FROM platform_blog_posts WHERE id = ?", [id]);
        return result.affectedRows > 0;
      } catch (err) {
        console.error("[Blog Resolver] Deletion Failure:", err.message);
        throw new Error("FAILED_TO_DECOMMISSION_BLOG_POST");
      }
    },
  },
};
