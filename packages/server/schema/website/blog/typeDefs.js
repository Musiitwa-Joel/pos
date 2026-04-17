import { gql } from "graphql-tag";

export const typeDefs = gql`
  type BlogPost {
    id: ID!
    title: String!
    slug: String!
    author: String!
    category: String
    excerpt: String
    content: String!
    image_url: String
    is_draft: Boolean
    published_at: String
    created_at: String
  }

  input CreateBlogPostInput {
    title: String!
    slug: String!
    author: String!
    category: String
    excerpt: String
    content: String!
    image_url: String
    is_draft: Boolean
  }

  input UpdateBlogPostInput {
    title: String
    slug: String
    author: String
    category: String
    excerpt: String
    content: String
    image_url: String
    is_draft: Boolean
    published_at: String
  }

  extend type Query {
    getBlogPosts: [BlogPost]
    getBlogPostBySlug(slug: String!): BlogPost
    getPublishedBlogPosts: [BlogPost]
  }

  extend type Mutation {
    createBlogPost(input: CreateBlogPostInput!): BlogPost
    updateBlogPost(id: ID!, input: UpdateBlogPostInput!): BlogPost
    deleteBlogPost(id: ID!): Boolean
  }
`;
