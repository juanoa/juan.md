import { defineCollection } from "astro:content";
import { z } from 'astro/zod'
import { glob } from "astro/loaders";

const logs = defineCollection({
  loader: glob({
    pattern: "**/*.mdx",
    base: "./src/content/logs",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    createdAt: z.coerce.date(),
    translations: z
      .object({
        en: z.string().optional(),
        es: z.string().optional(),
      })
      .default({}),
    draft: z.boolean().default(false),
  }),
});

export const collections = { logs };
