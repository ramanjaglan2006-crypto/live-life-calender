/**
 * IPC Handlers — Secure communication bridge between renderer and main process.
 * 
 * WHY this exists:
 * Electron enforces process isolation (contextIsolation: true).
 * The React renderer CANNOT directly:
 * - Access the filesystem
 * - Set OS wallpapers
 * - Control the tray
 * - Read/write persistent settings
 * 
 * IPC (Inter-Process Communication) is the ONLY sanctioned bridge.
 * The preload script exposes a limited API surface; the main process
 * handlers here implement the actual logic.
 * 
 * Security model:
 * Renderer → preload (contextBridge) → IPC → main process handlers
 */

import { ipcMain, dialog, app } from 'electron'
import { join } from 'path'
import { writeFileSync, mkdirSync, existsSync } from 'fs'

export function registerIpcHandlers(mainWindow) {
  // Handle wallpaper save request from renderer
  ipcMain.handle('save-wallpaper', async (event, { dataURL, filename }) => {
    try {
      const outputDir = join(app.getPath('userData'), 'wallpapers')
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true })
      }

      // Convert data URL to buffer
      const base64Data = dataURL.replace(/^data:image\/png;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')

      const filePath = join(outputDir, filename || 'life-calendar.png')
      writeFileSync(filePath, buffer)

      return { success: true, path: filePath }
    } catch (err) {
      console.error('[IPC] save-wallpaper error:', err)
      return { success: false, error: err.message }
    }
  })

  // Handle "set as wallpaper" request
  ipcMain.handle('set-wallpaper', async (event, { filePath }) => {
    try {
      // Dynamic import because `wallpaper` is an ESM-only package
      const { setWallpaper } = await import('wallpaper')
      await setWallpaper(filePath)
      return { success: true }
    } catch (err) {
      console.error('[IPC] set-wallpaper error:', err)
      return { success: false, error: err.message }
    }
  })

  // Handle settings persistence (read/write to userData)
  ipcMain.handle('get-settings', async () => {
    try {
      const settingsPath = join(app.getPath('userData'), 'settings.json')
      if (existsSync(settingsPath)) {
        const { readFileSync } = await import('fs')
        return JSON.parse(readFileSync(settingsPath, 'utf-8'))
      }
      return null
    } catch (err) {
      console.error('[IPC] get-settings error:', err)
      return null
    }
  })

  ipcMain.handle('save-settings', async (event, settings) => {
    try {
      const settingsPath = join(app.getPath('userData'), 'settings.json')
      writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
      return { success: true }
    } catch (err) {
      console.error('[IPC] save-settings error:', err)
      return { success: false, error: err.message }
    }
  })

  // Expose app info
  ipcMain.handle('get-app-info', () => ({
    version: app.getVersion(),
    platform: process.platform,
    userDataPath: app.getPath('userData'),
  }))
}
