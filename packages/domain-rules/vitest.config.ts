import { defineConfig } from 'vitest/config';

// Seam 2: pure domain rules, no I/O (spec 0001, Testing Decisions).
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
