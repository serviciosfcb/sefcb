// Héroe: las manos del logo se arman con partículas, como los conteos de una gammagrafía,
// y laten cada vez que el trazo del electrocardiograma marca una onda R.

type Particle = {
  x: number; y: number; vx: number; vy: number;
  nx: number; ny: number;          // destino normalizado dentro del símbolo
  dx: number; dy: number;          // dirección de dispersión al hacer scroll
  size: number; sprite: number; alpha: number; delay: number; ph: number;
  ambient: boolean;
};

const RED = ['#6d1a1c', '#9f2728', '#c4383c', '#e2484d', '#f3a19f'];
const GREY = ['#5f5d5a', '#8c8b88', '#a1a19f', '#c3c2bf', '#dedcd8'];

export function initHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const canvas = hero.querySelector<HTMLCanvasElement>('[data-heart]')!;
  const ecgCanvas = hero.querySelector<HTMLCanvasElement>('[data-ecg]')!;
  const pauseBtn = hero.querySelector<HTMLButtonElement>('[data-hero-pause]');
  const ctx = canvas.getContext('2d')!;
  const ectx = ecgCanvas.getContext('2d')!;
  const root = document.documentElement;
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => mq.matches || root.dataset.motion === 'reduced';

  let W = 0, H = 0, DPR = 1, EW = 0, EH = 0;
  let particles: Particle[] = [];
  let center = { x: 0, y: 0 }, markH = 300, aspect = 1;
  const mouse = { x: -9999, y: -9999 };
  let scrollP = 0, beat = 10, start = performance.now(), last = start;
  let running = false, visible = true, userPaused = false, ready = false;

  // Sprites luminosos precalculados, uno por color
  const sprites = [...RED, ...GREY].map((c) => {
    const s = document.createElement('canvas'); s.width = s.height = 32;
    const g = s.getContext('2d')!; const grd = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grd.addColorStop(0, c); grd.addColorStop(.28, c); grd.addColorStop(.55, c + '55'); grd.addColorStop(1, c + '00');
    g.fillStyle = grd; g.fillRect(0, 0, 32, 32); return s;
  });

  // Trazo de ECG
  const ecg = { values: new Float32Array(0), head: 0, dist: 0, speed: 170, period: 60 / 72, lastPhase: 0 };
  const wave = (ph: number) => {
    const g = (c: number, w: number, a: number) => a * Math.exp(-(((ph - c) / w) ** 2));
    return g(.12, .028, .11) + g(.255, .009, -.1) + g(.28, .01, 1) + g(.305, .012, -.24) + g(.52, .05, .27);
  };

  function layout() {
    const r = canvas.getBoundingClientRect();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const mobile = W < 760;
    markH = mobile ? Math.min(W * .48, H * .27) : Math.min(H * .56, W * .33);
    center = mobile ? { x: W * .5, y: H * .2 } : { x: W * .735, y: H * .45 };
    hero.style.setProperty('--cx', `${(center.x / W) * 100}%`);
    hero.style.setProperty('--cy', `${(center.y / H) * 100}%`);

    const er = ecgCanvas.getBoundingClientRect();
    EW = Math.max(1, Math.round(er.width)); EH = Math.max(1, Math.round(er.height));
    ecgCanvas.width = Math.round(EW * DPR); ecgCanvas.height = Math.round(EH * DPR);
    ectx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const old = ecg.values; ecg.values = new Float32Array(EW).fill(NaN);
    ecg.values.set(old.subarray(0, Math.min(old.length, EW)));
    ecg.speed = mobile ? 120 : 170;
    ecg.head = Math.min(ecg.head, EW - 1);
  }

  async function buildParticles() {
    const img = new Image(); img.src = canvas.dataset.src || '';
    try { await img.decode(); } catch { return; }
    const w = img.naturalWidth, h = img.naturalHeight; aspect = w / h;
    const off = document.createElement('canvas'); off.width = w; off.height = h;
    const o = off.getContext('2d', { willReadFrequently: true })!; o.drawImage(img, 0, 0);
    const d = o.getImageData(0, 0, w, h).data;
    const step = W < 760 ? 3 : 2;
    const list: Particle[] = [];
    const rnd = Math.random;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const i = (y * w + x) * 4;
        if (d[i + 3] < 140) continue;
        const grey = Math.abs(d[i] - d[i + 1]) < 30;
        const edge = d[((y) * w + Math.min(w - 1, x + step)) * 4 + 3] < 140 || d[((Math.min(h - 1, y + step)) * w + x) * 4 + 3] < 140 ||
          d[((y) * w + Math.max(0, x - step)) * 4 + 3] < 140 || d[((Math.max(0, y - step)) * w + x) * 4 + 3] < 140;
        const tone = edge ? 3 + (rnd() < .4 ? 1 : 0) : Math.floor(rnd() * 3.2);
        const nx = (x + (rnd() - .5) * step) / h - aspect / 2, ny = (y + (rnd() - .5) * step) / h - .5;
        const ang = Math.atan2(ny, nx) + (rnd() - .5) * .8;
        list.push({
          x: 0, y: 0, vx: 0, vy: 0, nx, ny, dx: Math.cos(ang), dy: Math.sin(ang),
          size: (edge ? 2.6 : 2) + rnd() * 1.6, sprite: (grey ? RED.length : 0) + Math.min(4, tone),
          alpha: edge ? .95 : .55 + rnd() * .35, delay: rnd() * .9, ph: rnd() * Math.PI * 2, ambient: false,
        });
      }
    }
    // Halo de conteos alrededor del símbolo y ruido de fondo, como en una imagen de gammacámara
    const halo = Math.round(list.length * .14);
    for (let k = 0; k < halo; k++) {
      const a = rnd() * Math.PI * 2, r = .5 + rnd() * .38;
      list.push({ x: 0, y: 0, vx: 0, vy: 0, nx: Math.cos(a) * r * aspect * .9, ny: Math.sin(a) * r * .9, dx: Math.cos(a), dy: Math.sin(a), size: 1.4 + rnd() * 1.4, sprite: rnd() < .6 ? 1 : RED.length + 1, alpha: .12 + rnd() * .22, delay: .3 + rnd(), ph: rnd() * 6.28, ambient: false });
    }
    const amb = W < 760 ? 60 : 140;
    for (let k = 0; k < amb; k++) {
      list.push({ x: rnd() * W, y: rnd() * H, vx: 0, vy: 0, nx: rnd(), ny: rnd(), dx: 0, dy: -1, size: 1.2 + rnd() * 1.6, sprite: rnd() < .5 ? 2 : RED.length + 2, alpha: .08 + rnd() * .2, delay: rnd() * 1.5, ph: rnd() * 6.28, ambient: true });
    }
    // Arranque disperso por todo el lienzo
    for (const p of list) { if (!p.ambient) { p.x = rnd() * W; p.y = rnd() * H; } }
    particles = list;
    ready = true;
  }

  function onBeat() { beat = 0; }

  function stepEcg(dt: number) {
    const px = ecg.speed * dt;
    const L = ecg.speed * ecg.period;
    let n = Math.max(1, Math.round(px));
    for (let k = 0; k < n; k++) {
      ecg.dist += px / n;
      const ph = (ecg.dist % L) / L;
      if (ecg.lastPhase < .28 && ph >= .28) onBeat();
      ecg.lastPhase = ph;
      ecg.head = (ecg.head + px / n) % EW;
      ecg.values[Math.floor(ecg.head)] = wave(ph);
    }
  }

  function drawEcg() {
    ectx.clearRect(0, 0, EW, EH);
    const base = EH * .66, amp = EH * .5, gap = 28, head = Math.floor(ecg.head);
    ectx.lineWidth = 2; ectx.lineJoin = 'round'; ectx.lineCap = 'round';
    ectx.strokeStyle = '#e2484d'; ectx.shadowColor = 'rgba(226,72,77,.8)'; ectx.shadowBlur = 10;
    ectx.beginPath();
    let pen = false;
    for (let x = 0; x < EW; x++) {
      const inGap = (x > head && x <= head + gap) || (head + gap >= EW && x <= (head + gap) - EW);
      const v = ecg.values[x];
      if (inGap || Number.isNaN(v)) { pen = false; continue; }
      const y = base - v * amp;
      if (!pen) { ectx.moveTo(x, y); pen = true; } else ectx.lineTo(x, y);
    }
    ectx.stroke();
    const hv = ecg.values[head];
    if (!Number.isNaN(hv)) {
      ectx.shadowBlur = 18; ectx.fillStyle = '#ffd9d8';
      ectx.beginPath(); ectx.arc(head, base - hv * amp, 3.2, 0, Math.PI * 2); ectx.fill();
    }
    ectx.shadowBlur = 0;
  }

  function drawParticles(time: number, f60: number, animate: boolean) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    beat += animate ? f60 / 60 : 0;
    const sys = !animate ? 0 : beat < .09 ? beat / .09 : Math.exp(-(beat - .09) * 5.5);
    hero.style.setProperty('--latido', sys.toFixed(3));
    const s = markH * (1 - .05 * sys);
    const k = .05 * f60, damp = Math.pow(.83, f60);
    const R = 120, R2 = R * R;
    const fade = 1 - scrollP;
    for (const p of particles) {
      let tx: number, ty: number;
      if (p.ambient) {
        tx = p.nx * W + Math.sin(time * .3 + p.ph) * 8; ty = p.ny * H - (time * 6 + p.ph * 30) % (H + 40) + H * .1;
        if (ty < -20) ty += H + 40;
        p.x = tx; p.y = ty;
      } else {
        tx = center.x + p.nx * s + Math.sin(time * .9 + p.ph) * 1.2;
        ty = center.y + p.ny * s + Math.cos(time * .7 + p.ph) * 1.2;
        if (scrollP > 0) { tx += p.dx * scrollP * W * .45; ty += p.dy * scrollP * H * .45 - scrollP * 140; }
        if (animate) {
          if (time > p.delay) {
            const mx = p.x - mouse.x, my = p.y - mouse.y, d2 = mx * mx + my * my;
            if (d2 < R2) { const dd = Math.sqrt(d2) || 1, fo = (1 - dd / R) * 3.2 * f60; p.vx += (mx / dd) * fo; p.vy += (my / dd) * fo; }
            p.vx = (p.vx + (tx - p.x) * k) * damp; p.vy = (p.vy + (ty - p.y) * k) * damp;
            p.x += p.vx * f60; p.y += p.vy * f60;
          }
        } else { p.x = tx; p.y = ty; }
      }
      const appear = animate ? Math.min(1, Math.max(0, (time - p.delay) / .7)) : 1;
      const tw = p.ambient ? .5 + .5 * Math.sin(time * 1.6 + p.ph) : 1;
      const a = p.alpha * appear * fade * tw * (.82 + .3 * sys);
      if (a < .01) continue;
      const size = p.size * (1 + .3 * sys) * 2.2;
      ctx.globalAlpha = Math.min(1, a);
      ctx.drawImage(sprites[p.sprite], p.x - size / 2, p.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  function frame(now: number) {
    if (!running) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const time = (now - start) / 1000;
    stepEcg(dt);
    drawEcg();
    if (ready) drawParticles(time, dt * 60, true);
    requestAnimationFrame(frame);
  }

  function renderStatic() {
    // Imagen fija: símbolo completo y un trazo entero, sin movimiento
    const L = ecg.speed * ecg.period;
    for (let x = 0; x < EW; x++) ecg.values[x] = wave(((x + L * .4) % L) / L);
    ecg.head = EW + 100;
    drawEcg();
    if (ready) drawParticles(10, 1, false);
    hero.style.setProperty('--latido', '0');
  }

  function update() {
    const should = visible && !userPaused && !reduced() && !document.hidden;
    if (should && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    else if (!should && running) { running = false; }
    if (!should && (reduced() || userPaused)) renderStatic();
    if (pauseBtn) {
      const paused = userPaused || reduced();
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.hidden = reduced() && !userPaused;
      const lbl = pauseBtn.querySelector('[data-label]');
      if (lbl) lbl.textContent = paused ? pauseBtn.dataset.play! : pauseBtn.dataset.pause!;
      pauseBtn.classList.toggle('en-pausa', paused);
    }
  }

  // Eventos
  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  pauseBtn?.addEventListener('click', () => { userPaused = !userPaused; update(); });
  const onScroll = () => {
    scrollP = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * .85)));
    if (!running && visible && ready && (reduced() || userPaused)) drawParticles(10, 1, false);
  };
  addEventListener('scroll', onScroll, { passive: true });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; update(); }).observe(hero);
  document.addEventListener('visibilitychange', update);
  mq.addEventListener('change', update);
  document.addEventListener('a11y:change', update);
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = window.setTimeout(() => { layout(); if (!running) renderStatic(); }, 120); });

  layout();
  buildParticles().then(() => {
    hero.classList.add('lienzo-listo');
    start = performance.now();
    if (reduced()) renderStatic();
    update();
  });
}
