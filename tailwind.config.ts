import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        background: "#FFFFF0",
        primary: "#09090B",
        secondary: "#FBD26F",
        royal: "#0C4575",
        muted: "#D4D4D8",
        // background: "#0C4575",
        // primary: "#FFFFF0",
      },
    },
  },
  plugins: [],
};
export default config;
