/**
 * Micro-interactions for /dev/ui-lab.html: scroll progress, section reveal, pipeline fill.
 */
(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progressBar = document.querySelector('.dev-scroll-progress');
  if (progressBar && !reducedMotion) {
    let ticking = false;

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });

    updateProgress();
  } else if (progressBar) {
    progressBar.style.width = '100%';
  }

  const sections = document.querySelectorAll('.dev-lab__section');
  if (sections.length) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      sections.forEach((el) => el.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );

      sections.forEach((el) => observer.observe(el));
    }
  }

  const pipeline = document.querySelector('.dev-pipeline');
  const pipelineFill = document.querySelector('.dev-pipeline__fill');
  const pipelineSteps = document.querySelectorAll('.dev-pipeline__step');

  if (pipeline && pipelineFill && pipelineSteps.length && !reducedMotion) {
    const pipelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const ratio = entry.intersectionRatio;
          const activeCount = Math.min(
            pipelineSteps.length,
            Math.max(1, Math.ceil(ratio * pipelineSteps.length + 0.3))
          );

          pipelineFill.style.width = ((activeCount - 1) / (pipelineSteps.length - 1)) * 100 + '%';

          pipelineSteps.forEach((step, index) => {
            step.classList.toggle('is-active', index < activeCount);
          });
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    pipelineObserver.observe(pipeline);
    pipelineSteps[0].classList.add('is-active');
  } else if (pipelineSteps.length) {
    pipelineSteps.forEach((step) => step.classList.add('is-active'));
    if (pipelineFill) pipelineFill.style.width = '100%';
  }
})();
