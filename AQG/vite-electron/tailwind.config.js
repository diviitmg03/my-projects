/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["dark"], // Specify "light" or your preferred theme as the only theme
    darkTheme: false, // Optionally, explicitly disable dark theme support
  },
}
