import React, { createContext, useContext, useState } from 'react';

// Unified Auth Modes to match the federated cluster standards
export type AuthMode = 'login' | 'register' | 'signup' | 'forgot' | 'forgot-password' | 'reset' | 'reset-password';

interface AuthContextType {
  showAuthModal: boolean;
  authMode: AuthMode;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  setMode: (mode: AuthMode) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const openAuth = (mode: AuthMode = 'login') => {
    // Normalizing aliases
    let normalizedMode = mode;
    if (mode === 'signup') normalizedMode = 'register';
    if (mode === 'forgot-password') normalizedMode = 'forgot';
    if (mode === 'reset-password') normalizedMode = 'reset';
    
    setAuthMode(normalizedMode);
    setShowAuthModal(true);
  };

  const closeAuth = () => setShowAuthModal(false);
  const setMode = (mode: AuthMode) => {
    let normalizedMode = mode;
    if (mode === 'signup') normalizedMode = 'register';
    if (mode === 'forgot-password') normalizedMode = 'forgot';
    if (mode === 'reset-password') normalizedMode = 'reset';
    setAuthMode(normalizedMode);
  };

  return (
    <AuthContext.Provider value={{ showAuthModal, authMode, openAuth, closeAuth, setMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
