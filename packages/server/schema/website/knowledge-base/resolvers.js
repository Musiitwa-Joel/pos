import { registryPool } from "../../../config/config.js";

export const resolvers = {
  Query: {
    getKBCategories: async (_, { type }) => {
      const [rows] = await registryPool.execute(
        "SELECT * FROM platform_kb_categories WHERE type = ? ORDER BY order_index ASC",
        [type]
      );
      return rows;
    },
    getKBArticles: async (_, { type, categoryId }) => {
      let query = "SELECT * FROM platform_kb_articles WHERE kb_type = ? AND is_active = 1";
      const params = [type];

      if (categoryId) {
        query += " AND category_id = ?";
        params.push(categoryId);
      }

      query += " ORDER BY order_index ASC";
      
      const [rows] = await registryPool.execute(query, params);
      return rows;
    },
    getKBArticleBySlug: async (_, { slug, type }) => {
      const [rows] = await registryPool.execute(
        "SELECT * FROM platform_kb_articles WHERE slug = ? AND kb_type = ? LIMIT 1",
        [slug, type]
      );
      return rows[0] || null;
    }
  },
  KBArticle: {
    category: async (parent) => {
      if (!parent.category_id) return null;
      const [rows] = await registryPool.execute(
        "SELECT * FROM platform_kb_categories WHERE id = ? LIMIT 1",
        [parent.category_id]
      );
      return rows[0] || null;
    }
  },
  Mutation: {
    upsertKBCategory: async (_, { input }) => {
      const { id, name, slug, type, icon_name, order_index } = input;
      
      if (id) {
        await registryPool.execute(
          `UPDATE platform_kb_categories 
           SET name = ?, slug = ?, type = ?, icon_name = ?, order_index = ? 
           WHERE id = ?`,
          [name, slug, type, icon_name, order_index, id]
        );
        return { ...input };
      } else {
        const [result] = await registryPool.execute(
          `INSERT INTO platform_kb_categories (name, slug, type, icon_name, order_index) 
           VALUES (?, ?, ?, ?, ?)`,
          [name, slug, type, icon_name, order_index]
        );
        return { ...input, id: result.insertId };
      }
    },
    deleteKBCategory: async (_, { id }) => {
      await registryPool.execute("DELETE FROM platform_kb_categories WHERE id = ?", [id]);
      return true;
    },
    upsertKBArticle: async (_, { input }) => {
      const { id, category_id, title, slug, content, excerpt, kb_type, icon_name, order_index, is_active } = input;
      
      if (id) {
        await registryPool.execute(
          `UPDATE platform_kb_articles 
           SET category_id = ?, title = ?, slug = ?, content = ?, excerpt = ?, kb_type = ?, icon_name = ?, order_index = ?, is_active = ? 
           WHERE id = ?`,
          [category_id, title, slug, content, excerpt, kb_type, icon_name, order_index, is_active ? 1 : 0, id]
        );
        return { ...input };
      } else {
        const [result] = await registryPool.execute(
          `INSERT INTO platform_kb_articles (category_id, title, slug, content, excerpt, kb_type, icon_name, order_index, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [category_id, title, slug, content, excerpt, kb_type, icon_name, order_index, is_active ? 1 : 0]
        );
        return { ...input, id: result.insertId };
      }
    },
    deleteKBArticle: async (_, { id }) => {
      await registryPool.execute("DELETE FROM platform_kb_articles WHERE id = ?", [id]);
      return true;
    }
  }
};
