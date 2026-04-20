/**
 * Core constants for the Life Calendar application.
 * Centralized configuration prevents magic numbers scattered through the codebase.
 */

// Default assumptions — can be overridden by user settings
export const DEFAULT_LIFESPAN_YEARS = 80
export const DAYS_PER_YEAR = 365.25 // Accounts for leap years
export const DEFAULT_TOTAL_DAYS = Math.floor(DEFAULT_LIFESPAN_YEARS * DAYS_PER_YEAR)

// Grid rendering configuration
// 365 columns = 1 row per year of life. Clean visual mapping.
export const GRID_COLUMNS = 365
export const DOT_RADIUS = 2
export const DOT_GAP = 1         // Gap between dot edges
export const DOT_SPACING = (DOT_RADIUS * 2) + DOT_GAP // Center-to-center distance

// Color tokens — single source of truth for all rendering paths
// Used by both the React canvas component AND the headless wallpaper generator
export const COLORS = {
  background: '#0a0a0f',
  pastDay: '#e2e8f0',       // White-ish — days you've lived
  currentDay: '#ef4444',    // Red — you are here
  currentDayGlow: '#f87171',// Glow ring around current day
  futureDay: '#1e293b',     // Dark slate — days yet to come
  gridLabel: '#475569',     // Year labels on the side
  headerText: '#f1f5f9',
  subtitleText: '#64748b',
}

// Wallpaper export dimensions (target 4K for crisp wallpapers)
export const WALLPAPER_WIDTH = 3840
export const WALLPAPER_HEIGHT = 2160

// Scheduler
export const CRON_MIDNIGHT = '0 0 * * *' // Every day at midnight

// Storage keys for electron-store / localStorage
export const STORAGE_KEYS = {
  BIRTH_DATE: 'birthDate',
  LIFESPAN_YEARS: 'lifespanYears',
  WALLPAPER_PATH: 'wallpaperPath',
  AUTO_WALLPAPER: 'autoWallpaper',
}
