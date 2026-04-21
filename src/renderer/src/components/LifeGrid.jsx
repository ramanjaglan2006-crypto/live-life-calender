/**
 * LifeGrid — The core visual component.
 * 
 * Renders ~29,200 dots on a single <canvas> element.
 * 
 * Why Canvas instead of DOM?
 * - 30k DOM nodes would cause massive layout thrashing
 * - Canvas draws all dots in a single GPU-accelerated paint
 * - Interaction (hover/tooltip) is handled via mouse position math, not event delegation
 * 
 * Column strategy:
 * - On-screen: dynamic columns based on viewport aspect ratio (fills the space)
 * - Wallpaper export: fixed 365 columns (1 row = 1 year, at 4K it's crisp)
 */

import { useRef, useEffect, useState, useCallback } from 'react'
import { COLORS } from '@core/constants'
import { dayIndexToDate, dayIndexToAge } from '../utils/dateCalc'

/**
 * Calculate optimal column count so the grid fills the container.
 * columns ≈ sqrt(totalDots * aspectRatio)
 */
function computeOptimalColumns(totalDots, width, height) {
  const aspectRatio = width / height
  const cols = Math.round(Math.sqrt(totalDots * aspectRatio))
  return Math.max(50, Math.min(cols, 500))
}

export default function LifeGrid({ dayStates, birthDate, elapsed }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const layout = useRef({})

  // Observe container resize for responsive rendering
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width: Math.floor(width), height: Math.floor(height) })
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !dayStates.length || !dimensions.width) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    canvas.style.width = `${dimensions.width}px`
    canvas.style.height = `${dimensions.height}px`
    ctx.scale(dpr, dpr)

    const totalDots = dayStates.length
    const leftMargin = 36
    const padding = 16
    const availableWidth = dimensions.width - leftMargin - padding
    const availableHeight = dimensions.height - padding * 2

    const columns = computeOptimalColumns(totalDots, availableWidth, availableHeight)
    const rows = Math.ceil(totalDots / columns)

    const dotSpacingX = availableWidth / columns
    const dotSpacingY = availableHeight / rows
    const dotSpacing = Math.min(dotSpacingX, dotSpacingY)
    const dotRadius = Math.max(dotSpacing * 0.38, 0.5)

    const gridWidth = columns * dotSpacing
    const gridHeight = rows * dotSpacing
    const offsetX = leftMargin + (availableWidth - gridWidth) / 2
    const offsetY = padding + (availableHeight - gridHeight) / 2

    layout.current = { columns, dotSpacing, dotRadius, offsetX, offsetY, rows, totalDots }

    // Clear
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, dimensions.width, dimensions.height)

    // Batch render by state
    const colorMap = [COLORS.pastDay, COLORS.currentDay, COLORS.futureDay]
    const useSquares = dotRadius < 1.5

    for (let state = 0; state < 3; state++) {
      ctx.fillStyle = colorMap[state]
      if (useSquares) {
        const size = Math.max(dotRadius * 2, 1)
        for (let i = 0; i < totalDots; i++) {
          if (dayStates[i] !== state) continue
          const col = i % columns
          const row = Math.floor(i / columns)
          const x = offsetX + col * dotSpacing + (dotSpacing - size) / 2
          const y = offsetY + row * dotSpacing + (dotSpacing - size) / 2
          ctx.fillRect(x, y, size, size)
        }
      } else {
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
    }

    // Glow on current day
    const currentIndex = dayStates.indexOf(1)
    if (currentIndex >= 0) {
      const col = currentIndex % columns
      const row = Math.floor(currentIndex / columns)
      const x = offsetX + col * dotSpacing + dotSpacing / 2
      const y = offsetY + row * dotSpacing + dotSpacing / 2

      ctx.beginPath()
      ctx.arc(x, y, Math.max(dotRadius * 3, 4), 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(x, y, Math.max(dotRadius * 2, 3), 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(x, y, Math.max(dotRadius * 1.3, 2), 0, Math.PI * 2)
      ctx.fillStyle = COLORS.currentDay
      ctx.fill()
    }

    // Year labels every 10 years
    ctx.fillStyle = COLORS.gridLabel
    const labelSize = Math.max(9, Math.min(12, dotSpacing * 4))
    ctx.font = `500 ${labelSize}px Inter, system-ui, sans-serif`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    for (let year = 10; year <= 80; year += 10) {
      const dayIndex = Math.floor(year * 365.25)
      if (dayIndex >= totalDots) break
      const row = Math.floor(dayIndex / columns)
      const y = offsetY + row * dotSpacing + dotSpacing / 2
      ctx.fillText(`${year}`, offsetX - 6, y)
    }

  }, [dayStates, dimensions])

  // Tooltip via mouse hit-testing
  const handleMouseMove = useCallback((e) => {
    if (!layout.current.dotSpacing || !birthDate) return

    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const { columns, dotSpacing, offsetX, offsetY, totalDots } = layout.current

    const col = Math.floor((mouseX - offsetX) / dotSpacing)
    const row = Math.floor((mouseY - offsetY) / dotSpacing)

    if (col < 0 || col >= columns || row < 0) { setTooltip(null); return }

    const index = row * columns + col
    if (index < 0 || index >= totalDots) { setTooltip(null); return }

    const dotX = offsetX + col * dotSpacing + dotSpacing / 2
    const dotY = offsetY + row * dotSpacing + dotSpacing / 2
    if (Math.hypot(mouseX - dotX, mouseY - dotY) > dotSpacing * 0.6) { setTooltip(null); return }

    const date = dayIndexToDate(birthDate, index)
    const age = dayIndexToAge(index)
    const state = dayStates[index] === 0 ? 'Lived' : dayStates[index] === 1 ? 'Today' : 'Future'

    setTooltip({
      x: e.clientX, y: e.clientY,
      text: `Day ${index.toLocaleString()} — ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      sub: `Age ${age.years}y ${age.days}d · ${state}`,
    })
  }, [birthDate, dayStates])

  const handleMouseLeave = useCallback(() => setTooltip(null), [])

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-0 flex-1">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-2 rounded-lg
                     bg-surface-700/95 backdrop-blur-sm border border-surface-600
                     shadow-xl shadow-black/30"
          style={{ left: tooltip.x + 16, top: tooltip.y - 8 }}
        >
          <div className="text-xs font-medium text-accent-white">{tooltip.text}</div>
          <div className="text-[10px] text-accent-muted mt-0.5">{tooltip.sub}</div>
        </div>
      )}
    </div>
  )
}
