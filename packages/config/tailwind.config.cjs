/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../../apps/*/index.html",
    "../../apps/*/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#5e6ad2', // Linear-esque blurple
          600: '#4c56b5',
          900: '#312e81',
        },
        background: '#0e1015', // Very dark, low saturation
        surface: '#15171e', // Slightly lighter for cards
        surfaceHover: '#1c1f26',
        text: '#f2f2f2',
        muted: '#8b8d98',
        border: 'rgba(255,255,255,0.06)', // Translucent borders
        success: '#2fb380',
        alert: '#e25858',
      },
      spacing: {
        '8px': '8px',
        '16px': '16px',
        '24px': '24px',
        '32px': '32px',
        '40px': '40px',
        '64px': '64px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px 0 rgba(94, 106, 210, 0.15)',
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'pulse-slow': 'pulseSlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .4 },
        }
      }
    },
  },
  plugins: [],
}
