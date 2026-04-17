export const typeDefs = `#graphql
  type KBCategory {
    id: ID!
    name: String!
    slug: String!
    type: String!
    icon_name: String
    order_index: Int
    created_at: String
  }

  type KBArticle {
    id: ID!
    category_id: ID
    category: KBCategory
    title: String!
    slug: String!
    content: String!
    excerpt: String
    kb_type: String!
    icon_name: String
    order_index: Int
    is_active: Boolean
    created_at: String
    updated_at: String
  }

  input KBCategoryInput {
    id: ID
    name: String!
    slug: String!
    type: String!
    icon_name: String
    order_index: Int
  }

  input KBArticleInput {
    id: ID
    category_id: ID
    title: String!
    slug: String!
    content: String!
    excerpt: String
    kb_type: String!
    icon_name: String
    order_index: Int
    is_active: Boolean
  }

  extend type Query {
    getKBCategories(type: String!): [KBCategory]
    getKBArticles(type: String!, categoryId: ID): [KBArticle]
    getKBArticleBySlug(slug: String!, type: String!): KBArticle
  }

  extend type Mutation {
    upsertKBCategory(input: KBCategoryInput!): KBCategory
    deleteKBCategory(id: ID!): Boolean
    upsertKBArticle(input: KBArticleInput!): KBArticle
    deleteKBArticle(id: ID!): Boolean
  }
`;
