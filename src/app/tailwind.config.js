/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:first-of-type::after": { content: "none" },
            a: {
              color: "var(--link)",
              wordBreak: "break-word",
              code: { color: "var(--link)" },
            },
            code: {
              backgroundColor: "var(--muted)",
              "&:before": { content: "none !important" },
              "&:after": { content: "none !important" },
            },
            hr: {
              marginTop: "1rem",
              marginBottom: "1rem",
            },
            img: {
              marginTop: 0,
              marginBottom: 0,
            },
            figure: {
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
              position: "relative",
              "&>button.copy-btn": {
                opacity: 0,
              },
              "&:hover>button.copy-btn": {
                opacity: 1,
              },
            },
            ul: {
              "padding-inline-start": "0",
            },
          },
        },
      },
    },
  },
};
