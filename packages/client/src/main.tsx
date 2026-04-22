import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './lib/apollo';
import { initSafariHardening } from './lib/safari';
import App from './App';
import './index.css';
import './styles/components.css';

// Initialize Institutional Safari Hardening Protocol
initSafariHardening();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </StrictMode>,
);
