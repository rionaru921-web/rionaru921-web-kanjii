import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "var(--bg-primary)",
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
          warm: "var(--bg-warm)",
        },
        // "gold" is kept as the class-name family for the primary accent
        // (now terracotta) so the ~50 files already using text-gold /
        // bg-gold-gradient / border-gold keep working — only the CSS
        // variables they resolve to changed.
        gold: {
          DEFAULT: "var(--accent-primary)",
          bright: "var(--accent-light)",
          deep: "var(--accent-hover)",
          warm: "var(--accent-warm)",
        },
        // Same idea: "vermilion" now resolves to the new wine tone used for
        // warnings/errors, so existing text-vermilion / bg-vermilion usage
        // is unaffected.
        vermilion: "var(--wine)",
        ink: {
          DEFAULT: "var(--ink-primary)",
          secondary: "var(--ink-secondary)",
          muted: "var(--ink-muted)",
        },
        sage: "var(--sage)",
        premium: "var(--gold-accent)",
      },
      fontFamily: {
        serif: ["var(--font-noto-serif-jp)", "serif"],
        sans: ["var(--font-noto-sans-jp)", "sans-serif"],
        display: ["var(--font-playfair)", "var(--font-noto-serif-jp)", "serif"],
      },
      boxShadow: {
        gold: "0 8px 30px -8px rgba(139, 90, 60, 0.25)",
        "gold-lg": "0 20px 60px -12px rgba(139, 90, 60, 0.3)",
        warm: "0 4px 24px rgba(139, 90, 60, 0.08)",
        "warm-hover": "0 12px 40px rgba(139, 90, 60, 0.15)",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, var(--accent-light), var(--accent-primary), var(--accent-hover))",
      },
      keyframes: {
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
        "chochin-sway": {
          "0%, 100%": { transform: "rotate(-1.5deg)" },
          "50%": { transform: "rotate(1.5deg)" },
        },
        "pulse-warm": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.7" },
          "50%": { transform: "scale(1.15)", opacity: "1" },
        },
      },
      animation: {
        "bounce-slow": "bounce-slow 2.2s ease-in-out infinite",
        "chochin-sway": "chochin-sway 4s ease-in-out infinite",
        "pulse-warm": "pulse-warm 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
