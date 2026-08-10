/**
 * Interactive process orchestrator for /dev/ui-lab.html Phase 3.
 * Scroll-scrubbed activation, hover/click focus, SVG packet flow, live activity log.
 */
(function () {
  const root = document.getElementById('dev-flow');
  if (!root) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const steps = [
    {
      id: 'discovery',
      num: '01',
      icon: '☕',
      title: 'Discovery',
      tagline: 'Map the mess before we automate it',
      summary: 'We trace how work actually moves through your team — not how the org chart says it should.',
      deliverables: ['Workflow audit', 'Pain-point map', 'Integration inventory', 'Scoped proposal'],
      duration: '3–5 days',
      tools: ['Miro', 'Freshworks API', 'Process interviews'],
      logs: [
        { level: 'info', text: 'Connecting to Freshdesk — reading ticket routing rules…' },
        { level: 'ok', text: 'Found 4 manual handoffs between CRM and spreadsheets' },
        { level: 'warn', text: 'Duplicate data entry on quote → invoice flow' },
        { level: 'info', text: 'POPIA data residency requirements captured' },
      ],
    },
    {
      id: 'build',
      num: '02',
      icon: '⚙️',
      title: 'Build',
      tagline: 'Wire the systems, test the edges',
      summary: 'Logic Apps orchestration, Python where it counts, and APIs that fail gracefully — not just happily.',
      deliverables: ['Azure Logic Apps', 'Python workers', 'Webhook endpoints', 'Error alerting'],
      duration: '2–6 weeks',
      tools: ['Azure', 'Python', 'REST APIs', 'GitHub Actions'],
      logs: [
        { level: 'info', text: 'Deploying logic_app_orchestrator v1.2…' },
        { level: 'ok', text: 'Freshworks → Azure sync: 200 OK (847 records)' },
        { level: 'ok', text: 'Retry policy: 3 attempts, exponential backoff' },
        { level: 'info', text: 'Running integration test suite… 12/12 passed' },
      ],
    },
    {
      id: 'deliver',
      num: '03',
      icon: '🚀',
      title: 'Deliver',
      tagline: 'Handover you can run without me',
      summary: 'Documentation, walkthrough, and monitoring so the system keeps working when priorities shift.',
      deliverables: ['Runbook docs', 'Walkthrough session', 'Monitoring dashboard', '30-day support'],
      duration: '1 week',
      tools: ['Azure Monitor', 'Notion', 'Loom', 'Support SLA'],
      logs: [
        { level: 'ok', text: 'Production deployment verified' },
        { level: 'info', text: 'Handover session scheduled — stakeholders invited' },
        { level: 'ok', text: 'Runbook published: 24 pages, searchable' },
        { level: 'info', text: 'Monitoring alerts: response time < 2s, error rate < 0.1%' },
      ],
    },
  ];

  const chapters = root.querySelectorAll('.dev-flow__chapter');
  const nodes = root.querySelectorAll('.dev-flow__node');
  const paths = root.querySelectorAll('.dev-flow__path');
  const packets = root.querySelectorAll('.dev-flow__packet');
  const statusEl = root.querySelector('[data-flow-status]');
  const meterFill = root.querySelector('.dev-flow__meter-fill');
  const detailTitle = root.querySelector('[data-detail-title]');
  const detailTagline = root.querySelector('[data-detail-tagline]');
  const detailSummary = root.querySelector('[data-detail-summary]');
  const detailDeliverables = root.querySelector('[data-detail-deliverables]');
  const detailDuration = root.querySelector('[data-detail-duration]');
  const detailTools = root.querySelector('[data-detail-tools]');
  const logEl = root.querySelector('[data-flow-log]');

  let activeIndex = 0;
  let logTimers = [];
  let packetRaf = 0;
  let packetPhase = 0;

  function clearLogTimers() {
    logTimers.forEach(clearTimeout);
    logTimers = [];
  }

  function renderLogLines(stepIndex, animate) {
    if (!logEl) return;
    clearLogTimers();
    logEl.innerHTML = '';

    const lines = steps[stepIndex].logs;
    if (!animate || reducedMotion) {
      lines.forEach((line) => appendLogLine(line));
      return;
    }

    lines.forEach((line, i) => {
      const timer = setTimeout(() => appendLogLine(line), 180 + i * 420);
      logTimers.push(timer);
    });
  }

  function appendLogLine(line) {
    const row = document.createElement('div');
    row.className = 'dev-flow__log-line dev-flow__log-line--' + line.level;
    row.textContent = line.text;
    logEl.appendChild(row);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function updateDetail(index) {
    const step = steps[index];
    if (!step) return;

    if (detailTitle) detailTitle.textContent = step.title;
    if (detailTagline) detailTagline.textContent = step.tagline;
    if (detailSummary) detailSummary.textContent = step.summary;
    if (detailDuration) detailDuration.textContent = step.duration;

    if (detailDeliverables) {
      detailDeliverables.innerHTML = step.deliverables
        .map((d) => '<span class="dev-flow__tag">' + d + '</span>')
        .join('');
    }

    if (detailTools) {
      detailTools.innerHTML = step.tools
        .map((t) => '<span class="dev-flow__tool">' + t + '</span>')
        .join('');
    }

    if (statusEl) {
      statusEl.textContent = step.id + ' :: running';
      statusEl.dataset.phase = step.id;
    }

    renderLogLines(index, true);
  }

  function setActive(index, options) {
    const opts = options || {};
    const clamped = Math.max(0, Math.min(steps.length - 1, index));
    if (clamped === activeIndex && !opts.force) return;

    activeIndex = clamped;

    nodes.forEach((node, i) => {
      const isActive = i === activeIndex;
      const isPast = i < activeIndex;
      node.classList.toggle('is-active', isActive);
      node.classList.toggle('is-past', isPast);
      node.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    chapters.forEach((ch, i) => {
      ch.classList.toggle('is-active', i === activeIndex);
      ch.classList.toggle('is-past', i < activeIndex);
    });

    paths.forEach((path, i) => {
      path.classList.toggle('is-active', i < activeIndex);
      path.classList.toggle('is-flowing', i === activeIndex - 1 || (activeIndex > i));
    });

    if (meterFill) {
      meterFill.style.width = ((activeIndex + 1) / steps.length) * 100 + '%';
    }

    updateDetail(activeIndex);

    root.dataset.activeStep = String(activeIndex);
    root.dispatchEvent(new CustomEvent('flowstep', { detail: { index: activeIndex } }));
  }

  function animatePackets() {
    if (reducedMotion) return;

    packetPhase += 0.008;
    packets.forEach((packet, i) => {
      const path = paths[i];
      if (!path || !path.classList.contains('is-flowing')) {
        packet.style.opacity = '0';
        return;
      }

      const len = path.getTotalLength();
      const offset = (packetPhase + i * 0.33) % 1;
      const point = path.getPointAtLength(offset * len);
      packet.setAttribute('cx', point.x);
      packet.setAttribute('cy', point.y);
      packet.style.opacity = '1';
    });

    packetRaf = requestAnimationFrame(animatePackets);
  }

  nodes.forEach((node, i) => {
    node.addEventListener('click', () => setActive(i, { force: true }));
    node.addEventListener('mouseenter', () => {
      if (!root.classList.contains('is-scrubbing')) setActive(i, { force: true });
    });
  });

  if (!reducedMotion && chapters.length) {
    const chapterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number(entry.target.dataset.step);
          if (!Number.isNaN(idx)) {
            root.classList.add('is-scrubbing');
            setActive(idx, { force: true });
            window.setTimeout(() => root.classList.remove('is-scrubbing'), 400);
          }
        });
      },
      { threshold: 0.55, rootMargin: '-20% 0px -20% 0px' }
    );

    chapters.forEach((ch) => chapterObserver.observe(ch));
  }

  if (!reducedMotion) {
    animatePackets();
  } else {
    paths.forEach((p) => p.classList.add('is-active'));
    packets.forEach((p) => { p.style.opacity = '0'; });
  }

  setActive(0, { force: true });

  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(packetRaf);
    clearLogTimers();
  });
})();
