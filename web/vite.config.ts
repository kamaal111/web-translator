import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import etags from './vitest/etags';

const outDir = process.env.BUILD_OUTPUT || 'dist';

export default defineConfig({
  plugins: [react({ babel: { plugins: [['babel-plugin-react-compiler']] } }), tailwindcss(), etags({ outDir })],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  build: {
    outDir,
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
});
