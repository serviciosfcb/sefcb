// Convierte los horarios escritos en el panel («Lunes a viernes» · «7:00 a. m. – 6:00 p. m.») en franjas
// que el navegador puede comparar con la hora de Cúcuta. Si un texto no se entiende, esa sede no muestra
// el aviso de «abierta ahora»: nunca se adivina.

export type Franja = { dias: number[]; desde: number; hasta: number; festivos: boolean };

const quitarTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const DIAS: Record<string, number> = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 };

const leerDias = (texto: string): { dias: number[]; festivos: boolean } | null => {
  const t = quitarTildes(texto).replace(/s\b/g, '').replace(/\s+/g, ' ').trim();
  const festivos = /festivo/.test(t);
  const nombres = [...t.matchAll(/domingo|lune|marte|miercole|jueve|vierne|sabado/g)].map((m) => {
    const n = m[0];
    return DIAS[n] ?? DIAS[`${n}s`] ?? DIAS[n.replace(/e$/, 'es')];
  });
  if (nombres.some((n) => n === undefined) || nombres.length === 0) return festivos ? { dias: [], festivos } : null;
  // «Lunes a viernes» es un rango; «Sábados y domingos» o «Sábados» son días sueltos
  if (/\ba\b/.test(t) && nombres.length === 2) {
    const [a, b] = nombres as number[];
    const dias: number[] = [];
    for (let d = a; ; d = (d + 1) % 7) { dias.push(d); if (d === b) break; if (dias.length > 7) return null; }
    return { dias, festivos };
  }
  return { dias: nombres as number[], festivos };
};

// «7:00 a. m.», «6:00 p. m.», «12:00 m.» (mediodía) o «8:00» sin indicar
const leerHora = (s: string): { min: number; mer: 'am' | 'pm' | 'm' | '' } | null => {
  const m = quitarTildes(s).match(/(\d{1,2})(?::(\d{2}))?\s*(a\.?\s*m\.?|p\.?\s*m\.?|m\.?)?/);
  if (!m) return null;
  const h = Number(m[1]), mm = Number(m[2] || 0);
  if (h > 12 || mm > 59) return null;
  const mer = m[3] ? (m[3].startsWith('a') ? 'am' : m[3].startsWith('p') ? 'pm' : 'm') : '';
  return { min: h * 60 + mm, mer };
};
const a24 = (h: { min: number; mer: string }) => {
  const hh = Math.floor(h.min / 60) % 12, mm = h.min % 60;
  if (h.mer === 'm') return 12 * 60 + mm;
  return (h.mer === 'pm' ? hh + 12 : hh) * 60 + mm;
};

const leerHoras = (texto: string): { desde: number; hasta: number } | null => {
  const partes = texto.split(/[–—-]| a (?=\d)/);
  if (partes.length !== 2) return null;
  const ini = leerHora(partes[0]), fin = leerHora(partes[1]);
  if (!ini || !fin || !fin.mer) return null;
  if (!ini.mer) {
    // «8:00 – 11:00 a. m.» comparte el a. m.; «7:00 – 12:00 m.» o «1:00 – 6:00 p. m.» se resuelven por orden
    if (fin.mer === 'm') ini.mer = 'am';
    else if (fin.mer === 'pm') ini.mer = Math.floor(ini.min / 60) % 12 > Math.floor(fin.min / 60) % 12 ? 'am' : 'pm';
    else ini.mer = fin.mer;
  }
  const desde = a24(ini), hasta = a24(fin);
  return hasta > desde ? { desde, hasta } : null;
};

export const leerHorarios = (filas: { dias: string; horas: string }[]): Franja[] | null => {
  const franjas: Franja[] = [];
  for (const f of filas) {
    const d = leerDias(f.dias), h = leerHoras(f.horas);
    if (!d || !h) return null;
    franjas.push({ ...d, ...h });
  }
  return franjas.length ? franjas : null;
};
