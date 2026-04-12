import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { initSafariHardening } from './lib/safari';
import App from './App';
import './index.css';
import './styles/components.css';

const httpLink = createHttpLink({
  uri: 'http://localhost:9000/graphql',
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

// Initialize Institutional Safari Hardening Protocol
initSafariHardening();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
