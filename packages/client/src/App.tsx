import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HardwareProvider } from './HardwareContext';
import { AuthProvider, useAuth } from './AuthContext';
import { POSProvider } from './POSContext';
import { IdentityProvider, useIdentity } from './contexts/IdentityContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { SalesProvider } from './contexts/SalesContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { HRProvider } from './contexts/HRContext';
import { SystemProvider } from './contexts/SystemContext';
import { IntelligenceProvider } from './contexts/IntelligenceContext';
const AppShell = React.lazy(() => import('./AppShell'));
import { Toaster } from 'sonner';
import LogoLoader from './components/LogoLoader';
import { HelmetProvider } from 'react-helmet-async';
import TredPosSEO from './components/common/TredPosSEO';
import AuthModal from './components/auth/AuthModal';

import { observer } from '@legendapp/state/react';



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
  const { openAuth } = useAuth();

  useEffect(() => {
    if (!currentUser) openAuth('login');
  }, [currentUser, openAuth]);

  if (currentUser) {
    return (
      <React.Suspense fallback={<LogoLoader status={loadingStatus} />}>
        <AppShell />
      </React.Suspense>
    );
  }

  return (
    <React.Suspense fallback={<LogoLoader status={loadingStatus} />}>
      <div className="min-h-screen bg-black">
        <AuthModal />
      </div>
    </React.Suspense>
  );
});
