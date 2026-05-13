/** @type {import('tailwindcss').Config} */
// All gh-* colors are CSS variables defined in index.css. They swap when the
// `.dark` class is set on <html>, which is how darkMode: 'class' works.
// Values are R G B (space-separated, no commas) so that Tailwind's
// alpha-value modifier (`bg-gh-accent/10`) keeps working.
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gh: {
          canvas: v('--gh-canvas'),
          'canvas-inset': v('--gh-canvas-inset'),
          overlay: v('--gh-overlay'),
          subtle: v('--gh-subtle'),
          'subtle-emphasis': v('--gh-subtle-emphasis'),
          'border-muted': v('--gh-border-muted'),
          border: v('--gh-border'),
          fg: v('--gh-fg'),
          'fg-muted': v('--gh-fg-muted'),
          'fg-subtle': v('--gh-fg-subtle'),
          accent: v('--gh-accent'),
          'accent-emphasis': v('--gh-accent-emphasis'),
          success: v('--gh-success'),
          'success-emphasis': v('--gh-success-emphasis'),
          danger: v('--gh-danger'),
          'danger-emphasis': v('--gh-danger-emphasis'),
          attention: v('--gh-attention'),
          done: v('--gh-done'),
          // Brand gradient stops are constant (look right on both themes).
          'cp-pink': '#ec6cb9',
          'cp-purple': '#a371f7',
          'cp-blue': '#2f81f7',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Helvetica',
          'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"',
        ],
        mono: [
          'ui-monospace', 'SFMono-Regular', '"SF Mono"', 'Menlo',
          'Consolas', '"Liberation Mono"', 'monospace',
        ],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.4' }],
        sm: ['13px', { lineHeight: '1.5' }],
        base: ['14px', { lineHeight: '1.5' }],
        md: ['15px', { lineHeight: '1.5' }],
        lg: ['17px', { lineHeight: '1.45' }],
        xl: ['20px', { lineHeight: '1.35' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['30px', { lineHeight: '1.25' }],
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        card: '0 0 transparent',
        elev: 'var(--gh-elev)',
        focus: '0 0 0 3px rgb(var(--gh-accent) / 0.4)',
      },
      backgroundImage: {
        'copilot-grad':
          'linear-gradient(120deg,#ec6cb9 0%,#a371f7 50%,#2f81f7 100%)',
      },
      keyframes: {
        sparkle: {
          '0%,100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.08)' },
        },
        caret: {
          '0%,49%': { opacity: 1 },
          '50%,100%': { opacity: 0 },
        },
      },
      animation: {
        sparkle: 'sparkle 1.8s ease-in-out infinite',
        caret: 'caret 1s steps(2,start) infinite',
      },
    },
  },
  plugins: [],
};
