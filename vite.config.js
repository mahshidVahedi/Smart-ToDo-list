import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup/setupTests.ts', './tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.ts'],
    server: { deps: { inline: [/^@?vue/, /^pinia/] } },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/utils/**/*.{js,ts}',
        'src/utils/nlp/**/*.{js,ts}',
        'src/utils/googleAuth.js',
        'src/utils/googleApiUtils.js',
        'src/components/TaskItem.vue',
        'src/components/TaskStats.vue',
      ],
      exclude: [
        'src/components/GoogleSync.vue',
        'src/App.vue',
        'src/main.js',
        'src/components/TaskForm.vue',
        'src/components/TaskList.vue',
        'src/components/FiltersBar.vue',
        'src/components/ProjectSidebar*.vue',
        'src/composables/**',
        'src/constants/**',
        'src/store/**',
        'src/sync/**',
        '**/*.d.ts',
        '**/node_modules/**',
        'tests/**',
        '**/*.{config,config.*}.{js,ts}',
      ],
      all: false,
      thresholds: {
        global: {
          lines: 85,
          functions: 85,
          statements: 85,
          branches: 75,
        },
      },
    },
  }
})
