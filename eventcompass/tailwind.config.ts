/** @type {import('tailwindcss').Config} */
// Force rebuild
export default {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        card: "#eef2fa",
        cardBorder: "#d6d9e7",
        slateBlue: "#5f7aa2",
      },
      borderRadius: { "2xl": "1rem" },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  important: true
};
