/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soccer Connect Primary - Electric Teal (distinctive, energetic)
        primary: {
          50: '#effefb',
          100: '#c9fef4',
          200: '#93fcea',
          300: '#55f2dd',
          400: '#21dfca',
          500: '#08c4b0',
          600: '#049e90',
          700: '#087e74',
          800: '#0c645e',
          900: '#0f524d',
          950: '#013230',
        },
        // Secondary - Sunset Orange (warm, community feel)
        secondary: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdba8',
          300: '#ffc170',
          400: '#ff9d38',
          500: '#ff7f11',
          600: '#f06307',
          700: '#c74a08',
          800: '#9e3b0f',
          900: '#7f3310',
          950: '#451706',
        },
        // Accent - Royal Purple (professional, distinctive)
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        // Field Green - For soccer-specific accents
        field: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Dark theme - Premium navy-black
        dark: {
          50: '#f6f7f9',
          100: '#eceff3',
          200: '#d5dae3',
          300: '#b1baca',
          400: '#8694ac',
          500: '#677791',
          600: '#526178',
          700: '#444f62',
          800: '#3b4453',
          850: '#2d3545',
          900: '#232a37',
          925: '#1a1f2a',
          950: '#0d1117',
          975: '#080b10',
        },
        // Success - Emerald
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Warning - Amber
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Danger - Crimson Red
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.15' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        // Stats/Numbers - bigger, bolder
        'stat': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
        'stat-lg': ['2.75rem', { lineHeight: '1.1', fontWeight: '800' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '14px',
        '2xl': '18px',
        '3xl': '24px',
      },
      boxShadow: {
        // Subtle depth shadows (no glass)
        'sm': '0 1px 2px rgba(0, 0, 0, 0.08)',
        'DEFAULT': '0 2px 8px rgba(0, 0, 0, 0.12)',
        'md': '0 4px 16px rgba(0, 0, 0, 0.16)',
        'lg': '0 8px 32px rgba(0, 0, 0, 0.20)',
        'xl': '0 12px 48px rgba(0, 0, 0, 0.24)',
        '2xl': '0 24px 64px rgba(0, 0, 0, 0.28)',
        // Inset shadows for depth
        'inner-sm': 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
        'inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.15)',
        'inner-lg': 'inset 0 4px 8px rgba(0, 0, 0, 0.2)',
        // Colored accent shadows
        'primary': '0 4px 24px rgba(8, 196, 176, 0.25)',
        'primary-lg': '0 8px 40px rgba(8, 196, 176, 0.35)',
        'secondary': '0 4px 24px rgba(255, 127, 17, 0.25)',
        'secondary-lg': '0 8px 40px rgba(255, 127, 17, 0.35)',
        'accent': '0 4px 24px rgba(168, 85, 247, 0.25)',
        'danger': '0 4px 24px rgba(239, 68, 68, 0.25)',
        // Card shadows
        'card': '0 2px 12px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.25s ease-out',
        'fade-in-down': 'fadeInDown 0.25s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'slide-in-left': 'slideInLeft 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
        'spin-slow': 'spin 1.5s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        // Soccer-specific
        'kick': 'kick 0.5s ease-out',
        'score': 'score 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        kick: {
          '0%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-15deg)' },
          '50%': { transform: 'rotate(5deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        score: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      transitionDuration: {
        'fast': '100ms',
        'normal': '150ms',
        'slow': '250ms',
        'slower': '350ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backgroundImage: {
        // Subtle patterns
        'field-pattern': 'linear-gradient(90deg, rgba(8, 196, 176, 0.03) 1px, transparent 1px), linear-gradient(rgba(8, 196, 176, 0.03) 1px, transparent 1px)',
        'grid-pattern': 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        // Gradients
        'gradient-primary': 'linear-gradient(135deg, #08c4b0 0%, #049e90 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #ff7f11 0%, #f06307 100%)',
        'gradient-accent': 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1a1f2a 0%, #0d1117 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(45, 53, 69, 0.5) 0%, rgba(35, 42, 55, 0.3) 100%)',
      },
      backgroundSize: {
        'pattern': '24px 24px',
      },
    },
  },
  plugins: [],
}
