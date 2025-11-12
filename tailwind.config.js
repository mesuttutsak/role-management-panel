module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81"
        },
        accent: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669"
        },
        background: "#f8fafc",
        foreground: "#0f172a"
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Poppins", "sans-serif"]
      },
      boxShadow: {
        surface: "0 2px 6px #090909ff",
        button: "0 10px 25px rgba(79, 70, 229, 0.25)",
        buttonNegative: "0 10px 25px rgba(185, 28, 28, 0.25)"
      },
      borderRadius: {
        xl: "1rem"
      }
    }
  },
  plugins: []
};
