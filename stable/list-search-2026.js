(() => {
  'use strict';

  // Zoé Lista – gyors, csak megjelenítést érintő keresés/szűrés.
  // Nem módosít listaadatot: a már kirenderelt tételeket rejti/mutatja.
  const STATE_KEY = 'zoe-lista-state-v1';
  const SESSION_KEY = 'zoe-lista-search-v1';

  const toolbar = document.querySelector('.toolbar');
  const listRoot = document.getElementById('listRoot');
  if (!toolbar || !listRoot) return;

  const load = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };
  const loadSession = () => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || {}; }
    catch { return {}; }
  };
  const saveSession = value => {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(value)); } catch {}
  };
  const normalize = value => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

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

  const openBtn = document.createElement('button');
  openBtn.type = 'button';
  openBtn.className = 'soft-btn list-search-open';
  openBtn.innerHTML = '<span aria-hidden="true">🔍</span> Keresés';
  openBtn.setAttribute('aria-expanded', 'false');
  toolbar.appendChild(openBtn);

  const panel = document.createElement('section');
  panel.className = 'list-search-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Keresés a bevásárlólistában');
  panel.innerHTML = `
    <div class="list-search-row">
      <label class="list-search-input-wrap">
        <span aria-hidden="true">🔍</span>
        <input class="list-search-input" type="search" inputmode="search" autocomplete="off" placeholder="Termék vagy kategória…" aria-label="Termék vagy kategória keresése" />
      </label>
      <select class="list-search-category" aria-label="Kategória szűrése">
        <option value="">Minden kategória</option>
      </select>
      <button type="button" class="list-search-clear" aria-label="Keresés törlése">×</button>
    </div>
    <div class="list-search-meta">
      <span class="list-search-count">0 / 0 tétel</span>
      <span class="list-search-hint">Ékezet nélkül is kereshetsz</span>
    </div>`;
  listRoot.insertAdjacentElement('beforebegin', panel);

  const empty = document.createElement('div');
  empty.className = 'list-search-empty';
  empty.hidden = true;
  empty.innerHTML = '<span>🔎</span><strong>Nincs találat erre a szűrésre.</strong><small>Próbálj másik terméknevet vagy kategóriát.</small>';
  panel.insertAdjacentElement('afterend', empty);

  const input = panel.querySelector('.list-search-input');
  const category = panel.querySelector('.list-search-category');
  const clearBtn = panel.querySelector('.list-search-clear');
  const count = panel.querySelector('.list-search-count');
  let applyTimer = 0;
  let opened = false;

  function itemCount() {
    const items = load(STATE_KEY, []);
    return Array.isArray(items) ? items.length : 0;
  }

  function categoryValues() {
    const values = new Set();
    const items = load(STATE_KEY, []);
    for (const item of Array.isArray(items) ? items : []) {
      if (item?.category) values.add(String(item.category));
    }
    for (const section of listRoot.querySelectorAll(':scope > .category-block')) {
      const value = categoryOfSection(section);
      if (value) values.add(value);
    }
    return [...values].sort((a,b) => a.localeCompare(b, 'hu', {sensitivity:'base'}));
  }

  function refreshCategoryOptions() {
    const current = category.value;
    const values = categoryValues();
    const signature = values.join('\u0001');
    if (category.dataset.signature === signature) return;
    category.dataset.signature = signature;
    category.innerHTML = '<option value="">Minden kategória</option>' + values
      .map(value => `<option value="${value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}">${value.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</option>`)
      .join('');
    if (values.includes(current)) category.value = current;
  }

  function searchState() {
    return {query: input.value, category: category.value, opened};
  }

  function isFiltering() {
    return Boolean(normalize(input.value) || category.value);
  }

  function applyFilter() {
    clearTimeout(applyTimer);
    refreshCategoryOptions();

    const query = normalize(input.value);
    const selectedCategory = category.value;
    const sections = [...listRoot.querySelectorAll(':scope > .category-block')];
    let renderedTotal = 0;
    let visible = 0;

    for (const section of sections) {
      const sectionCategory = categoryOfSection(section);
      const categoryMatch = !selectedCategory || sectionCategory === selectedCategory;
      let sectionVisible = 0;

      for (const row of section.querySelectorAll(':scope .item')) {
        renderedTotal++;
        const name = row.querySelector('.item-name')?.textContent || '';
        const haystack = normalize(`${name} ${sectionCategory}`);
        const queryMatch = !query || haystack.includes(query);
        const matches = categoryMatch && queryMatch;
        row.classList.toggle('list-search-hidden', !matches);
        if (matches) { visible++; sectionVisible++; }
      }

      section.classList.toggle('list-search-hidden', sectionVisible === 0);
    }

    // A core üresállapotát kereséskor elrejtjük, mert ilyenkor saját találatüzenetünk van.
    const coreEmpty = listRoot.querySelector(':scope > .empty');
    const filtering = isFiltering();
    if (coreEmpty) coreEmpty.classList.toggle('list-search-core-empty-hidden', filtering);

    const total = Math.max(renderedTotal, itemCount());
    count.textContent = filtering ? `${visible} / ${total} tétel` : `${total} tétel`;
    empty.hidden = !(opened && filtering && total > 0 && visible === 0);
    openBtn.classList.toggle('is-active', filtering);
    clearBtn.disabled = !filtering;
    saveSession(searchState());
  }

  function scheduleApply(delay = 20) {
    clearTimeout(applyTimer);
    applyTimer = setTimeout(applyFilter, delay);
  }

  function setOpened(value, focus = false) {
    opened = Boolean(value);
    panel.hidden = !opened;
    openBtn.setAttribute('aria-expanded', opened ? 'true' : 'false');
    openBtn.classList.toggle('is-open', opened);
    if (!opened) {
      input.value = '';
      category.value = '';
      empty.hidden = true;
    }
    applyFilter();
    if (opened && focus) setTimeout(() => input.focus(), 40);
  }

  function clearFilter() {
    input.value = '';
    category.value = '';
    applyFilter();
    input.focus();
  }

  openBtn.addEventListener('click', () => setOpened(!opened, !opened));
  input.addEventListener('input', () => scheduleApply(0));
  category.addEventListener('change', () => scheduleApply(0));
  clearBtn.addEventListener('click', clearFilter);
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (isFiltering()) clearFilter();
      else setOpened(false);
    }
  });

  // Az app gyakran teljesen újrarendereli a listát. Csak childList változásokat
  // figyelünk, így a saját class kapcsolgatásunk nem indít megfigyelőhurkot.
  const observer = new MutationObserver(() => scheduleApply(25));
  observer.observe(listRoot, {childList:true, subtree:true});
  window.addEventListener('storage', event => {
    if (event.key === STATE_KEY) scheduleApply(10);
  });
  window.addEventListener('zoe-action-undone', () => scheduleApply(15));

  const remembered = loadSession();
  if (remembered.opened) {
    opened = true;
    panel.hidden = false;
    input.value = String(remembered.query || '');
    refreshCategoryOptions();
    if ([...category.options].some(option => option.value === remembered.category)) category.value = remembered.category;
    openBtn.setAttribute('aria-expanded','true');
    openBtn.classList.add('is-open');
  }
  applyFilter();

  window.ZoeListSearch2026 = {
    open: () => setOpened(true, true),
    close: () => setOpened(false),
    clear: clearFilter,
    apply: applyFilter
  };
})();