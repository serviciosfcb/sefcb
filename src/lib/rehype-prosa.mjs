// Da estructura visual a los textos escritos en el panel, sin pedirle nada distinto a quien escribe:
// - Listas de «**Etiqueta:** valor» (y párrafos seguidos con esa forma) → lista de datos (dl.datos).
// - Listas cuyos elementos son solo enlaces a PDF → lista de documentos para descargar.
// - Un párrafo suelto que empieza con «**Algo:**» o «**Algo,**» → nota destacada.
// - Una sección (##) con dos o más subtítulos (###) → los casos se agrupan en paneles.
// - En Preguntas frecuentes, cada pregunta (###) se abre y se cierra (details).
// Los encabezados conservan su id: Astro los numera después de este paso.

const esEl = (n, tag) => n && n.type === 'element' && (!tag || n.tagName === tag);
const esBlanco = (n) => n && n.type === 'text' && !n.value.trim();
const texto = (n) => (n.type === 'text' ? n.value : (n.children || []).map(texto).join(''));
const sinBlancos = (hijos) => hijos.filter((c) => !esBlanco(c));
const el = (tagName, className, children = [], extra = {}) => ({
  type: 'element', tagName, properties: { ...(className ? { className: [].concat(className) } : {}), ...extra }, children,
});

// «**Horario:** lunes a viernes…» → { etiqueta: 'Horario', resto: [nodos] }
function etiquetaDe(contenedor, fin = /:$/) {
  const hijos = contenedor.children || [];
  let i = 0;
  while (i < hijos.length && esBlanco(hijos[i])) i++;
  const primero = hijos[i];
  if (!esEl(primero, 'strong')) return null;
  const t = texto(primero).trim();
  if (!fin.test(t) || t.length > 90) return null;
  const resto = hijos.slice(i + 1).map((n) => ({ ...n }));
  if (resto[0] && resto[0].type === 'text') resto[0].value = resto[0].value.replace(/^\s+/, '');
  if (!resto.some((n) => !esBlanco(n))) return null;
  return { etiqueta: t.replace(/\s*:$/, ''), resto, fuerte: primero };
}

// El valor empieza con mayúscula («lunes a viernes…» → «Lunes a viernes…»); los enlaces y correos no se tocan
const mayuscula = (nodos) => {
  const n = nodos[0];
  if (n && n.type === 'text' && /^[a-záéíóúñ]/.test(n.value)) nodos[0] = { ...n, value: n.value[0].toLocaleUpperCase('es') + n.value.slice(1) };
  return nodos;
};
const fila = (etiqueta, contenido) => el('div', 'dato', [el('dt', null, [{ type: 'text', value: etiqueta }]), el('dd', null, mayuscula(contenido))]);

function listaADatos(lista) {
  const items = sinBlancos(lista.children).filter((c) => esEl(c, 'li'));
  if (items.length < 2) return null;
  const filas = [];
  for (const li of items) {
    const hijos = sinBlancos(li.children);
    let contenedor = li;
    let extra = [];
    if (esEl(hijos[0], 'p')) { contenedor = hijos[0]; extra = hijos.slice(1); }
    const e = etiquetaDe(contenedor);
    if (!e) return null;
    filas.push(fila(e.etiqueta, contenedor === li ? e.resto : [el('p', null, e.resto), ...extra]));
  }
  return el('dl', 'datos', filas);
}

const esPdf = (a) => {
  const href = String(a.properties?.href || '');
  return /\.pdf($|[?#])/i.test(href) || /\bPDF\b/.test(texto(a));
};

function listaADocumentos(lista) {
  const items = sinBlancos(lista.children).filter((c) => esEl(c, 'li'));
  if (!items.length) return null;
  for (const li of items) {
    let hijos = sinBlancos(li.children);
    if (hijos.length === 1 && esEl(hijos[0], 'p')) hijos = sinBlancos(hijos[0].children);
    if (hijos.length !== 1 || !esEl(hijos[0], 'a') || !esPdf(hijos[0])) return null;
    const a = hijos[0];
    const t = texto(a).trim();
    const m = t.match(/^(.*?)\s*\(([^()]*)\)$/);
    a.properties = { ...a.properties, className: ['doc'] };
    a.children = [el('span', 'doc-nombre', [{ type: 'text', value: m ? m[1] : t }])];
    if (m) a.children.push(el('span', 'doc-meta', [{ type: 'text', value: m[2] }]));
    li.children = [a];
  }
  lista.properties = { ...lista.properties, className: ['documentos'] };
  return lista;
}

// Agrupa los casos (###) de cada sección (##) que tenga dos o más
function agruparCasos(hijos) {
  const salida = [];
  let i = 0;
  while (i < hijos.length) {
    const n = hijos[i];
    if (!esEl(n, 'h2')) { salida.push(n); i++; continue; }
    // límites de la sección
    let j = i + 1;
    while (j < hijos.length && !esEl(hijos[j], 'h2')) j++;
    const seccion = hijos.slice(i + 1, j);
    const h3s = seccion.filter((c) => esEl(c, 'h3')).length;
    salida.push(n);
    if (h3s < 2) { salida.push(...seccion); i = j; continue; }
    let k = 0;
    while (k < seccion.length && !esEl(seccion[k], 'h3')) salida.push(seccion[k++]);
    const casos = [];
    while (k < seccion.length) {
      const grupo = [seccion[k++]];
      while (k < seccion.length && !esEl(seccion[k], 'h3')) grupo.push(seccion[k++]);
      casos.push(el('div', 'caso', sinBlancos(grupo)));
    }
    salida.push(el('div', 'casos', casos));
    i = j;
  }
  return salida;
}

function preguntasPlegables(hijos) {
  const salida = [];
  let i = 0;
  while (i < hijos.length) {
    const n = hijos[i];
    if (!esEl(n, 'h3')) { salida.push(n); i++; continue; }
    const resp = [];
    i++;
    while (i < hijos.length && !esEl(hijos[i], 'h3') && !esEl(hijos[i], 'h2')) resp.push(hijos[i++]);
    salida.push(el('details', 'pregunta', [el('summary', null, [n]), el('div', 'respuesta', sinBlancos(resp))]));
  }
  return salida;
}

// Plugin para Sätteri, el procesador de Markdown de Astro: transforma una copia del árbol y la pone en su lugar
export const prosaSatteri = {
  name: 'prosa-sefcb',
  after(raiz, ctx) {
    const copia = JSON.parse(JSON.stringify(raiz));
    transformar(copia, ctx.data?.astro?.frontmatter || {});
    ctx.replaceNode(raiz, copia);
  },
};

export default function rehypeProsa() {
  return (arbol, archivo) => transformar(arbol, archivo?.data?.astro?.frontmatter || {});
}

function transformar(arbol, fm) {
  {
    // Listas de datos y de documentos (en cualquier nivel)
    const recorrer = (nodo) => {
      if (!nodo.children) return;
      nodo.children = nodo.children.map((c) => {
        if (esEl(c, 'ul')) return listaADocumentos(c) || listaADatos(c) || c;
        return c;
      });
      nodo.children.forEach(recorrer);
    };
    recorrer(arbol);
    let hijos = arbol.children;

    // Párrafos seguidos «**Etiqueta:** valor» → datos; uno suelto → nota
    const nuevos = [];
    for (let i = 0; i < hijos.length; i++) {
      const n = hijos[i];
      if (esEl(n, 'p') && etiquetaDe(n)) {
        const corrida = [n];
        let j = i + 1;
        while (j < hijos.length && (esBlanco(hijos[j]) || (esEl(hijos[j], 'p') && etiquetaDe(hijos[j])))) j++;
        for (let k = i + 1; k < j; k++) if (!esBlanco(hijos[k])) corrida.push(hijos[k]);
        if (corrida.length >= 2) {
          nuevos.push(el('dl', 'datos', corrida.map((p) => { const e = etiquetaDe(p); return fila(e.etiqueta, e.resto); })));
          i = j - 1;
          continue;
        }
        const e = etiquetaDe(n);
        if (e.etiqueta.length <= 40) { n.properties = { ...n.properties, className: ['nota'] }; }
        nuevos.push(n);
        continue;
      }
      if (esEl(n, 'p') && etiquetaDe(n, /,$/)) {
        const e = etiquetaDe(n, /,$/);
        if (e.etiqueta.length <= 40) n.properties = { ...n.properties, className: ['nota'] };
      }
      nuevos.push(n);
    }
    hijos = nuevos;

    hijos = fm.key === 'faq' ? preguntasPlegables(hijos) : agruparCasos(hijos);
    arbol.children = hijos;
  }
}
