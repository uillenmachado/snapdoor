import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Paleta de neutros expandida
        neutral: {
          50: "hsl(var(--neutral-50))",
          100: "hsl(var(--neutral-100))",
          200: "hsl(var(--neutral-200))",
          300: "hsl(var(--neutral-300))",
          400: "hsl(var(--neutral-400))",
          500: "hsl(var(--neutral-500))",
          600: "hsl(var(--neutral-600))",
          700: "hsl(var(--neutral-700))",
          800: "hsl(var(--neutral-800))",
          900: "hsl(var(--neutral-900))",
        },
        // Cores de marca SnapDoor
        brand: {
          green: {
            50: "hsl(var(--brand-green-50))",
            100: "hsl(var(--brand-green-100))",
            200: "hsl(var(--brand-green-200))",
            300: "hsl(var(--brand-green-300))",
            400: "hsl(var(--brand-green-400))",
            500: "hsl(var(--brand-green-500))",
            600: "hsl(var(--brand-green-600))",
            700: "hsl(var(--brand-green-700))",
            800: "hsl(var(--brand-green-800))",
            900: "hsl(var(--brand-green-900))",
          },
          purple: {
            50: "hsl(var(--brand-purple-50))",
            100: "hsl(var(--brand-purple-100))",
            200: "hsl(var(--brand-purple-200))",
            300: "hsl(var(--brand-purple-300))",
            400: "hsl(var(--brand-purple-400))",
            500: "hsl(var(--brand-purple-500))",
            600: "hsl(var(--brand-purple-600))",
            700: "hsl(var(--brand-purple-700))",
            800: "hsl(var(--brand-purple-800))",
            900: "hsl(var(--brand-purple-900))",
          },
        },
        // Cores de status
        success: {
          50: "hsl(var(--status-success-50))",
          100: "hsl(var(--status-success-100))",
          500: "hsl(var(--status-success-500))",
          700: "hsl(var(--status-success-700))",
        },
        info: {
          50: "hsl(var(--status-info-50))",
          100: "hsl(var(--status-info-100))",
          500: "hsl(var(--status-info-500))",
          700: "hsl(var(--status-info-700))",
        },
        warning: {
          50: "hsl(var(--status-warning-50))",
          100: "hsl(var(--status-warning-100))",
          500: "hsl(var(--status-warning-500))",
          700: "hsl(var(--status-warning-700))",
        },
        danger: {
          50: "hsl(var(--status-danger-50))",
          100: "hsl(var(--status-danger-100))",
          500: "hsl(var(--status-danger-500))",
          700: "hsl(var(--status-danger-700))",
        },
        // Cores de etapas do pipeline
        pipeline: {
          1: "hsl(var(--pipeline-stage-1))",
          2: "hsl(var(--pipeline-stage-2))",
          3: "hsl(var(--pipeline-stage-3))",
          4: "hsl(var(--pipeline-stage-4))",
          5: "hsl(var(--pipeline-stage-5))",
          6: "hsl(var(--pipeline-stage-6))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
