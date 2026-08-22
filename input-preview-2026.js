(() => {
  'use strict';

  // Zoé Lista – élő, nem mentő értelmezési előnézet.
  // Gépelés közben csak olvas a katalógusból és az ármemóriából.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const PRICE_MEMORY_KEY = 'zoe-lista-price-memory-v1';

  const FAMILY_COLORS = {
    'Zöldség-gyümölcs':'#55a95a','Pékáru':'#c88a43','Hús és felvágott':'#d45b62',
    'Hal és tenger gyümölcsei':'#4e9bd3','Tejtermék és tojás':'#65b9cf','Fagyasztott':'#7a9fd6',
    'Alapélelmiszer':'#b28b5e','Snack és édesség':'#c46fba','Italok':'#38a5a1',
    'Szeszes italok':'#8b65ad','Háztartás':'#71808b','Higiénia':'#df7f9e',
    'Baba és gyermek':'#dda55d','Állateledel':'#987759','Ruházat':'#6d79cf',
    'Virág és ajándék':'#c85d92','Egyéb':'#7d8589'
  };

  const input = document.getElementById('itemInput');
  const form = document.getElementById('addForm');
  const help = document.querySelector('.composer .quick-help');
  if (!input || !form || !help) return;

  const preview = document.createElement('div');
  preview.id = 'inputPreview';
  preview.className = 'input-preview';
  preview.hidden = true;
  preview.setAttribute('aria-live', 'polite');
  preview.setAttribute('aria-label', 'Zoé értelmezési előnézet');
  help.insertAdjacentElement('afterend', preview);

  function loadJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function money(n) {
    return new Intl.NumberFormat('hu-HU', {maximumFractionDigits:0}).format(Math.round(n)) + ' Ft';
  }

  function num(n) {
    return new Intl.NumberFormat('hu-HU', {maximumFractionDigits:2}).format(n);
  }

  function extractPrice(text) {
    const m = text.match(/(?:^|\s)(\d[\d\s.,]*)\s*(?:ft|forint)\s*$/i);
    if (!m) return {text, price:null};
    return {
      text:text.slice(0, m.index).trim(),
      price:Number(m[1].replace(/\s/g, '').replace(',', '.'))
    };
  }

  function extractQuantity(text) {
    let s = text.trim(), qty = null, unit = null, m;
    const U = 'kg|g|l|ml|db|pár|par|csomag|cs|doboz|üveg|uveg|flakon|zacskó|zacsko';

    m = s.match(new RegExp('^(\\d+(?:[.,]\\d+)?)\\s*(' + U + ')\\s+(.+)$', 'i'));
    if (m) {
      qty = Number(m[1].replace(',', '.')); unit = normalize(m[2]); s = m[3].trim();
    } else {
      m = s.match(new RegExp('^(.+?)\\s+(\\d+(?:[.,]\\d+)?)\\s*(' + U + ')$', 'i'));
      if (m) {
        s = m[1].trim(); qty = Number(m[2].replace(',', '.')); unit = normalize(m[3]);
      } else {
        m = s.match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/);
        if (m) { qty = Number(m[1].replace(',', '.')); s = m[2].trim(); }
        else {
          m = s.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)$/);
          if (m) { s = m[1].trim(); qty = Number(m[2].replace(',', '.')); }
        }
      }
    }

    if (unit === 'g') { qty /= 1000; unit = 'kg'; }
    if (unit === 'ml') { qty /= 1000; unit = 'l'; }
    if (unit === 'uveg' || unit === 'üveg') unit = 'üveg';
    if (unit === 'zacsko' || unit === 'zacskó') unit = 'csomag';
    if (unit === 'cs') unit = 'csomag';
    if (unit === 'par' || unit === 'pár') unit = 'pár';
    return {text:s, qty, unit};
  }

  function findRule(name, learned) {
    const key = normalize(name);
    if (!key) return null;
    if (learned[key]) return {rule:learned[key], exact:true};

    // Biztonságos részleges felismerés: csak teljes szó/phrase és legalább 5 karakter.
    // Így nem tér vissza a korábbi „lé” / „Fa” jellegű substring-hiba.
    const padded = ` ${key} `;
    let best = null;
    let bestAlias = '';
    for (const [alias, rule] of Object.entries(learned)) {
      if (!rule || alias.length < 5) continue;
      if (padded.includes(` ${alias} `) && alias.length > bestAlias.length) {
        best = rule;
        bestAlias = alias;
      }
    }
    return best ? {rule:best, exact:false} : null;
  }

  function parsePreview(raw) {
    const priced = extractPrice(raw.trim());
    const quantity = extractQuantity(priced.text);
    const typedName = quantity.text.trim();
    if (!typedName) return null;

    const learned = loadJson(LEARNED_KEY, {});
    const priceMemory = loadJson(PRICE_MEMORY_KEY, {});
    const key = normalize(typedName);
    const hit = findRule(typedName, learned);
    const rule = hit?.rule || null;
    const mem = priceMemory[key];

    const category = rule?.category || 'Egyéb';
    const icon = rule?.icon || '🛒';
    const label = rule?.label || typedName;
    const defaultUnit = rule?.unit || 'db';
    const unit = quantity.unit || mem?.unit || defaultUnit;
    const qty = Math.max(0.01, quantity.qty ?? 1);
    const defaultPrice = Number(rule?.price ?? 699);
    const price = Number(priced.price ?? mem?.price ?? defaultPrice);
    const source = priced.price != null ? 'explicit' : mem ? 'memory' : 'estimate';

    return {
      typedName, label, category, icon, unit, qty, price,
      total:price * qty,
      source,
      recognized:!!rule,
      exact:!!hit?.exact
    };
  }

  function render() {
    const raw = input.value.trim();
    if (!raw) {
      preview.hidden = true;
      preview.innerHTML = '';
      return;
    }

    const p = parsePreview(raw);
    if (!p) {
      preview.hidden = true;
      return;
    }

    const color = FAMILY_COLORS[p.category] || FAMILY_COLORS['Egyéb'];
    preview.style.setProperty('--preview-color', color);

    const priceLabel = p.source === 'explicit'
      ? 'saját ár'
      : p.source === 'memory'
        ? 'megjegyzett saját ár'
        : '≈ becsült';
    const stateLabel = p.recognized ? (p.exact ? 'felismerve' : 'felismerve a családból') : 'bizonytalan';
    const stateIcon = p.recognized ? '✓' : '?';
    const totalPart = p.qty !== 1 ? `<span class="preview-total">össz. ${money(p.total)}</span>` : '';

    preview.innerHTML = `
      <div class="preview-icon">${escapeHtml(p.icon)}</div>
      <div class="preview-body">
        <div class="preview-topline">
          <strong>${escapeHtml(p.label)}</strong>
          <span class="preview-category">${escapeHtml(p.category)}</span>
        </div>
        <div class="preview-meta">
          <span>${num(p.qty)} ${escapeHtml(p.unit)}</span>
          <span class="preview-price ${p.source === 'estimate' ? 'estimate' : 'user'}">${escapeHtml(priceLabel)}: ${money(p.price)}/${escapeHtml(p.unit)}</span>
          ${totalPart}
        </div>
      </div>
      <div class="preview-status ${p.recognized ? 'ok' : 'uncertain'}" title="${escapeHtml(stateLabel)}" aria-label="${escapeHtml(stateLabel)}">${stateIcon}</div>`;
    preview.hidden = false;
  }

  let frame = 0;
  function schedule() {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => { frame = 0; render(); });
  }

  input.addEventListener('input', schedule);
  input.addEventListener('focus', schedule);
  form.addEventListener('submit', () => setTimeout(render, 0));
  window.addEventListener('storage', schedule);
  render();
})();
