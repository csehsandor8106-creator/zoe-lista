(() => {
  'use strict';

  // Zoé Lista – „Mi hiányozhat még?” indulás előtti ellenőrzés.
  // A már meglévő, helyben tanult kipipálási előzményekből dolgozik.
  // Erős jel lehet: esedékességi ciklus vagy a mostani tételekkel ismétlődő együttvásárlás.
  const STATE_KEY = 'zoe-lista-state-v1';
  const HABITS_KEY = 'zoe-lista-habits-v1';
  const DISMISS_KEY = 'zoe-lista-missing-dismiss-v1';
  const MAX_SUGGESTIONS = 3;
  const DAY = 86400000;
  const TOGETHER_WINDOW = 18 * 60 * 60 * 1000;
  const DISMISS_MS = 24 * 60 * 60 * 1000;

  const COLORS = window.ZoeListLayout?.colors || {
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

  function fallbackCycle(purchases) {
    const times = [...new Set((Array.isArray(purchases) ? purchases : []).map(Number).filter(Number.isFinite))].sort((a,b)=>a-b);
    if (times.length < 3) return null;
    const intervals = [];
    for (let i=1;i<times.length;i++) {
      const days = (times[i]-times[i-1]) / DAY;
      if (days >= 0.35 && days <= 365) intervals.push(days);
    }
    if (intervals.length < 2) return null;
    const days = median(intervals);
    if (!Number.isFinite(days) || days <= 0) return null;
    const mad = median(intervals.map(v=>Math.abs(v-days))) || 0;
    return {
      days,
      confidence:Math.max(0,Math.min(1,1-(mad/Math.max(days,.01)))),
      last:times[times.length-1]
    };
  }

  function cycleOf(entry) {
    try {
      return window.ZoeShoppingHabits2026?.cycle?.(entry?.purchases) || fallbackCycle(entry?.purchases);
    } catch {
      return fallbackCycle(entry?.purchases);
    }
  }

  function cycleLabel(days) {
    if (!Number.isFinite(days)) return '';
    if (days < 1.5) return 'kb. naponta';
    if (days < 2.6) return 'kb. kétnaponta';
    if (days < 6) return `kb. ${Math.max(3,Math.round(days))} naponta`;
    if (days < 9.5) return 'kb. hetente';
    if (days < 18.5) return 'kb. kéthetente';
    if (days < 38) return 'kb. havonta';
    return `kb. ${Math.round(days)} naponta`;
  }

  function cleanDismissed() {
    const now = Date.now();
    const data = load(DISMISS_KEY, {});
    let changed = false;
    for (const [key, until] of Object.entries(data)) {
      if (!Number.isFinite(Number(until)) || Number(until) <= now) {
        delete data[key];
        changed = true;
      }
    }
    if (changed) save(DISMISS_KEY, data);
    return data;
  }

  function purchaseTimes(entry) {
    return (Array.isArray(entry?.purchases) ? entry.purchases : [])
      .map(Number)
      .filter(Number.isFinite)
      .sort((a,b)=>a-b);
  }

  function nearbyCount(candidateTimes, currentTimes) {
    if (!candidateTimes.length || !currentTimes.length) return 0;
    let count = 0;
    for (const time of candidateTimes) {
      if (currentTimes.some(other => Math.abs(other-time) <= TOGETHER_WINDOW)) count += 1;
    }
    return count;
  }

  function qtyText(value) {
    return new Intl.NumberFormat('hu-HU',{maximumFractionDigits:2}).format(Number(value) || 1);
  }

  function addText(item) {
    const qty = Number(item?.qty) > 0 ? Number(item.qty) : 1;
    return `${qtyText(qty)} ${item?.unit || 'db'} ${item?.name || ''}`.trim();
  }

  function buildCandidates() {
    const items = load(STATE_KEY, []);
    const openItems = items.filter(item => item && !item.done);
    if (!openItems.length) return [];

    const habits = load(HABITS_KEY, {});
    const entries = Object.values(habits).filter(entry => entry?.name && purchaseTimes(entry).length);
    if (!entries.length) return [];

    const currentNames = new Set(items.filter(Boolean).map(item=>normalize(item.name)).filter(Boolean));
    const currentKeys = new Set(items.filter(Boolean).map(keyOf));
    const currentHabitEntries = entries.filter(entry => currentKeys.has(entry.key) || currentNames.has(normalize(entry.name)));
    const currentTimes = currentHabitEntries.flatMap(purchaseTimes);
    const dismissed = cleanDismissed();
    const now = Date.now();
    const suggestions = [];

    for (const entry of entries) {
      const nameKey = normalize(entry.name);
      if (!nameKey || currentNames.has(nameKey) || currentKeys.has(entry.key) || dismissed[entry.key]) continue;

      const times = purchaseTimes(entry);
      const cycle = cycleOf(entry);
      let due = false;
      let daysUntil = null;
      let dueScore = 0;

      if (cycle && Number.isFinite(cycle.days) && Number.isFinite(cycle.last)) {
        const next = cycle.last + cycle.days * DAY;
        daysUntil = (next-now) / DAY;
        const lead = Math.max(1,Math.min(4,cycle.days*.25));
        const staleAfter = Math.max(14,cycle.days*1.5);
        due = daysUntil <= lead && -daysUntil <= staleAfter;
        if (due) {
          dueScore = 950 + (Number(cycle.confidence)||0)*180 + Math.max(-80,Math.min(120,-daysUntil*18));
        }
      }

      const together = nearbyCount(times,currentTimes);
      const togetherRatio = times.length ? together / times.length : 0;
      const coBought = currentTimes.length > 0 && together >= 2 && togetherRatio >= .45;
      const coScore = coBought ? 650 + together*55 + togetherRatio*180 : 0;

      if (!due && !coBought) continue;

      let reason = '';
      if (due && coBought) reason = `${entry.name} gyakran ilyenkor, és ezekkel a tételekkel együtt került a kosaradba.`;
      else if (due) reason = `${entry.name} gyakran szoktál ilyenkor venni.`;
      else reason = `${entry.name} a mostani tételekkel gyakran együtt került a kosaradba.`;

      const meta = [];
      if (cycle?.days) meta.push(cycleLabel(cycle.days));
      if (coBought) meta.push(`${together} korábbi közös bevásárlás`);

      suggestions.push({
        ...entry,
        score:dueScore+coScore+(due&&coBought?250:0),
        due,
        coBought,
        daysUntil,
        together,
        reason,
        meta:meta.join(' · ')
      });
    }

    return suggestions
      .sort((a,b)=>b.score-a.score || String(a.name).localeCompare(String(b.name),'hu',{sensitivity:'base'}))
      .slice(0,MAX_SUGGESTIONS);
  }

  const section = document.createElement('section');
  section.className = 'missing-items-check';
  section.hidden = true;
  section.setAttribute('aria-label','Mi hiányozhat még a listáról');
  section.innerHTML = `
    <div class="missing-items-head">
      <div>
        <strong>🧠 Mi hiányozhat még?</strong>
        <small>Zoé a korábbi vásárlásaid alapján ellenőrizte a listát</small>
      </div>
    </div>
    <div class="missing-items-list"></div>`;

  const habitsSection = document.querySelector('.habit-suggestions');
  const smartPicks = document.querySelector('.smart-picks');
  const preview = document.getElementById('inputPreview');
  const help = document.querySelector('.composer .quick-help');
  (habitsSection || smartPicks || preview || help)?.insertAdjacentElement('afterend',section);

  const list = section.querySelector('.missing-items-list');
  let renderTimer = 0;

  function render() {
    clearTimeout(renderTimer);
    if (input.value.trim()) {
      section.hidden = true;
      return;
    }

    const picks = buildCandidates();
    list.innerHTML = '';

    for (const item of picks) {
      const card = document.createElement('article');
      card.className = 'missing-item-card';
      card.dataset.key = item.key;
      card.style.setProperty('--missing-color',COLORS[item.category] || COLORS['Egyéb'] || '#7d8589');

      const icon = document.createElement('span');
      icon.className = 'missing-item-icon';
      icon.textContent = item.icon || '🛒';

      const copy = document.createElement('div');
      copy.className = 'missing-item-copy';
      const reason = document.createElement('strong');
      reason.textContent = item.reason;
      copy.appendChild(reason);
      if (item.meta) {
        const meta = document.createElement('small');
        meta.textContent = item.meta;
        copy.appendChild(meta);
      }

      const actions = document.createElement('div');
      actions.className = 'missing-item-actions';
      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'missing-add';
      add.dataset.action = 'add';
      add.textContent = '+ Felveszem';
      const dismiss = document.createElement('button');
      dismiss.type = 'button';
      dismiss.className = 'missing-dismiss';
      dismiss.dataset.action = 'dismiss';
      dismiss.textContent = 'Most nem';
      actions.append(add,dismiss);

      card.append(icon,copy,actions);
      list.appendChild(card);
    }

    section.hidden = picks.length === 0;
  }

  function schedule(delay=40) {
    clearTimeout(renderTimer);
    renderTimer = window.setTimeout(render,delay);
  }

  list.addEventListener('click',event=>{
    const button = event.target.closest('button[data-action]');
    const card = button?.closest('.missing-item-card');
    if (!button || !card) return;

    const habits = load(HABITS_KEY, {});
    const item = habits[card.dataset.key];
    if (!item) {
      card.remove();
      schedule(0);
      return;
    }

    if (button.dataset.action === 'dismiss') {
      const dismissed = cleanDismissed();
      dismissed[item.key] = Date.now()+DISMISS_MS;
      save(DISMISS_KEY,dismissed);
      card.remove();
      schedule(0);
      return;
    }

    input.value = addText(item);
    input.dispatchEvent(new Event('input',{bubbles:true}));
    form.requestSubmit();
    schedule(70);
  });

  form.addEventListener('submit',()=>schedule(70));
  listRoot.addEventListener('change',()=>schedule(60));
  input.addEventListener('input',()=>schedule(0));
  window.addEventListener('storage',()=>schedule(30));
  document.addEventListener('visibilitychange',()=>{ if (!document.hidden) schedule(0); });

  const observer = new MutationObserver(()=>schedule(50));
  observer.observe(listRoot,{childList:true,subtree:true});

  window.setInterval(()=>schedule(0),30*60*1000);
  render();

  window.ZoeMissingItems2026 = {render, candidates:buildCandidates};
})();