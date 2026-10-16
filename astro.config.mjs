import { defineConfig } from 'astro/config';

// Sitio institucional de Servicios Especializados del Corazón (sefcb.co)
// Español en la raíz, inglés en /en/.
export default defineConfig({
  site: 'https://sefcb.co',
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'always',
    assets: 'assets',
  },
});
