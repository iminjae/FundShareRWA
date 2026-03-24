import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#070B14",
          elevated: "#0E1525",
          card: "#101A2E",
        },
        line: "rgba(148, 163, 184, 0.22)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(96, 165, 250, 0.1), 0 12px 35px rgba(15, 23, 42, 0.55)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
