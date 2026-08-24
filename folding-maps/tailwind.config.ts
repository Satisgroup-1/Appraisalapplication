import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  corePlugins: {
    // Keep the existing editorial CSS untouched while Tailwind is introduced.
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        border: "var(--line)",
        background: "var(--paper)",
        foreground: "var(--ink)",
        muted: {
          foreground: "var(--muted)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
