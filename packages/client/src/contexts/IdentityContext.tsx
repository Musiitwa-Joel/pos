import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { apolloClient as client } from '../lib/apollo';
import { observable } from "@legendapp/state";
import { gql } from '@apollo/client';
import { User } from '../types';
import { LOGIN, GOOGLE_LOGIN } from '../gql/mutations/auth';
import { toast } from 'sonner';

const UPDATE_PROFILE_PICTURE = gql`
  mutation UpdateProfilePicture($file: Upload!) {
    updateProfilePicture(file: $file) {
      id
      username
      role
      authorizedModules
      profilePicture
      tenantStatus
    }
  }
`;

// 🛡️ [VANGUARD] Identity Observable:
// Managed centrally for zero-render institutional session tracking.
export const identityState$ = observable({
  currentUser: (JSON.parse(localStorage.getItem('khms_user') || 'null')) as User | null,
  isOffline: !navigator.onLine,
  isReady: false,
  loadingStatus: '',
});

interface IdentityContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null | ((prev: User | null) => User | null)) => void;
  login: (email: string, password: string) => Promise<string | undefined>;
  loginWithGoogle: (token: string) => Promise<string | undefined>;
  logout: () => void;
  updateProfilePicture: (file: File) => Promise<void>;
  isOffline: boolean;
  isReady: boolean;
  loadingStatus: string;
  withLoading: (status: string | undefined, fn: () => Promise<void>, showToast?: boolean) => Promise<void>;
  identityState$: any;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

const REFRESH_ME_QUERY = gql`
  query RefreshMe {
    me {
      id
      username
      role
      authorizedModules
      profilePicture
      tenantStatus
    }
  }
`;

import { observer } from '@legendapp/state/react';

export const IdentityProvider = observer(({ children, onLogoutCleanup }: { children: React.ReactNode, onLogoutCleanup?: () => void }) => {
  
  const setCurrentUser = (val: any) => {
    const nextUser = typeof val === 'function' ? val(identityState$.currentUser.get()) : val;
    identityState$.currentUser.set(nextUser);
    if (nextUser) {
      localStorage.setItem('khms_user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('khms_user');
    }
  };

  const logout = () => {
    localStorage.removeItem('khms_token');
    localStorage.removeItem('khms_user');
    identityState$.currentUser.set(null);
    if (onLogoutCleanup) onLogoutCleanup();
    window.location.href = '/';
  };

  const withLoading = async (status: string | undefined, fn: () => Promise<void>, showToast = false) => {
    // 🛰️ [VANGUARD] Status Formatter: "SAVING_SALE" -> "Saving Sale"
    const displayStatus = status
      ? status
        .replace(/\.\.\./g, '')
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      : 'Processing';

    identityState$.loadingStatus.set(displayStatus);
    
    let toastId: string | number | null = null;
    if (showToast && status) {
      toastId = toast.loading(`${displayStatus}...`);
    }

    try {
      await fn();
      if (showToast && toastId) {
        toast.success(`${displayStatus} completed`, { id: toastId });
      }
    } catch (err: any) {
      if (showToast && toastId) {
        toast.error(`${displayStatus} failed: ${err.message || 'Unknown Error'}`, { id: toastId });
      }
      throw err;
    } finally {
      identityState$.loadingStatus.set('');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      let result;
      await withLoading('Authenticating Credentials...', async () => {
        const { data } = await client.mutate({
          mutation: LOGIN,
          variables: { username: email, password }
        });
        if (data?.login) {
          // The backend might return a JWT string or a complex object
          // Assuming it matches the old structure
          const token = data.login; // Adjust if the backend returns { user, token }
          localStorage.setItem('khms_token', token);
          
          // Re-fetch 'me' to get the user object
          const { data: meData } = await client.query({ query: REFRESH_ME_QUERY, fetchPolicy: 'network-only' });
          if (meData?.me) {
            setCurrentUser(meData.me);
            result = meData.me.role;
          }
        }
      });
      return result;
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  const loginWithGoogle = async (token: string) => {
    try {
      let result;
      await withLoading('Processing Identity Token...', async () => {
        const { data } = await client.mutate({
          mutation: GOOGLE_LOGIN,
          variables: { idToken: token }
        });
        if (data?.googleLogin) {
          const token = data.googleLogin;
          localStorage.setItem('khms_token', token);
          
          const { data: meData } = await client.query({ query: REFRESH_ME_QUERY, fetchPolicy: 'network-only' });
          if (meData?.me) {
            setCurrentUser(meData.me);
            result = meData.me.role;
          }
        }
      });
      return result;
    } catch (err: any) {
      toast.error(err.message || 'Google authentication failed');
    }
  };

  const updateProfilePicture = async (file: File) => {
    await withLoading('UPDATING_AVATAR...', async () => {
      const { data } = await client.mutate({
        mutation: UPDATE_PROFILE_PICTURE,
        variables: { file }
      });
      if (data?.updateProfilePicture) {
        setCurrentUser(data.updateProfilePicture);
      }
    }, true);
  };

  useEffect(() => {
    const handleOnline = () => identityState$.isOffline.set(false);
    const handleOffline = () => identityState$.isOffline.set(true);
    const handleForceLogout = () => {
      toast.error('Session Expired: Please log in again');
      logout();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('khms_force_logout', handleForceLogout);

    const initialize = async () => {
      try {
        const { data } = await client.query({ query: REFRESH_ME_QUERY, fetchPolicy: 'network-only' });
        if (data?.me) {
          setCurrentUser(data.me);
        }
      } catch (err) {
        // console.error('[Vanguard Heartbeat] Not Authenticated');
      } finally {
        identityState$.isReady.set(true);
      }
    };

    initialize();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('khms_force_logout', handleForceLogout);
    };
  }, []);

  const value: IdentityContextType = useMemo(() => ({
    get currentUser() { return identityState$.currentUser.get(); },
    setCurrentUser,
    login,
    loginWithGoogle,
    logout,
    updateProfilePicture,
    get isOffline() { return identityState$.isOffline.get(); },
    get isReady() { return identityState$.isReady.get(); },
    get loadingStatus() { return identityState$.loadingStatus.get(); },
    withLoading,
    identityState$
  }), []);

  return (
    <IdentityContext.Provider value={value}>
      {children}
    </IdentityContext.Provider>
  );
});

export const useIdentity = () => {
  const context = useContext(IdentityContext);
  if (!context) throw new Error('useIdentity must be used within IdentityProvider');
  return context;
};
