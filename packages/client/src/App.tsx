import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { HardwareProvider, useHardware } from './HardwareContext';
import { AuthProvider } from './AuthContext';
import AppShell from './AppShell';
import { Toaster } from 'sonner';
import AppLayout from './web/AppLayout';
import LandingPage from './web/LandingPage';
import PricingDetail from './web/PricingDetail';
import StatusPage from './web/StatusPage';
import ProductFeatures from './web/ProductFeatures';
import AboutPage from './web/AboutPage';
import ContactPage from './web/ContactPage';
import CareersPage from './web/CareersPage';
import BlogPage from './web/BlogPage';
import CaseStudiesPage from './web/CaseStudiesPage';
import ReviewsPage from './web/ReviewsPage';
import KnowledgeBase from './web/KnowledgeBase';
import LegalPage from './web/LegalPage';
import ScrollToTop from './components/ScrollToTop';

function MainLayout() {
  return (
    <>
      <ScrollToTop />
      <AppLayout />
    </>
  );
}

function MainContent() {
  const { currentUser } = useHardware();

  if (currentUser) {
    return <AppShell />;
  }

  return (
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
  );
}

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function App() {
  const googleClientId = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) || "531837744865-9ggk92vnkmbpha1sibu3hulfosuk0j0r.apps.googleusercontent.com";

  React.useEffect(() => {
    console.log('IDENTITY_LOAD:', googleClientId);
  }, [googleClientId]);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <HardwareProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster position="bottom-right" theme="dark" richColors />
            <MainContent />
          </BrowserRouter>
        </AuthProvider>
      </HardwareProvider>
    </GoogleOAuthProvider>
  );
}
