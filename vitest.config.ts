import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'website/',
        'examples/',
        '*.config.*',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
  resolve: {
    alias: {
      '@oxog/kit/core': path.resolve(__dirname, './src/core/index.ts'),
      '@oxog/kit/network': path.resolve(__dirname, './src/network/index.ts'),
      '@oxog/kit/data': path.resolve(__dirname, './src/data/index.ts'),
      '@oxog/kit/validation': path.resolve(__dirname, './src/validation/index.ts'),
      '@oxog/kit/parsing': path.resolve(__dirname, './src/parsing/index.ts'),
      '@oxog/kit/async': path.resolve(__dirname, './src/async/index.ts'),
      '@oxog/kit/security': path.resolve(__dirname, './src/security/index.ts'),
      '@oxog/kit/utils': path.resolve(__dirname, './src/utils/index.ts'),
      '@oxog/kit/observability': path.resolve(__dirname, './src/observability/index.ts'),
      '@oxog/kit': path.resolve(__dirname, './src/index.ts'),
    },
  },
});
