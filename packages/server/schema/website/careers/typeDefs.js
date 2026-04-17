import { gql } from "graphql-tag";

export const typeDefs = gql`
  type JobPosition {
    id: ID!
    title: String!
    department: String!
    location: String
    type: String
    color_code: String
    description: String!
    requirements: String
    order_index: Int
    is_active: Boolean
    posted_at: String
    created_at: String
  }

  type JobPerk {
    id: ID!
    title: String!
    description: String!
    icon_name: String
    order_index: Int
    is_active: Boolean
  }

  input CreateJobInput {
    title: String!
    department: String!
    location: String
    type: String
    color_code: String
    description: String!
    requirements: String
    order_index: Int
    is_active: Boolean
  }

  input UpdateJobInput {
    title: String
    department: String
    location: String
    type: String
    color_code: String
    description: String
    requirements: String
    order_index: Int
    is_active: Boolean
  }

  input PerkInput {
    title: String!
    description: String!
    icon_name: String
    order_index: Int
    is_active: Boolean
  }

  extend type Query {
    getJobs: [JobPosition]
    getOpenPositions: [JobPosition]
    getJobPerks: [JobPerk]
  }

  extend type Mutation {
    createJob(input: CreateJobInput!): JobPosition
    updateJob(id: ID!, input: UpdateJobInput!): JobPosition
    deleteJob(id: ID!): Boolean
    
    createPerk(input: PerkInput!): JobPerk
    updatePerk(id: ID!, input: PerkInput!): JobPerk
    deletePerk(id: ID!): Boolean
  }
`;
