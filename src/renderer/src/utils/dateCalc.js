/**
 * Pure date calculation functions.
 * No side effects, no dependencies on Electron or React.
 * This module is the mathematical heart of the app.
 */

import { DAYS_PER_YEAR } from '@core/constants'

/**
 * Calculate the total number of days in a lifespan.
 * Uses 365.25 to account for leap years over long periods.
 */
export function totalDaysInLifespan(years) {
  return Math.floor(years * DAYS_PER_YEAR)
}

/**
 * Calculate how many days have elapsed since birth.
 * Returns a float for precision; callers should floor it.
 *
 * Why we use UTC midnight normalization:
 * Without it, DST transitions can cause off-by-one errors
 * (a day could appear as 23h or 25h long).
 */
export function daysElapsed(birthDate) {
  const birth = normalizeToMidnight(new Date(birthDate))
  const today = normalizeToMidnight(new Date())
  const diffMs = today - birth
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Determine the state of every day in the lifespan.
 * Returns a flat array of states: 'past' | 'current' | 'future'
 *
 * Why a flat array instead of a 2D grid?
 * Canvas rendering iterates linearly anyway. A flat array avoids
 * nested loops and allows direct index-to-position math.
 */
export function computeDayStates(birthDate, lifespanYears) {
  const total = totalDaysInLifespan(lifespanYears)
  const elapsed = daysElapsed(birthDate)

  // Pre-allocate typed approach: fill with 'future', then overwrite
  const states = new Array(total)

  for (let i = 0; i < total; i++) {
    if (i < elapsed) {
      states[i] = 0 // past (numeric for performance in hot loop)
    } else if (i === elapsed) {
      states[i] = 1 // current
    } else {
      states[i] = 2 // future
    }
  }

  return { states, total, elapsed }
}

/**
 * Convert a day index back to a calendar date.
 * Useful for tooltips: "Day 8,432 — March 15, 2028"
 */
export function dayIndexToDate(birthDate, dayIndex) {
  const birth = new Date(birthDate)
  const target = new Date(birth)
  target.setDate(target.getDate() + dayIndex)
  return target
}

/**
 * Get a human-readable age string from a day index.
 * e.g., "23 years, 147 days"
 */
export function dayIndexToAge(dayIndex) {
  const years = Math.floor(dayIndex / DAYS_PER_YEAR)
  const remainingDays = Math.floor(dayIndex % DAYS_PER_YEAR)
  return { years, days: remainingDays }
}

/**
 * Calculate life progress as a percentage.
 */
export function lifeProgress(birthDate, lifespanYears) {
  const elapsed = daysElapsed(birthDate)
  const total = totalDaysInLifespan(lifespanYears)
  return Math.min((elapsed / total) * 100, 100)
}

// --- Internal helpers ---

function normalizeToMidnight(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
