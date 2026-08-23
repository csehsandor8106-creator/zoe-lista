(() => {
  'use strict';

  // Zoé Lista – időalapú vásárlási szokások.
  // Csak a tényleges kipipálás számít vásárlásnak. A memória teljesen helyi.
  const STATE_KEY = 'zoe-lista-state-v1';
  const HABITS_KEY = 'zoe-lista-habits-v1';
  const MAX_PURCHASES = 16;
  const MAX_SUGGESTIONS = 4;
  const MIN_PURCHASES = 3;
  const DAY = 86400000;

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
  if (!form || !input || !listRoot) return;

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,' ')
      .trim();
  }

  function keyOf(item) {
    return `${normalize(item?.name)}|${normalize(item?.unit || 'db')}`;
  }

  function median(values) {
    const sorted = values.filter(Number.isFinite).slice().sort((a,b)=>a-b);
    if (!sorted.length) return null;
    const mid = Math.floor(sorted.length/2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid-1] + sorted[mid]) / 2;
  }

  function robustCycle(purchases) {
    const times = [...new Set((Array.isArray(purchases) ? purchases : [])
      .map(Number)
      .filter(Number.isFinite))]
      .sort((a,b)=>a-b);

    if (times.length < MIN_PURCHASES) return null;

    const intervals = [];
    for (let i=1;i<times.length;i++) {
      const days = (times[i]-times[i-1]) / DAY;
      // A pár órán belüli duplázás nem külön bevásárlási ritmus.
      if (days >= 0.35 && days <= 365) intervals.push(days);
    }
    if (intervals.length < 2) return null;

    const rawMedian = median(intervals);
    if (!Number.isFinite(rawMedian) || rawMedian <= 0) return null;

    // A mediántól nagyon távoli intervallumokat gyengén kiszűrjük.
    const low = Math.max(0.35, rawMedian * 0.45);
    const high = rawMedian * 2.2;
    const filtered = intervals.filter(v => v >= low && v <= high);
    const cycle = median(filtered.length >= 2 ? filtered : intervals);
    if (!Number.isFinite(cycle) || cycle <= 0) return null;

    const deviations = intervals.map(v => Math.abs(v-cycle));
    const mad = median(deviations) || 0;
    const confidence = Math.max(0, Math.min(1, 1 - (mad / Math.max(cycle, 0.01))));

    return {days:cycle, confidence, intervals:intervals.length, last:times[times.length-1]};
  }

  function cycleLabel(days) {
    if (days < 1.5) return 'kb. naponta';
    if (days < 2.6) return 'kb. kétnaponta';
    if (days < 6) return `kb. ${Math.max(3, Math.round(days))} naponta`;
    if (days < 9.5) return 'kb. hetente';
    if (days < 18.5) return 'kb. kéthetente';
    if (days < 25) return `kb. ${Math.round(days)} naponta`;
    if (days < 38) return 'kb. havonta';
    if (days < 70) return 'kb. másfél–két havonta';
    return `kb. ${Math.round(days)} naponta`;
  }

  function dueLabel(daysUntil) {
    if (daysUntil <= -1.5) return 'már esedékes';
    if (daysUntil <= 0.5) return 'ma esedékes';
    if (daysUntil <= 1.5) return 'holnap körül';
    return `${Math.ceil(daysUntil)} nap múlva`;
  }

  function qtyText(value) {
    return new Intl.NumberFormat('hu-HU',{maximumFractionDigits:2}).format(Number(value) || 1);
  }

  function addText(item) {
    const qty = Number(item.qty) || 1;
    if (Math.abs(qty-1) < 0.001) return item.name;
    return `${qtyText(qty)} ${item.unit || 'db'} ${item.name}`;
  }

  let habits = load(HABITS_KEY, {});

  function recordPurchase(item) {
    if (!item?.name) return;
    const key = keyOf(item);
    if (!key || key.startsWith('|')) return;

    habits = load(HABITS_KEY, habits || {});
    const previous = habits[key] || {};
    const ids = Array.isArray(previous.purchaseIds) ? previous.purchaseIds.slice(-31) : [];
    const id = String(item.id || '');
    if (id && ids.includes(id)) return;

    const purchases = Array.isArray(previous.purchases)
      ? previous.purchases.map(Number).filter(Number.isFinite).slice(-(MAX_PURCHASES-1))
      : [];
    const purchaseEvents = Array.isArray(previous.purchaseEvents)
      ? previous.purchaseEvents.filter(event => event && Number.isFinite(Number(event.at))).slice(-(MAX_PURCHASES-1))
      : [];

    const now = Date.now();
    const qty = Number(item.qty) > 0 ? Number(item.qty) : (Number(previous.qty) || 1);
    purchases.push(now);
    purchaseEvents.push({
      itemId:id,
      at:now,
      qty,
      unit:item.unit || previous.unit || 'db',
      price:Number(item.price) > 0 ? Number(item.price) : null,
      priceSource:item.source || 'estimate',
      name:item.name,
      icon:item.icon || previous.icon || '🛒',
      category:item.category || previous.category || 'Egyéb'
    });
    if (id) ids.push(id);

    habits[key] = {
      key,
      name:item.name,
      icon:item.icon || previous.icon || '🛒',
      category:item.category || previous.category || 'Egyéb',
      unit:item.unit || previous.unit || 'db',
      qty,
      purchases:purchases.slice(-MAX_PURCHASES),
      purchaseEvents:purchaseEvents.slice(-MAX_PURCHASES),
      purchaseIds:ids.slice(-32),
      lastPurchase:now
    };
    save(HABITS_KEY, habits);
  }

  const section = document.createElement('section');
  section.className = 'habit-suggestions';
  section.setAttribute('aria-label','Időzített vásárlási javaslatok');
  section.innerHTML = `
    <div class="habit-head">
      <span>🧠 Mostanában esedékes</span>
      <small class="habit-subtitle">Zoé a kipipált vásárlások ritmusából tanul</small>
    </div>
    <div class="habit-row"></div>
    <div class="habit-learning" hidden></div>`;

  const smartPicks = document.querySelector('.smart-picks');
  const preview = document.getElementById('inputPreview');
  const help = document.querySelector('.composer .quick-help');
  (smartPicks || preview || help)?.insertAdjacentElement('afterend', section);

  const row = section.querySelector('.habit-row');
  const learning = section.querySelector('.habit-learning');

  function activeKeys() {
    return new Set(load(STATE_KEY, []).filter(i => !i?.done).map(keyOf));
  }

  function candidates() {
    habits = load(HABITS_KEY, habits || {});
    const active = activeKeys();
    const now = Date.now();
    const out = [];

    for (const entry of Object.values(habits)) {
      if (!entry?.name || active.has(entry.key)) continue;
      const cycle = robustCycle(entry.purchases);
      if (!cycle) continue;

      const next = cycle.last + cycle.days * DAY;
      const leadDays = Math.max(1, Math.min(4, cycle.days * 0.25));
      const daysUntil = (next-now) / DAY;
      const overdueDays = -daysUntil;
      const staleAfter = Math.max(14, cycle.days * 1.5);

      if (daysUntil > leadDays) continue;
      if (overdueDays > staleAfter) continue;

      out.push({...entry, cycle, next, daysUntil, leadDays});
    }

    return out.sort((a,b) => {
      // Előbb az esedékes/lejárt, utána a közelgő; azonos esetben stabilabb minta előrébb.
      if ((a.daysUntil <= 0) !== (b.daysUntil <= 0)) return a.daysUntil <= 0 ? -1 : 1;
      return a.daysUntil - b.daysUntil || b.cycle.confidence - a.cycle.confidence;
    }).slice(0,MAX_SUGGESTIONS);
  }

  function learningSummary() {
    habits = load(HABITS_KEY, habits || {});
    const entries = Object.values(habits).filter(x => x?.name && Array.isArray(x.purchases) && x.purchases.length);
    if (!entries.length) return '';

    const learnedCount = entries.filter(x => robustCycle(x.purchases)).length;
    if (learnedCount) return `Zoé már ${learnedCount} termék vásárlási ritmusát ismeri.`;

    const best = entries.slice().sort((a,b)=>(b.purchases?.length||0)-(a.purchases?.length||0))[0];
    const n = Math.min(MIN_PURCHASES, best?.purchases?.length || 0);
    return `Tanulás folyamatban · ${best?.name || 'egy termék'}: ${n}/${MIN_PURCHASES} vásárlás`;
  }

  function render() {
    const typing = !!input.value.trim();
    if (typing) {
      section.hidden = true;
      return;
    }

    const picks = candidates();
    row.innerHTML = '';

    for (const item of picks) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'habit-pick';
      button.dataset.key = item.key;
      button.style.setProperty('--habit-color', FAMILY_COLORS[item.category] || FAMILY_COLORS['Egyéb']);
      button.title = `${item.name} · ${cycleLabel(item.cycle.days)} · ${dueLabel(item.daysUntil)}`;

      const icon = document.createElement('span');
      icon.className = 'habit-icon';
      icon.textContent = item.icon || '🛒';

      const text = document.createElement('span');
      text.className = 'habit-text';
      const name = document.createElement('strong');
      name.textContent = item.name;
      const meta = document.createElement('small');
      meta.textContent = `${dueLabel(item.daysUntil)} · ${cycleLabel(item.cycle.days)}`;
      text.append(name,meta);

      const plus = document.createElement('span');
      plus.className = 'habit-plus';
      plus.textContent = '+';
      button.append(icon,text,plus);
      row.appendChild(button);
    }

    const learningText = learningSummary();
    learning.textContent = learningText;
    learning.hidden = !!picks.length || !learningText;

    // Ha még semmilyen vásárlási adat nincs, ne foglaljon helyet.
    section.hidden = !picks.length && !learningText;
  }

  listRoot.addEventListener('change', event => {
    const checkbox = event.target.closest?.('.check');
    if (!checkbox || !checkbox.checked) return;
    const id = checkbox.closest('.item')?.dataset?.id;
    if (!id) return;

    window.setTimeout(() => {
      const item = load(STATE_KEY, []).find(x => String(x?.id) === String(id));
      if (item) recordPurchase(item);
      render();
    },25);
  });

  row.addEventListener('click', event => {
    const button = event.target.closest('.habit-pick');
    if (!button) return;
    habits = load(HABITS_KEY, habits || {});
    const item = habits[button.dataset.key];
    if (!item) return;
    input.value = addText(item);
    input.dispatchEvent(new Event('input',{bubbles:true}));
    form.requestSubmit();
    window.setTimeout(render,40);
  });

  input.addEventListener('input',render);
  window.addEventListener('storage',render);
  document.addEventListener('visibilitychange',()=>{ if (!document.hidden) render(); });

  // Nyitva hagyott PWA-nál napváltás után is frissüljön az esedékesség.
  window.setInterval(render, 30 * 60 * 1000);

  render();
  window.ZoeShoppingHabits2026 = {render, cycle:robustCycle};
})();