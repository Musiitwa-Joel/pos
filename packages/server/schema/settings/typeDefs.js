import { gql } from "graphql-tag";

export default gql`
  type Role {
    id: ID!
    name: String!
    description: String
  }

  type Setting {
    key: String!
    value: String
  }

  type SystemTelemetry {
    kernelVersion: String
    uptime: String
    cpuUsage: Float
    memoryTotal: Float
    memoryUsed: Float
    storageUtilization: Float
    dbStatus: String
    nodeId: String
  }

  type BackupResult {
    success: Boolean!
    message: String!
    filename: String
    size: Float
    timestamp: String
  }

  extend type Query {
    settings: [Setting!]!
    setting(key: String!): String
    roles: [Role!]!
    getSystemTelemetry: SystemTelemetry!
  }

  extend type Mutation {
    updateSetting(key: String!, value: String!): Setting
    initializeSettingsDatabase: String
    addRole(name: String!, description: String): Role!
    deleteRole(id: ID!): Boolean!
    
    # System Operations
    backupDatabase: BackupResult!
    testNotificationSettings(email: String!): String!
  }
`;
