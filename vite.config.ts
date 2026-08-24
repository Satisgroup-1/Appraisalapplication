import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2022',
  },
  // The folding-maps/ tree is a separate vendored project (see DO-NOT-MERGE.md).
  // Keep its Next.js tests out of this app's vitest run.
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', 'folding-maps/**'],
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
