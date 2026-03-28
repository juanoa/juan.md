// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import wrapMdxComponentsWithNotProse from "./src/plugins/remark-wrap-mdx-components.js";

// https://astro.build/config
export default defineConfig({
  site: "https://juan.md",
  integrations: [
    mdx({
      remarkPlugins: [wrapMdxComponentsWithNotProse],
    }),
    react(),
  ],
  image: {
    service: passthroughImageService(),
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
  redirects: {
    "/frontend": "/frontend/introduction",
  },
});
