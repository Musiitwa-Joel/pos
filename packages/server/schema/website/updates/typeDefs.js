import { gql } from "graphql-tag";

export const typeDefs = gql`
  type UpdateEntry {
    id: ID!
    title: String!
    summary: String
    content: String!
    image_url: String
    category: String
    published_at: String
    created_at: String
  }

  input CreateUpdateInput {
    title: String!
    summary: String
    content: String!
    image_url: String
    category: String
    published_at: String
  }

  input UpdateEntryInput {
    title: String
    summary: String
    content: String
    image_url: String
    category: String
    published_at: String
  }

  extend type Query {
    getUpdates: [UpdateEntry]
    getLatestUpdate: UpdateEntry
  }

  extend type Mutation {
    createUpdate(input: CreateUpdateInput!): UpdateEntry
    updateUpdate(id: ID!, input: UpdateEntryInput!): UpdateEntry
    deleteUpdate(id: ID!): Boolean
  }
`;
