// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// https://astro.build/config
export default defineConfig({
  site: "https://collocations.juan.md",
  output: "server",
  adapter: vercel(),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client"],
    },
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@": fileURLToPath(new URL("../../packages/ui/src", import.meta.url)),
      },
    },
  },
});
