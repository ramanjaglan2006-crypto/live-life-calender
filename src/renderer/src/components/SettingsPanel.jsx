/**
 * SettingsPanel — Modal overlay for user configuration.
 * 
 * Handles: birth date, lifespan, auto-wallpaper toggle.
 * Slides in from the right for a polished feel.
 */

import { useState } from 'react'

export default function SettingsPanel({ settings, onUpdate, onClose }) {
  const [localBirthDate, setLocalBirthDate] = useState(settings.birthDate || '')
  const [localLifespan, setLocalLifespan] = useState(settings.lifespanYears || 80)

  const handleSave = () => {
    if (localBirthDate) {
      onUpdate('birthDate', localBirthDate)
    }
    onUpdate('lifespanYears', Number(localLifespan))
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50
                      bg-surface-800 border-l border-surface-600
                      shadow-2xl shadow-black/50 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-600/50">
          <h2 className="text-base font-semibold text-accent-white tracking-wide">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-accent-muted hover:text-accent-white
                       hover:bg-surface-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Birth Date */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold tracking-wider text-accent-muted uppercase">
              Date of Birth
            </label>
            <input
              type="date"
              value={localBirthDate}
              onChange={(e) => setLocalBirthDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg
                         bg-surface-700 border border-surface-600
                         text-accent-white text-sm font-mono
                         focus:outline-none focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red/50
                         transition-all"
            />
            <p className="text-[11px] text-accent-muted">
              This determines where "today" falls on your life grid.
            </p>
          </div>

          {/* Lifespan */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold tracking-wider text-accent-muted uppercase">
              Expected Lifespan (years)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={40}
                max={120}
                value={localLifespan}
                onChange={(e) => setLocalLifespan(e.target.value)}
                className="flex-1 accent-accent-red"
              />
              <span className="text-sm font-mono text-accent-white w-12 text-right">
                {localLifespan}
              </span>
            </div>
          </div>

          {/* Auto Wallpaper Toggle */}
          <div className="flex items-center justify-between py-3 px-4 rounded-lg
                          bg-surface-700/50 border border-surface-600">
            <div>
              <div className="text-sm font-medium text-accent-white/90">Auto-update wallpaper</div>
              <div className="text-[11px] text-accent-muted mt-0.5">
                Regenerate and set wallpaper at midnight daily
              </div>
            </div>
            <button
              onClick={() => onUpdate('autoWallpaper', !settings.autoWallpaper)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300
                ${settings.autoWallpaper ? 'bg-accent-red' : 'bg-surface-600'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white
                           shadow-md transition-transform duration-300
                           ${settings.autoWallpaper ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {/* Info callout */}
          <div className="p-4 rounded-lg bg-accent-red/5 border border-accent-red/20">
            <p className="text-xs text-accent-redGlow leading-relaxed">
              💡 <strong>How the grid works:</strong> Each row represents one year of your life.
              Each dot is a single day. White dots are days you've lived.
              The red dot is today. Dark dots are your future.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-surface-600/50">
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-lg font-medium text-sm
                       bg-accent-red text-white
                       hover:bg-accent-redGlow
                       transition-all duration-200 active:scale-[0.98]
                       shadow-lg shadow-accent-red/25"
          >
            Save Settings
          </button>
        </div>
      </div>
    </>
  )
}
