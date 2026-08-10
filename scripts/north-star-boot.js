/**
 * Boot sequence — PC startup meets coffee ritual (north-star preview).
 */
(function () {
  const boot = document.getElementById('ns-boot');
  if (!boot) return;

  const fill = boot.querySelector('.ns-boot__fill');
  const status = boot.querySelector('.ns-boot__status');
  const skipBtn = boot.querySelector('.ns-boot__skip');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const steps = [
    { pct: 18, text: 'POST… OK' },
    { pct: 38, text: 'Grinding beans…' },
    { pct: 58, text: 'Mounting ~/integrations…' },
    { pct: 78, text: 'Heating the group head…' },
    { pct: 94, text: 'Starting cafe-shell…' },
    { pct: 100, text: 'Ready.' },
  ];

  let cancelled = false;

  function finish() {
    boot.classList.add('is-done');
    document.documentElement.classList.add('ns-ready');
    document.dispatchEvent(new CustomEvent('ns-boot-done'));
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
      await new Promise((r) => setTimeout(r, 480));
    }
    if (!cancelled) {
      await new Promise((r) => setTimeout(r, 260));
      finish();
    }
  }

  run();
})();
