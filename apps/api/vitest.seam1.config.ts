import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// Seam 1: the /v1 API and the worker on real PostgreSQL and Redis (spec 0001, Testing
// Decisions). Files run one at a time because they share one database.
export default defineConfig({
  plugins: [
    // NestJS dependency injection needs decorator metadata, which esbuild does not emit.
    swc.vite({
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
        target: 'es2023',
      },
    }),
  ],
  test: {
    include: ['test/seam1/**/*.test.ts'],
    globalSetup: ['test/seam1/support/global-setup.ts'],
    setupFiles: ['test/seam1/support/setup.ts'],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
