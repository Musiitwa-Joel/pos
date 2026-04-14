export default `
  type User {
    id: ID!
    username: String!
    role: String!
    employeeId: ID
    tenantStatus: String
    isActive: Boolean
    authorizedModules: [String]
    profilePicture: String
    createdAt: String
    updatedAt: String
  }

  type Query {
    me: User
    users: [User!]!
  }

  type TenantInfo {
    id: String
    db_name: String
  }

  type Mutation {
    login(username: String!, password: String!): String
    googleLogin(idToken: String!): String
    googleRegisterInstitution(name: String!, location: String!, phone: String!, email: String!): TenantInfo
    googleDecommissionRegistry(tenantId: String!): Boolean
    googleFinalizeProvisioning(tenantId: String!, password: String!): Boolean
    initializeUserDatabase: String
    updateProfilePicture(file: Upload!): User!
  }
`;
