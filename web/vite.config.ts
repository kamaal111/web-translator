import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import etags from './vitest/etags';
import renameOutput from './vitest/rename-output';

const outDir = process.env.BUILD_OUTPUT || 'dist';

export default defineConfig({
  plugins: [
    react({ babel: { plugins: [['babel-plugin-react-compiler']] } }),
    tailwindcss(),
    renameOutput({ outDir, renames: { 'index.prod.html': 'index.html' } }),
    etags({ outDir }),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  build: {
    outDir,
    emptyOutDir: true,
    rolldownOptions: {
      input: { index: path.resolve(__dirname, 'index.prod.html') },
    },
  },
});
