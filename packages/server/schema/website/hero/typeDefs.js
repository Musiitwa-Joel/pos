import { gql } from "graphql-tag";

export default gql`
  type HeroSection {
    blackPart1: String
    orangePart: String
    blackPart2: String
    description: String
    primaryCta: String
    secondaryCta: String
    marqueeItems: [String]
    marqueeSpeed: Int
    updatedAt: String
  }

  input UpdateHeroSectionInput {
    blackPart1: String
    orangePart: String
    blackPart2: String
    description: String
    primaryCta: String
    secondaryCta: String
    marqueeItems: [String]
    marqueeSpeed: Int
  }

  extend type Query {
    getHeroSection: HeroSection
  }

  extend type Mutation {
    updateHeroSection(input: UpdateHeroSectionInput!): HeroSection
  }
`;
