// Mapa del sitio para buscadores (https://sefcb.co/sitemap.xml). Se genera solo con cada publicación:
// incluye todas las páginas, servicios y noticias en los dos idiomas, con su página equivalente en el otro idioma.
import type { APIRoute } from 'astro';
import { getPaginas, getServicios, pathOfPagina, pathOfServicio } from '../lib/paginas';
import { getNoticias, slugOf, isoDate } from '../lib/noticias';
import { pageRoutes } from '../i18n/routes';
import { content } from '../i18n/content';

const SITE = 'https://sefcb.co';

export const GET: APIRoute = async () => {
  type Entry = { es: string; en: string; lastmod?: string };
  const entries: Entry[] = [
    { es: pageRoutes.inicio.es, en: pageRoutes.inicio.en },
    { es: pageRoutes.noticias.es, en: pageRoutes.noticias.en },
  ];
  const [pEs, pEn] = await Promise.all([getPaginas('es'), getPaginas('en')]);
  for (const p of pEs) {
    const par = pEn.find((x) => x.data.key === p.data.key);
    if (par) entries.push({ es: pathOfPagina(p), en: pathOfPagina(par) });
  }
  const [sEs, sEn] = await Promise.all([getServicios('es'), getServicios('en')]);
  for (const s of sEs) {
    const par = sEn.find((x) => x.data.key === s.data.key);
    if (par) entries.push({ es: pathOfServicio(s), en: pathOfServicio(par) });
  }
  for (const n of await getNoticias()) {
    const slug = slugOf(n);
    entries.push({ es: `${content.es.news.base}${slug}/`, en: `${content.en.news.base}${slug}/`, lastmod: n.data.ocultar_fecha ? undefined : isoDate(n.data.date) });
  }

  const url = (loc: string, e: Entry) => `  <url>
    <loc>${SITE}${loc}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''}
    <xhtml:link rel="alternate" hreflang="es" href="${SITE}${e.es}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}${e.en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${e.es}"/>
  </url>`;

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.flatMap((e) => [url(e.es, e), url(e.en, e)]).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
