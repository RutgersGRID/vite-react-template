import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Change this base path to match your repository name
  base: '/vite-react-template/',
  server: {
    port: 3000,
  },
  build: {
    // Generate sourcemaps for better debugging
    sourcemap: true,
    // Minify output files
    minify: 'terser',
    // Additional build options can be added here
  },
});