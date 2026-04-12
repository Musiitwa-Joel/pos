import { gql } from "graphql-tag";

export default gql`
  type Operator {
    id: ID!
    username: String!
    role: String
    email: String
  }

  type InstitutionHq {
    id: ID!
    name: String!
    physicalLocation: String
    supportEmail: String
    supportPhone: String
    dbName: String!
    ownerEmail: String
    paymentStatus: String
    status: String
    plan: BillingPlan
    createdAt: String
    lastPayment: SystemPayment
    operators: [Operator]
    totalStaff: Int
    storageUsage: Float
    pulseVelocity: Float
    complianceScore: Int
    lastSaleAt: String
  }

  type RegistrySetting {
    key: String!
    value: String
  }

  extend type Query {
    # 👑 CEO Access Only: Global Business Registry
    allInstitutionsHq: [InstitutionHq]
    
    # 🏛️ Governance Infrastructure
    getRegistrySettings: [RegistrySetting]
  }

  extend type Mutation {
    # 🔒 Global Access Enforcement
    updateInstitutionStatus(id: ID!, status: String!): Boolean

    # 🏛️ Infrastructure Governance
    updateRegistrySetting(key: String!, value: String!): Boolean
    
    # ⚡ Emergency Protocol: Force rewrite of physical .env from database
    forceRegistrySync: Boolean
  }
`;
