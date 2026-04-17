import { registryPool } from "../../../config/config.js";

export const resolvers = {
  Query: {
    getJobs: async () => {
      try {
        const [rows] = await registryPool.execute("SELECT * FROM platform_jobs ORDER BY order_index ASC, created_at DESC");
        return rows;
      } catch (err) {
        console.error("[Careers Resolver] Query Failure:", err.message);
        throw new Error("FAILED_TO_RETRIEVE_JOBS");
      }
    },
    getOpenPositions: async () => {
      try {
        const [rows] = await registryPool.execute("SELECT * FROM platform_jobs WHERE is_active = TRUE ORDER BY order_index ASC, posted_at DESC");
        return rows;
      } catch (err) {
        console.error("[Careers Resolver] Open Positions Query Failure:", err.message);
        throw new Error("FAILED_TO_RETRIEVE_OPEN_POSITIONS");
      }
    },
    getJobPerks: async () => {
      try {
        const [rows] = await registryPool.execute("SELECT * FROM platform_careers_perks WHERE is_active = TRUE ORDER BY order_index ASC");
        return rows;
      } catch (err) {
        console.error("[Careers Resolver] Perks Query Failure:", err.message);
        throw new Error("FAILED_TO_RETRIEVE_PERKS");
      }
    }
  },
  Mutation: {
    createJob: async (_, { input }) => {
      const { title, department, location, type, color_code, description, requirements, order_index, is_active } = input;
      try {
        const [result] = await registryPool.execute(
          `INSERT INTO platform_jobs (title, department, location, type, color_code, description, requirements, order_index, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [title, department, location || 'Remote', type || 'Full-time', color_code || 'bg-neo-orange', description, requirements, order_index || 0, is_active !== undefined ? is_active : true]
        );
        const [newJob] = await registryPool.execute("SELECT * FROM platform_jobs WHERE id = ?", [result.insertId]);
        return newJob[0];
      } catch (err) {
        console.error("[Careers Resolver] Creation Failure:", err.message);
        throw new Error("FAILED_TO_PROVISION_JOB");
      }
    },
    updateJob: async (_, { id, input }) => {
      const sanitizedInput = { ...input };
      delete sanitizedInput.__typename;
      delete sanitizedInput.id;
      delete sanitizedInput.created_at;
      delete sanitizedInput.posted_at;

      const fields = [];
      const values = [];
      Object.entries(sanitizedInput).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });
      if (fields.length === 0) {
        const [existing] = await registryPool.execute("SELECT * FROM platform_jobs WHERE id = ?", [id]);
        return existing[0];
      }
      try {
        await registryPool.execute(`UPDATE platform_jobs SET ${fields.join(", ")} WHERE id = ?`, [...values, id]);
        const [updated] = await registryPool.execute("SELECT * FROM platform_jobs WHERE id = ?", [id]);
        return updated[0];
      } catch (err) {
        console.error("[Careers Resolver] Update Failure:", err.message);
        throw new Error("FAILED_TO_UPDATE_JOB");
      }
    },
    deleteJob: async (_, { id }) => {
      try {
        const [result] = await registryPool.execute("DELETE FROM platform_jobs WHERE id = ?", [id]);
        return result.affectedRows > 0;
      } catch (err) {
        console.error("[Careers Resolver] Deletion Failure:", err.message);
        throw new Error("FAILED_TO_DECOMMISSION_JOB");
      }
    },

    createPerk: async (_, { input }) => {
      const { title, description, icon_name, order_index, is_active } = input;
      try {
        const [result] = await registryPool.execute(
          `INSERT INTO platform_careers_perks (title, description, icon_name, order_index, is_active) VALUES (?, ?, ?, ?, ?)`,
          [title, description, icon_name || 'Zap', order_index || 0, is_active !== undefined ? is_active : true]
        );
        const [newPerk] = await registryPool.execute("SELECT * FROM platform_careers_perks WHERE id = ?", [result.insertId]);
        return newPerk[0];
      } catch (err) {
        console.error("[Careers Resolver] Perk Creation Failure:", err.message);
        throw new Error("FAILED_TO_PROVISION_PERK");
      }
    },
    updatePerk: async (_, { id, input }) => {
      const sanitized = { ...input };
      delete sanitized.__typename;
      delete sanitized.id;

      const fields = [];
      const values = [];
      Object.entries(sanitized).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });
      try {
        await registryPool.execute(`UPDATE platform_careers_perks SET ${fields.join(", ")} WHERE id = ?`, [...values, id]);
        const [updated] = await registryPool.execute("SELECT * FROM platform_careers_perks WHERE id = ?", [id]);
        return updated[0];
      } catch (err) {
        console.error("[Careers Resolver] Perk Update Failure:", err.message);
        throw new Error("FAILED_TO_UPDATE_PERK");
      }
    },
    deletePerk: async (_, { id }) => {
      try {
        await registryPool.execute("DELETE FROM platform_careers_perks WHERE id = ?", [id]);
        return true;
      } catch (err) {
        console.error("[Careers Resolver] Perk Deletion Failure:", err.message);
        throw new Error("FAILED_TO_DECOMMISSION_PERK");
      }
    }
  },
};
