// src/content/config.ts
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title:        z.string(),
    description:  z.string(),
    pubDate:      z.coerce.date(),
    updatedDate:  z.coerce.date().optional(),
    heroImage:    z.string().optional(),
    tags:         z.array(z.string()).default([]),
    readingTime:  z.number().optional(),   // percek, auto-calc a generate script-ben
    draft:        z.boolean().default(false),
    // AI generálás metaadatok
    aiGenerated:  z.boolean().default(false),
    aiModel:      z.string().optional(),
    aiReviewed:   z.boolean().default(false),
  }),
});

export const collections = { blog };
