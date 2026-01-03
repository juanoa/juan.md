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

const posts = defineCollection({
  loader: glob({ pattern: "**/index.mdx", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  docs,
  posts,
};
