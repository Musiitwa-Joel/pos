import React, { createContext, useContext, useState } from 'react';

type AuthMode = 'login' | 'signup';

interface AuthContextType {
  showAuthModal: boolean;
  authMode: AuthMode;
  openAuth: (mode: AuthMode) => void;
  closeAuth: () => void;
  setMode: (mode: AuthMode) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuth = () => setShowAuthModal(false);

  return (
    <AuthContext.Provider value={{ showAuthModal, authMode, openAuth, closeAuth, setMode: setAuthMode }}>
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
