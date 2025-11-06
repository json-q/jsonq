import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const BLOG_PATH = "src/blog";

const blog = defineCollection({
  loader: glob({ base: `./${BLOG_PATH}`, pattern: "**/[^_]*.md" }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()),
    }),
});

export const collections = { blog };
