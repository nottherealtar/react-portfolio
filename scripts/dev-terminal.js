/**
 * Terminal boot sequence for /dev/ui-lab.html
 * Skippable; respects prefers-reduced-motion.
 */
(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const outputEl = document.getElementById('dev-terminal-output');
  const currentEl = document.getElementById('dev-terminal-current');
  const skipBtn = document.getElementById('dev-terminal-skip');
  if (!outputEl || !currentEl) return;

  const commands = [
    {
      input: 'cat about_josh.txt',
      output: [
        { text: 'Joshua Coetzer — Automation & Integration Specialist', className: 'dev-terminal__line--ok' },
        { text: 'Location: Johannesburg, South Africa (SAST)', className: 'dev-terminal__line--info' },
        { text: 'Stack: Python · Azure · Freshworks · APIs', className: '' },
      ],
      delay: 500,
    },
    {
      input: './check_services.sh',
      output: [
        { text: '[ok] Process automation pipelines', className: 'dev-terminal__line--ok' },
        { text: '[ok] Azure Logic Apps orchestration', className: 'dev-terminal__line--ok' },
        { text: '[ok] Freshworks CRM/FSM integrations', className: 'dev-terminal__line--ok' },
        { text: '[warn] Manual workflows detected — ready to fix', className: 'dev-terminal__line--warn' },
      ],
      delay: 450,
    },
    {
      input: 'echo $VALUE_PROP',
      output: [
        { text: 'I automate what slows your business down.', className: 'dev-terminal__line--info' },
      ],
      delay: 400,
    },
  ];

  let cancelled = false;

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function appendLine(text, className) {
    const line = document.createElement('p');
    line.className = 'dev-terminal__line ' + (className || 'dev-terminal__line--cmd');
    line.textContent = text;
    outputEl.appendChild(line);
  }

  function renderStatic() {
    commands.forEach((cmd) => {
      appendLine('$ ' + cmd.input, 'dev-terminal__line--cmd');
      cmd.output.forEach((line) => appendLine(line.text, line.className));
    });
    currentEl.textContent = '';
    currentEl.hidden = true;
    if (skipBtn) skipBtn.hidden = true;
  }

  async function typeText(text, speed) {
    currentEl.hidden = false;
    for (let i = 0; i <= text.length; i++) {
      if (cancelled) return;
      currentEl.textContent = text.slice(0, i);
      await sleep(speed);
    }
  }

  async function run() {
    if (reducedMotion) {
      renderStatic();
      return;
    }

    const speed = 38;

    for (const cmd of commands) {
      if (cancelled) break;
      await typeText('$ ' + cmd.input, speed);
      appendLine('$ ' + cmd.input, 'dev-terminal__line--cmd');
      currentEl.textContent = '';
      await sleep(280);

      for (const line of cmd.output) {
        if (cancelled) break;
        appendLine(line.text, line.className);
        await sleep(70);
      }

      await sleep(cmd.delay || 400);
    }

    currentEl.hidden = true;
    if (skipBtn) skipBtn.hidden = true;
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      cancelled = true;
      outputEl.innerHTML = '';
      renderStatic();
    });
  }

  run();
})();
