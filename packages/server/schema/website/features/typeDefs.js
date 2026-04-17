import { gql } from "graphql-tag";

export const typeDefs = gql`
  type FeatureNode {
    id: ID!
    title: String!
    description: String!
    icon: String
    color: String
    order_index: Int
    created_at: String
  }

  input CreateFeatureInput {
    title: String!
    description: String!
    icon: String
    color: String
    order_index: Int
  }

  input UpdateFeatureInput {
    title: String
    description: String
    icon: String
    color: String
    order_index: Int
  }

  extend type Query {
    getFeatures: [FeatureNode]
  }

  extend type Mutation {
    createFeature(input: CreateFeatureInput!): FeatureNode
    updateFeature(id: ID!, input: UpdateFeatureInput!): FeatureNode
    deleteFeature(id: ID!): Boolean
  }
`;
