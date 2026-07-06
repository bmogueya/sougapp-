import type { Config } from "tailwindcss";

/**
 * Token-driven Tailwind theme.
 * Every color resolves to a CSS variable defined in src/index.css so that
 * light/dark themes swap by changing variables, not utility classes.
 * Variables hold space-separated RGB channels to support `/ <alpha-value>`.
 */
const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: withAlpha("--bg"),
        surface: withAlpha("--surface"),
        "surface-2": withAlpha("--surface-2"),
        overlay: withAlpha("--overlay"),
        border: withAlpha("--border"),
        "border-strong": withAlpha("--border-strong"),
        text: withAlpha("--text"),
        muted: withAlpha("--muted"),
        faint: withAlpha("--faint"),
        primary: {
          DEFAULT: withAlpha("--primary"),
          strong: withAlpha("--primary-strong"),
          foreground: withAlpha("--primary-foreground"),
        },
        gold: withAlpha("--gold"),
        success: withAlpha("--success"),
        warning: withAlpha("--warning"),
        danger: withAlpha("--danger"),
        info: withAlpha("--info"),
        // Per-service module accents (the constellation)
        food: withAlpha("--m-food"),
        grocery: withAlpha("--m-grocery"),
        marketplace: withAlpha("--m-marketplace"),
        pharmacy: withAlpha("--m-pharmacy"),
        parcel: withAlpha("--m-parcel"),
        taxi: withAlpha("--m-taxi"),
        wallet: withAlpha("--m-wallet"),
        billing: withAlpha("--m-billing"),
        booking: withAlpha("--m-booking"),
      },
      fontFamily: {
        sans: [
          "IBM Plex Sans",
          "IBM Plex Sans Arabic",
          "system-ui",
          "sans-serif",
        ],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        raised:
          "0 4px 12px -2px rgb(0 0 0 / 0.10), 0 2px 6px -2px rgb(0 0 0 / 0.08)",
        glow: "0 0 0 1px rgb(var(--primary) / 0.25), 0 8px 30px -8px rgb(var(--primary) / 0.35)",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
