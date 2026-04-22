/**
 * System Tray Manager
 * 
 * WHY this exists:
 * The Life Calendar should run silently in the background, updating the wallpaper
 * at midnight daily. The system tray provides:
 * 1. A persistent icon showing the app is running
 * 2. Quick actions (show window, export now, quit)
 * 3. "Close to tray" behavior — closing the window doesn't kill the scheduler
 * 
 * Without the tray, closing the window would stop the cron job,
 * defeating the auto-wallpaper feature.
 */

import { Tray, Menu, nativeImage, app } from 'electron'
import { join } from 'path'

let tray = null

export function setupTray(mainWindow) {
  // Create a 16x16 tray icon programmatically (no external asset needed)
  // In production, replace with a proper icon from resources/
  const iconPath = join(__dirname, '../../resources/icon.png')
  let trayIcon

  try {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  } catch {
    // Fallback: create a simple red dot icon if no icon file exists
    trayIcon = nativeImage.createEmpty()
  }

  tray = new Tray(trayIcon)
  tray.setToolTip('Life Calendar')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Life Calendar',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      },
    },
    {
      label: 'Export Wallpaper Now',
      click: () => {
        // Trigger export via IPC to the renderer
        mainWindow.webContents.send('trigger-export')
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)

  // Click on tray icon → show/hide window
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  // Intercept window close → hide to tray instead of destroying
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })
}
