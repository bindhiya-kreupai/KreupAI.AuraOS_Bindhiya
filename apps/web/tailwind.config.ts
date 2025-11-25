/**
 * @module TailwindConfig
 * @description Tailwind CSS configuration with Aurora Professional theme
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 * @reference docs/aura-uiux-design.md
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/@aura/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Aurora Professional Color Palette
      colors: {
        // Primary Brand Colors
        'celestial-indigo': '#4B3BF5',
        'quantum-rose': '#E91E8C',
        'neural-mint': '#00D4AA',

        // Status Colors
        'sunset-amber': '#FFB547',
        'coral-alert': '#FF5744',

        // Neutral Spectrum - Moonlight Grays
        'ink-black': '#0A0E27',
        'deep-space': '#1A1F3A',
        'twilight': '#404968',
        'silver-mist': '#8892B0',
        'cloud': '#CBD5E1',
        'pearl': '#E8ECF4',
        'white-glow': '#F7F9FC',

        // Dark Mode - Cosmic Night
        'deep-cosmos': '#0A0B1E',
        'stellar-blue': '#151729',
        'nebula-purple': '#1F1B3C',

        // Semantic Colors (Mapped to CSS Variables)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      // Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Clash Display', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Cascadia Code', 'monospace'],
      },

      // Font Sizes - Fluid Typography
      fontSize: {
        xs: ['clamp(0.75rem, 2vw, 0.875rem)', { lineHeight: '1.5' }],
        sm: ['clamp(0.875rem, 2.5vw, 1rem)', { lineHeight: '1.5' }],
        base: ['clamp(1rem, 3vw, 1.125rem)', { lineHeight: '1.6' }],
        lg: ['clamp(1.125rem, 3.5vw, 1.25rem)', { lineHeight: '1.5' }],
        xl: ['clamp(1.25rem, 4vw, 1.5rem)', { lineHeight: '1.4' }],
        '2xl': ['clamp(1.5rem, 5vw, 2rem)', { lineHeight: '1.3' }],
        '3xl': ['clamp(2rem, 6vw, 3rem)', { lineHeight: '1.2' }],
        '4xl': ['clamp(2.5rem, 8vw, 4rem)', { lineHeight: '1.1' }],
      },

      // Spacing
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },

      // Border Radius
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      // Box Shadow
      boxShadow: {
        'glow-indigo': '0 0 20px rgba(75, 59, 245, 0.3)',
        'glow-rose': '0 0 20px rgba(233, 30, 140, 0.3)',
        'glow-mint': '0 0 20px rgba(0, 212, 170, 0.3)',
        'card': '0 10px 40px rgba(75, 59, 245, 0.08), 0 2px 10px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 60px rgba(75, 59, 245, 0.12), 0 5px 20px rgba(233, 30, 140, 0.08)',
      },

      // Background Image (Gradients)
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, #4B3BF5 0%, #E91E8C 50%, #00D4AA 100%)',
        'aurora-soft': 'linear-gradient(120deg, rgba(75, 59, 245, 0.05) 0%, rgba(233, 30, 140, 0.03) 50%, rgba(0, 212, 170, 0.05) 100%)',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },

      // Backdrop Blur
      backdropBlur: {
        xs: '2px',
      },

      // Animation
      animation: {
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'aurora-wave': 'auroraWave 8s ease-in-out infinite',
      },

      keyframes: {
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(75, 59, 245, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(233, 30, 140, 0.5)' },
        },
        auroraWave: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },

      // Transitions
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'swift': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
};

export default config;
