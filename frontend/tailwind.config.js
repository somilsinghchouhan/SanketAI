/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sanket: {
          bg: '#f8fafc',          // Clean slate-50 canvas
          surface: '#ffffff',     // Crisp white panels
          card: '#ffffff',        // White cards
          cardHover: '#f1f5f9',   // Subtle hover
          subtle: '#f1f5f9',      // Slate-100 secondary background
          border: '#e2e8f0',      // Slate-200 clean borders
          borderStrong: '#cbd5e1',// Slate-300 headers/dividers
          navy: '#0b1329',        // Deep obsidian navy
          navyLight: '#111c38',   // Slate-900 surface
          navyMuted: '#1e293b',   // Slate-800
          text: '#0f172a',        // Slate-900 primary text
          textMuted: '#475569',   // Slate-600 secondary text
          textDim: '#64748b',     // Slate-500 tertiary/metadata text
          primary: '#2563eb',     // Cyber Blue primary
          primaryHover: '#1d4ed8',// Blue-700
          primaryLight: '#eff6ff',// Blue-50 subtle highlight
          primaryBorder: '#bfdbfe',// Blue-200
          accent: '#0ea5e9',      // Cyan-500 intelligence highlight
          indigo: '#4f46e5',      // Indigo-600 node connector
          critical: '#dc2626',    // Red-600 critical risk
          criticalBg: '#fef2f2',  // Red-50
          criticalBorder: '#fecaca', // Red-200
          high: '#ea580c',        // Orange-600 high risk
          highBg: '#fff7ed',      // Orange-50
          highBorder: '#fed7aa',  // Orange-200
          medium: '#d97706',      // Amber-600 medium risk
          mediumBg: '#fffbeb',    // Amber-50
          mediumBorder: '#fde68a',// Amber-200
          low: '#16a34a',         // Green-600 low risk
          lowBg: '#f0fdf4',       // Green-50
          lowBorder: '#bbf7d0',   // Green-200
        },
        police: {
          bg: '#f8fafc',          // Clean slate-50 canvas
          surface: '#ffffff',     // Crisp white panels
          card: '#ffffff',        // White cards
          cardHover: '#f8fafc',   // Subtle hover
          subtle: '#f1f5f9',      // Slate-100 secondary background
          border: '#e2e8f0',      // Slate-200 clean borders
          borderStrong: '#cbd5e1',// Slate-300 headers/dividers
          navy: '#0b1329',        // Deep police navy for top bar or high-contrast elements
          navyMuted: '#1e293b',   // Slate-800
          text: '#0f172a',        // Slate-900 primary text
          textMuted: '#475569',   // Slate-600 secondary text
          textDim: '#64748b',     // Slate-500 tertiary/metadata text
          accent: '#2563eb',      // Law enforcement blue (blue-600)
          accentHover: '#1d4ed8', // blue-700
          accentLight: '#eff6ff', // blue-50 subtle highlight
          accentBorder: '#bfdbfe',// blue-200
          critical: '#dc2626',    // red-600
          criticalBg: '#fef2f2',  // red-50
          criticalBorder: '#fecaca', // red-200
          high: '#ea580c',        // orange-600
          highBg: '#fff7ed',      // orange-50
          highBorder: '#fed7aa',  // orange-200
          medium: '#d97706',      // amber-600
          mediumBg: '#fffbeb',    // amber-50
          mediumBorder: '#fde68a',// amber-200
          low: '#16a34a',         // green-600
          lowBg: '#f0fdf4',       // green-50
          lowBorder: '#bbf7d0',   // green-200
        }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        serif: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'SFMono-Regular', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
