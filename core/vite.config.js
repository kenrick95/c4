import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib.ts'),
      name: '@kenrick95/c4',
      fileName: 'c4',
      formats: ['cjs', 'es', 'umd'],
    },
  },
})
