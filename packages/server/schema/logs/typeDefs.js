export default `
  type Log {
    id: ID!
    userId: ID!
    action: String!
    details: String
    ipAddress: String
    timestamp: String!
  }

  extend type Query {
    logs(limit: Int, offset: Int): [Log!]!
  }

  extend type Mutation {
    initializeLogsDatabase: String
  }
`;
