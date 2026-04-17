import { gql } from "graphql-tag";

export const typeDefs = gql`
  type PressRelease {
    id: ID!
    title: String!
    source: String
    link: String
    excerpt: String
    published_date: String
    created_at: String
  }

  input CreatePressInput {
    title: String!
    source: String
    link: String
    excerpt: String
    published_date: String
  }

  input UpdatePressInput {
    title: String
    source: String
    link: String
    excerpt: String
    published_date: String
  }

  extend type Query {
    getPressReleases: [PressRelease]
  }

  extend type Mutation {
    createPressRelease(input: CreatePressInput!): PressRelease
    updatePressRelease(id: ID!, input: UpdatePressInput!): PressRelease
    deletePressRelease(id: ID!): Boolean
  }
`;
