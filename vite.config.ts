import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    federation({
      name: 'hostApp',
      remotes: {
        remoteApp:
          mode === 'development'
            ? 'http://localhost:5050/remoteEntry.js'  
            : 'http://localhost:4173/remoteEntry.js' 
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  base: '/',
  publicDir: 'public',
  build: {
    sourcemap: true,
  },
  server: {
    open: true,
    port: 5000,  
  },
  preview: {
    port: 5000,  
  }
}));
