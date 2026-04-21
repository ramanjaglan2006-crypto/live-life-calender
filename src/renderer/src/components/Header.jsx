/**
 * Header — Displays life statistics and controls.
 * 
 * Shows: age, days lived, progress bar, and action buttons.
 * Designed to be information-dense but not overwhelming.
 */

import { COLORS } from '@core/constants'

export default function Header({ age, elapsed, total, progress, onExport, onSettings }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-surface-600/50">
      {/* Left: Title + Stats */}
      <div className="flex items-center gap-8">
        <div>
          <h1 className="text-lg font-semibold tracking-wider text-accent-white/90">
            LIFE CALENDAR
          </h1>
          <p className="text-xs text-accent-muted mt-0.5 font-mono">
            Every dot is a day. Make them count.
          </p>
        </div>

        {/* Stats chips */}
        {elapsed > 0 && (
          <div className="hidden md:flex items-center gap-4">
            <StatChip
              label="AGE"
              value={`${age.years}y ${age.days}d`}
            />
            <StatChip
              label="DAYS LIVED"
              value={elapsed.toLocaleString()}
            />
            <StatChip
              label="DAYS LEFT"
              value={(total - elapsed).toLocaleString()}
            />

            {/* Micro progress bar */}
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-surface-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-red to-accent-redGlow rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-accent-muted">
                {progress.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className="px-3 py-1.5 text-xs font-medium rounded-md
                     bg-surface-700 text-accent-white/80 border border-surface-600
                     hover:bg-surface-600 hover:text-accent-white
                     transition-all duration-200 active:scale-95"
          title="Export as wallpaper"
        >
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
            </svg>
            Export
          </span>
        </button>

        <button
          onClick={onSettings}
          className="p-1.5 rounded-md
                     bg-surface-700 text-accent-white/60 border border-surface-600
                     hover:bg-surface-600 hover:text-accent-white
                     transition-all duration-200 active:scale-95"
          title="Settings"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  )
}

function StatChip({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] font-semibold tracking-widest text-accent-muted uppercase">
        {label}
      </span>
      <span className="text-sm font-mono font-medium text-accent-white/90">
        {value}
      </span>
    </div>
  )
}
