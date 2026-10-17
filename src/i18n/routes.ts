// Mapa de direcciones del sitio en los dos idiomas.
// Es la única fuente de las rutas: el menú, los enlaces, las páginas y las redirecciones salen de aquí.
import type { Lang } from './content';
import { links } from './content';

export type RouteKey = keyof typeof pageRoutes;

export const pageRoutes = {
  inicio: { es: '/', en: '/en/' },
  noticias: { es: '/noticias/', en: '/en/news/' },

  // Servicios
  servicios: { es: '/servicios/', en: '/en/services/' },
  'servicio-noinvasiva': { es: '/servicios/cardiologia-no-invasiva/', en: '/en/services/non-invasive-cardiology/' },
  'servicio-nuclear': { es: '/servicios/medicina-nuclear/', en: '/en/services/nuclear-medicine/' },
  'servicio-intervencionismo': { es: '/servicios/intervencionismo/', en: '/en/services/interventional-cardiology/' },
  'servicio-consulta': { es: '/servicios/consulta-externa/', en: '/en/services/specialist-consultations/' },
  'servicio-terapia': { es: '/servicios/terapia-fisica/', en: '/en/services/physical-therapy/' },
  'servicio-transporte': { es: '/servicios/transporte-asistencial/', en: '/en/services/ambulance-transport/' },
  'servicio-obesidad': { es: '/servicios/hormesis/', en: '/en/services/hormesis/' },

  // Pacientes
  pacientes: { es: '/pacientes/', en: '/en/patients/' },
  cita: { es: '/pacientes/como-pedir-cita/', en: '/en/patients/booking/' },
  antes: { es: '/pacientes/antes-de-su-atencion/', en: '/en/patients/before-your-visit/' },
  preparacion: { es: '/pacientes/preparacion-para-examenes/', en: '/en/patients/exam-preparation/' },
  resultados: { es: '/pacientes/resultados-e-historia-clinica/', en: '/en/patients/results-and-medical-records/' },
  seguridad: { es: '/pacientes/seguridad-del-paciente/', en: '/en/patients/patient-safety/' },
  derechos: { es: '/pacientes/derechos-y-deberes/', en: '/en/patients/rights-and-responsibilities/' },
  faq: { es: '/pacientes/preguntas-frecuentes/', en: '/en/patients/faq/' },
  asociacion: { es: '/pacientes/asociacion-de-usuarios/', en: '/en/patients/patient-association/' },
  educacion: { es: '/pacientes/educacion/', en: '/en/patients/health-education/' },
  visitantes: { es: '/pacientes/pacientes-de-otras-ciudades/', en: '/en/patients/traveling-to-cucuta/' },

  // Nosotros
  nosotros: { es: '/nosotros/', en: '/en/about/' },
  direccionamiento: { es: '/nosotros/direccionamiento-estrategico/', en: '/en/about/mission-and-vision/' },
  calidad: { es: '/nosotros/calidad/', en: '/en/about/quality/' },
  equipo: { es: '/nosotros/equipo/', en: '/en/about/our-team/' },
  empleo: { es: '/nosotros/trabaje-con-nosotros/', en: '/en/about/careers/' },
  bienestar: { es: '/nosotros/programa-de-bienestar/', en: '/en/about/wellbeing-program/' },

  // Transparencia
  transparencia: { es: '/transparencia/', en: '/en/transparency/' },
  politicas: { es: '/transparencia/politicas-institucionales/', en: '/en/transparency/institutional-policies/' },
  entidades: { es: '/transparencia/directorio-de-entidades/', en: '/en/transparency/oversight-bodies/' },
  tributarios: { es: '/transparencia/certificados-tributarios/', en: '/en/transparency/tax-certificates/' },

  // Contacto y legales
  contacto: { es: '/contacto/', en: '/en/contact/' },
  datos: { es: '/politica-de-datos/', en: '/en/privacy/' },
  accesibilidad: { es: '/accesibilidad/', en: '/en/accessibility/' },
  mapa: { es: '/mapa-del-sitio/', en: '/en/sitemap/' },
} satisfies Record<string, Record<Lang, string>>;

export const r = (lang: Lang, key: RouteKey) => pageRoutes[key][lang];

// Secciones del sitio y su página principal
export const sections = {
  servicios: 'servicios',
  pacientes: 'pacientes',
  nosotros: 'nosotros',
  transparencia: 'transparencia',
  contacto: 'contacto',
  legal: 'inicio',
} as const satisfies Record<string, RouteKey>;
export type Section = keyof typeof sections;

export const serviceRoute = (key: string) => `servicio-${key}` as RouteKey;

// Enlace a partir de una clave: ruta interna si existe; si no, enlace externo de content.ts
export const to = (lang: Lang, key: string): string =>
  key in pageRoutes ? pageRoutes[key as RouteKey][lang] : ((links as Record<string, string>)[key] ?? '#');
export const isExternal = (href: string) => /^https?:/.test(href);
