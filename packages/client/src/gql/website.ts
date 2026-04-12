import { gql } from '@apollo/client';

export const GET_WEBSITE_PRICING = gql`
  query GetWebsitePricing {
    getWebsitePricing {
      planName
      basePrice
      billingInterval
      subLabel
      calculatorBaseRate
      calculatorHeadline
      features {
        title
        description
      }
      onboardedCount
      onboardedTenants
      updatedAt
    }
  }
`;

export const UPDATE_WEBSITE_PRICING = gql`
  mutation UpdateWebsitePricing($input: UpdatePricingInput!) {
    updateWebsitePricing(input: $input) {
      planName
      basePrice
      billingInterval
      subLabel
      calculatorBaseRate
      calculatorHeadline
      features {
        title
        description
      }
      updatedAt
    }
  }
`;

export const GET_HERO_SECTION = gql`
  query GetHeroSection {
    getHeroSection {
      blackPart1
      orangePart
      blackPart2
      description
      primaryCta
      secondaryCta
      marqueeItems
      marqueeSpeed
      updatedAt
    }
  }
`;

export const UPDATE_HERO_SECTION = gql`
  mutation UpdateHeroSection($input: UpdateHeroSectionInput!) {
    updateHeroSection(input: $input) {
      blackPart1
      orangePart
      blackPart2
      description
      primaryCta
      secondaryCta
      marqueeItems
      marqueeSpeed
      updatedAt
    }
  }
`;
