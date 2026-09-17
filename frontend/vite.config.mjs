import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { caddyTemplateBlocks } from './vite/caddyTemplateBlocks.mjs';

export default defineConfig({
  plugins: [caddyTemplateBlocks(), react()],
  resolve: {
    alias: [
      {
        find: /^@blueprintjs\/icons$/,
        replacement: new URL('./vite/blueprintIconsShim.mjs', import.meta.url).pathname,
      },
    ],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://localhost:10000',
      '/authenticate': 'http://localhost:10000',
    },
  },
  build: {
    outDir: 'build',
  },
  define: {
    // By default, vite doesn't define globals and react-dates relies on it without an upgrade available
    global: {},
  },
});
