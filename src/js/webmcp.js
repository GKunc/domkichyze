// WebMCP: expose safe, read-only-ish page tools to in-browser AI agents.
// The API is still experimental and its name changed between Chrome versions
// (navigator.modelContext -> document.modelContext). Verify against current
// Chrome docs before relying on it. Always feature-detect.
(() => {
  const ctx = document.modelContext || navigator.modelContext;
  if (!ctx || typeof ctx.registerTool !== 'function') return;

  const text = (t) => ({ content: [{ type: 'text', text: t }] });
  const sections = ['nasze-domki', 'cennik', 'atrakcje', 'o-nas', 'dodatki', 'rezerwacja'];

  try {
    ctx.registerTool({
      name: 'get_page_summary',
      description: 'Zwraca tytuł strony, nagłówek i cennik Domków Chyże 3 (ceny za dobę za cały domek).',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => text(JSON.stringify({
        title: document.title,
        headline: document.querySelector('h1')?.textContent.trim(),
        prices: [...document.querySelectorAll('.price-card')].map((c) => ({
          season: c.querySelector('h3')?.textContent.trim(),
          dates: c.querySelector('p')?.textContent.replace(/\s+/g, ' ').trim(),
          price: c.querySelector('.price')?.textContent.replace(/\s+/g, ' ').trim(),
        })),
        minimumStay: '2 noce',
        contact: { email: 'kontakt@domkichyze.pl', phone: '+48 696 166 002' },
      })),
    });

    ctx.registerTool({
      name: 'scroll_to_section',
      description: 'Przewija stronę do sekcji: nasze-domki, cennik, atrakcje, o-nas, dodatki, rezerwacja.',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', enum: sections } },
        required: ['id'],
      },
      execute: async ({ id }) => {
        const el = document.getElementById(id);
        if (!el) return text('Section not found');
        el.scrollIntoView({ behavior: 'smooth' });
        return text('Scrolled to ' + id);
      },
    });
  } catch (err) {
    console.warn('WebMCP registration failed', err);
  }
})();
