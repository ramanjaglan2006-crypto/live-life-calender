/**
 * useLifeData — React hook that bridges the date calculation engine to the UI.
 * 
 * Returns memoized day states and derived statistics.
 * Re-computes only when birthDate or lifespanYears change.
 */

import { useMemo } from 'react'
import { computeDayStates, lifeProgress, daysElapsed, dayIndexToAge } from '../utils/dateCalc'
import { DEFAULT_LIFESPAN_YEARS } from '@core/constants'

export function useLifeData(birthDate, lifespanYears = DEFAULT_LIFESPAN_YEARS) {
  const data = useMemo(() => {
    if (!birthDate) {
      return {
        states: [],
        total: 0,
        elapsed: 0,
        progress: 0,
        age: { years: 0, days: 0 },
        isValid: false,
      }
    }

    try {
      const { states, total, elapsed } = computeDayStates(birthDate, lifespanYears)
      const progress = lifeProgress(birthDate, lifespanYears)
      const age = dayIndexToAge(elapsed)

      return {
        states,
        total,
        elapsed,
        progress,
        age,
        isValid: true,
      }
    } catch (err) {
      console.error('useLifeData: Invalid date computation', err)
      return {
        states: [],
        total: 0,
        elapsed: 0,
        progress: 0,
        age: { years: 0, days: 0 },
        isValid: false,
      }
    }
  }, [birthDate, lifespanYears])

  return data
}
