/**
 * Wallpaper Service — Shared logic for generating and setting OS wallpapers.
 * 
 * WHY this is in /core/ (not /main/ or /renderer/):
 * The wallpaper generation math is identical regardless of where it runs.
 * - The renderer uses it for "Export" button (browser Canvas)
 * - The main process uses it for midnight auto-update (headless Canvas via node-canvas)
 * 
 * By keeping the rendering logic in a shared module, we avoid duplicating
 * 150+ lines of canvas drawing code across processes.
 * 
 * This module exports pure functions that accept day states and return
 * image data. The CALLER is responsible for the platform-specific parts
 * (browser download vs. fs.writeFile vs. wallpaper.set).
 */

import { COLORS, WALLPAPER_WIDTH, WALLPAPER_HEIGHT, GRID_COLUMNS } from './constants.js'

/**
 * Compute the wallpaper layout geometry.
 * Separated from rendering so it can be tested independently.
 */
export function computeWallpaperLayout(totalDots, options = {}) {
  const {
    width = WALLPAPER_WIDTH,
    height = WALLPAPER_HEIGHT,
    columns = GRID_COLUMNS,
    showTitle = true,
  } = options

  const rows = Math.ceil(totalDots / columns)
  const padding = Math.floor(width * 0.06)
  const topPadding = showTitle ? Math.floor(height * 0.1) : padding
  const availableWidth = width - (padding * 2)
  const availableHeight = height - topPadding - padding

  const dotSpacingX = availableWidth / columns
  const dotSpacingY = availableHeight / rows
  const dotSpacing = Math.min(dotSpacingX, dotSpacingY)
  const dotRadius = Math.max(dotSpacing * 0.35, 1)

  const gridWidth = columns * dotSpacing
  const gridHeight = rows * dotSpacing
  const offsetX = padding + (availableWidth - gridWidth) / 2
  const offsetY = topPadding + (availableHeight - gridHeight) / 2

  return {
    rows,
    columns,
    dotSpacing,
    dotRadius,
    offsetX,
    offsetY,
    gridWidth,
    gridHeight,
    padding,
    topPadding,
  }
}

/**
 * Draw the life grid onto any Canvas 2D context.
 * Works with both browser Canvas and node-canvas.
 */
export function drawLifeGrid(ctx, dayStates, layout, options = {}) {
  const { width = WALLPAPER_WIDTH, height = WALLPAPER_HEIGHT } = options
  const { columns, dotSpacing, dotRadius, offsetX, offsetY } = layout
  const totalDots = dayStates.length

  // Background
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, width, height)

  // Title
  if (options.showTitle) {
    ctx.fillStyle = COLORS.headerText
    ctx.font = `600 ${Math.floor(width * 0.018)}px Inter, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(options.title || 'LIFE CALENDAR', width / 2, layout.topPadding * 0.45)

    if (options.subtitle) {
      ctx.fillStyle = COLORS.subtitleText
      ctx.font = `400 ${Math.floor(width * 0.01)}px Inter, system-ui, sans-serif`
      ctx.fillText(options.subtitle, width / 2, layout.topPadding * 0.7)
    }
  }

  // Batch-render dots by state (3 draw calls for 30k dots)
  const colorMap = [COLORS.pastDay, COLORS.currentDay, COLORS.futureDay]

  for (let state = 0; state < 3; state++) {
    ctx.fillStyle = colorMap[state]
    ctx.beginPath()
    for (let i = 0; i < totalDots; i++) {
      if (dayStates[i] !== state) continue
      const col = i % columns
      const row = Math.floor(i / columns)
      const x = offsetX + col * dotSpacing + dotSpacing / 2
      const y = offsetY + row * dotSpacing + dotSpacing / 2
      ctx.moveTo(x + dotRadius, y)
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
    }
    ctx.fill()
  }

  // Current day glow
  const currentIndex = dayStates.indexOf(1)
  if (currentIndex >= 0) {
    const col = currentIndex % columns
    const row = Math.floor(currentIndex / columns)
    const x = offsetX + col * dotSpacing + dotSpacing / 2
    const y = offsetY + row * dotSpacing + dotSpacing / 2

    ctx.beginPath()
    ctx.arc(x, y, dotRadius * 2.5, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x, y, dotRadius * 1.8, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'
    ctx.fill()
  }
}
