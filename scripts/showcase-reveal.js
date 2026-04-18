/**
 * Scroll reveal for [data-reveal]: one IntersectionObserver, rAF-batched class writes,
 * per-target unobserve, clears will-change after transition.
 * Call window.refreshScrollReveal() after injecting new [data-reveal] nodes (e.g. blog list).
 */
(function () {
  if (window.__portfolioRevealInit) return;
  window.__portfolioRevealInit = true;

  var sel = '[data-reveal]';
  var root = document.documentElement;

  function revealAll() {
    document.querySelectorAll(sel).forEach(function (el) {
      el.classList.add('is-revealed');
      el.classList.add('reveal-animated');
    });
  }

  function onTransitionEnd(ev) {
    if (ev.propertyName !== 'opacity' && ev.propertyName !== 'transform') return;
    ev.target.classList.add('reveal-animated');
    ev.target.removeEventListener('transitionend', onTransitionEnd);
  }

  function attachRevealCleanup(el) {
    el.addEventListener('transitionend', onTransitionEnd);
  }

  if (root.classList.contains('reveal-complete')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', revealAll, { once: true });
    } else {
      revealAll();
    }
    window.refreshScrollReveal = function () {};
    return;
  }

  if (!root.classList.contains('has-scroll-reveal')) {
    window.refreshScrollReveal = function () {};
    return;
  }

  var io = null;
  var pending = new Set();
  var rafScheduled = false;

  function flushPending() {
    rafScheduled = false;
    if (!pending.size) return;
    pending.forEach(function (el) {
      el.classList.add('is-revealed');
      attachRevealCleanup(el);
      if (io) io.unobserve(el);
    });
    pending.clear();
  }

  function scheduleReveal(el) {
    if (el.classList.contains('is-revealed') || pending.has(el)) return;
    pending.add(el);
    if (!rafScheduled) {
      rafScheduled = true;
      requestAnimationFrame(flushPending);
    }
  }

  io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) scheduleReveal(entry.target);
      });
    },
    {
      root: null,
      rootMargin: '100px 0px 60px 0px',
      threshold: [0, 0.08, 0.15],
    }
  );

  function observe() {
    document.querySelectorAll(sel).forEach(function (el) {
      io.observe(el);
    });
  }

  window.refreshScrollReveal = function () {
    if (!io || root.classList.contains('reveal-complete')) return;
    document.querySelectorAll(sel).forEach(function (el) {
      if (!el.classList.contains('is-revealed')) {
        io.observe(el);
      }
    });
  };

  function onReducedMotionChange() {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    revealAll();
    root.classList.remove('has-scroll-reveal');
    root.classList.add('reveal-complete');
    pending.clear();
    if (io) {
      io.disconnect();
      io = null;
    }
    window.refreshScrollReveal = function () {};
  }

  try {
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', onReducedMotionChange);
  } catch (_) {
    try {
      window.matchMedia('(prefers-reduced-motion: reduce)').addListener(onReducedMotionChange);
    } catch (_) { /* noop */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observe, { once: true });
  } else {
    observe();
  }
})();
