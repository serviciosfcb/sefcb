// Fotos institucionales. Viven en src/assets/fotos/ para que Astro las optimice (WebP en varios tamaños).
// En el panel, los campos de foto guardan la ruta "/src/assets/fotos/<archivo>".
import type { ImageMetadata } from 'astro';

const archivos = import.meta.glob<{ default: ImageMetadata }>('/src/assets/fotos/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true });

// Devuelve la imagen optimizable si existe en la carpeta de fotos; si no, undefined.
export function foto(ruta?: string): ImageMetadata | undefined {
  if (!ruta) return undefined;
  const nombre = ruta.split('/').pop() ?? '';
  return archivos[`/src/assets/fotos/${nombre}`]?.default;
}

export type Txt = { es: string; en?: string };
export const txt = (x: Txt | string | undefined, en: boolean) => (typeof x === 'string' ? x : x ? (en ? x.en || x.es : x.es) : '');
