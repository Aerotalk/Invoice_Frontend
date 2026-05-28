/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
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
          50: "#f5f7ff",
          100: "#ebedff",
          200: "#dde0ff",
          300: "#c4c8ff",
          400: "#a2a7ff",
          500: "#7a7fff",
          600: "#6366f1", // Sleek modern indigo primary
          700: "#4f46e5",
          800: "#3730a3",
          900: "#312e81",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
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
        success: {
          DEFAULT: "#10b981", // Emerald
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b", // Amber
          foreground: "#ffffff",
        },
        danger: {
          DEFAULT: "#ef4444", // Rose/Red
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "16px",
        "2xl": "24px",
      },
      boxShadow: {
        premium: "0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.03)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.04)",
        "glass-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glow: "0 0 15px -3px rgba(99, 102, 241, 0.15)",
        "glow-success": "0 0 15px -3px rgba(16, 185, 129, 0.15)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(4px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-out": "fade-out 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
}
