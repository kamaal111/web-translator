/// <reference types="vitest/config" />

import path from 'node:path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import buildLocales from './vite/build-locales';
import etags from './vite/etags';
import renameOutput from './vite/rename-output';

const outDir = process.env.BUILD_OUTPUT || 'dist';

export default defineConfig({
  plugins: [
    buildLocales(),
    react({ babel: { plugins: [['babel-plugin-react-compiler']] } }),
    renameOutput({ outDir, renames: { 'index.prod.html': 'index.html' } }),
    etags({ outDir }),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, 'src'), '@test-utils': path.resolve(__dirname, 'src/test-utils') } },
  build: {
    outDir,
    emptyOutDir: true,
    rolldownOptions: {
      input: { index: path.resolve(__dirname, 'index.prod.html') },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
