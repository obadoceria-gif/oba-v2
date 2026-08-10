import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'core': ['./src/core/state/StateManager.js', './src/core/events/EventBus.js'],
          'storage': ['./src/core/storage/IndexedDBAdapter.js'],
          'validators': ['./src/core/validators/ValidationEngine.js']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
