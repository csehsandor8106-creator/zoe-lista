(() => {
  'use strict';

  // Zoé Lista – gyakran vásárolt termékek és egykoppintásos gyors hozzáadás.
  // A memória helyben, localStorage-ban él. A tényleges kipipálás erősebben számít,
  // mint a puszta hozzáadás, ezért idővel a valóban vásárolt termékek kerülnek előre.
  const STATE_KEY = 'zoe-lista-state-v1';
  const HISTORY_KEY = 'zoe-lista-frequent-v1';
  const SEEDED_KEY = 'zoe-lista-frequent-seeded-v1';
  const MAX_PICKS = 6;

  const FAMILY_COLORS = {
    'Zöldség-gyümölcs':'#55a95a','Pékáru':'#c88a43','Hús és felvágott':'#d45b62',
    'Hal és tenger gyümölcsei':'#4e9bd3','Tejtermék és tojás':'#65b9cf','Fagyasztott':'#7a9fd6',
    'Alapélelmiszer':'#b28b5e','Snack és édesség':'#c46fba','Italok':'#38a5a1',
    'Szeszes italok':'#8b65ad','Háztartás':'#71808b','Higiénia':'#df7f9e',
    'Baba és gyermek':'#dda55d','Állateledel':'#987759','Ruházat':'#6d79cf',
    'Virág és ajándék':'#c85d92','Egyéb':'#7d8589'
  };

  const form = document.getElementById('addForm');
  const input = document.getElementById('itemInput');
  const listRoot = document.getElementById('listRoot');
  const help = document.querySelector('.composer .quick-help');
  if (!form || !input || !listRoot || !help) return;

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

  function keyOf(item) {
    return `${normalize(item?.name)}|${normalize(item?.unit || 'db')}`;
  }

  function qtyText(n) {
    return new Intl.NumberFormat('hu-HU', {maximumFractionDigits:2}).format(Number(n) || 1);
  }

  let history = load(HISTORY_KEY, {});

  function remember(item, type, seeded = false) {
    if (!item?.name) return;
    const key = keyOf(item);
    if (!key || key.startsWith('|')) return;

    const previous = history[key] || {};
    const doneIds = Array.isArray(previous.doneIds) ? previous.doneIds.slice(-15) : [];

    const next = {
      key,
      name:item.name,
      icon:item.icon || previous.icon || '🛒',
      category:item.category || previous.category || 'Egyéb',
      unit:item.unit || previous.unit || 'db',
      qty:Number(item.qty) > 0 ? Number(item.qty) : (previous.qty || 1),
      addCount:Number(previous.addCount) || 0,
      doneCount:Number(previous.doneCount) || 0,
      lastUsed:Number(item.createdAt) || Date.now(),
      doneIds
    };

    if (seeded) {
      next.addCount = Math.max(1, next.addCount);
      next.lastUsed = Number(item.createdAt) || next.lastUsed;
    } else if (type === 'add') {
      next.addCount += 1;
      next.lastUsed = Date.now();
    } else if (type === 'done') {
      const id = String(item.id || '');
      if (id && !next.doneIds.includes(id)) {
        next.doneCount += 1;
        next.doneIds.push(id);
        next.doneIds = next.doneIds.slice(-16);
      }
      next.lastUsed = Date.now();
    }

    history[key] = next;
    save(HISTORY_KEY, history);
  }

  // Első alkalommal a jelenlegi lista enyhe kezdőmemóriát ad, hogy a funkció
  // azonnal kipróbálható legyen. Később a valódi használat súlya messze nagyobb.
  if (!localStorage.getItem(SEEDED_KEY)) {
    const current = load(STATE_KEY, []);
    for (const item of current) remember(item, 'seed', true);
    try { localStorage.setItem(SEEDED_KEY, '1'); } catch {}
  }

  const box = document.createElement('section');
  box.className = 'smart-picks';
  box.setAttribute('aria-label', 'Gyakran vásárolt termékek');
  box.innerHTML = `
    <div class="smart-picks-head">
      <span>⚡ Gyors hozzáadás</span>
      <small>Zoé tanulja a szokásaidat</small>
    </div>
    <div class="smart-picks-row"></div>`;

  const preview = document.getElementById('inputPreview');
  (preview || help).insertAdjacentElement('afterend', box);
  const row = box.querySelector('.smart-picks-row');

  function score(item) {
    const ageDays = Math.max(0, (Date.now() - (Number(item.lastUsed) || 0)) / 86400000);
    const recency = Math.max(0, 90 - ageDays);
    return (Number(item.doneCount) || 0) * 1000
      + (Number(item.addCount) || 0) * 120
      + recency;
  }

  function activeKeys() {
    return new Set(load(STATE_KEY, []).filter(i => !i.done).map(keyOf));
  }

  function addText(item) {
    const qty = Number(item.qty) || 1;
    // 1 egységnél elég a terméknév: az app katalógusa visszaadja a megszokott egységet.
    if (Math.abs(qty - 1) < 0.001) return item.name;
    return `${qtyText(qty)} ${item.unit || 'db'} ${item.name}`;
  }

  function render() {
    history = load(HISTORY_KEY, history || {});
    const typing = !!input.value.trim();
    if (typing) {
      box.hidden = true;
      return;
    }

    const active = activeKeys();
    const picks = Object.values(history)
      .filter(x => x && x.name && ((Number(x.addCount) || 0) > 0 || (Number(x.doneCount) || 0) > 0))
      .sort((a,b) => score(b) - score(a) || String(a.name).localeCompare(String(b.name), 'hu', {sensitivity:'base'}))
      .slice(0, MAX_PICKS);

    row.innerHTML = '';
    for (const item of picks) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'smart-pick';
      if (active.has(item.key)) button.classList.add('is-active');
      button.style.setProperty('--pick-color', FAMILY_COLORS[item.category] || FAMILY_COLORS['Egyéb']);
      button.dataset.key = item.key;
      button.title = active.has(item.key)
        ? 'Már a listán – koppintva növeli a mennyiséget'
        : 'Koppints a hozzáadáshoz';

      const icon = document.createElement('span');
      icon.className = 'smart-pick-icon';
      icon.textContent = item.icon || '🛒';
      const label = document.createElement('span');
      label.className = 'smart-pick-label';
      label.textContent = item.name;
      button.append(icon, label);

      const uses = (Number(item.doneCount) || 0) + (Number(item.addCount) || 0);
      if (uses > 1) {
        const badge = document.createElement('span');
        badge.className = 'smart-pick-count';
        badge.textContent = `×${uses}`;
        button.appendChild(badge);
      }
      row.appendChild(button);
    }

    box.hidden = picks.length === 0;
  }

  // A submit capture fázisában még az app saját submit-kezelője előtt készítünk
  // egy állapotfotót. Utána a ténylegesen létrejött / megnövelt tételt jegyezzük meg.
  form.addEventListener('submit', () => {
    const before = new Map(load(STATE_KEY, []).map(i => [String(i.id), Number(i.qty) || 0]));
    window.setTimeout(() => {
      const after = load(STATE_KEY, []);
      let changed = after.find(i => !before.has(String(i.id)));
      if (!changed) {
        changed = after.find(i => (Number(i.qty) || 0) > (before.get(String(i.id)) ?? -Infinity));
      }
      if (changed) remember(changed, 'add');
      render();
    }, 20);
  }, true);

  // A kipipálás erősebb jel: ez azt jelenti, hogy a termék tényleg bekerült a kosárba.
  listRoot.addEventListener('change', event => {
    const checkbox = event.target.closest?.('.check');
    if (!checkbox || !checkbox.checked) return;
    const id = checkbox.closest('.item')?.dataset?.id;
    if (!id) return;
    window.setTimeout(() => {
      const item = load(STATE_KEY, []).find(i => String(i.id) === String(id));
      if (item) remember(item, 'done');
      render();
    }, 20);
  });

  row.addEventListener('click', event => {
    const button = event.target.closest('.smart-pick');
    if (!button) return;
    const item = history[button.dataset.key];
    if (!item) return;
    input.value = addText(item);
    input.dispatchEvent(new Event('input', {bubbles:true}));
    form.requestSubmit();
  });

  input.addEventListener('input', render);
  window.addEventListener('storage', render);
  render();
})();
