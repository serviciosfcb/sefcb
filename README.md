# Sitio web de Servicios Especializados del Corazón

Sitio institucional de la IPS (sefcb.co), en español e inglés, construido con [Astro](https://astro.build). Genera páginas estáticas: no tiene base de datos ni plugins, y se publica en Cloudflare Pages.

## Requisitos

- Node.js 22 o superior
- npm

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm install` | Instala las dependencias (solo la primera vez o cuando cambie `package.json`) |
| `npm run dev` | Abre el sitio en modo desarrollo en http://localhost:4321, con recarga automática |
| `npm run build` | Genera el sitio final en la carpeta `dist/` |
| `npm run preview` | Sirve la carpeta `dist/` para revisarla antes de publicar |

## Dónde se edita cada cosa

| Qué quiero cambiar | Archivo |
| --- | --- |
| Noticias, teléfonos, horarios, convenios y documentos de transparencia | Panel de contenido en `/admin` |
| Textos fijos del sitio, en español o en inglés | `src/i18n/content.ts` |
| Enlaces externos (portal, PQRS, pagos, redes) | `src/i18n/content.ts` (al inicio del archivo) |
| Colores, tipografía y tamaños | `src/styles/global.css` (variables en `:root`) |
| Logo | `src/assets/logo-color.png` y `src/assets/logo-blanco.png` |
| Ícono del navegador | `public/favicon-32.png` y `public/apple-touch-icon.png` |
| Orden de las secciones de la página de inicio | `src/components/Home.astro` |

Cada texto existe dos veces en `content.ts`: una en el bloque `es` y otra en el bloque `en`. Al cambiar uno, cambie también su traducción.

## Panel de contenido (`/admin`)

Las personas sin conocimientos técnicos editan desde `https://sefcb.pages.dev/admin` (luego `https://sefcb.co/admin`), con su cuenta de GitHub. Cada cambio guardado se convierte en un commit en este repositorio, y Cloudflare publica el sitio en uno o dos minutos.

Desde el panel se edita:

- **Noticias** (`src/content/noticias/`): título, fecha, resumen, foto, contenido y su versión en inglés.
- **Contacto, sedes y horarios** (`src/data/contacto.json`)
- **Convenios** (`src/data/convenios.json`)
- **Transparencia** (`src/data/transparencia.json`): estados financieros y otros documentos.

Las fotos y PDF que se suben desde el panel quedan en `public/uploads/`.

### Activación (una sola vez)

1. En GitHub, en la cuenta `serviciosfcb`: Settings → Developer settings → OAuth Apps → New OAuth App.
   - Homepage URL: `https://sefcb.pages.dev`
   - Authorization callback URL: `https://sefcb.pages.dev/api/callback`
2. Copie el Client ID y genere un Client secret.
3. En Cloudflare Pages, proyecto `sefcb` → Settings → Variables and Secrets, agregue `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET` (este último como secreto) y vuelva a desplegar.
4. Cada persona que vaya a publicar necesita una cuenta de GitHub (con verificación en dos pasos) agregada como colaboradora del repositorio con permiso de escritura.

### Al lanzar en sefcb.co

- En `public/admin/config.yml`, cambie `base_url`, `site_url` y `display_url` a `https://sefcb.co`.
- En la OAuth App de GitHub, cambie las dos direcciones a `https://sefcb.co`.

El inicio de sesión lo resuelven `functions/api/auth.js` y `functions/api/callback.js` (Cloudflare Pages Functions).

## Estructura

```
src/
  i18n/content.ts      Textos fijos del sitio, en los dos idiomas
  data/*.json          Contacto, sedes, convenios y transparencia (editables desde el panel)
  content/noticias/    Noticias en Markdown (editables desde el panel)
  layouts/Base.astro   Estructura común: cabecera, pie, metadatos y datos para Google
  components/          Secciones de la página (héroe, servicios, contacto…)
  scripts/hero.ts      Animación del héroe: partículas del logo y trazo de ECG
  scripts/animations.ts Animaciones al hacer scroll (GSAP)
  styles/global.css    Sistema de diseño y modos de accesibilidad
  pages/               Rutas: inicio y noticias en español, y lo mismo en /en/
public/                Archivos que se publican tal cual (incluye admin/ y uploads/)
functions/api/         Inicio de sesión del panel con GitHub
scripts/preview.py     Arma una copia con rutas relativas para vistas previas
```

## Accesibilidad

El sitio apunta a WCAG 2.2 nivel AA. Antes de publicar un cambio, verifique:

- Que se pueda recorrer todo con el teclado (Tab, Shift+Tab, Enter) y que el foco siempre se vea.
- Que toda imagen con contenido tenga texto alternativo, y que las decorativas tengan `alt=""` o `aria-hidden="true"`.
- Que el texto nuevo tenga buen contraste (mínimo 4.5:1 sobre su fondo).
- Que el panel de accesibilidad siga funcionando: tamaño de texto, alto contraste, subrayar enlaces, espaciado, detener animaciones y lectura en voz alta.

Las animaciones se apagan solas si el visitante activa "reducir movimiento" en su dispositivo o en el panel de accesibilidad.

## Publicación en Cloudflare Pages

- Comando de compilación: `npm run build`
- Carpeta de salida: `dist`
- Variable de entorno: `NODE_VERSION` = `22`

Cada cambio en la rama principal se publica automáticamente. Los cambios en otras ramas generan un enlace de vista previa para revisarlos antes.
