import tsconfigPaths from 'vite-tsconfig-paths';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      // Includes only files within the `app` directory for test coverage reporting.
      include: ['**/src/**'],
      exclude: [...coverageConfigDefaults.exclude],
    },
  },

  plugins: [tsconfigPaths()],
});
