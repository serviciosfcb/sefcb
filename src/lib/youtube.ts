// Convierte cualquier enlace de YouTube (watch?v=, youtu.be, shorts, embed, live) en la dirección para insertarlo.
// Usa youtube-nocookie.com: YouTube no guarda cookies hasta que la persona le da reproducir.
export type Video = { id: string; vertical: boolean; embed: string };

export function videoYoutube(enlace: string): Video | null {
  const url = (enlace || '').trim();
  const m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  if (!m) return null;
  return { id: m[1], vertical: /\/shorts\//.test(url), embed: `https://www.youtube-nocookie.com/embed/${m[1]}` };
}
