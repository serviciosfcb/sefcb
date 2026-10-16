// Colecciones de contenido que se editan desde el panel (/admin).
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const noticias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/noticias' }),
  schema: z.object({
    title: z.string(),
    title_en: z.string().optional().default(''),
    date: z.coerce.date(),
    summary: z.string().optional().default(''),
    summary_en: z.string().optional().default(''),
    image: z.string().optional().default(''),
    imageAlt: z.string().optional().default(''),
    imageAlt_en: z.string().optional().default(''),
    body_en: z.string().optional().default(''),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { noticias };
