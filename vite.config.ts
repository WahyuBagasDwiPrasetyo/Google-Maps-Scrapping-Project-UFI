import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  base: './', // ✅ Pastikan resource ditemukan dengan benar di semua environment (ubah jika perlu)
  plugins: [
    react(),
    tsConfigPaths(),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      renderer: {},
    }),
  ],
  build: {
    outDir: 'dist', // ✅ Pastikan hasil build masuk ke folder yang benar
    rollupOptions: {
      input: {
        main: 'index.html', // ✅ Pastikan index.html masuk dalam build
      },
    },
  },
})
