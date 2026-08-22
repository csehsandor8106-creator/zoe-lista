(() => {
  'use strict';

  const STATE_KEY = 'zoe-lista-state-v1';
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const PRICE_MEMORY_KEY = 'zoe-lista-price-memory-v1';

  function normalize(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  }

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function findRule(name, learned) {
    const key = normalize(name);
    if (learned[key]?.unit) return learned[key];

    const padded = ` ${key} `;
    let best = null;
    let bestLength = 0;
    for (const [alias, rule] of Object.entries(learned)) {
      if (!rule?.unit || alias.length < 5) continue;
      if (padded.includes(` ${alias} `) && alias.length > bestLength) {
        best = rule;
        bestLength = alias.length;
      }
    }
    return best;
  }

  function knownPrice(rule, unit) {
    if (!rule || !unit) return null;
    const mapped = rule.pricesByUnit?.[unit];
    if (Number.isFinite(mapped)) return mapped;
    if (rule.unit === unit && Number.isFinite(rule.price)) return rule.price;
    return null;
  }

  function fixState() {
    const items = load(STATE_KEY, []);
    const learned = load(LEARNED_KEY, {});
    const memory = load(PRICE_MEMORY_KEY, {});
    let changed = false;

    for (const item of items) {
      if (!item?.unit) continue;
      const key = normalize(item.name);
      const rule = findRule(item.name, learned);
      if (!rule) continue;

      const remembered = memory[key];
      const memoryUnitMismatch = item.source === 'user' && remembered && remembered.unit && remembered.unit !== item.unit && item.price === remembered.price;
      if (memoryUnitMismatch) {
        item.price = null;
        item.source = 'unknown';
        changed = true;
        continue;
      }

      if (!['estimate','estimate-unit','unknown'].includes(item.source)) continue;
      const price = knownPrice(rule, item.unit);

      if (price == null) {
        if (item.price !== null) { item.price = null; changed = true; }
        if (item.source !== 'unknown') { item.source = 'unknown'; changed = true; }
      } else {
        if (item.price !== price) { item.price = price; changed = true; }
        if (item.source === 'unknown') { item.source = 'estimate'; changed = true; }
      }
    }

    if (changed) {
      try { localStorage.setItem(STATE_KEY, JSON.stringify(items)); } catch {}
    }
    return changed;
  }

  function money(n) {
    return new Intl.NumberFormat('hu-HU',{maximumFractionDigits:0}).format(Math.round(n)) + ' Ft';
  }

  function decorateUnknownPrices() {
    const items = load(STATE_KEY, []);
    const byId = new Map(items.map(i => [String(i.id), i]));
    const unknown = items.filter(i => i?.price == null || i?.source === 'unknown');

    for (const row of document.querySelectorAll('.item')) {
      const item = byId.get(String(row.dataset.id));
      if (!item || (item.price != null && item.source !== 'unknown')) continue;

      const badge = row.querySelector('.pill.estimate, .pill.user');
      if (badge) {
        badge.textContent = 'ár nélkül';
        badge.classList.remove('user');
        badge.classList.add('estimate');
      }
      const priceLine = row.querySelector('.price-line');
      if (priceLine) priceLine.innerHTML = '— <span class="unit">(ár megadása a ✎ gombbal)</span>';
    }

    if (unknown.length) {
      const knownSum = items.reduce((sum, i) => sum + (Number.isFinite(i?.price) ? i.price * i.qty : 0), 0);
      const total = document.getElementById('totalText');
      if (total) total.textContent = `≈ ${money(knownSum)} + ?`;
      const count = document.getElementById('countText');
      if (count && !count.textContent.includes('ár nélkül')) count.textContent += ` • ${unknown.length} ár nélkül`;
    }
  }

  function refreshPolicy() {
    if (fixState()) {
      location.reload();
      return;
    }
    decorateUnknownPrices();
  }

  setTimeout(refreshPolicy, 0);

  const addForm = document.getElementById('addForm');
  if (addForm) addForm.addEventListener('submit', () => setTimeout(refreshPolicy, 0));

  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-act="edit"]');
    if (!button) return;
    const row = button.closest('.item');
    if (!row) return;
    setTimeout(() => {
      const item = load(STATE_KEY, []).find(i => String(i.id) === String(row.dataset.id));
      const priceInput = document.getElementById('editPrice');
      if (item && priceInput && (item.price == null || item.source === 'unknown')) {
        priceInput.value = '';
        priceInput.placeholder = 'Ár megadása';
      }
    }, 0);
  });

  const editForm = document.getElementById('editForm');
  if (editForm) {
    editForm.addEventListener('submit', event => {
      const priceInput = document.getElementById('editPrice');
      const editId = document.getElementById('editId')?.value;
      if (!priceInput || priceInput.value.trim() !== '') return;
      const item = load(STATE_KEY, []).find(i => String(i.id) === String(editId));
      if (item && (item.price == null || item.source === 'unknown')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        priceInput.focus();
      }
    }, true);
  }
})();