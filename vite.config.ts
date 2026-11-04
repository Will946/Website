import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base: the built site works from a domain root or from a subpath like /Website/.
export default defineConfig({
  base: './',
  plugins: [react()],
});
