import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { HardwareProvider, useHardware } from './HardwareContext';
import { AuthProvider } from './AuthContext';
import { POSProvider } from './POSContext';
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
const CaseStudiesPage = React.lazy(() => import('./web/CaseStudiesPage'));
const ReviewsPage = React.lazy(() => import('./web/ReviewsPage'));
const KnowledgeBase = React.lazy(() => import('./web/KnowledgeBase'));
const LegalPage = React.lazy(() => import('./web/LegalPage'));
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from 'sonner';
import LogoLoader from './components/LogoLoader';

function MainLayout() {
  return (
    <>
      <ScrollToTop />
      <AppLayout />
    </>
  );
}

function MainContent() {
  const { currentUser, loadingStatus } = useHardware();

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
          <Route path="/press" element={<ContactPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/blog" element={<BlogPage />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </React.Suspense>
  );
}

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function App() {
  const googleClientId = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) || "531837744865-9ggk92vnkmbpha1sibu3hulfosuk0j0r.apps.googleusercontent.com";

  React.useEffect(() => {
    // console.log('IDENTITY_LOAD:', googleClientId);
  }, [googleClientId]);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <HardwareProvider>
        <POSProvider>
          <AuthProvider>
            <BrowserRouter>
              <Toaster position="bottom-right" theme="dark" richColors />
              <MainContent />
            </BrowserRouter>
          </AuthProvider>
        </POSProvider>
      </HardwareProvider>
    </GoogleOAuthProvider>
  );
}
