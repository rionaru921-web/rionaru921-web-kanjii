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
        // Wave 19: every entry uses rgb(var(--x) / <alpha-value>) instead of
        // a plain var(--x) reference — the CSS variables themselves are now
        // space-separated RGB triples (see globals.css :root), which is what
        // lets Tailwind's opacity modifier (border-gold/20, bg-ink/60, etc.)
        // actually generate a rule. With a plain var(--x) hex string, /N was
        // silently producing no CSS at all — confirmed by grepping the
        // compiled bundle for every custom color across 126 files.
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--bg-primary) / <alpha-value>)",
          primary: "rgb(var(--bg-primary) / <alpha-value>)",
          secondary: "rgb(var(--bg-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--bg-tertiary) / <alpha-value>)",
          warm: "rgb(var(--bg-warm) / <alpha-value>)",
        },
        // "gold" is kept as the class-name family for the primary accent
        // (now terracotta) so the ~50 files already using text-gold /
        // bg-gold-gradient / border-gold keep working — only the CSS
        // variables they resolve to changed.
        gold: {
          DEFAULT: "rgb(var(--accent-primary) / <alpha-value>)",
          bright: "rgb(var(--accent-light) / <alpha-value>)",
          deep: "rgb(var(--accent-hover) / <alpha-value>)",
          warm: "rgb(var(--accent-warm) / <alpha-value>)",
        },
        // Same idea: "vermilion" now resolves to the new wine tone used for
        // warnings/errors, so existing bg-vermilion / border-vermilion usage
        // is unaffected. --wine itself is the lighter accent tone (fine at
        // low opacity or on icons); text-vermilion-text is a darker shade
        // reserved for readable text, since the lighter tone alone doesn't
        // clear WCAG AA contrast on a white background.
        vermilion: {
          DEFAULT: "rgb(var(--wine) / <alpha-value>)",
          text: "rgb(var(--wine-text) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink-primary) / <alpha-value>)",
          secondary: "rgb(var(--ink-secondary) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
        },
        sage: "rgb(var(--sage) / <alpha-value>)",
        premium: "rgb(var(--gold-accent) / <alpha-value>)",
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
          "linear-gradient(135deg, rgb(var(--accent-light)), rgb(var(--accent-primary)), rgb(var(--accent-hover)))",
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
