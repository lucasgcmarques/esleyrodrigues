/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"PP Neue Montreal"', "sans-serif"],
      },
      fontSize: {
        site: ["0.75rem", { lineHeight: "1", fontWeight: "500" }],
      },
      colors: {
        text: "#111",
        border: "#111",
        "bg-content": "rgba(245, 245, 245, 0.97)",
        "bg-muted": "#f5f5f5",
      },
      spacing: {
        "content-left": "22rem",
        "header-offset": "3.5rem",
        "header-footer": "30px",
      },
      maxWidth: {
        content: "400px",
      },
      transitionDuration: {
        250: "250ms",
      },
      zIndex: {
        below: "0",
        base: "1",
        header: "2",
      },
    },
  },
  plugins: [],
};
