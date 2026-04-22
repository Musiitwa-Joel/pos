import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

/**
 * HSM v2.4 Identity & Persistence Blueprint
 * Unified Apollo Client configuration to prevent context duplication 
 * and ensure singleton behavior across production bundles.
 */

// Dynamic API resolution
export const getApiBaseUrl = () => {
    try {
        // @ts-ignore - Handle various environment injection patterns
        const meta = (import.meta as any);
        const viteEnv = meta.env?.VITE_API_BASE_URL;
        if (viteEnv) return viteEnv;

        const nodeEnv = typeof process !== 'undefined' ? process.env?.VITE_API_BASE_URL : null;
        if (nodeEnv) return nodeEnv;
    } catch (e) {
        // Environment extraction failed, falling back to local horizon
    }
    return `http://${window.location.hostname}:9000`;
};

export const API_BASE_URL = getApiBaseUrl();

// 📡 Terminal Uplink Factory
export const getUploadLink = (token?: string) => createUploadLink({
    uri: `${API_BASE_URL}/graphql`,
    headers: {
        "Apollo-Require-Preflight": "true",
        ...(token ? { authorization: `Bearer ${token}` } : {})
    },
});

export const uploadLink = getUploadLink();

// 🔑 Identity Handshake
const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('khms_token');
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
            "Apollo-Require-Preflight": "true"
        }
    };
});

// 🛡️ Forensic Audit Link
const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        for (const err of graphQLErrors) {
            if (err.extensions?.code === 'UNAUTHENTICATED' || err.message?.includes('expired token')) {
                // Event handled by HardwareProvider to trigger logout
                window.dispatchEvent(new CustomEvent('khms_force_logout'));
                break;
            }
        }
    }
    if (networkError) {
        console.error('[Apollo Network Error]', networkError);
    }
});

/**
 * The Institutional Singleton: Shared Apollo Client instance.
 * Ensures that Symbol(__APOLLO_CONTEXT__) matches across all lazy-loaded chunks.
 */
export const apolloClient = new ApolloClient({
    link: ApolloLink.from([errorLink, authLink, uploadLink]),
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    // Cache policy optimizations can be added here
                }
            }
        }
    }),
    connectToDevTools: true,
});
