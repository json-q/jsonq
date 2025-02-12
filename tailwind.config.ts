import type { Config } from 'tailwindcss';
import twAnimate from 'tailwindcss-animate';
import twTypography from '@tailwindcss/typography';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,md,mdx}',
    './components/**/*.{js,ts,jsx,tsx,md,mdx}',
    './app/**/*.{js,ts,jsx,tsx,md,mdx}',
    './posts/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            'blockquote p:first-of-type::before': { content: 'none' },
            'blockquote p:first-of-type::after': { content: 'none' },
            a: {
              color: theme('colors.blue.600'),
              '&:hover': {
                color: theme('colors.blue.800'),
              },
              code: { color: theme('colors.blue.600') },
            },
            code: {
              color: theme('colors.pink.600'),
            },
            h1: {
              marginBottom: 0,
            },
            h2: {
              fontWeight: theme('fontWeight.extrabold'),
            },
            h3: {
              fontWeight: theme('fontWeight.extrabold'),
            },
            hr: {
              marginTop: '2rem',
              marginBottom: '2rem',
            },
            p: {
              color: theme('colors.slate.800'),
            },
            img: {
              marginTop: 0,
              marginBottom: 0,
            },
            ul: {
              marginTop: 0,
            },
            blockquote: {
              p: {
                color: theme('colors.slate.600'),
              },
            },
            pre: {
              position: 'relative',
              code: {
                overflow: 'hidden',
                whiteSpace: 'pre-wrap !important',
              },
              button: {
                position: 'absolute',
                right: '0.5rem',
                top: '0.5rem',
                display: 'none',
              },
              '&:hover': {
                button: {
                  display: 'block',
                },
              },
            },
          },
        },
        invert: {
          css: {
            a: {
              color: theme('colors.blue.400'),
              '&:hover': {
                color: theme('colors.blue.600'),
              },
              code: { color: theme('colors.blue.400') },
            },
            code: { color: theme('colors.pink.400') },
            p: {
              color: theme('colors.slate.200'),
            },
            blockquote: {
              p: {
                color: theme('colors.slate.400'),
              },
            },
          },
        },
      }),
    },
  },
  variants: {
    typography: ['dark'],
  },
  plugins: [twAnimate, twTypography],
} satisfies Config;
