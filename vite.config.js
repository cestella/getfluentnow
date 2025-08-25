import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    },
    minify: 'esbuild'
  },
  server: {
    open: true,
    port: 8000,
    host: '0.0.0.0'
  },
  plugins: []
});