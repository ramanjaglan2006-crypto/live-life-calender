import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/**
 * Web-only Vite config — builds the renderer as a standalone web app.
 * Strips Electron-specific features (tray, IPC, wallpaper setting).
 * Used for Vercel deployment.
 */
export default defineConfig({
  root: 'src/renderer',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer/src'),
      '@core': resolve(__dirname, 'src/core')
    }
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true
  }
})
