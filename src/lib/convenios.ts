// Logos de los convenios. Viven en src/assets/convenios/ para que Astro los optimice (WebP).
// En el panel, el campo Logo guarda la ruta "/src/assets/convenios/<archivo>".
import type { ImageMetadata } from 'astro';

const archivos = import.meta.glob<{ default: ImageMetadata }>('/src/assets/convenios/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}', { eager: true });

export function logoConvenio(ruta?: string): ImageMetadata | undefined {
  if (!ruta) return undefined;
  const nombre = ruta.split('/').pop() ?? '';
  return archivos[`/src/assets/convenios/${nombre}`]?.default;
}

// Ancho del logo en rem para que todos se vean del mismo peso: los anchos y bajos crecen a lo ancho,
// los cuadrados a lo alto, con la misma área aproximada y dentro de la ficha.
export function anchoLogo(meta: ImageMetadata, area = 19, maxW = 10, maxH = 3.6): number {
  const r = meta.width / meta.height;
  let w = Math.sqrt(area * r);
  if (w > maxW) w = maxW;
  if (w / r > maxH) w = maxH * r;
  return Math.round(w * 100) / 100;
}
