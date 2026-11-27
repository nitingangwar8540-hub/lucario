/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── Full Material Design 3 colour token set from Stitch design ───
      colors: {
        // Primary
        'primary':                   '#091722',
        'primary-container':         '#1e2b37',
        'primary-fixed':             '#d6e4f4',
        'primary-fixed-dim':         '#bac8d8',
        'on-primary':                '#ffffff',
        'on-primary-container':      '#8592a1',
        'on-primary-fixed':          '#0f1d28',
        'on-primary-fixed-variant':  '#3b4855',
        'inverse-primary':           '#bac8d8',
        // Secondary  (forest green)
        'secondary':                 '#2c694e',
        'secondary-container':       '#aeeecb',
        'secondary-fixed':           '#b1f0ce',
        'secondary-fixed-dim':       '#95d4b3',
        'on-secondary':              '#ffffff',
        'on-secondary-container':    '#316e52',
        'on-secondary-fixed':        '#002114',
        'on-secondary-fixed-variant':'#0e5138',
        // Tertiary  (amber/gold)
        'tertiary':                  '#1f1300',
        'tertiary-container':        '#382700',
        'tertiary-fixed':            '#ffdea4',
        'tertiary-fixed-dim':        '#e6c27e',
        'on-tertiary':               '#ffffff',
        'on-tertiary-fixed':         '#261900',
        'on-tertiary-fixed-variant': '#5b430a',
        'on-tertiary-container':     '#ac8c4f',
        // Surface scale
        'surface':                   '#f7f9ff',
        'surface-bright':            '#f7f9ff',
        'surface-dim':               '#d0dbea',
        'surface-container-lowest':  '#ffffff',
        'surface-container-low':     '#edf4ff',
        'surface-container':         '#e4effe',
        'surface-container-high':    '#dee9f9',
        'surface-container-highest': '#d8e3f3',
        'surface-variant':           '#d8e3f3',
        'surface-tint':              '#53606d',
        'on-surface':                '#121c27',
        'on-surface-variant':        '#44474b',
        'inverse-surface':           '#27313d',
        'inverse-on-surface':        '#e8f1ff',
        // Background
        'background':                '#f7f9ff',
        'on-background':             '#121c27',
        // Outline
        'outline':                   '#74777c',
        'outline-variant':           '#c4c6cc',
        // Error
        'error':                     '#ba1a1a',
        'error-container':           '#ffdad6',
        'on-error':                  '#ffffff',
        'on-error-container':        '#93000a',
      },

      // ─── Border radius scale from Stitch ───
      borderRadius: {
        DEFAULT: '0.125rem',
        lg:      '0.25rem',
        xl:      '0.5rem',
        full:    '0.75rem',
      },

      // ─── Spacing / layout tokens ───
      spacing: {
        'gutter':         '1.5rem',
        'gutter-mobile':  '1rem',
        'margin':         '3rem',
        'margin-mobile':  '1.25rem',
        'space-xs':       '0.25rem',
        'space-sm':       '0.5rem',
        'space-md':       '1rem',
        'space-lg':       '1.5rem',
        'space-xl':       '2.5rem',
      },

      // ─── Font family tokens ───
      fontFamily: {
        'display-lg':          ['"Newsreader"', 'serif'],
        'headline-lg':         ['"Newsreader"', 'serif'],
        'headline-lg-mobile':  ['"Newsreader"', 'serif'],
        'headline-md':         ['"Newsreader"', 'serif'],
        'headline-sm':         ['"Newsreader"', 'serif'],
        'display-lg-mobile':   ['"Newsreader"', 'serif'],
        'title-lg':            ['"Plus Jakarta Sans"', 'sans-serif'],
        'title-md':            ['"Plus Jakarta Sans"', 'sans-serif'],
        'body-lg':             ['"Plus Jakarta Sans"', 'sans-serif'],
        'body-md':             ['"Plus Jakarta Sans"', 'sans-serif'],
        'body-sm':             ['"Plus Jakarta Sans"', 'sans-serif'],
        'label-lg':            ['"Plus Jakarta Sans"', 'sans-serif'],
        'label-md':            ['"Plus Jakarta Sans"', 'sans-serif'],
        'label-sm':            ['"Plus Jakarta Sans"', 'sans-serif'],
      },

      // ─── Font size scale (matches Stitch design tokens exactly) ───
      fontSize: {
        'display-lg':  ['48px', { lineHeight: '56px', letterSpacing: '-0.02em',  fontWeight: '500' }],
        'display-lg-mobile': ['34px', { lineHeight: '42px', letterSpacing: '-0.015em', fontWeight: '500' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.015em', fontWeight: '600' }],
        'headline-lg-mobile': ['26px', { lineHeight: '34px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'title-lg':    ['18px', { lineHeight: '26px', fontWeight: '600' }],
        'title-md':    ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg':     ['16px', { lineHeight: '26px', fontWeight: '400' }],
        'body-md':     ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'body-sm':     ['12px', { lineHeight: '18px', fontWeight: '400' }],
        'label-lg':    ['14px', { lineHeight: '20px', letterSpacing: '0.01em',  fontWeight: '600' }],
        'label-md':    ['12px', { lineHeight: '16px', letterSpacing: '0.02em',  fontWeight: '600' }],
        'label-sm':    ['10px', { lineHeight: '14px', letterSpacing: '0.04em',  fontWeight: '700' }],
      },

      // ─── Custom keyframes from Stitch <style> block ───
      keyframes: {
        floatSlow: {
          '0%':   { transform: 'translateY(0px) rotate(0deg)' },
          '50%':  { transform: 'translateY(-16px) rotate(3deg)' },
          '100%': { transform: 'translateY(8px) rotate(-2deg)' },
        },
        floatReverse: {
          '0%':   { transform: 'translateY(0px) rotate(0deg) scale(1)' },
          '50%':  { transform: 'translateY(20px) rotate(-4deg) scale(1.05)' },
          '100%': { transform: 'translateY(-10px) rotate(2deg) scale(0.97)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%':      { opacity: '0.65', transform: 'scale(1.08)' },
        },
        driftBg: {
          '0%':   { transform: 'translate(0, 0)' },
          '50%':  { transform: 'translate(-30px, 20px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
      },

      // ─── Animation utilities ───
      animation: {
        'float-slow':    'floatSlow 10s ease-in-out infinite alternate',
        'float-reverse': 'floatReverse 12s ease-in-out infinite alternate',
        'pulse-subtle':  'pulseSubtle 7s ease-in-out infinite',
        'drift':         'driftBg 24s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
