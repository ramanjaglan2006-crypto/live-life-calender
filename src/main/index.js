/**
 * Electron Main Process — Application entry point.
 * 
 * WHY this exists:
 * The main process is the "backend" of the Electron app. It has full Node.js access
 * and manages: window lifecycle, system tray, OS-level wallpaper setting, and the
 * midnight cron scheduler. The renderer (React) CANNOT do these things directly
 * due to Electron's security model (contextIsolation).
 * 
 * Architecture:
 * - Creates a frameless window for a clean, modern look
 * - Delegates tray management to tray.js
 * - Delegates scheduling to scheduler.js
 * - Registers IPC handlers for renderer ↔ main communication
 */

import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { setupTray } from './tray'
import { setupScheduler } from './scheduler'
import { registerIpcHandlers } from './ipc-handlers'

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    show: false, // Show after ready-to-show to avoid white flash
    frame: false, // Frameless for custom title bar
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      // macOS traffic light buttons — positioned to align with our drag region
      color: '#0a0a0f',
      symbolColor: '#64748b',
      height: 32,
    },
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false, // Required for preload to use Node APIs
      contextIsolation: true, // Security: renderer can't access Node directly
      nodeIntegration: false,
    },
  })

  // Smooth window appearance
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Open external links in system browser, not in Electron
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Dev mode: load from Vite dev server. Prod: load built files.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

// --- App lifecycle ---

app.whenReady().then(() => {
  const win = createWindow()

  // Set up system tray (minimize-to-tray behavior)
  setupTray(win)

  // Set up midnight wallpaper auto-update
  setupScheduler()

  // Register IPC handlers for renderer communication
  registerIpcHandlers(win)

  // macOS: re-create window when dock icon clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      win.show()
    }
  })
})

// Keep app running when all windows closed (tray mode)
app.on('window-all-closed', () => {
  // On macOS, apps typically stay active until Cmd+Q
  if (process.platform !== 'darwin') {
    // On Windows/Linux, hide to tray instead of quitting
    // The tray module handles showing the window again
  }
})
