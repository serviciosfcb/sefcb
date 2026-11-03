// Rótulos que lleva la ilustración de cada servicio (portada, cuadrícula y página del servicio).
import type { Lang } from '../i18n/content';
import { content, sedes } from '../i18n/content';

export const visualLabels = (lang: Lang, key: string): string[] => {
  const t = content[lang].services;
  if (key === 'obesidad') return t.pillars;
  if (key === 'consulta') return t.sounds;
  if (key === 'chequeo') return t.journey;
  if (key === 'transporte') return sedes.map((s) => (lang === 'en' ? s.nombre_en || s.nombre : s.nombre));
  return [];
};
