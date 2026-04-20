/**
 * useSettings — Persists user preferences to localStorage.
 * 
 * In a future phase, this will sync with Electron's main process
 * via IPC for cross-process consistency (e.g., the scheduler needs
 * the birth date to generate wallpapers headlessly).
 */

import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_LIFESPAN_YEARS, STORAGE_KEYS } from '@core/constants'

const DEFAULTS = {
  birthDate: null,
  lifespanYears: DEFAULT_LIFESPAN_YEARS,
  autoWallpaper: false,
}

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('life-calendar-settings')
      if (stored) {
        return { ...DEFAULTS, ...JSON.parse(stored) }
      }
    } catch (err) {
      console.warn('Failed to load settings from localStorage', err)
    }
    return { ...DEFAULTS }
  })

  // Persist to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem('life-calendar-settings', JSON.stringify(settings))
    } catch (err) {
      console.warn('Failed to save settings to localStorage', err)
    }
  }, [settings])

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULTS })
  }, [])

  return { settings, updateSetting, resetSettings }
}
