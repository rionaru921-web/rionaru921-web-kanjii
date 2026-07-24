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
        // warnings/errors, so existing bg-vermilion / border-vermilion usage
        // is unaffected. --wine itself is the lighter accent tone (fine at
        // low opacity or on icons); text-vermilion-text is a darker shade
        // reserved for readable text, since the lighter tone alone doesn't
        // clear WCAG AA contrast on a white background.
        vermilion: {
          DEFAULT: "var(--wine)",
          text: "var(--wine-text)",
        },
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
        // Neutral ink-toned shadows (no warm/terracotta tint) for the
        // "refined white base" look — Notion/Linear/Apple use colorless,
        // very low-opacity shadows rather than colored ones.
        gold: "0 8px 24px -8px rgba(31, 27, 24, 0.18)",
        "gold-lg": "0 20px 50px -12px rgba(31, 27, 24, 0.22)",
        warm: "0 4px 24px rgba(31, 27, 24, 0.06)",
        "warm-hover": "0 12px 40px rgba(31, 27, 24, 0.1)",
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
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "bounce-slow": "bounce-slow 2.2s ease-in-out infinite",
        "chochin-sway": "chochin-sway 4s ease-in-out infinite",
        "pulse-warm": "pulse-warm 2.2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
