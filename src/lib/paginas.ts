// Utilidades de las páginas internas y de los servicios: idioma, dirección y página equivalente.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/content';
import { pageRoutes, serviceRoute, type RouteKey } from '../i18n/routes';

export type Pagina = CollectionEntry<'paginas'>;
export type Servicio = CollectionEntry<'servicios'>;

export const langOf = (e: { id: string }): Lang => (e.id.startsWith('en/') ? 'en' : 'es');

export function pathOfPagina(p: Pagina): string {
  const key = p.data.key as RouteKey;
  const route = pageRoutes[key];
  if (!route) throw new Error(`La página ${p.id} usa la clave "${p.data.key}", que no existe en src/i18n/routes.ts`);
  return route[langOf(p)];
}
export const pathOfServicio = (s: Servicio) => pageRoutes[serviceRoute(s.data.key)][langOf(s)];

export async function getPaginas(lang: Lang) {
  const all = await getCollection('paginas', (p) => langOf(p) === lang);
  return all.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}
export async function getServicios(lang: Lang) {
  const all = await getCollection('servicios', (s) => langOf(s) === lang);
  return all.sort((a, b) => a.data.order - b.data.order);
}

// Página de la otra lengua con la misma clave; si no existe, la portada de ese idioma
export function altPath(key: string, lang: Lang): string {
  const other: Lang = lang === 'es' ? 'en' : 'es';
  const route = pageRoutes[key as RouteKey];
  return route ? route[other] : pageRoutes.inicio[other];
}

// Para getStaticPaths: quita el prefijo de idioma y las barras de los extremos
export const toParam = (path: string) => path.replace(/^\/(en\/)?/, '').replace(/\/$/, '');
