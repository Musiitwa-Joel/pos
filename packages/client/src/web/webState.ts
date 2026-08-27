import { observable } from "@legendapp/state";

// 🚀 [VANGUARD] Institutional Web State:
// Centralized state engine for the public-facing platform.
// This ensures zero-render latency for UI interactions like 
// navigation, filtering, and theme transitions.
export const webState$ = observable({
  ui: {
    isMenuOpen: false,
    activeCategory: 'All',
    pricingInterval: 'monthly' as 'monthly' | 'yearly',
    searchQuery: '',
    isFilterLoading: false,
    nodeCount: 1,
    selectedJob: null as any,
    selectedPress: null as any,
    selectedBlog: null as any,
    selectedArticle: null as any, // For KB
    selectedReview: null as any,
    selectedCaseStudy: null as any,
    selectedChangelog: null as any,
  },
  contact: {
    formData: {
      name: '',
      email: '',
      subject: 'General Inquiry',
      message: ''
    },
    submitted: false,
    isSubmitting: false,
  },
  // Cache for website configuration data
  content: {
    hero: null as any,
    pricing: null as any,
    features: [] as any[],
  }
});
