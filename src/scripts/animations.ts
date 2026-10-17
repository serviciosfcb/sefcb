// Coreografía de la página: entrada del héroe, titulares que se revelan por líneas,
// línea de tiempo que se dibuja con el scroll y microinteracciones.
// Con "reducir movimiento" (sistema o panel de accesibilidad) no se anima nada y todo queda visible.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
const mq = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => mq.matches || root.dataset.motion === 'reduced';
const fine = matchMedia('(hover: hover) and (pointer: fine)');

let ctx: gsap.Context | null = null;
let splits: SplitText[] = [];

// Divide un titular en líneas enmascaradas; al terminar se restaura el texto original
function splitLines(el: HTMLElement, vars: gsap.TweenVars) {
  const s = SplitText.create(el, {
    type: 'lines', mask: 'lines', linesClass: 'linea', autoSplit: true,
    onSplit: (self) => gsap.from(self.lines, { ...vars, onComplete: () => self.revert() }),
  });
  splits.push(s);
}

function build(withIntro = true) {
  ctx = gsap.context(() => {
    root.classList.add('js-anim');
    const ease = 'expo.out';

    // Entrada del héroe
    if (withIntro) {
      const title = document.querySelector<HTMLElement>('[data-hero-title]');
      const intro = gsap.timeline({ delay: .1 });
      intro.from('[data-hero-kicker]', { x: -24, opacity: 0, duration: .9, ease }, 0);
      if (title) splitLines(title, { yPercent: 115, duration: 1.25, stagger: .1, ease, delay: .22 });
      intro.from('[data-hero-fade]', { y: 26, opacity: 0, duration: 1, stagger: .1, ease }, .55);
      intro.from('.accesos [data-stagger-item]', { y: 50, opacity: 0, duration: 1.1, stagger: .08, ease }, .8);
    }
    root.classList.remove('intro');

    // Titulares de sección: líneas que suben desde una máscara
    document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
      splitLines(el, { yPercent: 110, duration: 1.15, stagger: .09, ease, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    // Bloques que aparecen
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.from(el, { y: 36, opacity: 0, duration: 1.1, ease, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((list) => {
      if (list.closest('.accesos')) return;
      gsap.from(list.querySelectorAll('[data-stagger-item]'), { y: 40, opacity: 0, duration: 1, stagger: .1, ease, scrollTrigger: { trigger: list, start: 'top 88%', once: true } });
    });

    // Fotos: se descubren desde una ventana más pequeña y la imagen se asienta
    document.querySelectorAll<HTMLElement>('[data-foto-reveal]').forEach((el) => {
      const img = el.querySelector('img');
      const rad = getComputedStyle(el).borderRadius || '0px';
      const idx = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
      const st = { trigger: el, start: 'top 92%', once: true };
      gsap.fromTo(el, { clipPath: `inset(9% 7% 9% 7% round ${rad})` }, { clipPath: `inset(0% 0% 0% 0% round ${rad})`, duration: 1.5, delay: idx * .08, ease, scrollTrigger: st, clearProps: 'clipPath' });
      if (img) gsap.fromTo(img, { scale: 1.22 }, { scale: 1, duration: 2, delay: idx * .08, ease, scrollTrigger: st, clearProps: 'transform' });
    });

    // Línea de tiempo de la atención: el latido se dibuja con el scroll y enciende cada paso
    const tl = document.querySelector<HTMLElement>('[data-timeline]');
    if (tl) {
      const steps = [...tl.querySelectorAll<HTMLElement>('[data-step]')];
      ScrollTrigger.create({
        trigger: tl, start: 'top 75%', end: 'bottom 55%', scrub: .6,
        onUpdate: (st) => {
          const p = st.progress;
          tl.style.setProperty('--avance', String(1 - p));
          tl.style.setProperty('--avance-y', String(p));
          steps.forEach((s, i) => s.classList.toggle('encendido', p >= (i / steps.length) + .02));
        },
      });
      tl.style.setProperty('--avance', '1');
      tl.style.setProperty('--avance-y', '0');
    }

    // El héroe se aleja con el scroll
    gsap.to('.heroe-in', { yPercent: -18, opacity: .2, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.tira', { y: 60, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } });

    // El teléfono del portal entra girando
    gsap.from('.telefono', { rotateY: -40, rotateX: 18, y: 80, opacity: 0, duration: 1.6, ease, scrollTrigger: { trigger: '.portal-escena', start: 'top 80%', once: true } });
    gsap.from('[data-toast]', { x: 60, opacity: 0, scale: .9, duration: 1.1, delay: .9, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.portal-escena', start: 'top 80%', once: true } });
  });
}

function teardown() {
  root.classList.remove('intro');
  ctx?.revert(); ctx = null;
  splits.forEach((s) => s.revert()); splits = [];
  root.classList.remove('js-anim');
  document.querySelectorAll<HTMLElement>('[data-timeline]').forEach((t) => { t.style.removeProperty('--avance'); t.style.removeProperty('--avance-y'); });
}

// Microinteracciones: brillo que sigue al cursor, botones magnéticos y teléfono que se inclina
function interactions() {
  document.addEventListener('pointermove', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('.btn, [data-spot]');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });

  document.querySelectorAll<HTMLElement>('[data-magnet]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      if (reduced() || !fine.matches) return;
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .22, y: (e.clientY - r.top - r.height / 2) * .3, duration: .5, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1, .4)' }));
  });

  const scene = document.querySelector<HTMLElement>('[data-tilt]');
  const phone = scene?.querySelector<HTMLElement>('[data-tilt-inner]');
  if (scene && phone) {
    scene.addEventListener('pointermove', (e) => {
      if (reduced() || !fine.matches) return;
      const r = scene.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      phone.style.transform = `rotateY(${-14 + px * 22}deg) rotateX(${6 - py * 16}deg) rotateZ(1deg)`;
    });
    scene.addEventListener('pointerleave', () => { phone.style.transform = ''; });
  }

  document.querySelector('[data-top]')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    document.querySelector<HTMLElement>('.saltar')?.focus({ preventScroll: true });
  });
}

let built = false;
function sync() {
  if (reduced()) { teardown(); return; }
  if (ctx) { teardown(); build(false); }  // cambio de tamaño de texto u otro ajuste: rehacer sin repetir la entrada
  else { build(!built); }
  built = true;
  ScrollTrigger.refresh();
}

// Longitud real de cada trazo que se dibuja (líneas de ECG, vasos, rutas)
function measureDraw() {
  document.querySelectorAll<SVGGeometryElement>('[data-draw]').forEach((el) => {
    try { el.style.setProperty('--len', String(Math.ceil(el.getTotalLength()) + 2)); } catch { /* sin geometría */ }
  });
}

export function initAnimations() {
  measureDraw();
  interactions();
  const start = () => sync();
  if (document.fonts?.ready) document.fonts.ready.then(start); else start();
  mq.addEventListener('change', sync);
  document.addEventListener('a11y:change', sync);
}
