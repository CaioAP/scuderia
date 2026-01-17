import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
  },
  resolve: {
    alias: {
      '#shared': resolve(__dirname, './shared'),
      '~': resolve(__dirname, './app'),
      '@': resolve(__dirname, './app'),
    },
  },
});
