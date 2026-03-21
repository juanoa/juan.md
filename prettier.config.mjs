import * as astro from "prettier-plugin-astro";
import * as tailwindcss from "prettier-plugin-tailwindcss";

/** @type {import("prettier").Config} */
const config = {
  bracketSameLine: true,
  plugins: [astro, tailwindcss],
};

export default config;
