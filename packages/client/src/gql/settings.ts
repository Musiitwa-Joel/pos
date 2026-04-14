import { gql } from '@apollo/client/core';

export const GET_SETTINGS = gql`
  query GetSettings {
    settings {
      key
      value
    }
  }
`;

export const UPDATE_SETTING = gql`
  mutation UpdateSetting($key: String!, $value: String!) {
    updateSetting(key: $key, value: $value) {
      key
      value
    }
  }
`;

export const INITIALIZE_SETTINGS_DB = gql`
  mutation InitializeSettingsDatabase {
    initializeSettingsDatabase
  }
`;
export const GET_ROLES = gql`
  query GetRoles {
    roles {
      id
      name
      description
      authorizedModules
    }
  }
`;

export const ADD_ROLE = gql`
  mutation AddRole($name: String!, $description: String, $authorizedModules: [String]) {
    addRole(name: $name, description: $description, authorizedModules: $authorizedModules) {
      id
      name
      description
      authorizedModules
    }
  }
`;

export const UPDATE_ROLE = gql`
  mutation UpdateRole($id: ID!, $name: String, $description: String, $authorizedModules: [String]) {
    updateRole(id: $id, name: $name, description: $description, authorizedModules: $authorizedModules) {
      id
      name
      description
      authorizedModules
    }
  }
`;

export const DELETE_ROLE = gql`
  mutation DeleteRole($id: ID!) {
    deleteRole(id: $id)
  }
`;

export const GET_SYSTEM_TELEMETRY = gql`
  query GetSystemTelemetry {
    getSystemTelemetry {
      kernelVersion
      uptime
      cpuUsage
      memoryTotal
      memoryUsed
      storageUtilization
      dbStatus
      nodeId
    }
  }
`;

export const BACKUP_DATABASE = gql`
  mutation BackupDatabase {
    backupDatabase {
      success
      message
      filename
      size
      timestamp
    }
  }
`;

export const TEST_NOTIFICATION_SETTINGS = gql`
  mutation TestNotificationSettings($email: String!) {
    testNotificationSettings(email: $email)
  }
`;
