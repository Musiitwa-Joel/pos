export default `
  type PricingFeature {
    title: String!
    description: String!
  }

  type WebsitePricing {
    planName: String
    basePrice: String
    billingInterval: String
    subLabel: String
    features: [PricingFeature]
    calculatorBaseRate: Float
    calculatorHeadline: String
    onboardedCount: Int
    onboardedTenants: [String]
    updatedAt: String
  }

  input PricingFeatureInput {
    title: String!
    description: String!
  }

  input UpdatePricingInput {
    planName: String
    basePrice: String
    billingInterval: String
    subLabel: String
    features: [PricingFeatureInput]
    calculatorBaseRate: Float
    calculatorHeadline: String
  }

  extend type Query {
    getWebsitePricing: WebsitePricing
  }

  extend type Mutation {
    updateWebsitePricing(input: UpdatePricingInput!): WebsitePricing
  }
`;
