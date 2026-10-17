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
    // La fecha se usa para ordenar; con ocultar_fecha no se muestra en el sitio
    ocultar_fecha: z.boolean().optional().default(false),
  }),
});

// Páginas internas. Cada archivo vive en es/ o en/ y se enlaza con su par por "key".
// La dirección de la página sale de src/i18n/routes.ts según su key.
const paginas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/paginas' }),
  schema: z.object({
    key: z.string(),
    title: z.string(),
    description: z.string().optional().default(''),
    lead: z.string().optional().default(''),
    section: z.enum(['servicios', 'pacientes', 'nosotros', 'transparencia', 'contacto', 'legal']),
    order: z.number().optional().default(50),
    layout: z.enum(['texto', 'seccion', 'servicios', 'equipo', 'transparencia', 'contacto', 'mapa', 'preparacion', 'empleo', 'seguridad']).optional().default('texto'),
    card: z.string().optional().default(''),
    review: z.string().optional().default(''),
  }),
});

// Servicios: datos estructurados para su página y la tarjeta del listado.
const servicios = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/servicios' }),
  schema: z.object({
    key: z.enum(['noinvasiva', 'nuclear', 'intervencionismo', 'consulta', 'terapia', 'transporte', 'obesidad']),
    title: z.string(),
    tag: z.string(),
    summary: z.string(),
    order: z.number(),
    groups: z.array(z.object({
      title: z.string(),
      intro: z.string().optional().default(''),
      items: z.array(z.object({ name: z.string(), detail: z.string().optional().default('') })).optional().default([]),
    })).optional().default([]),
    location: z.string().optional().default(''),
    sede: z.number().optional().default(0),
    review: z.string().optional().default(''),
  }),
});

export const collections = { noticias, paginas, servicios };
