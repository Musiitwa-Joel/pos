import { gql } from "graphql-tag";

export default gql`
  type Changelog {
    id: ID!
    version: String!
    title: String!
    category: String!
    content: String!
    released_at: String
    created_at: String
  }

  input CreateChangelogInput {
    version: String!
    title: String!
    category: String!
    content: String!
    released_at: String
  }

  input UpdateChangelogInput {
    version: String
    title: String
    category: String
    content: String
    released_at: String
  }

  extend type Query {
    getChangelogs: [Changelog]
    getLatestChangelog: Changelog
  }

  extend type Mutation {
    createChangelog(input: CreateChangelogInput!): Changelog
    updateChangelog(id: ID!, input: UpdateChangelogInput!): Changelog
    deleteChangelog(id: ID!): Boolean
  }
`;
