import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Lists every lazily-loaded JS chunk with its (decoded) byte size in the page, so the loading
// screen can show real download progress (see src/main.ts).
function chunkList(base: string): Plugin {
  return {
    name: 'chunk-list',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const chunks = Object.values(ctx.bundle ?? {})
          .filter((c) => c.type === 'chunk' && !c.isEntry)
          .map((c) => [base + c.fileName, new TextEncoder().encode(c.type === 'chunk' ? c.code : '').length]);
        return { html, tags: [{ tag: 'script', children: `window.__CHUNKS=${JSON.stringify(chunks)}`, injectTo: 'head' }] };
      },
    },
  };
}

// Served from the domain root locally; the GitHub Pages workflow sets BASE_PATH=/Website/, since the site
// lives at will946.github.io/Website/.
const base = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env.BASE_PATH ?? '/';
export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), chunkList(base)],
  build: {
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        // Big libraries in their own files: they download in parallel and stay cached across deploys.
        manualChunks(id) {
          if (id.includes('@dimforge')) return 'rapier';
          if (id.includes('node_modules/three/')) return 'three';
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react';
        },
      },
    },
  },
});
