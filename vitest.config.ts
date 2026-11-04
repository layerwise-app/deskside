import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Tests run in Node without the Cloudflare and TanStack Start plugins.
export default defineConfig({
  plugins: [viteReact()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    // Image encoding is slow on busy machines.
    testTimeout: 60_000,
    include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs']
  }
});
