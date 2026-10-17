// Fichas de educación al paciente: lista por idioma, dirección y ficha equivalente en el otro idioma.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/content';
import { pageRoutes } from '../i18n/routes';
import { langOf } from './paginas';
import data from '../data/educacion.json';

export type Ficha = CollectionEntry<'educacion'>;
export type Categoria = (typeof data.categorias)[number];

const ordenCategoria = (id: string) => {
  const i = data.categorias.findIndex((c) => c.id === id);
  return i < 0 ? 99 : i;
};

export const slugOfFicha = (f: Ficha) => f.id.split('/').pop() as string;
export const pathOfFicha = (f: Ficha) => `${pageRoutes.educacion[langOf(f)]}${slugOfFicha(f)}/`;

// Las fichas marcadas como borrador solo se ven mientras se trabaja en el computador
export async function getFichas(lang: Lang) {
  const all = await getCollection('educacion', (f) => langOf(f) === lang && (import.meta.env.DEV || !f.data.draft));
  return all.sort((a, b) => ordenCategoria(a.data.categoria) - ordenCategoria(b.data.categoria) || a.data.orden - b.data.orden || a.data.title.localeCompare(b.data.title));
}

// Dirección de la misma ficha en el otro idioma; si no existe, la página de Educación de ese idioma
export async function altPathOfFicha(f: Ficha) {
  const lang = langOf(f);
  const other: Lang = lang === 'es' ? 'en' : 'es';
  const par = (await getFichas(other)).find((x) => x.data.key === f.data.key);
  return par ? pathOfFicha(par) : pageRoutes.educacion[other];
}

export const categoria = (id: string) => data.categorias.find((c) => c.id === id);

// Minutos de lectura aproximados (200 palabras por minuto), contando el cuerpo y las listas de la ficha
export function minutosLectura(f: Ficha) {
  const d = f.data;
  const partes = [f.body ?? '', d.summary, ...(d.pasos ? [...d.pasos.antes, ...d.pasos.durante, ...d.pasos.despues] : []), ...(d.alarma?.items ?? []), ...(d.lista?.items ?? []), ...d.preguntas];
  const palabras = partes.join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}
