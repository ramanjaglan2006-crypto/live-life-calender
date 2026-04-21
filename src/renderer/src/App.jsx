/**
 * App.jsx — Root component that orchestrates the Life Calendar UI.
 * 
 * Architecture role: This is the single "smart" component.
 * It owns state (via hooks) and passes data down to pure presentational children.
 * No child component manages its own data fetching or persistence.
 */

import { useState, useCallback } from 'react'
import { useLifeData } from './hooks/useLifeData'
import { useSettings } from './hooks/useSettings'
import LifeGrid from './components/LifeGrid'
import Header from './components/Header'
import SettingsPanel from './components/SettingsPanel'
import { downloadWallpaper } from './utils/canvasExport'

export default function App() {
  const { settings, updateSetting, resetSettings } = useSettings()
  const lifeData = useLifeData(settings.birthDate, settings.lifespanYears)
  const [showSettings, setShowSettings] = useState(false)

  // First-time experience: if no birth date, open settings
  const [showOnboarding, setShowOnboarding] = useState(!settings.birthDate)

  const handleExport = useCallback(() => {
    if (!lifeData.states.length) return

    downloadWallpaper(lifeData.states, {
      showTitle: true,
      title: 'LIFE CALENDAR',
      subtitle: `Age ${lifeData.age.years} · Day ${lifeData.elapsed.toLocaleString()} of ${lifeData.total.toLocaleString()}`,
    })
  }, [lifeData])

  return (
    <div className="h-screen w-screen flex flex-col bg-surface-900 overflow-hidden select-none">
      {/* Draggable title bar region for Electron frameless window */}
      <div className="h-8 w-full flex-shrink-0 app-drag-region" />

      <Header
        age={lifeData.age}
        elapsed={lifeData.elapsed}
        total={lifeData.total}
        progress={lifeData.progress}
        onExport={handleExport}
        onSettings={() => setShowSettings(true)}
      />

      {/* Main content area */}
      <main className="flex-1 min-h-0 relative">
        {lifeData.isValid ? (
          <LifeGrid
            dayStates={lifeData.states}
            birthDate={settings.birthDate}
            elapsed={lifeData.elapsed}
          />
        ) : (
          /* Onboarding state — no birth date set */
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6 max-w-md px-8">
              {/* Decorative dot pattern */}
              <div className="flex justify-center gap-1.5 mb-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${
                      i === 3
                        ? 'bg-accent-red shadow-lg shadow-accent-red/40 animate-pulse'
                        : i < 3
                        ? 'bg-accent-white/80'
                        : 'bg-surface-600'
                    }`}
                  />
                ))}
              </div>

              <h2 className="text-2xl font-semibold text-accent-white tracking-wide">
                Your Life in Dots
              </h2>
              <p className="text-sm text-accent-muted leading-relaxed">
                Each dot represents one day of your life.
                White dots are days you've already lived.
                The <span className="text-accent-red font-semibold">red dot</span> is today.
                Dark dots are your future.
              </p>
              <button
                onClick={() => setShowSettings(true)}
                className="px-6 py-3 rounded-lg font-medium text-sm
                           bg-accent-red text-white
                           hover:bg-accent-redGlow
                           transition-all duration-300 active:scale-95
                           shadow-xl shadow-accent-red/30 hover:shadow-accent-red/50"
              >
                Enter Your Birth Date →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Legend bar */}
      {lifeData.isValid && (
        <div className="flex items-center justify-center gap-6 py-3 border-t border-surface-600/30">
          <LegendItem color="bg-accent-white" label="Lived" />
          <LegendItem color="bg-accent-red" label="Today" glow />
          <LegendItem color="bg-surface-600" label="Future" />
        </div>
      )}

      {/* Settings overlay */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onUpdate={updateSetting}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

function LegendItem({ color, label, glow }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color} ${glow ? 'shadow-md shadow-accent-red/50' : ''}`} />
      <span className="text-[10px] font-medium tracking-wider text-accent-muted uppercase">{label}</span>
    </div>
  )
}
