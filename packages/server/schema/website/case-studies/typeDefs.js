import { gql } from "graphql-tag";

export const typeDefs = gql`
  type CaseStudy {
    id: ID!
    title: String!
    slug: String!
    client_name: String
    industry: String
    summary: String
    content: String!
    results: String
    metric: String
    metric_label: String
    image_url: String
    is_featured: Boolean
    created_at: String
  }

  input CreateCaseStudyInput {
    title: String!
    slug: String!
    client_name: String
    industry: String
    summary: String
    content: String!
    results: String
    metric: String
    metric_label: String
    image_url: String
    is_featured: Boolean
  }

  input UpdateCaseStudyInput {
    title: String
    slug: String
    client_name: String
    industry: String
    summary: String
    content: String
    results: String
    metric: String
    metric_label: String
    image_url: String
    is_featured: Boolean
  }

  extend type Query {
    getCaseStudies: [CaseStudy]
    getCaseStudyBySlug(slug: String!): CaseStudy
    getFeaturedCaseStudies: [CaseStudy]
  }

  extend type Mutation {
    createCaseStudy(input: CreateCaseStudyInput!): CaseStudy
    updateCaseStudy(id: ID!, input: UpdateCaseStudyInput!): CaseStudy
    deleteCaseStudy(id: ID!): Boolean
  }
`;
