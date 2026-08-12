/**
 * Scroll- and tap-reactive process timeline for /dev/ui-lab.html Phase 3.
 * Evolves the production "How it works" section — no dashboards or fake logs.
 */
(function () {
  const root = document.getElementById('dev-process');
  if (!root) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const steps = root.querySelectorAll('.dev-process__step');
  const pourFill = root.querySelector('.dev-process__pour-fill');
  const pourLength = 340;

  let activeIndex = 0;

  function setActive(index) {
    const clamped = Math.max(0, Math.min(steps.length - 1, index));
    if (clamped === activeIndex && root.dataset.activeStep === String(clamped)) return;

    activeIndex = clamped;
    root.dataset.activeStep = String(clamped);

    steps.forEach((step, i) => {
      const isActive = i === activeIndex;
      const isPast = i < activeIndex;
      step.classList.toggle('is-active', isActive);
      step.classList.toggle('is-past', isPast);

      const btn = step.querySelector('.dev-process__node');
      if (btn) btn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    if (pourFill) {
      const progress = steps.length > 1 ? activeIndex / (steps.length - 1) : 0;
      const offset = pourLength - progress * pourLength;
      pourFill.style.strokeDashoffset = String(offset);
    }
  }

  steps.forEach((step, i) => {
    const btn = step.querySelector('.dev-process__node');
    if (btn) {
      btn.addEventListener('click', () => setActive(i));
    }
  });

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number(entry.target.dataset.step);
          if (!Number.isNaN(idx)) setActive(idx);
        });
      },
      { threshold: 0.6, rootMargin: '-12% 0px -30% 0px' }
    );

    steps.forEach((step) => observer.observe(step));
  }

  if (pourFill) {
    pourFill.style.strokeDasharray = String(pourLength);
    pourFill.style.strokeDashoffset = reducedMotion ? '0' : String(pourLength);
  }

  if (reducedMotion) {
    steps.forEach((step) => {
      step.classList.add('is-active', 'is-past');
    });
    if (pourFill) pourFill.style.strokeDashoffset = '0';
  } else {
    setActive(0);
  }
})();
