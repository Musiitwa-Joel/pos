import { registryPool } from "../../../config/config.js";

export const resolvers = {
  Query: {
    getStatusComponents: async () => {
      const [rows] = await registryPool.execute(
        "SELECT * FROM platform_status_components ORDER BY order_index ASC"
      );
      return rows;
    },
    getActiveIncidents: async () => {
      const [rows] = await registryPool.execute(
        "SELECT * FROM platform_status_incidents WHERE status != 'RESOLVED' ORDER BY created_at DESC"
      );
      return rows;
    },
    getIncidentHistory: async (_, { limit = 20 }) => {
      const [rows] = await registryPool.execute(
        "SELECT * FROM platform_status_incidents ORDER BY created_at DESC LIMIT ?",
        [limit]
      );
      return rows;
    }
  },
  Mutation: {
    upsertStatusComponent: async (_, { input }) => {
      const { id, name, description, status, order_index } = input;
      if (id) {
        await registryPool.execute(
          `UPDATE platform_status_components SET name = ?, description = ?, status = ?, order_index = ? WHERE id = ?`,
          [name, description, status, order_index, id]
        );
        return { ...input };
      } else {
        const [result] = await registryPool.execute(
          `INSERT INTO platform_status_components (name, description, status, order_index) VALUES (?, ?, ?, ?)`,
          [name, description, status, order_index]
        );
        return { ...input, id: result.insertId };
      }
    },
    deleteStatusComponent: async (_, { id }) => {
      await registryPool.execute("DELETE FROM platform_status_components WHERE id = ?", [id]);
      return true;
    },
    upsertStatusIncident: async (_, { input }) => {
      const { id, title, message, status, impact } = input;
      if (id) {
        await registryPool.execute(
          `UPDATE platform_status_incidents SET title = ?, message = ?, status = ?, impact = ? WHERE id = ?`,
          [title, message, status, impact, id]
        );
        return { ...input };
      } else {
        const [result] = await registryPool.execute(
          `INSERT INTO platform_status_incidents (title, message, status, impact) VALUES (?, ?, ?, ?)`,
          [title, message, status, impact]
        );
        return { ...input, id: result.insertId };
      }
    },
    deleteStatusIncident: async (_, { id }) => {
      await registryPool.execute("DELETE FROM platform_status_incidents WHERE id = ?", [id]);
      return true;
    }
  }
};
