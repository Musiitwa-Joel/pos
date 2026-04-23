import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Force deduplication of react and apollo
      'react': path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
      '@apollo/client': path.resolve(__dirname, '../../node_modules/@apollo/client'),
    },
    dedupe: ['react', 'react-dom', '@apollo/client', 'graphql'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Removed object syntax for manualChunks to fix Rolldown compatibility error
      },
    },
  },
  define: {
    'process.env': {},
  },
});
