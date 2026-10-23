const plugin = require('tailwindcss/plugin')

/**
 * Dark mode: classes keep their names and read their color from CSS variables, which
 * the `.dark` class on <html> swaps (AppShell adds it; landing and login stay light).
 * Slate is shared by every utility. Tints and accent text get separate values per
 * utility so, for example, `bg-brand-50` darkens while `text-brand-700` lightens.
 * Each entry is [light, dark].
 */
const SLATE = {
  50: ['#f8fafc', '#0f1520'], 100: ['#f1f5f9', '#1a2231'], 200: ['#e2e8f0', '#2a3445'],
  300: ['#cbd5e1', '#3a4659'], 400: ['#94a3b8', '#7d8aa0'], 500: ['#64748b', '#94a3b8'],
  600: ['#475569', '#aab6c8'], 700: ['#334155', '#c5cfdc'], 800: ['#1e293b', '#d8e0ea'],
  900: ['#0f172a', '#e4e9f0'], 950: ['#020617', '#edf1f6'],
}
const SURFACE = ['#ffffff', '#161d2a']
const THEMED = {
  bg: {
    brand: { 50: ['#fff1f2', '#2c1820'], 100: ['#ffe1e4', '#3b1d28'] },
    rose: { 50: ['#fff1f2', '#2c191e'], 100: ['#ffe4e6', '#3b1f26'] },
    amber: { 50: ['#fffbeb', '#2a2315'] },
    emerald: { 50: ['#ecfdf5', '#13271e'] },
    navy: { 50: ['#f0f4f8', '#1b2638'], 500: ['#486581', '#5f7d9e'], 700: ['#243b53', '#557499'], 900: ['#102a43', '#3b5878'] },
  },
  text: {
    brand: { 600: ['#a8142c', '#ef8798'], 700: ['#8f1324', '#f19aa8'], 800: ['#741321', '#f5b1bc'] },
    rose: { 700: ['#be123c', '#f29aa6'], 800: ['#9f1239', '#f5afb8'], 900: ['#881337', '#f8c3ca'] },
    amber: { 700: ['#b45309', '#e3b360'], 800: ['#92400e', '#eac178'], 900: ['#78350f', '#efcd8f'], 950: ['#451a03', '#f3d8a6'] },
    emerald: { 700: ['#047857', '#6fcf9f'], 800: ['#065f46', '#8bd8b2'] },
    navy: { 700: ['#243b53', '#9db6d2'], 800: ['#1a3049', '#b2c6dc'], 900: ['#102a43', '#c6d6e7'] },
  },
  border: {
    brand: { 300: ['#f9a3ae', '#6a2a38'], 600: ['#a8142c', '#c7475c'], 700: ['#8f1324', '#d0566a'] },
    rose: { 200: ['#fecdd3', '#552630'], 300: ['#fda4af', '#6b2f3b'] },
    amber: { 200: ['#fde68a', '#54431f'] },
    navy: { 200: ['#bcccdc', '#33465f'] },
  },
  ring: {
    brand: { 100: ['#ffe1e4', '#4a2230'], 200: ['#fec8cf', '#5a2836'], 600: ['#a8142c', '#d0566a'] },
    rose: { 100: ['#ffe4e6', '#4a222c'], 200: ['#fecdd3', '#552630'] },
    amber: { 200: ['#fde68a', '#54431f'] },
    emerald: { 200: ['#a7f3d0', '#1f4a37'] },
    navy: { 200: ['#bcccdc', '#33465f'] },
  },
}

const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ')
const ref = (name) => `rgb(var(--${name}) / <alpha-value>)`
const vars = { light: { '--surface': channels(SURFACE[0]) }, dark: { '--surface': channels(SURFACE[1]) } }
for (const [shade, [light, dark]] of Object.entries(SLATE)) {
  vars.light[`--slate-${shade}`] = channels(light)
  vars.dark[`--slate-${shade}`] = channels(dark)
}
/** Builds one utility's overrides, e.g. { brand: { 50: 'rgb(var(--bg-brand-50) / …)' } }. */
const themed = (group) => Object.fromEntries(Object.entries(THEMED[group]).map(([color, shades]) => [
  color,
  Object.fromEntries(Object.entries(shades).map(([shade, [light, dark]]) => {
    const name = `${group}-${color}-${shade}`
    vars.light[`--${name}`] = channels(light)
    vars.dark[`--${name}`] = channels(dark)
    return [shade, ref(name)]
  })),
]))

/**
 * CommonJS on purpose: Tailwind 3 reloads its config by clearing require.cache.
 * An ES-module config (tailwind.config.js in a "type": "module" package) is
 * loaded through Node's ESM cache instead, so a running dev server keeps the
 * old theme forever and reports classes such as `bg-navy-900` as missing.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: Object.fromEntries(Object.keys(SLATE).map((shade) => [shade, ref(`slate-${shade}`)])),
        brand: {
          50: '#fff1f2',
          100: '#ffe1e4',
          200: '#fec8cf',
          300: '#f9a3ae',
          500: '#c3223a',
          600: '#a8142c',
          700: '#8f1324',
          800: '#741321',
          900: '#63151f'
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          500: '#486581',
          600: '#334e68',
          700: '#243b53',
          800: '#1a3049',
          900: '#102a43',
          DEFAULT: '#102a43'
        },
        gold: '#c69026'
      },
      backgroundColor: { ...themed('bg'), white: ref('surface') },
      textColor: themed('text'),
      borderColor: themed('border'),
      ringColor: { ...themed('ring'), white: ref('surface') },
      ringOffsetColor: { DEFAULT: 'rgb(var(--surface))', white: 'rgb(var(--surface))' },
      boxShadow: {
        xs: '0 1px 2px rgba(15,23,42,.05)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)'
      }
    }
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({ ':root': vars.light, ':root.dark': { ...vars.dark, colorScheme: 'dark' } })
    }),
  ],
}
