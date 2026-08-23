(() => {
  'use strict';

  // Zoé Lista – ismétlődő listák / sablonok.
  // A sablon nem fagyaszt be árakat: betöltéskor minden tétel a rendes beviteli
  // folyamaton megy át, így az aktuális bolt ármemóriája és a friss becslés él.
  const STATE_KEY = 'zoe-lista-state-v1';
  const TEMPLATES_KEY = 'zoe-lista-templates-v1';
  const ACTIVE_STORE_KEY = 'zoe-lista-active-store-v1';
  const MAX_TEMPLATES = 40;
  const NAME_SUGGESTIONS = ['Heti bevásárlás','Grillezés','Havi nagybevásárlás','Munkahelyre'];

  const form = document.getElementById('addForm');
  const input = document.getElementById('itemInput');
  const toolbar = document.querySelector('.toolbar');
  const listRoot = document.getElementById('listRoot');
  const clearDoneBtn = document.getElementById('clearDoneBtn');
  if (!form || !input || !toolbar || !listRoot) return;

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  function uid() { return crypto.randomUUID?.() || `tpl-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
  function num(value) { return new Intl.NumberFormat('hu-HU',{maximumFractionDigits:2}).format(Number(value) || 1); }
  function cleanInternalName(value) {
    if (window.ZoePackSize2026?.baseFromInternal) return window.ZoePackSize2026.baseFromInternal(value);
    return String(value || '').replace(/\s*⟦\s*\d+(?:[.,]\d+)?\s*(?:g|kg|ml|l|db)\s*⟧\s*$/i,'').trim();
  }
  function packFrom(item) {
    const p = item?.pack || window.ZoePackSize2026?.packFromInternal?.(item?.name);
    if (!p || !(Number(p.value) > 0) || !p.unit) return null;
    return {value:Number(p.value), unit:String(p.unit)};
  }
  function displayName(item) {
    return String(item?.displayName || cleanInternalName(item?.name) || item?.name || '').trim();
  }

  function currentItems() {
    return load(STATE_KEY, []).filter(item => item?.name);
  }

  function snapshotItem(item) {
    return {
      name:displayName(item),
      qty:Math.max(.01, Number(item.qty) || 1),
      unit:String(item.unit || 'db'),
      category:String(item.category || 'Egyéb'),
      icon:String(item.icon || '🛒'),
      pack:packFrom(item)
    };
  }

  function snapshotCurrent() {
    return currentItems().map(snapshotItem);
  }

  function templates() {
    const raw = load(TEMPLATES_KEY, []);
    return Array.isArray(raw) ? raw.filter(t => t?.id && t?.name && Array.isArray(t.items)) : [];
  }

  function saveTemplates(data) {
    save(TEMPLATES_KEY, data.slice(0, MAX_TEMPLATES));
  }

  function selectedStore() {
    const select = document.getElementById('storeProfileSelect');
    const id = select?.value || localStorage.getItem(ACTIVE_STORE_KEY) || 'general';
    const text = select?.selectedOptions?.[0]?.textContent?.trim() || window.ZoeStorePriceMemory2026?.storeLabel?.(id) || '🛒 Általános bolt';
    return {id, label:text};
  }

  function formatInput(item) {
    const name = String(item?.name || '').trim();
    if (!name) return '';
    const qty = Math.max(.01, Number(item.qty) || 1);
    const unit = String(item.unit || 'db');
    const prefix = unit === 'pár' ? `${num(qty)}` : `${num(qty)} ${unit}`;
    const pack = item.pack && Number(item.pack.value) > 0 && item.pack.unit
      ? ` ${num(item.pack.value)} ${item.pack.unit}`
      : '';
    return `${prefix} ${name}${pack}`.trim();
  }

  const openBtn = document.createElement('button');
  openBtn.type = 'button';
  openBtn.className = 'soft-btn template-open-btn';
  openBtn.innerHTML = '<span aria-hidden="true">🔁</span> Sablonok';
  toolbar.appendChild(openBtn);

  const dialog = document.createElement('dialog');
  dialog.className = 'template-dialog';
  dialog.innerHTML = `
    <div class="template-card-shell">
      <div class="template-head">
        <div>
          <h2>🔁 Ismétlődő listák</h2>
          <p>Ments el egy listát, és töltsd vissza később friss árakkal.</p>
        </div>
        <button type="button" class="icon-btn template-close" aria-label="Bezárás">✕</button>
      </div>

      <section class="template-save-box">
        <label>
          <span>Sablon neve</span>
          <input id="templateNameInput" list="templateNameSuggestions" maxlength="60" placeholder="pl. Heti bevásárlás" />
          <datalist id="templateNameSuggestions">
            ${NAME_SUGGESTIONS.map(name => `<option value="${esc(name)}"></option>`).join('')}
          </datalist>
        </label>
        <label class="template-store-check"><input id="templateSaveStore" type="checkbox" checked /> Az aktuális boltprofilt is jegyezze meg</label>
        <button type="button" class="add-btn template-save-btn">Aktuális lista mentése</button>
      </section>

      <div class="template-status" aria-live="polite"></div>
      <div class="template-list"></div>
    </div>`;
  document.body.appendChild(dialog);

  const closeBtn = dialog.querySelector('.template-close');
  const nameInput = dialog.querySelector('#templateNameInput');
  const saveStore = dialog.querySelector('#templateSaveStore');
  const saveBtn = dialog.querySelector('.template-save-btn');
  const status = dialog.querySelector('.template-status');
  const list = dialog.querySelector('.template-list');
  let busy = false;

  function setStatus(text, tone='') {
    status.textContent = text || '';
    status.dataset.tone = tone;
  }

  function cardStoreText(template) {
    return template.store?.label ? ` · ${template.store.label}` : '';
  }

  function render() {
    const data = templates().sort((a,b) => Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0));
    list.innerHTML = '';

    if (!data.length) {
      const empty = document.createElement('div');
      empty.className = 'template-empty';
      empty.innerHTML = '<strong>Még nincs elmentett sablon.</strong><span>Állíts össze egy listát, adj neki nevet, majd mentsd el.</span>';
      list.appendChild(empty);
      return;
    }

    for (const template of data) {
      const card = document.createElement('article');
      card.className = 'template-item';
      card.dataset.id = template.id;

      const names = template.items.slice(0,4).map(item => `${item.icon || '🛒'} ${item.name}`).join(' · ');
      const more = template.items.length > 4 ? ` · +${template.items.length-4}` : '';
      card.innerHTML = `
        <div class="template-item-top">
          <div>
            <strong>${esc(template.name)}</strong>
            <small>${template.items.length} tétel${esc(cardStoreText(template))}</small>
          </div>
          <span class="template-loop" aria-hidden="true">🔁</span>
        </div>
        <div class="template-preview">${esc(names + more)}</div>
        <div class="template-load-actions">
          <button type="button" class="soft-btn" data-act="append">＋ Hozzáfűzés</button>
          <button type="button" class="add-btn" data-act="replace">↻ Lista cseréje</button>
        </div>
        <div class="template-manage-actions">
          <button type="button" data-act="refresh">Frissítés a mostani listából</button>
          <button type="button" data-act="rename">Átnevezés</button>
          <button type="button" data-act="delete">Törlés</button>
        </div>`;
      list.appendChild(card);
    }
  }

  function saveCurrentAs(name, existingId=null) {
    const items = snapshotCurrent();
    if (!items.length) {
      setStatus('A jelenlegi lista üres, nincs mit sablonként menteni.','warn');
      return false;
    }
    const cleanName = String(name || '').trim();
    if (!cleanName) {
      setStatus('Adj nevet a sablonnak.','warn');
      nameInput.focus();
      return false;
    }

    const data = templates();
    const byName = data.find(t => t.name.localeCompare(cleanName,'hu',{sensitivity:'base'}) === 0);
    const target = data.find(t => t.id === existingId) || byName || null;
    const now = Date.now();
    const store = saveStore.checked ? selectedStore() : null;

    if (target) {
      target.name = cleanName;
      target.items = items;
      target.store = store;
      target.updatedAt = now;
      setStatus(`„${cleanName}” frissítve · ${items.length} tétel.`, 'ok');
    } else {
      data.unshift({id:uid(), name:cleanName, items, store, createdAt:now, updatedAt:now, version:1});
      setStatus(`„${cleanName}” elmentve · ${items.length} tétel.`, 'ok');
    }
    saveTemplates(data);
    nameInput.value = '';
    render();
    return true;
  }

  async function activateTemplateStore(template) {
    const storeId = template?.store?.id;
    if (!storeId) return;
    const select = document.getElementById('storeProfileSelect');
    if (!select || ![...select.options].some(o => o.value === storeId)) return;
    if (select.value === storeId) return;
    select.value = storeId;
    select.dispatchEvent(new Event('change',{bubbles:true}));
    await sleep(80);
  }

  async function clearCurrentList() {
    // A kipipáltakat először egyben töröljük, így rejtett állapotban sem maradnak bent.
    clearDoneBtn?.click();
    await sleep(35);

    let guard = 0;
    while (guard++ < 300) {
      const button = listRoot.querySelector('.item button[data-act="remove"]');
      if (!button) break;
      button.click();
      await sleep(12);
    }
  }

  async function addTemplateItems(template) {
    for (let index=0; index<template.items.length; index++) {
      const item = template.items[index];
      const text = formatInput(item);
      if (!text) continue;
      setStatus(`Betöltés… ${index+1}/${template.items.length} · ${item.name}`);
      input.value = text;
      input.dispatchEvent(new Event('input',{bubbles:true}));
      form.requestSubmit();
      await sleep(65);
    }
  }

  async function loadTemplate(template, replace=false) {
    if (busy || !template) return;
    busy = true;
    dialog.classList.add('is-busy');
    try {
      await activateTemplateStore(template);
      if (replace) await clearCurrentList();
      await addTemplateItems(template);
      window.ZoeStorePriceMemory2026?.applyActiveStorePrices?.();
      window.ZoeShoppingHabits2026?.render?.();
      window.ZoeMissingItems2026?.render?.();
      window.dispatchEvent(new CustomEvent('zoe-template-loaded',{detail:{templateId:template.id,replace}}));
      setStatus(`Kész · „${template.name}” · ${template.items.length} tétel.`, 'ok');
      await sleep(220);
      dialog.close();
    } finally {
      busy = false;
      dialog.classList.remove('is-busy');
    }
  }

  saveBtn.addEventListener('click', () => saveCurrentAs(nameInput.value));
  nameInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); saveCurrentAs(nameInput.value); }
  });

  list.addEventListener('click', async event => {
    const button = event.target.closest('button[data-act]');
    const card = button?.closest('.template-item');
    if (!button || !card || busy) return;
    const data = templates();
    const template = data.find(t => t.id === card.dataset.id);
    if (!template) return;

    const action = button.dataset.act;
    if (action === 'append') return loadTemplate(template,false);
    if (action === 'replace') return loadTemplate(template,true);
    if (action === 'refresh') {
      saveCurrentAs(template.name, template.id);
      return;
    }
    if (action === 'rename') {
      const next = String(prompt('Mi legyen a sablon új neve?', template.name) || '').trim();
      if (!next || next === template.name) return;
      template.name = next;
      template.updatedAt = Date.now();
      saveTemplates(data);
      setStatus(`Sablon átnevezve: „${next}”.`,'ok');
      render();
      return;
    }
    if (action === 'delete') {
      if (!confirm(`Törlöd ezt a sablont: ${template.name}?`)) return;
      saveTemplates(data.filter(t => t.id !== template.id));
      setStatus(`„${template.name}” törölve.`);
      render();
    }
  });

  openBtn.addEventListener('click', () => {
    setStatus('');
    render();
    dialog.showModal();
    setTimeout(() => nameInput.focus(), 60);
  });
  closeBtn.addEventListener('click', () => { if (!busy) dialog.close(); });
  dialog.addEventListener('click', event => { if (event.target === dialog && !busy) dialog.close(); });
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  window.addEventListener('storage', event => { if (event.key === TEMPLATES_KEY) render(); });

  window.ZoeListTemplates2026 = {render, templates, snapshotCurrent, loadTemplate};
})();