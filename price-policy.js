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

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  function findRule(name, learned) {
    const key = normalize(name);
    if (learned[key]?.unit) return {rule:learned[key], alias:key, exact:true};

    const padded = ` ${key} `;
    let best = null;
    let bestAlias = '';

    for (const [alias, rule] of Object.entries(learned)) {
      // Rövid szavaknál nincs laza substring matching.
      if (!rule?.unit || alias.length < 5) continue;
      if (padded.includes(` ${alias} `) && alias.length > bestAlias.length) {
        best = rule;
        bestAlias = alias;
      }
    }

    return best ? {rule:best, alias:bestAlias, exact:false} : null;
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
    let stateChanged = false;
    let learnedChanged = false;
    const changedIds = new Set();

    for (const item of items) {
      if (!item?.unit) continue;

      const key = normalize(item.name);
      const match = findRule(item.name, learned);
      if (!match) continue;

      let rule = match.rule;

      // Ha egy kiegészített név (pl. „Jégkrém (tescós)”) csak szóhatáros
      // rész-találattal ismert fel, tanuljuk meg a teljes nevet is ugyanahhoz
      // a szabályhoz. Így az app és az árpolitika a következő körben már
      // ugyanazt a pontos szabályt használja, nem tudnak pingpongozni.
      if (!match.exact && ['estimate','estimate-unit','unknown'].includes(item.source)) {
        const existing = learned[key];
        if (!existing || existing.builtinCatalog) {
          const derived = {
            ...rule,
            kind: rule.kind || 'learned',
            builtinCatalog: rule.builtinCatalog !== false,
            derivedCatalogAlias: true,
            derivedFromAlias: match.alias
          };
          if (!existing || JSON.stringify(existing) !== JSON.stringify(derived)) {
            learned[key] = derived;
            learnedChanged = true;
          }
          rule = learned[key] || rule;
        }
      }

      let itemChanged = false;
      const remembered = memory[key];
      const memoryUnitMismatch = item.source === 'user' && remembered && remembered.unit && remembered.unit !== item.unit && item.price === remembered.price;

      if (memoryUnitMismatch) {
        item.price = null;
        item.source = 'unknown';
        itemChanged = true;
      } else if (['estimate','estimate-unit','unknown'].includes(item.source)) {
        const price = knownPrice(rule, item.unit);

        if (price == null) {
          if (item.price !== null) { item.price = null; itemChanged = true; }
          if (item.source !== 'unknown') { item.source = 'unknown'; itemChanged = true; }
        } else {
          if (item.price !== price) { item.price = price; itemChanged = true; }
          if (item.source === 'unknown') { item.source = 'estimate'; itemChanged = true; }
        }
      }

      if (itemChanged) {
        stateChanged = true;
        changedIds.add(String(item.id));
      }
    }

    if (learnedChanged) save(LEARNED_KEY, learned);
    if (stateChanged) save(STATE_KEY, items);

    return {stateChanged, changedIds};
  }

  function money(n) {
    return new Intl.NumberFormat('hu-HU',{maximumFractionDigits:0}).format(Math.round(n)) + ' Ft';
  }

  function syncCorrectedRows(changedIds) {
    if (!changedIds?.size) return;

    const items = load(STATE_KEY, []);
    const byId = new Map(items.map(i => [String(i.id), i]));

    for (const id of changedIds) {
      const item = byId.get(String(id));
      const row = document.querySelector(`.item[data-id="${CSS.escape(String(id))}"]`);
      if (!item || !row) continue;

      if (item.price == null || item.source === 'unknown') continue;

      const badge = row.querySelector('.pill.estimate, .pill.user');
      if (badge) {
        badge.textContent = item.source === 'user' ? 'saját ár' : '≈ becsült';
        badge.classList.toggle('user', item.source === 'user');
        badge.classList.toggle('estimate', item.source !== 'user');
      }

      const priceLine = row.querySelector('.price-line');
      if (priceLine) {
        const qty = Number(item.qty) || 1;
        const unit = item.unit || 'db';
        priceLine.innerHTML = `${money(item.price * qty)} <span class="unit">(${money(item.price)}/${unit})</span>`;
      }
    }
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
  }

  function refreshTotal() {
    const items = load(STATE_KEY, []);
    const unknown = items.filter(i => i?.price == null || i?.source === 'unknown');
    const knownSum = items.reduce((sum, i) => {
      const price = Number(i?.price);
      const qty = Number(i?.qty) || 0;
      return sum + (Number.isFinite(price) ? price * qty : 0);
    }, 0);

    const total = document.getElementById('totalText');
    if (total) total.textContent = unknown.length ? `≈ ${money(knownSum)} + ?` : `≈ ${money(knownSum)}`;

    const count = document.getElementById('countText');
    if (count) {
      count.textContent = count.textContent.replace(/\s*•\s*\d+\s+ár nélkül/g, '');
      if (unknown.length) count.textContent += ` • ${unknown.length} ár nélkül`;
    }
  }

  function refreshPolicy() {
    // FONTOS: itt szándékosan nincs location.reload().
    // Egy becsült ár korrekciója nem indíthat teljes oldal-újratöltést,
    // különben két eltérő katalógusszabály végtelen villogást okozhat.
    const result = fixState();
    syncCorrectedRows(result.changedIds);
    decorateUnknownPrices();
    refreshTotal();
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
