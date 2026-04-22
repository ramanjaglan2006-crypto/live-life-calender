/**
 * Preload Script — The security membrane between Node.js and the browser.
 * 
 * WHY this exists:
 * Electron's contextIsolation means the renderer (React) lives in a sandboxed
 * browser context with NO access to Node.js APIs (fs, path, child_process, etc).
 * 
 * The preload script runs in a special privileged context that can see BOTH:
 * - Node.js APIs (via require/import)
 * - The renderer's window object (via contextBridge)
 * 
 * contextBridge.exposeInMainWorld() creates a safe, typed API surface.
 * The renderer can call `window.api.saveWallpaper(...)` but can NEVER
 * access arbitrary Node APIs. This prevents XSS attacks from gaining
 * full OS access — a critical security boundary.
 */

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Wallpaper operations
  saveWallpaper: (data) => ipcRenderer.invoke('save-wallpaper', data),
  setWallpaper: (data) => ipcRenderer.invoke('set-wallpaper', data),

  // Settings persistence
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // App info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  // Listen for main → renderer events (e.g., tray "export now" click)
  onTriggerExport: (callback) => {
    ipcRenderer.on('trigger-export', () => callback())
    // Return cleanup function
    return () => ipcRenderer.removeAllListeners('trigger-export')
  },
})
