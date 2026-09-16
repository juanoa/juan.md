// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import wrapMdxComponentsWithNotProse from "./src/plugins/remark-wrap-mdx-components.js";
import { fileURLToPath } from "node:url";

// https://astro.build/config
export default defineConfig({
  site: "https://juan.md",
  adapter: vercel({
    imageService: true,
    imagesConfig: {
      sizes: [320, 480, 640, 768, 960, 1200, 1536, 2048],
      formats: ["image/avif", "image/webp"],
      minimumCacheTTL: 2_678_400,
    },
  }),
  integrations: [
    mdx({
      remarkPlugins: [wrapMdxComponentsWithNotProse],
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});
