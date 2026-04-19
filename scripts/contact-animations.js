/**
 * Contact form — Web3Forms submission + animated feedback states
 */
(function () {
  function initContactForm() {
    const form      = document.getElementById('contact-form');
    const submitBtn = document.getElementById('cf-submit');
    const successEl = document.getElementById('contact-success');
    const resetBtn  = document.getElementById('cf-reset');

    if (!form || !submitBtn || !successEl) return;
    if (form.dataset.contactInit === 'true') return;
    form.dataset.contactInit = 'true';

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function resetHcaptcha() {
      try {
        if (typeof hcaptcha !== 'undefined' && typeof hcaptcha.reset === 'function') {
          hcaptcha.reset();
        }
      } catch (_) { /* noop */ }
    }

  // ── Validation ────────────────────────────────────────
    function validateField(id, errorId, test, msg) {
      const input = document.getElementById(id);
      const error = document.getElementById(errorId);
      if (!input || !error) return true;
      const ok = test(input.value);
      error.textContent = ok ? '' : msg;
      input.classList.toggle('field-invalid', !ok);
      return ok;
    }

    function validateAll() {
      const n = validateField('cf-name',    'cf-name-error',    v => v.trim().length > 0,         'Name is required.');
      const e = validateField('cf-email',   'cf-email-error',   v => EMAIL_RE.test(v.trim()),     'Enter a valid email address.');
      const t = validateField('cf-type',    'cf-type-error',    v => v !== '',                    'Please select a project type.');
      const m = validateField('cf-message', 'cf-message-error', v => v.trim().length > 10,        'Tell me a bit more (at least 10 characters).');
      return n && e && t && m;
    }

  // Clear per-field error on input
    ['cf-name','cf-email','cf-type','cf-message'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => {
        const errEl = document.getElementById(id + '-error');
        if (errEl) errEl.textContent = '';
        el.classList.remove('field-invalid');
      });
    });

  // ── Button states ─────────────────────────────────────
    function setBtn(state) {
      const states = {
        default: { text: 'Send it ☕',   disabled: false, cls: '' },
        loading: { text: 'Brewing…',     disabled: true,  cls: 'btn-loading' },
        error:   { text: 'Try again',    disabled: false, cls: 'btn-error' },
      };
      const s = states[state] || states.default;
      submitBtn.textContent = s.text;
      submitBtn.disabled    = s.disabled;
      submitBtn.className   = 'contact-submit ' + s.cls;
    }

  // ── Show success state ────────────────────────────────
    function showSuccess() {
      form.style.opacity = '0';
      form.style.transform = 'translateY(-8px)';
      form.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      setTimeout(() => {
        form.hidden = true;
        form.style.opacity = '';
        form.style.transform = '';
        successEl.hidden = false;
        successEl.classList.add('success-visible');
      }, 350);
    }

    function setGlobalError(message) {
      const globalError = document.getElementById('cf-global-error');
      if (!globalError) return;
      globalError.textContent = message || '';
      globalError.hidden = !message;
    }

  // ── Reset to form state ───────────────────────────────
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        successEl.hidden = true;
        successEl.classList.remove('success-visible');
        form.hidden = false;
        form.reset();
        resetHcaptcha();
        setGlobalError('');
        setBtn('default');
      });
    }

  // ── Shake animation on error ──────────────────────────
    function shakeBtn() {
      submitBtn.classList.add('btn-shake');
      submitBtn.addEventListener('animationend', () => {
        submitBtn.classList.remove('btn-shake');
      }, { once: true });
    }

  // ── Submit ────────────────────────────────────────────
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setGlobalError('');
      const captchaErr = document.getElementById('cf-captcha-error');
      if (captchaErr) captchaErr.textContent = '';
      if (!validateAll()) { shakeBtn(); return; }

      const hcaptchaField = form.querySelector('textarea[name="h-captcha-response"]');
      if (hcaptchaField && !hcaptchaField.value.trim()) {
        if (captchaErr) captchaErr.textContent = 'Please complete the verification.';
        shakeBtn();
        return;
      }

      setBtn('loading');

      const name = document.getElementById('cf-name')?.value?.trim() ?? '';
      const email = document.getElementById('cf-email')?.value?.trim() ?? '';
      const company = document.getElementById('cf-company')?.value?.trim() ?? '';
      const project_type = document.getElementById('cf-type')?.value ?? '';
      const message = document.getElementById('cf-message')?.value?.trim() ?? '';
      const hCaptchaResponse = hcaptchaField?.value?.trim() ?? '';

      try {
        const res = await fetch('/api/submit-contact', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            company,
            project_type,
            message,
            hCaptchaResponse,
          }),
        });

        const json = await res.json().catch(() => ({}));

        if (res.ok && json.success) {
          showSuccess();
        } else {
          setBtn('error');
          resetHcaptcha();
          setGlobalError(
            json.message || 'Submission failed. Please try again in a few minutes.'
          );
          shakeBtn();
        }
      } catch {
        setBtn('error');
        resetHcaptcha();
        setGlobalError('Network error while sending. Please try again.');
        shakeBtn();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm, { once: true });
  } else {
    initContactForm();
  }
})();
