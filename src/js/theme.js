// Motyw jasny/ciemny. Ładowany w <head> (bez defer), żeby zapisany wybór działał przed pierwszym malowaniem.
// Bez JS strona i tak podąża za ustawieniem systemu (prefers-color-scheme w CSS).
(() => {
  const root = document.documentElement;
  const KEY = 'theme';
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
  } catch { /* tryb prywatny / zablokowane dane strony */ }

  const systemDark = matchMedia('(prefers-color-scheme: dark)');
  const current = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    const sync = () => btn.setAttribute('aria-pressed', String(current() === 'dark'));
    btn.hidden = false;
    sync();
    btn.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem(KEY, next); } catch { /* wybór działa do końca wizyty */ }
      sync();
    });
    systemDark.addEventListener('change', sync);
  });
})();
