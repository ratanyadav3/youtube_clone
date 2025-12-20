/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'yt-bg': '#0f0f0f',
        'yt-surface': '#181818',
        'yt-card': '#202020',
        'yt-muted': '#aaaaaa',
        'yt-red': '#ff0000',
      },
      boxShadow: {
        'yt-sm': '0 1px 2px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
}




