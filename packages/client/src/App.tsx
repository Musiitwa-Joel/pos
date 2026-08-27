import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { HardwareProvider } from './HardwareContext';
import { AuthProvider } from './AuthContext';
import { POSProvider } from './POSContext';
import { IdentityProvider, useIdentity } from './contexts/IdentityContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { SalesProvider } from './contexts/SalesContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { HRProvider } from './contexts/HRContext';
import { SystemProvider } from './contexts/SystemContext';
import { IntelligenceProvider } from './contexts/IntelligenceContext';
const AppShell = React.lazy(() => import('./AppShell'));
const AppLayout = React.lazy(() => import('./web/AppLayout'));
const LandingPage = React.lazy(() => import('./web/LandingPage'));
const PricingDetail = React.lazy(() => import('./web/PricingDetail'));
const StatusPage = React.lazy(() => import('./web/StatusPage'));
const ProductFeatures = React.lazy(() => import('./web/ProductFeatures'));
const AboutPage = React.lazy(() => import('./web/AboutPage'));
const ContactPage = React.lazy(() => import('./web/ContactPage'));
const CareersPage = React.lazy(() => import('./web/CareersPage'));
const BlogPage = React.lazy(() => import('./web/BlogPage'));
const BlogPostPage = React.lazy(() => import('./web/BlogPostPage'));
const CaseStudiesPage = React.lazy(() => import('./web/CaseStudiesPage'));
const ReviewsPage = React.lazy(() => import('./web/ReviewsPage'));
const KnowledgeBase = React.lazy(() => import('./web/KnowledgeBase'));
const LegalPage = React.lazy(() => import('./web/LegalPage'));
const ChangelogPage = React.lazy(() => import('./web/ChangelogPage'));
const PressPage = React.lazy(() => import('./web/PressPage'));
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from 'sonner';
import LogoLoader from './components/LogoLoader';
import { HelmetProvider } from 'react-helmet-async';
import TredPosSEO from './components/common/TredPosSEO';

import { observer } from '@legendapp/state/react';

function MainLayout() {
  return (
    <>
      <ScrollToTop />
      <AppLayout />
    </>
  );
}



import { GoogleOAuthProvider } from '@react-oauth/google';

export default function App() {
  const googleClientId = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) || "531837744865-9ggk92vnkmbpha1sibu3hulfosuk0j0r.apps.googleusercontent.com";

  return (
    <HelmetProvider>
      <TredPosSEO />
      <GoogleOAuthProvider clientId={googleClientId}>
        <IdentityProvider>
          <InventoryProvider>
            <SalesProvider>
              <FinanceProvider>
                <HRProvider>
                  <SystemProvider>
                    <POSProvider>
                      <HardwareProvider>
                        <IntelligenceProvider>
                          <AuthProvider>
                            <BrowserRouter>
                              <Toaster position="bottom-right" theme="dark" richColors />
                              <MainContent />
                            </BrowserRouter>
                          </AuthProvider>
                        </IntelligenceProvider>
                      </HardwareProvider>
                    </POSProvider>
                  </SystemProvider>
                </HRProvider>
              </FinanceProvider>
            </SalesProvider>
          </InventoryProvider>
        </IdentityProvider>
      </GoogleOAuthProvider>
    </HelmetProvider>
  );
}

const MainContent = observer(() => {
  const { currentUser, loadingStatus } = useIdentity();

  if (currentUser) {
    return (
      <React.Suspense fallback={<LogoLoader status={loadingStatus} />}>
        <AppShell />
      </React.Suspense>
    );
  }

  return (
    <React.Suspense fallback={<LogoLoader status={loadingStatus} />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingDetail />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/features" element={<ProductFeatures />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/press" element={<PressPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/updates" element={<BlogPage />} />
          <Route path="/case-studies" element={<CaseStudiesPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/community" element={<ReviewsPage />} />
          <Route path="/helpcenter" element={<KnowledgeBase type="help" />} />
          <Route path="/apidocs" element={<KnowledgeBase type="api" />} />
          <Route path="/security" element={<KnowledgeBase type="security" />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/cookies" element={<LegalPage type="cookies" />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </React.Suspense>
  );
});
