/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{js,jsx,html}'],
  theme: {
    extend: {
      colors: {
        // Custom palette for the life calendar dark theme
        surface: {
          900: '#0a0a0f',    // Deepest background
          800: '#12121a',    // Card/panel background
          700: '#1a1a28',    // Elevated surfaces
          600: '#252536',    // Borders, dividers
        },
        accent: {
          red: '#ef4444',       // Current day — alive, urgent
          redGlow: '#f87171',   // Hover/glow state
          white: '#e2e8f0',     // Past days — lived
          muted: '#334155',     // Future days — unknown
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
