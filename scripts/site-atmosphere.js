/**
 * Soft rising steam wisps — organic puffs, not vertical streaks.
 * Respects prefers-reduced-motion and pauses when tab is hidden.
 */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const container = document.getElementById('canvas-container');
  if (!container) return;

  const existing = container.querySelector('canvas:not(.hero-globe-canvas)');
  if (existing) existing.remove();

  const canvas = document.createElement('canvas');
  canvas.id = 'site-atmosphere-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isMobile = () => window.innerWidth < 768;
  const wispCount = () => (isMobile() ? 6 : 11);

  /** @type {Array<{x:number,y:number,vx:number,vy:number,age:number,life:number,r:number,rx:number,ry:number,rot:number,drift:number,alpha:number}>} */
  let wisps = [];
  let width = 0;
  let height = 0;
  let running = true;
  let rafId = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnWisp(fromBottomBias) {
    const biased = fromBottomBias !== false && Math.random() < 0.82;
    let x;
    const lane = Math.random();
    if (lane < 0.38) {
      x = width * (0.04 + Math.random() * 0.22);
    } else if (lane < 0.76) {
      x = width * (0.74 + Math.random() * 0.22);
    } else {
      x = width * (0.28 + Math.random() * 0.44);
    }
    const y = biased
      ? height * (0.78 + Math.random() * 0.24)
      : height * (0.55 + Math.random() * 0.4);
    const r = 22 + Math.random() * 36;

    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 0.1,
      vy: -(0.06 + Math.random() * 0.11),
      age: 0,
      life: 320 + Math.random() * 260,
      r,
      rx: 0.9 + Math.random() * 0.3,
      ry: 1.15 + Math.random() * 0.35,
      rot: Math.random() * Math.PI,
      drift: Math.random() * Math.PI * 2,
      alpha: 0.028 + Math.random() * 0.032,
    };
  }

  function resetWisp(w) {
    const fresh = spawnWisp(true);
    Object.assign(w, fresh);
  }

  function initWisps() {
    wisps = [];
    const n = wispCount();
    for (let i = 0; i < n; i++) {
      const w = spawnWisp(false);
      w.age = Math.random() * w.life;
      wisps.push(w);
    }
  }

  function drawWisp(w) {
    const t = w.age / w.life;
    const fade = Math.sin(t * Math.PI);
    if (fade <= 0.01) return;

    const expand = 1 + t * 1.35;
    const rx = w.r * w.rx * expand;
    const ry = w.r * w.ry * expand;
    const alpha = w.alpha * fade;

    const grad = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, Math.max(rx, ry));
    grad.addColorStop(0, `rgba(247, 239, 226, ${alpha * 0.55})`);
    grad.addColorStop(0.35, `rgba(201, 169, 110, ${alpha * 0.35})`);
    grad.addColorStop(0.7, `rgba(161, 134, 111, ${alpha * 0.12})`);
    grad.addColorStop(1, 'rgba(161, 134, 111, 0)');

    ctx.save();
    ctx.translate(w.x, w.y);
    ctx.rotate(w.rot + Math.sin(w.drift) * 0.08);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    if (!running) return;

    ctx.clearRect(0, 0, width, height);

    for (const w of wisps) {
      w.age += 1;
      w.drift += 0.012;
      w.x += w.vx + Math.sin(w.drift) * 0.18;
      w.y += w.vy;
      w.rot += 0.0008;

      if (w.age >= w.life || w.y < -w.r * 2) {
        resetWisp(w);
        continue;
      }

      drawWisp(w);
    }

    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    tick();
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  resize();
  initWisps();
  tick();

  window.addEventListener('resize', () => {
    resize();
    initWisps();
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });
})();
