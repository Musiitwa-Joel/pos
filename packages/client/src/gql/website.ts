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

export const GET_CHANGELOGS = gql`
  query GetChangelogs {
    getChangelogs {
      id
      version
      title
      category
      content
      released_at
      created_at
    }
  }
`;

export const GET_LATEST_CHANGELOG = gql`
  query GetLatestChangelog {
    getLatestChangelog {
      id
      version
      title
      category
      content
      released_at
      created_at
    }
  }
`;

export const CREATE_CHANGELOG = gql`
  mutation CreateChangelog($input: CreateChangelogInput!) {
    createChangelog(input: $input) {
      id
      version
      title
      category
      content
      released_at
      created_at
    }
  }
`;

export const UPDATE_CHANGELOG = gql`
  mutation UpdateChangelog($id: ID!, $input: UpdateChangelogInput!) {
    updateChangelog(id: $id, input: $input) {
      id
      version
      title
      category
      content
      released_at
      created_at
    }
  }
`;

export const DELETE_CHANGELOG = gql`
  mutation DeleteChangelog($id: ID!) {
    deleteChangelog(id: $id)
  }
`;

// --- Reviews Hub ---
export const GET_REVIEWS = gql`
  query GetReviews {
    getReviews {
      id name role company content rating impact avatar_url is_featured created_at
    }
  }
`;

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) { id name role company content rating impact avatar_url is_featured }
  }
`;

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: ID!, $input: UpdateReviewInput!) {
    updateReview(id: $id, input: $input) { id name role company content rating impact avatar_url is_featured }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`;

// --- Updates Hub ---
export const GET_UPDATES = gql`
  query GetUpdates {
    getUpdates {
      id title summary content image_url category published_at created_at
    }
  }
`;

export const CREATE_UPDATE = gql`
  mutation CreateUpdate($input: CreateUpdateInput!) {
    createUpdate(input: $input) { id title summary content image_url category published_at }
  }
`;

export const UPDATE_UPDATE = gql`
  mutation UpdateUpdate($id: ID!, $input: UpdateEntryInput!) {
    updateUpdate(id: $id, input: $input) { id title summary content image_url category published_at }
  }
`;

export const DELETE_UPDATE = gql`
  mutation DeleteUpdate($id: ID!) {
    deleteUpdate(id: $id)
  }
`;

// --- Case Studies Hub ---
export const GET_CASE_STUDIES = gql`
  query GetCaseStudies {
    getCaseStudies {
      id title slug client_name industry summary content results metric metric_label image_url is_featured created_at
    }
  }
`;

export const CREATE_CASE_STUDY = gql`
  mutation CreateCaseStudy($input: CreateCaseStudyInput!) {
    createCaseStudy(input: $input) { id title slug client_name industry summary content results metric metric_label image_url is_featured }
  }
`;

export const UPDATE_CASE_STUDY = gql`
  mutation UpdateCaseStudy($id: ID!, $input: UpdateCaseStudyInput!) {
    updateCaseStudy(id: $id, input: $input) { id title slug client_name industry summary content results metric metric_label image_url is_featured }
  }
`;

export const DELETE_CASE_STUDY = gql`
  mutation DeleteCaseStudy($id: ID!) {
    deleteCaseStudy(id: $id)
  }
`;

// --- About Hub ---
export const GET_ABOUT_SECTIONS = gql`
  query GetAboutSections {
    getAboutSections {
      id
      title
      subtitle
      content
      image_url
      icon_name
      order_index
      section_type
      is_active
      updated_at
    }
  }
`;

export const CREATE_ABOUT_SECTION = gql`
  mutation CreateAboutSection($input: CreateAboutSectionInput!) {
    createAboutSection(input: $input) { id title subtitle content image_url icon_name order_index section_type is_active }
  }
`;

export const UPDATE_ABOUT_SECTION = gql`
  mutation UpdateAboutSection($id: ID!, $input: UpdateAboutSectionInput!) {
    updateAboutSection(id: $id, input: $input) { id title subtitle content image_url icon_name order_index section_type is_active }
  }
`;

export const DELETE_ABOUT_SECTION = gql`
  mutation DeleteAboutSection($id: ID!) {
    deleteAboutSection(id: $id)
  }
`;

// --- Careers Hub ---
export const GET_CAREERS_DATA = gql`
  query GetCareersData {
    getOpenPositions {
      id
      title
      department
      location
      type
      color_code
      description
      requirements
      order_index
      is_active
      posted_at
    }
    getJobPerks {
      id
      title
      description
      icon_name
      order_index
      is_active
    }
  }
`;

export const GET_JOBS = gql`
  query GetJobs {
    getJobs {
      id title department location type description requirements is_active posted_at created_at
    }
  }
`;

export const CREATE_JOB = gql`
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      id
      title
      department
      location
      type
      color_code
      description
      requirements
      order_index
      is_active
      posted_at
    }
  }
`;

export const UPDATE_JOB = gql`
  mutation UpdateJob($id: ID!, $input: UpdateJobInput!) {
    updateJob(id: $id, input: $input) {
      id
      title
      department
      location
      type
      color_code
      description
      requirements
      order_index
      is_active
      posted_at
    }
  }
`;

export const DELETE_JOB = gql`
  mutation DeleteJob($id: ID!) {
    deleteJob(id: $id)
  }
`;

export const CREATE_PERK = gql`
  mutation CreatePerk($input: PerkInput!) {
    createPerk(input: $input) {
      id
      title
    }
  }
`;

export const UPDATE_PERK = gql`
  mutation UpdatePerk($id: ID!, $input: PerkInput!) {
    updatePerk(id: $id, input: $input) {
      id
      title
    }
  }
`;

export const DELETE_PERK = gql`
  mutation DeletePerk($id: ID!) {
    deletePerk(id: $id)
  }
`;

// --- Blog Hub ---
export const GET_BLOG_POSTS = gql`
  query GetBlogPosts {
    getBlogPosts {
      id title slug author category excerpt content image_url is_draft published_at created_at
    }
  }
`;

export const CREATE_BLOG_POST = gql`
  mutation CreateBlogPost($input: CreateBlogPostInput!) {
    createBlogPost(input: $input) { id title slug author category excerpt content image_url is_draft }
  }
`;

export const UPDATE_BLOG_POST = gql`
  mutation UpdateBlogPost($id: ID!, $input: UpdateBlogPostInput!) {
    updateBlogPost(id: $id, input: $input) { id title slug author category excerpt content image_url is_draft published_at }
  }
`;

export const DELETE_BLOG_POST = gql`
  mutation DeleteBlogPost($id: ID!) {
    deleteBlogPost(id: $id)
  }
`;

export const GET_BLOG_POST_BY_SLUG = gql`
  query GetBlogPostBySlug($slug: String!) {
    getBlogPostBySlug(slug: $slug) {
      id
      title
      slug
      author
      category
      excerpt
      content
      image_url
      is_draft
      published_at
      created_at
    }
  }
`;

// --- Press Hub ---
export const GET_PRESS_RELEASES = gql`
  query GetPressReleases {
    getPressReleases {
      id title source link excerpt published_date created_at
    }
  }
`;

export const CREATE_PRESS_RELEASE = gql`
  mutation CreatePressRelease($input: CreatePressInput!) {
    createPressRelease(input: $input) { id title source link excerpt published_date }
  }
`;

export const UPDATE_PRESS_RELEASE = gql`
  mutation UpdatePressRelease($id: ID!, $input: UpdatePressInput!) {
    updatePressRelease(id: $id, input: $input) { id title source link excerpt published_date }
  }
`;

export const DELETE_PRESS_RELEASE = gql`
  mutation DeletePressRelease($id: ID!) {
    deletePressRelease(id: $id)
  }
`;
// --- Features Hub ---
export const GET_FEATURES = gql`
  query GetFeatures {
    getFeatures {
      id title description icon color order_index created_at
    }
  }
`;

export const CREATE_FEATURE = gql`
  mutation CreateFeature($input: CreateFeatureInput!) {
    createFeature(input: $input) { id title description icon color order_index }
  }
`;

export const UPDATE_FEATURE = gql`
  mutation UpdateFeature($id: ID!, $input: UpdateFeatureInput!) {
    updateFeature(id: $id, input: $input) { id title description icon color order_index }
  }
`;

export const DELETE_FEATURE = gql`
  mutation DeleteFeature($id: ID!) {
    deleteFeature(id: $id)
  }
`;

// --- Contact Hub ---
export const GET_CONTACT_INQUIRIES = gql`
  query GetContactInquiries {
    getContactInquiries {
      id
      name
      email
      subject
      message
      status
      created_at
      updated_at
    }
  }
`;

export const SUBMIT_CONTACT_INQUIRY = gql`
  mutation SubmitContactInquiry($input: ContactInput!) {
    submitContactInquiry(input: $input) {
      id
      name
      status
    }
  }
`;

export const DELETE_CONTACT_INQUIRY = gql`
  mutation DeleteContactInquiry($id: ID!) {
    deleteContactInquiry(id: $id)
  }
`;

export const MARK_INQUIRY_READ = gql`
  mutation MarkInquiryRead($id: ID!) {
    markInquiryRead(id: $id) {
      id
      status
    }
  }
`;

export const GET_CONTACT_CONFIG = gql`
  query GetContactConfig {
    getContactConfig {
      support_email
      support_phone
    }
  }
`;

export const UPDATE_CONTACT_CONFIG = gql`
  mutation UpdateContactConfig($input: ContactConfigInput!) {
    updateContactConfig(input: $input) {
      support_email
      support_phone
    }
  }
`;
// --- Knowledge Base Hub ---
export const GET_KB_CATEGORIES = gql`
  query GetKBCategories($type: String!) {
    getKBCategories(type: $type) {
      id name slug type icon_name order_index created_at
    }
  }
`;

export const GET_KB_ARTICLES = gql`
  query GetKBArticles($type: String!, $categoryId: ID) {
    getKBArticles(type: $type, categoryId: $categoryId) {
      id category_id title slug excerpt kb_type icon_name order_index is_active created_at
      category { id name }
    }
  }
`;

export const GET_KB_ARTICLE_BY_SLUG = gql`
  query GetKBArticleBySlug($slug: String!, $type: String!) {
    getKBArticleBySlug(slug: $slug, type: $type) {
      id category_id title slug content excerpt kb_type icon_name order_index is_active created_at
    }
  }
`;

export const UPSERT_KB_CATEGORY = gql`
  mutation UpsertKBCategory($input: KBCategoryInput!) {
    upsertKBCategory(input: $input) {
      id name slug type icon_name order_index
    }
  }
`;

export const DELETE_KB_CATEGORY = gql`
  mutation DeleteKBCategory($id: ID!) {
    deleteKBCategory(id: $id)
  }
`;

export const UPSERT_KB_ARTICLE = gql`
  mutation UpsertKBArticle($input: KBArticleInput!) {
    upsertKBArticle(input: $input) {
      id category_id title slug content excerpt kb_type icon_name order_index is_active
    }
  }
`;

export const DELETE_KB_ARTICLE = gql`
  mutation DeleteKBArticle($id: ID!) {
    deleteKBArticle(id: $id)
  }
`;

// --- Status Monitoring Hub ---
export const GET_STATUS_COMPONENTS = gql`
  query GetStatusComponents {
    getStatusComponents {
      id name description status order_index created_at
    }
  }
`;

export const GET_ACTIVE_INCIDENTS = gql`
  query GetActiveIncidents {
    getActiveIncidents {
      id title message status impact created_at updated_at
    }
  }
`;

export const GET_INCIDENT_HISTORY = gql`
  query GetIncidentHistory($limit: Int) {
    getIncidentHistory(limit: $limit) {
      id title message status impact created_at updated_at
    }
  }
`;

export const UPSERT_STATUS_COMPONENT = gql`
  mutation UpsertStatusComponent($input: StatusComponentInput!) {
    upsertStatusComponent(input: $input) {
      id name description status order_index
    }
  }
`;

export const DELETE_STATUS_COMPONENT = gql`
  mutation DeleteStatusComponent($id: ID!) {
    deleteStatusComponent(id: $id)
  }
`;

export const UPSERT_STATUS_INCIDENT = gql`
  mutation UpsertStatusIncident($input: StatusIncidentInput!) {
    upsertStatusIncident(input: $input) {
      id title message status impact
    }
  }
`;

export const DELETE_STATUS_INCIDENT = gql`
  mutation DeleteStatusIncident($id: ID!) {
    deleteStatusIncident(id: $id)
  }
`;
