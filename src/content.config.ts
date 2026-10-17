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
    layout: z.enum(['texto', 'seccion', 'servicios', 'equipo', 'transparencia', 'contacto', 'mapa', 'preparacion', 'empleo', 'seguridad', 'calidad', 'internacional', 'educacion']).optional().default('texto'),
    card: z.string().optional().default(''),
    // Foto de cabecera (opcional): ruta en src/assets/fotos, descripción y encuadre (object-position)
    image: z.string().optional().default(''),
    image_alt: z.string().optional().default(''),
    image_pos: z.string().optional().default('50% 50%'),
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
    // Foto del servicio (opcional): ruta en src/assets/fotos, descripción, pie de foto y encuadre
    image: z.string().optional().default(''),
    image_alt: z.string().optional().default(''),
    image_caption: z.string().optional().default(''),
    image_pos: z.string().optional().default('50% 50%'),
    review: z.string().optional().default(''),
  }),
});

// Educación al paciente: fichas cortas por categoría. Cada ficha vive en es/ o en/ y se enlaza con su par por "key".
// La dirección es la de la página de Educación + el nombre del archivo.
const texto = z.array(z.string()).optional().default([]);
// Las fechas pueden llegar como texto o como fecha (YAML convierte 2026-10-17 en fecha); se guardan como AAAA-MM-DD
const fecha = z.preprocess((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v ?? ''), z.string()).optional().default('');
const caja = z.object({ titulo: z.string().optional().default(''), items: texto }).optional();
const educacion = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/educacion' }),
  schema: z.object({
    key: z.string(),
    title: z.string(),
    summary: z.string(),
    categoria: z.enum(['examenes', 'enfermedades', 'prevencion', 'estilos', 'tratamiento', 'urgencias', 'derechos', 'seguridad', 'familias']),
    tipo: z.enum(['lectura', 'herramienta', 'video', 'descargable']).optional().default('lectura'),
    momento: z.array(z.enum(['antes', 'durante', 'despues', 'siempre'])).optional().default([]),
    servicios: z.array(z.enum(['noinvasiva', 'nuclear', 'intervencionismo', 'consulta', 'terapia', 'transporte', 'obesidad'])).optional().default([]),
    // Herramienta interactiva que se muestra en la ficha
    herramienta: z.enum(['', 'pasos', 'emergencia', 'presion', 'imc', 'riesgo']).optional().default(''),
    // Examen de src/data/preparaciones.json cuya preparación se muestra en "Antes"
    prep: z.string().optional().default(''),
    pasos: z.object({ antes: texto, durante: texto, despues: texto }).optional(),
    alarma: caja,
    // Lista que usa la herramienta de la ficha (por ejemplo, los factores de riesgo para marcar)
    lista: caja,
    preguntas: texto,
    comprobacion: z.object({ pregunta: z.string().optional().default(''), opciones: texto, correcta: z.coerce.number().int().min(0).optional().default(0), explicacion: z.string().optional().default('') }).optional(),
    video: z.string().optional().default(''),
    descargable: z.string().optional().default(''),
    revisado_por: z.string().optional().default(''),
    fecha_revision: fecha,
    proxima_revision: fecha,
    fuentes: z.array(z.object({ texto: z.string(), url: z.string().optional().default('') })).optional().default([]),
    orden: z.number().optional().default(50),
    destacado: z.boolean().optional().default(false),
    draft: z.boolean().optional().default(false),
    review: z.string().optional().default(''),
  }),
});

export const collections = { noticias, paginas, servicios, educacion };
