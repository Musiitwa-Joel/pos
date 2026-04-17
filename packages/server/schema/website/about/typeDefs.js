import { gql } from "graphql-tag";

export const typeDefs = gql`
  type AboutSection {
    id: ID!
    title: String!
    subtitle: String
    content: String!
    image_url: String
    icon_name: String
    order_index: Int
    section_type: String
    is_active: Boolean
    updated_at: String
  }

  input CreateAboutSectionInput {
    title: String!
    subtitle: String
    content: String!
    image_url: String
    icon_name: String
    order_index: Int
    section_type: String
    is_active: Boolean
  }

  input UpdateAboutSectionInput {
    title: String
    subtitle: String
    content: String
    image_url: String
    icon_name: String
    order_index: Int
    section_type: String
    is_active: Boolean
  }

  extend type Query {
    getAboutSections: [AboutSection]
  }

  extend type Mutation {
    createAboutSection(input: CreateAboutSectionInput!): AboutSection
    updateAboutSection(id: ID!, input: UpdateAboutSectionInput!): AboutSection
    deleteAboutSection(id: ID!): Boolean
  }
`;
