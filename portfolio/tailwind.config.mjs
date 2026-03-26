// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        // Display: erős, karakteres
        display: ["'DM Serif Display'", "Georgia", "serif"],
        // Body: tiszta, olvasható
        body: ["'DM Sans'", "system-ui", "sans-serif"],
        // Mono: kódhoz
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink:    "#0f0e0d",
        paper:  "#f8f5f0",
        accent: "#e8521a",  // meleg narancs – egyedi, nem szürke
        muted:  "#8a8580",
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body":       "#2a2825",
            "--tw-prose-headings":   "#0f0e0d",
            "--tw-prose-links":      "#e8521a",
            "--tw-prose-code":       "#0f0e0d",
            fontFamily: "var(--font-body)",
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
