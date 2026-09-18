import * as astro from "prettier-plugin-astro";
import * as tailwindcss from "prettier-plugin-tailwindcss";

/** @type {import("prettier").Config} */
const config = {
  bracketSameLine: false,
  plugins: [astro, tailwindcss],
};

export default config;
