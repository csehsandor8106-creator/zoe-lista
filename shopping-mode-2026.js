(() => {
  'use strict';

  // Zoé Lista – külön, boltban használható bevásárló mód.
  // Nem módosítja a lista adatait: a meglévő állapotból és bolti útvonalból
  // számolja a következő részleget, a haladást és a vizuális fókuszt.
  const STATE_KEY = 'zoe-lista-state-v1';
  const ACTIVE_ROUTE_KEY = 'zoe-lista-active-route-v1';
  const ACTIVE_STORE_KEY = 'zoe-lista-active-store-v1';
  const PROFILES_KEY = 'zoe-lista-store-profiles-v1';
  const MODE_KEY = 'zoe-lista-shopping-mode-v1';

  const DEFAULT_ROUTE = window.ZoeListLayout?.defaultRoute || [
    'Zöldség-gyümölcs','Pékáru','Hús és felvágott','Hal és tenger gyümölcsei',
    'Tejtermék és tojás','Fagyasztott','Alapélelmiszer','Snack és édesség','Italok',
    'Szeszes italok','Háztartás','Higiénia','Baba és gyermek','Állateledel',
    'Ruházat','Virág és ajándék','Egyéb'
  ];

  const ICONS = {
    'Zöldség-gyümölcs':'🥕','Pékáru':'🥖','Hús és felvágott':'🥩','Hal és tenger gyümölcsei':'🐟',
    'Tejtermék és tojás':'🥛','Fagyasztott':'❄️','Alapélelmiszer':'🍚','Snack és édesség':'🍿',
    'Italok':'🥤','Szeszes italok':'🥃','Háztartás':'🧽','Higiénia':'🧴','Baba és gyermek':'🍼',
    'Állateledel':'🐾','Ruházat':'👕','Virág és ajándék':'💐','Egyéb':'🛒'
  };

  const STORE_LABELS = {
    general:'🛒 Általános bolt', lidl:'🔵 Lidl', aldi:'🔷 Aldi', tesco:'🔴 Tesco', spar:'🟢 SPAR'
  };

  const toolbar = document.querySelector('.toolbar');
  const listRoot = document.getElementById('listRoot');
  const composer = document.querySelector('.composer');
  const form = document.getElementById('addForm');
  const editForm = document.getElementById('editForm');
  if (!toolbar || !listRoot || !composer) return;

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function routeNow() {
    const saved = load(ACTIVE_ROUTE_KEY, []);
    const route = Array.isArray(saved) ? saved.filter((x,i,a)=>DEFAULT_ROUTE.includes(x) && a.indexOf(x)===i) : [];
    for (const category of DEFAULT_ROUTE) if (!route.includes(category)) route.push(category);
    return route;
  }

  function categoryOfSection(section) {
    if (section?.dataset?.family) return section.dataset.family;
    const pill = section?.querySelector('.item .pill:not(.estimate):not(.user)');
    if (pill?.textContent?.trim()) return pill.textContent.trim();
    const title = section?.querySelector('.category-title');
    if (!title) return 'Egyéb';
    const copy = title.cloneNode(true);
    copy.querySelectorAll('span').forEach(node => node.remove());
    return copy.textContent.trim() || 'Egyéb';
  }

  function storeLabel() {
    const id = localStorage.getItem(ACTIVE_STORE_KEY) || 'general';
    const saved = load(PROFILES_KEY, {});
    const custom = saved?.[id];
    if (custom?.name) return `${custom.icon || '🏪'} ${custom.name}`;
    return STORE_LABELS[id] || '🏪 Bolt';
  }

  const startButton = document.createElement('button');
  startButton.type = 'button';
  startButton.className = 'soft-btn shopping-mode-start';
  startButton.innerHTML = '<span aria-hidden="true">🛒</span> Bevásárlás indítása';
  toolbar.prepend(startButton);

  const bar = document.createElement('section');
  bar.className = 'shopping-mode-bar';
  bar.hidden = true;
  bar.setAttribute('aria-live','polite');
  bar.innerHTML = `
    <div class="shopping-mode-top">
      <div class="shopping-mode-next">
        <small class="shopping-mode-eyebrow">Következő</small>
        <strong class="shopping-mode-title">—</strong>
      </div>
      <button type="button" class="shopping-mode-exit">Kilépés</button>
    </div>
    <div class="shopping-mode-meta">
      <span class="shopping-mode-progress-text"></span>
      <span class="shopping-mode-store"></span>
    </div>
    <div class="shopping-mode-track" aria-hidden="true"><span></span></div>`;
  listRoot.insertAdjacentElement('beforebegin', bar);

  const eyebrow = bar.querySelector('.shopping-mode-eyebrow');
  const title = bar.querySelector('.shopping-mode-title');
  const progressText = bar.querySelector('.shopping-mode-progress-text');
  const storeText = bar.querySelector('.shopping-mode-store');
  const progressFill = bar.querySelector('.shopping-mode-track span');
  const exitButton = bar.querySelector('.shopping-mode-exit');

  let active = localStorage.getItem(MODE_KEY) === '1';
  let lastCurrent = '';
  let updateTimer = 0;

  function countState(items) {
    const route = routeNow();
    const map = new Map(route.map(name => [name,{name,total:0,done:0,open:0}]));
    for (const item of items) {
      const category = map.has(item?.category) ? item.category : 'Egyéb';
      const bucket = map.get(category) || map.get('Egyéb');
      bucket.total += 1;
      if (item?.done) bucket.done += 1;
      else bucket.open += 1;
    }
    return {route,map};
  }

  function sectionByCategory(category) {
    return [...listRoot.querySelectorAll(':scope > .category-block')]
      .find(section => categoryOfSection(section) === category) || null;
  }

  function setStickyOffset() {
    const height = Math.max(0, Math.ceil(composer.getBoundingClientRect().height));
    document.documentElement.style.setProperty('--shopping-sticky-top', `${height + 3}px`);
  }

  function decorateSections(route, counts, current) {
    const rank = new Map(route.map((name,index)=>[name,index]));
    for (const section of listRoot.querySelectorAll(':scope > .category-block')) {
      const category = categoryOfSection(section);
      const data = counts.get(category) || {open:0,total:0};
      section.classList.remove('shopping-current','shopping-future','shopping-complete');
      section.style.removeProperty('order');

      if (!active) continue;
      const pos = rank.get(category) ?? 999;
      if (category === current) {
        section.classList.add('shopping-current');
        section.style.order = '-100';
      } else if (data.open > 0) {
        section.classList.add('shopping-future');
        section.style.order = String(pos);
      } else {
        section.classList.add('shopping-complete');
        section.style.order = String(1000 + pos);
      }
    }
  }

  function maybeScroll(current, force=false) {
    if (!active || !current || (!force && current === lastCurrent)) return;
    const section = sectionByCategory(current);
    if (!section) return;
    window.setTimeout(() => {
      section.scrollIntoView({behavior:'smooth',block:'start'});
    }, 80);
  }

  function render(forceScroll=false) {
    clearTimeout(updateTimer);
    const items = load(STATE_KEY, []);
    startButton.disabled = items.length === 0;

    document.body.classList.toggle('shopping-mode', active);
    bar.hidden = !active;
    startButton.setAttribute('aria-pressed', active ? 'true' : 'false');
    if (!active) {
      decorateSections(routeNow(), new Map(), '');
      lastCurrent = '';
      return;
    }

    setStickyOffset();
    const {route,map} = countState(items);
    const current = route.find(category => (map.get(category)?.open || 0) > 0) || '';
    const total = items.length;
    const done = items.filter(item => item?.done).length;
    const remainingDepartments = route.filter(category => (map.get(category)?.open || 0) > 0).length;
    const percent = total ? Math.max(0,Math.min(100,(done/total)*100)) : 0;

    storeText.textContent = storeLabel();
    progressFill.style.width = `${percent}%`;

    if (current) {
      const open = map.get(current)?.open || 0;
      eyebrow.textContent = 'Következő';
      title.textContent = `${ICONS[current] || '🛒'} ${current} · ${open} tétel`;
      progressText.textContent = `${done}/${total} tétel megvan · ${remainingDepartments} részleg van hátra`;
      bar.classList.remove('is-finished');
    } else if (total) {
      eyebrow.textContent = '✅ Kész';
      title.textContent = 'Bevásárlás kész';
      progressText.textContent = `${done}/${total} tétel megvan · minden részleg kész`;
      bar.classList.add('is-finished');
    } else {
      eyebrow.textContent = '🛒 Bevásárló mód';
      title.textContent = 'A lista még üres';
      progressText.textContent = 'Adj hozzá termékeket a kezdéshez.';
      bar.classList.remove('is-finished');
    }

    decorateSections(route,map,current);
    maybeScroll(current, forceScroll || (!!lastCurrent && current !== lastCurrent));
    lastCurrent = current;
  }

  function schedule(delay=35) {
    clearTimeout(updateTimer);
    updateTimer = window.setTimeout(() => render(false), delay);
  }

  function enterMode() {
    const items = load(STATE_KEY, []);
    if (!items.length) return;
    active = true;
    try { localStorage.setItem(MODE_KEY,'1'); } catch {}
    render(true);
  }

  function leaveMode() {
    active = false;
    try { localStorage.removeItem(MODE_KEY); } catch {}
    render(false);
    window.ZoeListLayout?.refresh?.();
  }

  startButton.addEventListener('click', enterMode);
  exitButton.addEventListener('click', leaveMode);

  listRoot.addEventListener('change', event => {
    if (!event.target.closest?.('.check')) return;
    schedule(45);
  });
  listRoot.addEventListener('click', event => {
    if (event.target.closest?.('.qty button') || event.target.closest?.('.mini-btn')) schedule(45);
  });
  form?.addEventListener('submit',()=>schedule(55));
  editForm?.addEventListener('submit',()=>schedule(55));
  window.addEventListener('zoe-store-route-change',()=>schedule(20));
  window.addEventListener('storage',event=>{
    if ([STATE_KEY,ACTIVE_ROUTE_KEY,ACTIVE_STORE_KEY,PROFILES_KEY,MODE_KEY].includes(event.key)) {
      if (event.key === MODE_KEY) active = event.newValue === '1';
      schedule(20);
    }
  });

  const observer = new MutationObserver(()=>schedule(45));
  observer.observe(listRoot,{childList:true,subtree:true});

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(()=>{ if (active) setStickyOffset(); });
    resizeObserver.observe(composer);
  }
  window.addEventListener('resize',()=>{ if (active) setStickyOffset(); },{passive:true});

  window.ZoeShoppingMode2026 = {
    enter:enterMode,
    exit:leaveMode,
    refresh:()=>render(false),
    get active(){ return active; }
  };

  render(active);
})();