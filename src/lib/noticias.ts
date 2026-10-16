// Utilidades de la sección de noticias: listas por idioma, fechas y textos en inglés.
import { getCollection, type CollectionEntry } from 'astro:content';
import { marked } from 'marked';
import type { Lang } from '../i18n/content';

export type Noticia = CollectionEntry<'noticias'>;

export async function getNoticias(): Promise<Noticia[]> {
  const all = await getCollection('noticias', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const slugOf = (n: Noticia) => n.id.replace(/\.md$/, '').split('/').pop()!;

// En inglés se usa la traducción si existe; si no, el texto en español (marcado con lang="es")
export function textos(n: Noticia, lang: Lang) {
  const d = n.data;
  const en = lang === 'en' && !!d.title_en;
  return {
    title: en ? d.title_en : d.title,
    summary: en ? d.summary_en || d.summary : d.summary,
    imageAlt: en ? d.imageAlt_en || d.imageAlt : d.imageAlt,
    translated: lang === 'es' || en,
    contentLang: lang === 'en' && !en ? 'es' : lang,
  };
}

export const bodyEn = (n: Noticia) => (n.data.body_en ? (marked.parse(n.data.body_en, { async: false }) as string) : '');

export const fecha = (d: Date, lang: Lang) =>
  new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
