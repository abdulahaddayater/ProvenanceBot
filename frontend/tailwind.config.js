/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f4f7f8',
          100: '#e3eaed',
          800: '#1a2b33',
          900: '#0f1a1f',
        },
        signal: {
          DEFAULT: '#0d9488',
          soft: '#ccfbf1',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
