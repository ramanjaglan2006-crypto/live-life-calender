/**
 * ExportButton — Dedicated export control with format options.
 * Currently supports PNG download; wallpaper-setting is handled via IPC.
 */

import { downloadWallpaper } from '../utils/canvasExport'

export default function ExportButton({ dayStates, settings }) {
  const handleExport = () => {
    if (!dayStates.length) return

    const { age } = settings || {}
    downloadWallpaper(dayStates, {
      showTitle: true,
      title: 'LIFE CALENDAR',
      subtitle: age ? `Age ${age.years} · Day ${dayStates.indexOf(1).toLocaleString()}` : '',
    })
  }

  return (
    <button
      onClick={handleExport}
      disabled={!dayStates.length}
      className="px-4 py-2 text-xs font-medium rounded-lg
                 bg-gradient-to-r from-accent-red to-accent-redGlow
                 text-white shadow-lg shadow-accent-red/20
                 hover:shadow-accent-red/40 hover:scale-[1.02]
                 disabled:opacity-40 disabled:cursor-not-allowed
                 transition-all duration-200 active:scale-95"
    >
      Export Wallpaper (4K)
    </button>
  )
}
