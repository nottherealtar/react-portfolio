/**
 * Coffee boot sequence for north-star prototype (edh.dev-style entry ritual).
 */
(function () {
  const boot = document.getElementById('ns-boot');
  if (!boot) return;

  const fill = boot.querySelector('.ns-boot__fill');
  const status = boot.querySelector('.ns-boot__status');
  const skipBtn = boot.querySelector('.ns-boot__skip');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const steps = [
    { pct: 20, text: 'Grinding beans…' },
    { pct: 45, text: 'Heating the group head…' },
    { pct: 70, text: 'Warming the globe…' },
    { pct: 92, text: 'Pulling the first shot…' },
    { pct: 100, text: 'Ready.' },
  ];

  let cancelled = false;

  function finish() {
    boot.classList.add('is-done');
    document.documentElement.classList.add('ns-ready');
  }

  function skip() {
    cancelled = true;
    if (fill) fill.style.width = '100%';
    if (status) status.textContent = 'Ready.';
    finish();
  }

  if (skipBtn) skipBtn.addEventListener('click', skip);

  if (reduced) {
    skip();
    return;
  }

  async function run() {
    for (const step of steps) {
      if (cancelled) break;
      if (fill) fill.style.width = step.pct + '%';
      if (status) status.textContent = step.text;
      await new Promise((r) => setTimeout(r, 520));
    }
    if (!cancelled) {
      await new Promise((r) => setTimeout(r, 280));
      finish();
    }
  }

  run();
})();
