import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
  },
  define: {
    // By default, vite doesn't define globals and react-dates relies on it without an upgrade available
    global: {},
  },
});
