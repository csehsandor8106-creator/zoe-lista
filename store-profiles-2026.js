(() => {
  'use strict';

  const PROFILES_KEY = 'zoe-lista-store-profiles-v1';
  const ACTIVE_PROFILE_KEY = 'zoe-lista-active-store-v1';
  const ACTIVE_ROUTE_KEY = 'zoe-lista-active-route-v1';

  const DEFAULT_ROUTE = window.ZoeListLayout?.defaultRoute || [
    'Zöldség-gyümölcs','Pékáru','Hús és felvágott','Hal és tenger gyümölcsei',
    'Tejtermék és tojás','Fagyasztott','Alapélelmiszer','Snack és édesség','Italok',
    'Szeszes italok','Háztartás','Higiénia','Baba és gyermek','Állateledel',
    'Ruházat','Virág és ajándék','Egyéb'
  ];

  // Kiinduló SABLONOK, nem hivatalos alaprajzok. Üzletenként eltérhetnek,
  // ezért mindegyik útvonala szabadon szerkeszthető a készüléken.
  const BASE_PROFILES = {
    general:{name:'Általános bolt', icon:'🛒', preset:true, route:[...DEFAULT_ROUTE]},
    lidl:{name:'Lidl', icon:'🔵', preset:true, route:[
      'Zöldség-gyümölcs','Pékáru','Hús és felvágott','Hal és tenger gyümölcsei','Tejtermék és tojás',
      'Alapélelmiszer','Snack és édesség','Fagyasztott','Italok','Szeszes italok','Háztartás','Higiénia',
      'Baba és gyermek','Állateledel','Ruházat','Virág és ajándék','Egyéb'
    ]},
    aldi:{name:'Aldi', icon:'🔷', preset:true, route:[
      'Pékáru','Zöldség-gyümölcs','Hús és felvágott','Tejtermék és tojás','Hal és tenger gyümölcsei',
      'Alapélelmiszer','Snack és édesség','Fagyasztott','Italok','Szeszes italok','Háztartás','Higiénia',
      'Baba és gyermek','Állateledel','Ruházat','Virág és ajándék','Egyéb'
    ]},
    tesco:{name:'Tesco', icon:'🔴', preset:true, route:[
      'Zöldség-gyümölcs','Pékáru','Hús és felvágott','Hal és tenger gyümölcsei','Tejtermék és tojás',
      'Alapélelmiszer','Snack és édesség','Italok','Szeszes italok','Fagyasztott','Háztartás','Higiénia',
      'Baba és gyermek','Állateledel','Ruházat','Virág és ajándék','Egyéb'
    ]},
    spar:{name:'SPAR', icon:'🟢', preset:true, route:[
      'Zöldség-gyümölcs','Pékáru','Hús és felvágott','Hal és tenger gyümölcsei','Tejtermék és tojás',
      'Alapélelmiszer','Fagyasztott','Snack és édesség','Italok','Szeszes italok','Háztartás','Higiénia',
      'Baba és gyermek','Állateledel','Virág és ajándék','Ruházat','Egyéb'
    ]}
  };

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
  function normalizeRoute(route) {
    const out = [];
    for (const name of Array.isArray(route) ? route : []) {
      if (DEFAULT_ROUTE.includes(name) && !out.includes(name)) out.push(name);
    }
    for (const name of DEFAULT_ROUTE) if (!out.includes(name)) out.push(name);
    return out;
  }
  function loadProfiles() {
    const saved = load(PROFILES_KEY, {});
    const merged = clone(BASE_PROFILES);
    for (const [id, profile] of Object.entries(saved || {})) {
      if (!profile || !profile.name) continue;
      merged[id] = {
        name:String(profile.name),
        icon:String(profile.icon || '🏪'),
        preset:Boolean(BASE_PROFILES[id]?.preset),
        route:normalizeRoute(profile.route)
      };
    }
    return merged;
  }
  function savedOnlyFrom(profiles) {
    const out = {};
    for (const [id, p] of Object.entries(profiles)) {
      const base = BASE_PROFILES[id];
      const differs = !base || JSON.stringify(normalizeRoute(p.route)) !== JSON.stringify(normalizeRoute(base.route)) || p.name !== base.name || p.icon !== base.icon;
      if (!base || differs) out[id] = {name:p.name, icon:p.icon, route:normalizeRoute(p.route)};
    }
    return out;
  }

  let profiles = loadProfiles();
  let activeId = localStorage.getItem(ACTIVE_PROFILE_KEY) || 'general';
  if (!profiles[activeId]) activeId = 'general';

  function applyActiveRoute() {
    const profile = profiles[activeId] || profiles.general;
    const route = normalizeRoute(profile.route);
    save(ACTIVE_ROUTE_KEY, route);
    try { localStorage.setItem(ACTIVE_PROFILE_KEY, activeId); } catch {}
    window.dispatchEvent(new CustomEvent('zoe-store-route-change', {detail:{profileId:activeId, route:[...route]}}));
  }

  const composer = document.querySelector('.composer');
  const toolbar = document.querySelector('.toolbar');
  if (!composer || !toolbar) return;

  const bar = document.createElement('section');
  bar.className = 'store-profile-bar';
  bar.setAttribute('aria-label', 'Üzletprofil');
  bar.innerHTML = `
    <label class="store-profile-select-wrap">
      <span>🏪 Bolt</span>
      <select id="storeProfileSelect" aria-label="Aktív üzlet"></select>
    </label>
    <button id="storeRouteBtn" class="store-route-btn" type="button">↕ Útvonal</button>
  `;
  toolbar.insertAdjacentElement('beforebegin', bar);

  const select = bar.querySelector('#storeProfileSelect');
  const routeBtn = bar.querySelector('#storeRouteBtn');

  const dialog = document.createElement('dialog');
  dialog.className = 'store-route-dialog';
  dialog.innerHTML = `
    <div class="store-route-card">
      <div class="store-route-head">
        <div>
          <h2>🏪 Bolti útvonal</h2>
          <p>A sablon csak kiindulópont — az adott üzlethez szabadon átrendezheted.</p>
        </div>
        <button type="button" class="icon-btn store-route-close" aria-label="Bezárás">✕</button>
      </div>
      <div class="store-route-profile-line">
        <strong id="storeRouteProfileName"></strong>
        <button type="button" class="soft-btn store-copy-btn">＋ Saját bolt</button>
      </div>
      <ol id="storeRouteList" class="store-route-list"></ol>
      <div class="store-route-actions">
        <button type="button" class="soft-btn store-reset-btn">Alap visszaállítása</button>
        <button type="button" class="soft-btn store-delete-btn" hidden>Saját profil törlése</button>
        <button type="button" class="add-btn store-save-btn">Mentés</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  const routeList = dialog.querySelector('#storeRouteList');
  const profileName = dialog.querySelector('#storeRouteProfileName');
  const closeBtn = dialog.querySelector('.store-route-close');
  const saveBtn = dialog.querySelector('.store-save-btn');
  const resetBtn = dialog.querySelector('.store-reset-btn');
  const copyBtn = dialog.querySelector('.store-copy-btn');
  const deleteBtn = dialog.querySelector('.store-delete-btn');
  let draftRoute = [];

  function renderSelect() {
    const ids = Object.keys(profiles);
    ids.sort((a,b) => {
      const ai = Object.prototype.hasOwnProperty.call(BASE_PROFILES, a) ? Object.keys(BASE_PROFILES).indexOf(a) : 999;
      const bi = Object.prototype.hasOwnProperty.call(BASE_PROFILES, b) ? Object.keys(BASE_PROFILES).indexOf(b) : 999;
      return ai - bi || profiles[a].name.localeCompare(profiles[b].name, 'hu', {sensitivity:'base'});
    });
    select.innerHTML = ids.map(id => `<option value="${id}">${profiles[id].icon} ${profiles[id].name}</option>`).join('');
    select.value = activeId;
  }

  function renderRoute() {
    const profile = profiles[activeId];
    profileName.textContent = `${profile.icon} ${profile.name}`;
    deleteBtn.hidden = Boolean(BASE_PROFILES[activeId]);
    routeList.innerHTML = draftRoute.map((name, index) => {
      const color = window.ZoeListLayout?.colors?.[name] || '#7d8589';
      return `<li class="store-route-row" data-index="${index}" style="--route-color:${color}">
        <span class="store-route-number">${index + 1}</span>
        <span class="store-route-name">${name}</span>
        <span class="store-route-move">
          <button type="button" data-move="up" aria-label="${name} feljebb" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" data-move="down" aria-label="${name} lejjebb" ${index === draftRoute.length - 1 ? 'disabled' : ''}>↓</button>
        </span>
      </li>`;
    }).join('');
  }

  function openEditor() {
    draftRoute = normalizeRoute(profiles[activeId]?.route);
    renderRoute();
    dialog.showModal();
  }

  select.addEventListener('change', () => {
    if (!profiles[select.value]) return;
    activeId = select.value;
    applyActiveRoute();
  });

  routeBtn.addEventListener('click', openEditor);
  closeBtn.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.close();
  });

  routeList.addEventListener('click', e => {
    const btn = e.target.closest('button[data-move]');
    if (!btn) return;
    const row = btn.closest('.store-route-row');
    const index = Number(row?.dataset.index);
    if (!Number.isInteger(index)) return;
    const next = btn.dataset.move === 'up' ? index - 1 : index + 1;
    if (next < 0 || next >= draftRoute.length) return;
    [draftRoute[index], draftRoute[next]] = [draftRoute[next], draftRoute[index]];
    renderRoute();
  });

  saveBtn.addEventListener('click', () => {
    profiles[activeId].route = normalizeRoute(draftRoute);
    save(PROFILES_KEY, savedOnlyFrom(profiles));
    applyActiveRoute();
    dialog.close();
  });

  resetBtn.addEventListener('click', () => {
    if (BASE_PROFILES[activeId]) draftRoute = [...BASE_PROFILES[activeId].route];
    else draftRoute = [...DEFAULT_ROUTE];
    renderRoute();
  });

  copyBtn.addEventListener('click', () => {
    const proposed = prompt('Mi legyen a saját üzletprofil neve?', `${profiles[activeId].name} – saját`);
    const name = String(proposed || '').trim();
    if (!name) return;
    const id = `custom-${Date.now()}`;
    profiles[id] = {name, icon:'🏪', preset:false, route:normalizeRoute(draftRoute)};
    activeId = id;
    save(PROFILES_KEY, savedOnlyFrom(profiles));
    renderSelect();
    applyActiveRoute();
    draftRoute = [...profiles[id].route];
    renderRoute();
  });

  deleteBtn.addEventListener('click', () => {
    if (BASE_PROFILES[activeId]) return;
    if (!confirm(`Törlöd ezt az üzletprofilt: ${profiles[activeId].name}?`)) return;
    delete profiles[activeId];
    activeId = 'general';
    save(PROFILES_KEY, savedOnlyFrom(profiles));
    renderSelect();
    applyActiveRoute();
    dialog.close();
  });

  renderSelect();
  applyActiveRoute();
})();
