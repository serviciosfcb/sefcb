import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { prosaSatteri } from './src/lib/rehype-prosa.mjs';

// Sitio institucional de Servicios Especializados del Corazón (sefcb.co)
// Español en la raíz, inglés en /en/.
export default defineConfig({
  site: 'https://sefcb.co',
  trailingSlash: 'ignore',
  // Estructura visual de los textos del panel (datos, documentos, casos, preguntas): src/lib/rehype-prosa.mjs
  markdown: { processor: satteri({ hastPlugins: [prosaSatteri] }) },
  build: {
    inlineStylesheets: 'always',
    assets: 'assets',
  },
});
