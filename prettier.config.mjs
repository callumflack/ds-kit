const config = {
  // We could import `ultracite/prettier` here, but that also requires
  // `prettier-plugin-svelte`. This repo only needs the Tailwind plugin.
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/styles/index.css",
  tailwindFunctions: ["cn", "cva"],
  printWidth: 90,
  tabWidth: 2,
  useTabs: false,
  singleQuote: false,
};

export default config;
