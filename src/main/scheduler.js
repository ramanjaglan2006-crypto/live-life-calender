/**
 * Midnight Scheduler — Cron-based daily wallpaper regeneration.
 * 
 * WHY this exists:
 * The core promise of Life Calendar is "your wallpaper updates every day."
 * A new day means one more white dot and the red dot moves forward.
 * This scheduler fires at midnight local time to:
 * 1. Recompute day states
 * 2. Render a new wallpaper image
 * 3. Set it as the OS wallpaper
 * 
 * WHY node-cron instead of setInterval?
 * - setInterval(86400000) drifts over time and doesn't handle sleep/wake
 * - node-cron fires at actual midnight regardless of when the app started
 * - node-cron handles DST transitions correctly
 * 
 * WHY this runs in the main process?
 * - The renderer process can be hidden (no window open)
 * - Main process is always alive while the app runs
 * - Main process has Node.js fs access for saving the PNG
 */

import cron from 'node-cron'
import { app } from 'electron'
import { join } from 'path'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { CRON_MIDNIGHT } from '../core/constants.js'

let schedulerTask = null

export function setupScheduler() {
  // Schedule at midnight every day
  schedulerTask = cron.schedule(CRON_MIDNIGHT, async () => {
    console.log('[Scheduler] Midnight tick — regenerating wallpaper')

    try {
      await generateAndSetWallpaper()
    } catch (err) {
      console.error('[Scheduler] Failed to update wallpaper:', err)
    }
  })

  console.log('[Scheduler] Midnight wallpaper update scheduled')
}

/**
 * Generate wallpaper and set it as the OS background.
 * 
 * This function reads the user's saved settings, computes current day states,
 * renders to a canvas, saves as PNG, then uses the `wallpaper` npm package
 * to set it as the desktop background.
 * 
 * NOTE: Canvas rendering in Node.js requires a different approach than the browser.
 * We use the same math but with node-canvas or a serialized approach.
 * For Phase 7, we'll implement the full headless pipeline.
 */
async function generateAndSetWallpaper() {
  // Ensure output directory exists
  const outputDir = join(app.getPath('userData'), 'wallpapers')
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  const outputPath = join(outputDir, 'life-calendar-current.png')
  console.log(`[Scheduler] Wallpaper will be saved to: ${outputPath}`)

  // TODO (Phase 7): Implement headless canvas rendering here
  // For now, this is a placeholder that will be filled when we integrate
  // node-canvas for server-side rendering.
  //
  // The pipeline will be:
  // 1. Read birthDate + lifespanYears from electron-store
  // 2. computeDayStates(birthDate, lifespanYears)
  // 3. Render to node-canvas
  // 4. Save as PNG
  // 5. Call wallpaper.set(outputPath)
}

export function stopScheduler() {
  if (schedulerTask) {
    schedulerTask.stop()
    console.log('[Scheduler] Stopped')
  }
}
