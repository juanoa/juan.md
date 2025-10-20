import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const docs = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean().optional(),
    sidebar: z.object({
      label: z.string().optional(),
      order: z.number(),
    }),
  }),
});

export const collections = {
  docs,
};
