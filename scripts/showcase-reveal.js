/**
 * One-time scroll reveal for [data-reveal]. Disabled when prefers-reduced-motion.
 */
(function () {
  var sel = '[data-reveal]';

  function revealAll() {
    document.querySelectorAll(sel).forEach(function (el) {
      el.classList.add('is-revealed');
    });
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', revealAll, { once: true });
    } else {
      revealAll();
    }
    return;
  }

  if (!('IntersectionObserver' in window)) {
    revealAll();
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
  );

  function observe() {
    document.querySelectorAll(sel).forEach(function (el) {
      io.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observe, { once: true });
  } else {
    observe();
  }
})();
