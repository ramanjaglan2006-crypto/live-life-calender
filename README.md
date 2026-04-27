# 🔴 Life Calendar

> **Every dot is a day. Make them count.**

A minimalist desktop application that visualizes your entire life as a grid of dots. Each dot represents one day — white for days lived, red for today, dark for your future.

![Life Calendar Grid](https://img.shields.io/badge/Dots-29%2C200-white?style=flat-square) ![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-blue?style=flat-square) ![Tech](https://img.shields.io/badge/Built%20With-Electron%20%2B%20React-61DAFB?style=flat-square)

---

## ✨ Features

- **30,000+ dot grid** — Each dot = 1 day of your life, rendered on Canvas in ~10ms
- **Real-time stats** — Age, days lived, days remaining, life completion percentage
- **4K wallpaper export** — Generate stunning 3840×2160 PNG wallpapers
- **Auto-update wallpaper** — Midnight cron job regenerates and sets your desktop background
- **System tray** — Runs silently in the background, close-to-tray behavior
- **Interactive tooltips** — Hover any dot to see the exact date and your age
- **First-time onboarding** — Clean setup flow for new users
- **Cross-platform** — macOS, Windows, Linux

## 🖥️ Screenshots

### Onboarding
Clean first-time experience with a visual explanation of the concept.

### Life Grid
~29,200 dots filling the screen. White (lived) → Red (today) → Dark (future).

### Settings Panel
Configure birth date, expected lifespan (40-120 years), and auto-wallpaper.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                 Electron Shell                   │
│                                                  │
│  ┌──────────────┐  IPC  ┌────────────────────┐  │
│  │ Main Process │◄─────►│ Renderer (React)   │  │
│  │              │       │                    │  │
│  │ • Tray       │       │ • Canvas Grid      │  │
│  │ • Scheduler  │       │ • Settings UI      │  │
│  │ • IPC Bridge │       │ • Export Button     │  │
│  │ • Wallpaper  │       │ • Tooltips         │  │
│  └──────┬───────┘       └────────┬───────────┘  │
│         │                        │               │
│         └────────┐  ┌────────────┘               │
│                  ▼  ▼                            │
│         ┌──────────────────┐                     │
│         │   Shared Core    │                     │
│         │ • Date Engine    │                     │
│         │ • Color Tokens   │                     │
│         │ • Canvas Render  │                     │
│         └──────────────────┘                     │
└─────────────────────────────────────────────────┘
```

### Why This Architecture?

| Decision | Reasoning |
|----------|-----------|
| **Canvas, not DOM** | 30k `<div>` elements = 500ms+ layout thrashing. Canvas draws all dots in ~10ms with 3 batched draw calls. |
| **Shared `/core/`** | The renderer (UI) and main process (headless export) need identical rendering logic. Shared module prevents duplication. |
| **node-cron, not setInterval** | `setInterval(86400000)` drifts during sleep/wake. Cron fires at actual midnight. |
| **Close-to-tray** | Closing the window must not kill the midnight scheduler. Tray keeps the app alive. |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
# Clone the repository
git clone https://github.com/ramanjaglan2006-crypto/live-life-calender.git
cd live-life-calender

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Build for Production

```bash
# Build optimized bundle
npm run build

# Package as native installer (.dmg / .exe / .AppImage)
npm run package
```

---

## 📂 Project Structure

```
life-calendar/
├── src/
│   ├── core/                    # Shared logic (both processes)
│   │   ├── constants.js         # Colors, grid config, storage keys
│   │   └── wallpaperService.js  # Canvas drawing (process-agnostic)
│   ├── main/                    # Electron main process
│   │   ├── index.js             # App lifecycle, window creation
│   │   ├── tray.js              # System tray + close-to-tray
│   │   ├── scheduler.js         # Midnight cron job
│   │   └── ipc-handlers.js      # IPC bridge handlers
│   ├── preload/                 # Security bridge
│   │   └── index.js             # contextBridge API
│   └── renderer/                # React frontend
│       ├── index.html
│       └── src/
│           ├── App.jsx          # Root component
│           ├── index.css        # Tailwind + dark theme
│           ├── components/
│           │   ├── LifeGrid.jsx     # Canvas dot grid
│           │   ├── Header.jsx       # Stats bar
│           │   ├── SettingsPanel.jsx # Configuration
│           │   └── ExportButton.jsx # Wallpaper export
│           ├── hooks/
│           │   ├── useLifeData.js   # Day state computation
│           │   └── useSettings.js   # Settings persistence
│           └── utils/
│               ├── dateCalc.js      # Pure date math
│               └── canvasExport.js  # 4K PNG export
├── resources/
│   └── icon.png                 # App icon
├── package.json
├── electron.vite.config.mjs
├── tailwind.config.js
└── postcss.config.js
```

---

## 🎨 Tech Stack

| Technology | Role |
|-----------|------|
| **Electron** | Desktop application shell |
| **React 18** | UI components |
| **Tailwind CSS 3** | Styling + dark theme |
| **electron-vite** | Build tooling (Vite-based) |
| **Canvas 2D API** | High-performance dot rendering |
| **node-cron** | Midnight wallpaper scheduling |
| **wallpaper** | Cross-platform wallpaper setting |

---

## ⚡ Performance

| Metric | Value |
|--------|-------|
| Dots rendered | ~29,200 |
| Draw calls per frame | 3 |
| Render time | ~5-15ms |
| Strategy | Batch by color state → single `fill()` per batch |
| Small dot mode | `fillRect` squares when radius < 1.5px |

---

## 🔧 Configuration

### Default Settings
- **Lifespan**: 80 years (adjustable 40-120)
- **Wallpaper resolution**: 3840 × 2160 (4K)
- **Auto-update**: Midnight daily (configurable)

### Color Scheme
| Element | Color | Hex |
|---------|-------|-----|
| Background | Deep black | `#0a0a0f` |
| Past days | White | `#e2e8f0` |
| Current day | Red | `#ef4444` |
| Future days | Dark slate | `#1e293b` |

---

## 📝 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 👤 Author

**Raman Jaglan**

- GitHub: [@ramanjaglan2006-crypto](https://github.com/ramanjaglan2006-crypto)

---

> *"The trouble is, you think you have time."* — Buddha
