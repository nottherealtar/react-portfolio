/**
 * Idle terminal lines on the north-star monitor after boot completes.
 */
(function () {
  const screen = document.getElementById('ns-monitor-screen');
  if (!screen) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lines = [
    { prompt: true, text: 'login josh' },
    { text: 'TarsOnlineCafe · Johannesburg' },
    { text: 'I automate what slows your business down.' },
    { prompt: true, text: '_' },
  ];

  function renderStatic() {
    screen.innerHTML = lines
      .map((line) => {
        const cls = line.prompt ? 'ns-monitor__line ns-monitor__line--prompt' : 'ns-monitor__line';
        const content = line.text === '_' ? '<span class="ns-monitor__cursor" aria-hidden="true"></span>' : line.text;
        return '<p class="' + cls + '">' + content + '</p>';
      })
      .join('');
  }

  function startTyping() {
    screen.innerHTML = '';
    let i = 0;

    function next() {
      if (i >= lines.length) return;
      const line = lines[i];
      const row = document.createElement('p');
      row.className = line.prompt ? 'ns-monitor__line ns-monitor__line--prompt' : 'ns-monitor__line';
      screen.appendChild(row);

      if (line.text === '_') {
        row.innerHTML = '<span class="ns-monitor__cursor" aria-hidden="true"></span>';
        i++;
        return;
      }

      let c = 0;
      const text = line.text;
      const tick = () => {
        row.textContent = text.slice(0, c);
        c++;
        if (c <= text.length) {
          setTimeout(tick, 22);
        } else {
          i++;
          setTimeout(next, 320);
        }
      };
      tick();
    }

    next();
  }

  if (reduced) {
    renderStatic();
    return;
  }

  let bootDone = false;
  let scrollDone = false;
  let started = false;

  function tryStart() {
    if (started || !bootDone || !scrollDone) return;
    started = true;
    setTimeout(startTyping, 280);
  }

  document.addEventListener('ns-boot-done', () => {
    bootDone = true;
    tryStart();
  }, { once: true });

  document.addEventListener('ns-scroll-settled', () => {
    scrollDone = true;
    tryStart();
  }, { once: true });
})();
