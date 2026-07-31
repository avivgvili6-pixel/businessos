import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// When deployed to https://<user>.github.io/<repo>/ the app is served
// from /<repo>/, not from /. We flip the base path only for the
// production build (BASE_PATH env), so `npm run dev` still runs at /.
export default defineConfig({
  plugins: [react()],
  root: '.',
  base: process.env.BASE_PATH || '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
