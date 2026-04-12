import { gql } from '@apollo/client/core';

export const INITIALIZE_LOGS_DB = gql`
  mutation InitializeLogsDatabase {
    initializeLogsDatabase
  }
`;
