(() => {
  'use strict';

  // Zoé Lista – saját árak története.
  // Csak a felhasználó által ténylegesen megadott árakat naplózza:
  //  - bevitelnél: „Milka 599 Ft”
  //  - szerkesztőben: Egységár módosítása + Mentés
  // A katalógus becsült árai nem kerülnek a történetbe.
  const STATE_KEY = 'zoe-lista-state-v1';
  const PRICE_MEMORY_KEY = 'zoe-lista-price-memory-v1';
  const HISTORY_KEY = 'zoe-lista-price-history-v1';
  const MIGRATED_KEY = 'zoe-lista-price-history-migrated-v1';
  const MAX_ENTRIES = 40;

  const addForm = document.getElementById('addForm');
  const input = document.getElementById('itemInput');
  const listRoot = document.getElementById('listRoot');
  const editForm = document.getElementById('editForm');
  const editPrice = document.getElementById('editPrice');
  const editId = document.getElementById('editId');
  if (!addForm || !input || !listRoot || !editForm || !editPrice || !editId) return;

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function historyKey(name, unit) {
    return `${normalize(name)}|${normalize(unit || 'db')}`;
  }

  function money(n) {
    return new Intl.NumberFormat('hu-HU', {maximumFractionDigits:0}).format(Math.round(Number(n) || 0)) + ' Ft';
  }

  function dateText(ts) {
    return new Intl.DateTimeFormat('hu-HU', {year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date(ts));
  }

  function loadHistory() {
    return load(HISTORY_KEY, {});
  }

  function record(name, unit, price, source = 'manual', timestamp = Date.now()) {
    const p = Number(price);
    if (!name || !Number.isFinite(p) || p <= 0) return;

    const key = historyKey(name, unit);
    if (!key || key.startsWith('|')) return;
    const history = loadHistory();
    const bucket = history[key] || {name, unit:unit || 'db', entries:[]};
    bucket.name = name;
    bucket.unit = unit || bucket.unit || 'db';
    bucket.entries = Array.isArray(bucket.entries) ? bucket.entries : [];

    // Ugyanazt az eseményt ne duplázzuk véletlenül több listener miatt.
    const last = bucket.entries[bucket.entries.length - 1];
    if (last && Number(last.price) === p && Math.abs(timestamp - Number(last.at || 0)) < 60000) {
      return;
    }

    bucket.entries.push({price:p, at:timestamp, source});
    bucket.entries = bucket.entries.slice(-MAX_ENTRIES);
    history[key] = bucket;
    save(HISTORY_KEY, history);
  }

  function mergeHistory(oldName, oldUnit, newName, newUnit) {
    const oldKey = historyKey(oldName, oldUnit);
    const newKey = historyKey(newName, newUnit);
    if (!oldKey || oldKey === newKey) return;

    const history = loadHistory();
    const oldBucket = history[oldKey];
    if (!oldBucket?.entries?.length) return;

    const newBucket = history[newKey] || {name:newName, unit:newUnit || 'db', entries:[]};
    newBucket.name = newName;
    newBucket.unit = newUnit || newBucket.unit || 'db';
    newBucket.entries = [...(newBucket.entries || []), ...oldBucket.entries]
      .sort((a,b) => Number(a.at || 0) - Number(b.at || 0))
      .slice(-MAX_ENTRIES);
    history[newKey] = newBucket;
    delete history[oldKey];
    save(HISTORY_KEY, history);
  }

  function statsFor(name, unit) {
    const bucket = loadHistory()[historyKey(name, unit)];
    const entries = (bucket?.entries || []).filter(e => Number(e.price) > 0);
    if (!entries.length) return null;
    const prices = entries.map(e => Number(e.price));
    return {
      count:entries.length,
      last:entries[entries.length - 1],
      min:Math.min(...prices),
      max:Math.max(...prices),
      avg:prices.reduce((a,b) => a + b, 0) / prices.length,
      entries
    };
  }

  // Egyszeri átvezetés a jelenlegi sajátár-memóriából.
  // Ez nem valódi múlt, csak egy kezdő pont, ezért minden termékből legfeljebb egy adatpont.
  if (!localStorage.getItem(MIGRATED_KEY)) {
    const memory = load(PRICE_MEMORY_KEY, {});
    const items = load(STATE_KEY, []);
    for (const [normalizedName, mem] of Object.entries(memory)) {
      const price = Number(mem?.price);
      if (!(price > 0)) continue;
      const matchingItem = items.find(i => normalize(i?.name) === normalizedName);
      const name = matchingItem?.name || normalizedName;
      const unit = mem?.unit || matchingItem?.unit || 'db';
      record(name, unit, price, 'import', Date.now() - 1);
    }
    try { localStorage.setItem(MIGRATED_KEY, '1'); } catch {}
  }

  // ---- Megjelenítés a szerkesztőben ----
  const panel = document.createElement('section');
  panel.className = 'price-history-panel';
  panel.setAttribute('aria-live', 'polite');
  editPrice.closest('label')?.insertAdjacentElement('afterend', panel);

  function renderPanel() {
    const id = editId.value;
    const item = load(STATE_KEY, []).find(i => String(i.id) === String(id));
    if (!item) {
      panel.hidden = true;
      panel.innerHTML = '';
      return;
    }

    const stats = statsFor(item.name, item.unit);
    panel.hidden = false;
    if (!stats) {
      panel.innerHTML = `
        <div class="price-history-title"><span>📈 Ártörténet</span><small>Még nincs saját ár elmentve</small></div>`;
      return;
    }

    const trend = stats.count < 2 ? '•' : stats.last.price > stats.entries[stats.entries.length - 2].price ? '↗' : stats.last.price < stats.entries[stats.entries.length - 2].price ? '↘' : '→';
    const recent = stats.entries.slice(-4).reverse();
    panel.innerHTML = `
      <div class="price-history-title">
        <span>📈 Ártörténet</span>
        <small>${stats.count} saját ár</small>
      </div>
      <div class="price-history-stats">
        <div><span>Legutóbbi</span><strong>${money(stats.last.price)} ${trend}</strong></div>
        <div><span>Átlag</span><strong>${money(stats.avg)}</strong></div>
        <div><span>Minimum</span><strong>${money(stats.min)}</strong></div>
      </div>
      <div class="price-history-recent">
        ${recent.map(e => `<span><b>${money(e.price)}</b><small>${dateText(e.at)}</small></span>`).join('')}
      </div>`;
  }

  listRoot.addEventListener('click', event => {
    const editButton = event.target.closest('button[data-act="edit"]');
    if (!editButton) return;
    setTimeout(renderPanel, 0);
  });

  // ---- Saját ár beírása a fő mezőben ----
  addForm.addEventListener('submit', () => {
    const raw = input.value.trim();
    const explicit = raw.match(/(?:^|\s)(\d[\d\s.,]*)\s*(?:ft|forint)\s*$/i);
    if (!explicit) return;

    const before = new Map(load(STATE_KEY, []).map(i => [String(i.id), {qty:Number(i.qty)||0, price:Number(i.price)||0}]));
    setTimeout(() => {
      const after = load(STATE_KEY, []);
      let item = after.find(i => !before.has(String(i.id)));
      if (!item) item = after.find(i => Number(i.price) !== (before.get(String(i.id))?.price ?? Number(i.price)));
      if (!item) item = after.find(i => Number(i.qty) > (before.get(String(i.id))?.qty ?? Number(i.qty)));
      if (!item || item.source !== 'user') return;
      record(item.name, item.unit, item.price, 'input');
    }, 25);
  }, true);

  // ---- Ár módosítása a szerkesztőben ----
  editForm.addEventListener('submit', () => {
    const id = editId.value;
    const beforeItem = load(STATE_KEY, []).find(i => String(i.id) === String(id));
    if (!beforeItem) return;
    const snapshot = {...beforeItem};

    setTimeout(() => {
      const afterItem = load(STATE_KEY, []).find(i => String(i.id) === String(id));
      if (!afterItem || afterItem.source !== 'user') return;
      mergeHistory(snapshot.name, snapshot.unit, afterItem.name, afterItem.unit);
      if (Number(afterItem.price) !== Number(snapshot.price) || snapshot.source !== 'user') {
        record(afterItem.name, afterItem.unit, afterItem.price, 'edit');
      }
      renderPanel();
    }, 25);
  }, true);

  window.addEventListener('storage', renderPanel);
})();