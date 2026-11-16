(() => {
  document.documentElement.classList.add('js');

  // Nagłówek: przezroczysty nad hero, jasne tło po przewinięciu (jak na oryginale).
  const header = document.getElementById('nav');
  if (header && !header.classList.contains('is-solid')) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Menu mobilne: pełnoekranowa nakładka.
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('menu');
  if (toggle && menu && header) {
    toggle.hidden = false;
    const setOpen = (open) => {
      menu.classList.toggle('is-open', open);
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Rozwiń menu');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    matchMedia('(min-width: 700px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  // Wideo w hero: start z JS (wyciszone), pomijane przy „ogranicz ruch”.
  const video = document.querySelector('.hero-video');
  if (video && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.muted = true;
    video.play().catch(() => {}); // bez autoplay w HTML (html-validate); poster zostaje, jeśli przeglądarka zablokuje
  }

  // Daty: przyjazd od dziś, wyjazd min. 2 noce później (minimalny pobyt).
  const checkin = document.getElementById('checkin');
  const checkout = document.getElementById('checkout');
  if (checkin && checkout) {
    const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    checkin.min = iso(new Date());
    checkin.addEventListener('change', () => {
      if (!checkin.value) return;
      const d = new Date(checkin.value + 'T12:00:00');
      d.setDate(d.getDate() + 2);
      checkout.min = iso(d);
      if (checkout.value && checkout.value < checkout.min) checkout.value = checkout.min;
    });
  }

  // Formularz: wysyłka w tle tylko gdy action to endpoint https (np. Formspree).
  // Przy action="mailto:" przeglądarka otwiera program pocztowy.
  const form = document.getElementById('lead-form');
  const status = document.getElementById('form-status');
  if (!form || !status || !/^https:\/\//.test(form.getAttribute('action') || '')) return;

  // Messages live in data-msg-* attributes on the form so they can be translated in HTML.
  const msg = (key) => form.dataset['msg' + key[0].toUpperCase() + key.slice(1)] || '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    status.textContent = msg('sending');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.textContent = msg('success');
    } catch {
      status.textContent = msg('error');
    } finally {
      if (btn) btn.disabled = false;
    }
  });
})();
