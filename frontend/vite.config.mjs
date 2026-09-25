import { defineConfig } from 'vite';
import jotaiBabel from 'jotai-babel/preset';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { caddyTemplateBlocks } from './vite/caddyTemplateBlocks.mjs';

export default defineConfig({
  plugins: [
    caddyTemplateBlocks(),
    react(),
    babel({
      presets: [reactCompilerPreset(), jotaiBabel],
    }),
  ],
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
