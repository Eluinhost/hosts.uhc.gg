import path from 'node:path';
import { defineConfig } from 'vite';
import jotaiBabel from 'jotai-babel/preset';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tanstackRouter from '@tanstack/router-plugin/vite';

import { caddyTemplateBlocks } from './vite/caddyTemplateBlocks.mjs';

export default defineConfig({
  plugins: [
    caddyTemplateBlocks(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    babel({
      presets: [reactCompilerPreset(), jotaiBabel],
    }),
  ],
  resolve: {
    alias: {
      '@': path.join(import.meta.dirname, 'src'),
    },
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
});
