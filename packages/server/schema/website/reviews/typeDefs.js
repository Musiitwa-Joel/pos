import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Review {
    id: ID!
    name: String!
    role: String
    company: String
    content: String!
    rating: Int
    impact: String
    avatar_url: String
    is_featured: Boolean
    created_at: String
  }

  input CreateReviewInput {
    name: String!
    role: String
    company: String
    content: String!
    rating: Int
    impact: String
    avatar_url: String
    is_featured: Boolean
  }

  input UpdateReviewInput {
    name: String
    role: String
    company: String
    content: String
    rating: Int
    impact: String
    avatar_url: String
    is_featured: Boolean
  }

  extend type Query {
    getReviews: [Review]
    getFeaturedReviews: [Review]
  }

  extend type Mutation {
    createReview(input: CreateReviewInput!): Review
    updateReview(id: ID!, input: UpdateReviewInput!): Review
    deleteReview(id: ID!): Boolean
  }
`;
