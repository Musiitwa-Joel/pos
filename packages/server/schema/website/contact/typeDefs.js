export default `
  type ContactInquiry {
    id: ID!
    name: String!
    email: String!
    subject: String
    message: String!
    status: String
    created_at: String
    updated_at: String
  }

  type ContactConfig {
    support_email: String
    support_phone: String
  }

  input ContactInput {
    name: String!
    email: String!
    subject: String
    message: String!
  }

  input ContactConfigInput {
    support_email: String
    support_phone: String
  }

  extend type Query {
    getContactInquiries: [ContactInquiry]
    getContactConfig: ContactConfig
  }

  extend type Mutation {
    submitContactInquiry(input: ContactInput!): ContactInquiry
    deleteContactInquiry(id: ID!): Boolean
    markInquiryRead(id: ID!): ContactInquiry
    updateContactConfig(input: ContactConfigInput!): ContactConfig
  }
`;
