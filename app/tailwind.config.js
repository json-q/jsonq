/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            'blockquote p:first-of-type::before': { content: 'none' },
            'blockquote p:first-of-type::after': { content: 'none' },
            a: {
              color: 'var(--color-blue-600)',
              '&:hover': {
                color: 'var(--color-blue-800)',
              },
              code: { color: 'var(--color-blue-600)' },
            },
            code: {
              color: 'var(--color-pink-600)',
            },
            hr: {
              marginTop: '1rem',
              marginBottom: '1rem',
            },
            img: {
              marginTop: 0,
              marginBottom: 0,
            },
            blockquote: {
              p: {
                color: 'var(--color-slate-600)',
              },
            },
            figure: {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
          },
        },
      },
    },
  },
};
