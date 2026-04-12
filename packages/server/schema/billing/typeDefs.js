import { gql } from "graphql-tag";

export default gql`
  type BillingPlan {
    id: ID!
    name: String!
    monthlyFee: Float!
    features: String
    createdAt: String
  }

  type SystemPayment {
    id: ID!
    tenantId: String!
    amount: Float!
    paymentDate: String!
    paymentMethod: String
    periodLabel: String
    createdAt: String
  }

  type RegistryLifecycleEvent {
    id: ID!
    tenantId: String!
    eventType: String!
    description: String
    metadata: String
    recordedAt: String
  }

  input SystemPaymentInput {
    tenantId: String!
    amount: Float!
    paymentDate: String!
    paymentMethod: String
    periodLabel: String
    notes: String
  }

  type InstitutionInsights {
    totalPaidAmount: Float
    paymentCount: Int
    activeStaffCount: Int
    accountAgeDays: Int
    subscriptionIntensity: String
    lastRegistryAudit: String
  }

  extend type Query {
    getInstitutionInsights(tenantId: ID!): InstitutionInsights
    billingPlans: [BillingPlan]
    recentSystemPayments(limit: Int): [SystemPayment]
    institutionPayments(tenantId: ID!): [SystemPayment]
    getInstitutionLifecycleEvents(tenantId: ID!): [RegistryLifecycleEvent]
  }

  extend type Mutation {
    # 💰 Record Monthly Collection
    recordSystemPayment(payload: SystemPaymentInput!): SystemPayment
    
    # 🏷️ Manage Plans
    createBillingPlan(name: String!, monthlyFee: Float!, features: String): BillingPlan
    
    # 📣 Send Reminders
    sendBillingReminder(tenantId: String!): Boolean

    # 💰 Dynamic Revenue Control
    updateMasterPricing(monthlyFee: Float!): BillingPlan
  }
`;
