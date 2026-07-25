import type { Config } from "tailwindcss";

/**
 * Tailwind is configured to read every color/spacing/radius value from
 * the CSS custom properties defined in styles/tokens.css, never from a
 * hardcoded palette. This is what makes the three brand themes (and
 * dark mode) a runtime attribute switch instead of a rebuild: the same
 * compiled CSS works for all of them because `bg-primary` always
 * resolves to `var(--color-primary)`, whatever that currently equals.
 *
 * Dark mode strategy: class-based ("dark" on <html>), NOT the
 * prefers-color-scheme media strategy — the user can override the OS
 * preference (theme-toggle.tsx), and we need dark mode to combine
 * with three different [data-brand] values, which media-query-driven
 * dark mode cannot express.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
          "on-primary": "var(--color-text-on-primary)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          300: "var(--color-primary-300)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          500: "var(--color-accent-500)",
          600: "var(--color-accent-600)",
        },
        success: {
          50: "var(--status-success-50)",
          500: "var(--status-success-500)",
          600: "var(--status-success-600)",
        },
        warning: {
          50: "var(--status-warning-50)",
          500: "var(--status-warning-500)",
          600: "var(--status-warning-600)",
        },
        danger: {
          50: "var(--status-danger-50)",
          500: "var(--status-danger-500)",
          600: "var(--status-danger-600)",
        },
        info: {
          50: "var(--status-info-50)",
          500: "var(--status-info-500)",
          600: "var(--status-info-600)",
        },
        risk: {
          low: "var(--risk-low)",
          medium: "var(--risk-medium)",
          high: "var(--risk-high)",
          critical: "var(--risk-critical)",
        },
        xp: "var(--color-xp)",
        streak: "var(--color-streak)",
        neutral: {
          0: "var(--neutral-0)",
          50: "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
          400: "var(--neutral-400)",
          500: "var(--neutral-500)",
          600: "var(--neutral-600)",
          700: "var(--neutral-700)",
          800: "var(--neutral-800)",
          900: "var(--neutral-900)",
          950: "var(--neutral-950)",
        },
      },
      fontFamily: {
        sans: ["var(--font-latin-body)"],
        display: ["var(--font-brand-display)"],
        arabic: ["var(--font-arabic-body)"],
        "arabic-display": ["var(--font-arabic-display)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        xs: ["var(--text-xs)", "var(--leading-xs)"],
        sm: ["var(--text-sm)", "var(--leading-sm)"],
        base: ["var(--text-base)", "var(--leading-base)"],
        lg: ["var(--text-lg)", "var(--leading-lg)"],
        xl: ["var(--text-xl)", "var(--leading-xl)"],
        "2xl": ["var(--text-2xl)", "var(--leading-2xl)"],
        "3xl": ["var(--text-3xl)", "var(--leading-3xl)"],
        "4xl": ["var(--text-4xl)", "var(--leading-4xl)"],
        "5xl": ["var(--text-5xl)", "var(--leading-5xl)"],
      },
      spacing: {
        "0": "var(--space-0)", "1": "var(--space-1)", "2": "var(--space-2)",
        "3": "var(--space-3)", "4": "var(--space-4)", "5": "var(--space-5)",
        "6": "var(--space-6)", "8": "var(--space-8)", "10": "var(--space-10)",
        "12": "var(--space-12)", "16": "var(--space-16)", "20": "var(--space-20)",
        "24": "var(--space-24)", "32": "var(--space-32)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
        control: "var(--radius-brand-control)",
        card: "var(--radius-brand-card)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "glow-labs": "var(--shadow-glow-labs)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },
      zIndex: {
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        drawer: "var(--z-drawer)",
        "modal-backdrop": "var(--z-modal-backdrop)",
        modal: "var(--z-modal)",
        popover: "var(--z-popover)",
        toast: "var(--z-toast)",
        tooltip: "var(--z-tooltip)",
      },
      screens: {
        // mobile is the implicit 0px default; tablet/desktop/wide named
        // explicitly so component code reads as intent, not magic numbers.
        tablet: "640px",
        desktop: "1024px",
        wide: "1536px", // GreenTrust executive dashboards, dense tables
      },
      ringColor: {
        DEFAULT: "var(--focus-ring-color)",
      },
      ringOffsetWidth: {
        DEFAULT: "var(--focus-ring-offset)",
      },
    },
  },
  plugins: [
    // Logical properties (ms-/me-/ps-/pe-/text-start/text-end/etc.) ship
    // natively in Tailwind v3.3+; no extra RTL plugin dependency needed.
    // Component authors MUST use logical utilities, never left-/right-.
  ],
};

export default config;
