import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Main process config — externalize node_modules for Electron compatibility
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  // Preload scripts — same externalization strategy
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  // Renderer process — standard React/Vite setup
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        '@core': resolve('src/core')
      }
    },
    server: {
      fs: {
        // Allow Vite to serve files from src/core/ (outside renderer root)
        allow: [resolve('src')]
      }
    },
    plugins: [react()]
  }
})
