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
        "primary": "#002045",
        "primary-container": "#1a365d",
        "on-primary": "#ffffff",
        "on-primary-container": "#86a0cd",
        "primary-fixed": "#d6e3ff",
        "primary-fixed-dim": "#adc7f7",
        "on-primary-fixed": "#001b3c",
        "on-primary-fixed-variant": "#2d476f",
        
        "secondary": "#1960a3",
        "secondary-container": "#7db6ff",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#00477f",
        "secondary-fixed": "#d3e4ff",
        "secondary-fixed-dim": "#a2c9ff",
        "on-secondary-fixed": "#001c38",
        "on-secondary-fixed-variant": "#004881",
        
        "tertiary": "#321b00",
        "tertiary-container": "#4f2e00",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#c6955e",
        "tertiary-fixed": "#ffddba",
        "tertiary-fixed-dim": "#f2bc82",
        "on-tertiary-fixed": "#2b1700",
        "on-tertiary-fixed-variant": "#633f0f",

        "background": "#faf9fd",
        "on-background": "#1a1c1e",

        "surface": "#faf9fd",
        "surface-dim": "#dad9dd",
        "surface-bright": "#faf9fd",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f4f3f7",
        "surface-container": "#efedf1",
        "surface-container-high": "#e9e7eb",
        "surface-container-highest": "#e3e2e6",
        "surface-variant": "#e3e2e6",
        "on-surface": "#1a1c1e",
        "on-surface-variant": "#43474e",
        "inverse-surface": "#2f3033",
        "inverse-on-surface": "#f1f0f4",
        "inverse-primary": "#adc7f7",
        "surface-tint": "#455f88",

        "outline": "#74777f",
        "outline-variant": "#c4c6cf",

        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "unit": "4px",
        "margin-mobile": "16px",
        "margin-desktop": "32px",
        "gutter": "16px",
        "container-max": "1280px",
      },
      fontFamily: {
        "sans": ["Inter", "sans-serif"],
        "display-lg": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "headline-sm": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "mono": ["JetBrains Mono", "monospace"],
        "mono-md": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "mono-md": ["14px", { lineHeight: "20px", fontWeight: "400" }]
      }
    },
  },
  plugins: [],
}
