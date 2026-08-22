(() => {
  'use strict';

  const STATE_KEY = 'zoe-lista-state-v1';

  const UNIT_RULES = {
    'fokhagyma': {
      label:'Fokhagyma',
      category:'Zöldség-gyümölcs',
      icon:'🧄',
      prices:{kg:1999,db:199}
    },
    'kaliforniai paprika': {
      label:'Kaliforniai paprika',
      category:'Zöldség-gyümölcs',
      icon:'🫑',
      prices:{kg:1499,db:399}
    },
    'kaliforniai paprika db': {
      label:'Kaliforniai paprika',
      category:'Zöldség-gyümölcs',
      icon:'🫑',
      forceUnit:'db',
      prices:{kg:1499,db:399}
    }
  };

  function normalize(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  }

  function fixState() {
    let items;
    try { items = JSON.parse(localStorage.getItem(STATE_KEY)) || []; }
    catch { return false; }

    let changed = false;
    for (const item of items) {
      if (!item || item.source === 'user') continue;
      const rule = UNIT_RULES[normalize(item.name)];
      if (!rule) continue;

      if (rule.forceUnit && item.unit !== rule.forceUnit) {
        item.unit = rule.forceUnit;
        changed = true;
      }
      if (item.name !== rule.label) { item.name = rule.label; changed = true; }
      if (item.category !== rule.category) { item.category = rule.category; changed = true; }
      if (item.icon !== rule.icon) { item.icon = rule.icon; changed = true; }

      const target = rule.prices[item.unit];
      if (target != null && item.price !== target) {
        item.price = target;
        changed = true;
      }

      // Az app általános újrafelismerése ne írja vissza a kg árat egy db-os becslésre.
      if (target != null && item.unit !== 'kg' && item.source === 'estimate') {
        item.source = 'estimate-unit';
        changed = true;
      }
    }

    if (changed) {
      try { localStorage.setItem(STATE_KEY, JSON.stringify(items)); } catch {}
    }
    return changed;
  }

  function fixAndRefresh() {
    if (fixState()) location.reload();
  }

  // Az app.js lefutása után helyrerakjuk a korábban hibásan mentett becsléseket.
  setTimeout(fixAndRefresh, 0);

  const form = document.getElementById('addForm');
  if (form) form.addEventListener('submit', () => setTimeout(fixAndRefresh, 0));
})();
