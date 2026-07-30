import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(['comparatif', 'guide', 'article']),
    keywords: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    products: z
      .array(
        z.object({
          name: z.string(),
          affiliateUrl: z.string(),
          imageUrl: z.string().optional(),
          rating: z.number().min(0).max(5).optional(),
          pros: z.array(z.string()).default([]),
          cons: z.array(z.string()).default([]),
        }),
      )
      .default([]),
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .default([]),
  }),
});

export const collections = { articles };
