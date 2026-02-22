// Sticky navigation: scroll behaviour + active section tracking
(function () {
  const nav = document.querySelector('.site-nav');
  const hamburger = document.querySelector('.nav-hamburger');
  const overlay = document.querySelector('.nav-mobile-overlay');
  const mobileLinks = overlay ? overlay.querySelectorAll('a') : [];
  const desktopLinks = document.querySelectorAll('.nav-links a[data-section]');

  if (!nav) return;

  // Scroll: add .scrolled class after 80px
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on init

  // Hamburger toggle
  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      if (isOpen) {
        overlay.style.display = 'flex';
        requestAnimationFrame(() => overlay.classList.add('open'));
        document.body.style.overflow = 'hidden';
      } else {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        overlay.addEventListener('transitionend', () => {
          if (!overlay.classList.contains('open')) overlay.style.display = 'none';
        }, { once: true });
      }
    });

    // Close overlay on any link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        overlay.addEventListener('transitionend', () => {
          if (!overlay.classList.contains('open')) overlay.style.display = 'none';
        }, { once: true });
      });
    });
  }

  // Active link tracking via IntersectionObserver
  if ('IntersectionObserver' in window && desktopLinks.length) {
    const sections = {};
    desktopLinks.forEach(link => {
      const id = link.dataset.section;
      const el = document.getElementById(id);
      if (el) sections[id] = el;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        desktopLinks.forEach(link => {
          if (link.dataset.section === id) {
            link.classList.toggle('active', entry.isIntersecting);
          }
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    Object.values(sections).forEach(el => observer.observe(el));
  }
})();
