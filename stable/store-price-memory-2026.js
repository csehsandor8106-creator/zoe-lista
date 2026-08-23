(() => {
  'use strict';

  // Zoé Lista – bolt szerinti saját ármemória és összehasonlítás.
  // Csak ténylegesen megadott saját árakat rögzít. A becsült árak nem kerülnek ide.
  const STATE_KEY = 'zoe-lista-state-v1';
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const ACTIVE_STORE_KEY = 'zoe-lista-active-store-v1';
  const PROFILES_KEY = 'zoe-lista-store-profiles-v1';
  const STORE_HISTORY_KEY = 'zoe-lista-store-price-memory-v1';
  const MAX_ENTRIES_PER_STORE = 40;

  const STORE_PRESETS = {
    general:{name:'Általános bolt',icon:'🛒'},
    lidl:{name:'Lidl',icon:'🔵'},
    aldi:{name:'Aldi',icon:'🔷'},
    tesco:{name:'Tesco',icon:'🔴'},
    spar:{name:'SPAR',icon:'🟢'}
  };

  const form = document.getElementById('addForm');
  const input = document.getElementById('itemInput');
  const listRoot = document.getElementById('listRoot');
  const editForm = document.getElementById('editForm');
  const editId = document.getElementById('editId');
  const editPrice = document.getElementById('editPrice');
  const totalText = document.getElementById('totalText');
  const countText = document.getElementById('countText');
  if (!form || !input || !listRoot || !editForm || !editId || !editPrice) return;

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

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function historyKey(name, unit) {
    return `${normalize(name)}|${normalize(unit || 'db')}`;
  }

  function money(value) {
    return new Intl.NumberFormat('hu-HU',{maximumFractionDigits:0}).format(Math.round(Number(value)||0)) + ' Ft';
  }

  function dateText(timestamp) {
    return new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(timestamp));
  }

  function median(values) {
    const sorted = values.map(Number).filter(Number.isFinite).sort((a,b)=>a-b);
    if (!sorted.length) return null;
    const mid = Math.floor(sorted.length/2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
  }

  function activeStoreId() {
    return localStorage.getItem(ACTIVE_STORE_KEY) || 'general';
  }

  function storeInfo(storeId) {
    const id = String(storeId || 'general');
    const saved = load(PROFILES_KEY, {});
    const profile = saved?.[id];
    if (profile?.name) return {id,name:String(profile.name),icon:String(profile.icon || '🏪')};
    const preset = STORE_PRESETS[id];
    if (preset) return {id,name:preset.name,icon:preset.icon};
    return {id,name:'Korábbi saját bolt',icon:'🏪'};
  }

  function storeLabel(storeId) {
    const info = storeInfo(storeId);
    return `${info.icon} ${info.name}`;
  }

  function storeLocative(storeId, fallbackName='bolt') {
    if (storeId==='aldi') return 'az Aldiban';
    if (storeId==='lidl') return 'a Lidlben';
    if (storeId==='tesco') return 'a Tescóban';
    if (storeId==='spar') return 'a SPAR-ban';
    if (storeId==='general') return 'az Általános boltban';
    return `ebben a boltban: ${fallbackName}`;
  }

  function loadStoreHistory() {
    return load(STORE_HISTORY_KEY, {});
  }

  function safeRule(name) {
    const learned = load(LEARNED_KEY, {});
    const key = normalize(name);
    if (learned[key]) return learned[key];
    const padded = ` ${key} `;
    let best = null;
    let bestAlias = '';
    for (const [alias, rule] of Object.entries(learned)) {
      if (!rule || alias.length < 5) continue;
      if (padded.includes(` ${alias} `) && alias.length > bestAlias.length) {
        best = rule;
        bestAlias = alias;
      }
    }
    return best;
  }

  function estimateFor(name, unit) {
    const rule = safeRule(name);
    const mapped = Number(rule?.pricesByUnit?.[unit]);
    if (Number.isFinite(mapped) && mapped > 0) return mapped;
    if (rule?.unit === unit && Number(rule?.price) > 0) return Number(rule.price);
    return null;
  }

  function record(name, unit, price, source='manual', timestamp=Date.now(), storeId=activeStoreId()) {
    const p = Number(price);
    if (!name || !Number.isFinite(p) || p <= 0) return false;
    const key = historyKey(name, unit);
    if (!key || key.startsWith('|')) return false;

    const history = loadStoreHistory();
    const bucket = history[key] || {name,unit:unit || 'db',stores:{}};
    bucket.name = name;
    bucket.unit = unit || bucket.unit || 'db';
    bucket.stores = bucket.stores && typeof bucket.stores === 'object' ? bucket.stores : {};

    const info = storeInfo(storeId);
    const store = bucket.stores[storeId] || {storeId,storeName:info.name,storeIcon:info.icon,entries:[]};
    store.storeId = storeId;
    store.storeName = info.name;
    store.storeIcon = info.icon;
    store.entries = Array.isArray(store.entries) ? store.entries : [];

    const last = store.entries[store.entries.length-1];
    if (last && Number(last.price) === p && Math.abs(timestamp-Number(last.at||0)) < 60000) return false;

    store.entries.push({price:p,at:timestamp,source});
    store.entries = store.entries.slice(-MAX_ENTRIES_PER_STORE);
    bucket.stores[storeId] = store;
    history[key] = bucket;
    save(STORE_HISTORY_KEY,history);
    return true;
  }

  function mergeHistory(oldName, oldUnit, newName, newUnit) {
    const oldKey = historyKey(oldName,oldUnit);
    const newKey = historyKey(newName,newUnit);
    if (!oldKey || oldKey === newKey) return;
    const history = loadStoreHistory();
    const oldBucket = history[oldKey];
    if (!oldBucket) return;
    const next = history[newKey] || {name:newName,unit:newUnit || 'db',stores:{}};
    next.name = newName;
    next.unit = newUnit || next.unit || 'db';
    next.stores = next.stores || {};

    for (const [storeId,oldStore] of Object.entries(oldBucket.stores || {})) {
      const current = next.stores[storeId] || {
        storeId,
        storeName:oldStore.storeName || storeInfo(storeId).name,
        storeIcon:oldStore.storeIcon || storeInfo(storeId).icon,
        entries:[]
      };
      current.entries = [...(current.entries || []),...(oldStore.entries || [])]
        .sort((a,b)=>Number(a.at||0)-Number(b.at||0))
        .slice(-MAX_ENTRIES_PER_STORE);
      next.stores[storeId] = current;
    }

    history[newKey] = next;
    delete history[oldKey];
    save(STORE_HISTORY_KEY,history);
  }

  function statsForStore(store) {
    const entries = (store?.entries || []).filter(e=>Number(e.price)>0);
    if (!entries.length) return null;
    const prices = entries.map(e=>Number(e.price));
    return {
      storeId:store.storeId,
      storeName:store.storeName,
      storeIcon:store.storeIcon,
      count:entries.length,
      last:entries[entries.length-1],
      typical:median(prices),
      avg:prices.reduce((a,b)=>a+b,0)/prices.length,
      min:Math.min(...prices),
      entries
    };
  }

  function comparisonFor(name, unit) {
    const bucket = loadStoreHistory()[historyKey(name,unit)];
    if (!bucket) return {bucket:null,stores:[],qualified:[],best:null};
    const stores = Object.values(bucket.stores || {})
      .map(statsForStore)
      .filter(Boolean)
      .sort((a,b)=>a.typical-b.typical || b.count-a.count);
    const qualified = stores.filter(s=>s.count>=2);
    const best = qualified.length>=2 ? qualified[0] : null;
    return {bucket,stores,qualified,best};
  }

  function preferredPrice(name, unit) {
    const history = loadStoreHistory();
    const wantedName = normalize(name);
    const wantedUnit = normalize(unit || '');
    const storeId = activeStoreId();
    const candidates = [];

    for (const [key,bucket] of Object.entries(history)) {
      if (!bucket?.name || normalize(bucket.name)!==wantedName) continue;
      if (wantedUnit && normalize(bucket.unit || 'db')!==wantedUnit) continue;
      const stats = statsForStore(bucket.stores?.[storeId]);
      if (stats) candidates.push({bucket,stats,key});
    }

    if (!candidates.length && !wantedUnit) {
      for (const [key,bucket] of Object.entries(history)) {
        if (!bucket?.name || normalize(bucket.name)!==wantedName) continue;
        const stats = statsForStore(bucket.stores?.[storeId]);
        if (stats) candidates.push({bucket,stats,key});
      }
    }

    if (!candidates.length) return null;
    candidates.sort((a,b)=>Number(b.stats.last.at||0)-Number(a.stats.last.at||0));
    const chosen = candidates[0];
    const info = storeInfo(storeId);
    return {
      price:Number(chosen.stats.last.price),
      unit:chosen.bucket.unit || unit || 'db',
      storeId,
      storeName:info.name,
      storeIcon:info.icon,
      storeLabel:`${info.icon} ${info.name}`,
      at:Number(chosen.stats.last.at||0),
      count:chosen.stats.count
    };
  }

  function extractPrice(text) {
    const match = String(text || '').match(/(?:^|\s)(\d[\d\s.,]*)\s*(?:ft|forint)\s*$/i);
    if (!match) return {text:String(text || ''),price:null};
    return {
      text:String(text || '').slice(0,match.index).trim(),
      price:Number(match[1].replace(/\s/g,'').replace(',','.'))
    };
  }

  function extractQuantity(text) {
    let s=String(text || '').trim(),qty=null,unit=null,m;
    const U='kg|g|l|ml|db|pár|par|csomag|cs|doboz|üveg|uveg|flakon|zacskó|zacsko';
    m=s.match(new RegExp('^(\\d+(?:[.,]\\d+)?)\\s*('+U+')\\s+(.+)$','i'));
    if (m) { qty=Number(m[1].replace(',','.'));unit=normalize(m[2]);s=m[3].trim(); }
    else {
      m=s.match(new RegExp('^(.+?)\\s+(\\d+(?:[.,]\\d+)?)\\s*('+U+')$','i'));
      if (m) { s=m[1].trim();qty=Number(m[2].replace(',','.'));unit=normalize(m[3]); }
      else {
        m=s.match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/);
        if (m) { qty=Number(m[1].replace(',','.'));s=m[2].trim(); }
        else {
          m=s.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)$/);
          if (m) { s=m[1].trim();qty=Number(m[2].replace(',','.')); }
        }
      }
    }
    if (unit==='g') { qty=(qty??1)/1000;unit='kg'; }
    if (unit==='ml') { qty=(qty??1)/1000;unit='l'; }
    if (unit==='uveg'||unit==='üveg') unit='üveg';
    if (unit==='zacsko'||unit==='zacskó'||unit==='cs') unit='csomag';
    if (unit==='par'||unit==='pár') unit='pár';
    return {text:s,qty,unit};
  }

  function preferredForRaw(raw) {
    const priced = extractPrice(raw);
    if (priced.price != null) return null;
    const quantity = extractQuantity(priced.text);
    const name = quantity.text.trim();
    if (!name) return null;
    const rule = safeRule(name);
    const targetUnit = quantity.unit || rule?.unit || '';
    return preferredPrice(name,targetUnit) || preferredPrice(name,'');
  }

  function injectedText(raw, remembered) {
    const priced = extractPrice(raw);
    const quantity = extractQuantity(priced.text);
    if (quantity.unit) return `${priced.text} ${remembered.price} Ft`;
    const qty = quantity.qty ?? 1;
    const q = new Intl.NumberFormat('hu-HU',{maximumFractionDigits:2}).format(qty);
    return `${q} ${remembered.unit || 'db'} ${quantity.text.trim()} ${remembered.price} Ft`;
  }

  function changedItem(before) {
    const after = load(STATE_KEY,[]);
    let item = after.find(i=>!before.has(String(i.id)));
    if (!item) item = after.find(i=>Number(i.qty)!==(before.get(String(i.id))?.qty ?? Number(i.qty)));
    if (!item) item = after.find(i=>Number(i.price)!==(before.get(String(i.id))?.price ?? Number(i.price)));
    return item || null;
  }

  function syncRow(item) {
    if (!item) return;
    const row = listRoot.querySelector(`.item[data-id="${CSS.escape(String(item.id))}"]`);
    if (!row) return;
    const unknown = item.price==null || item.source==='unknown';
    const badge = row.querySelector('.pill.user,.pill.estimate');
    if (badge) {
      badge.textContent = unknown ? 'ár nélkül' : item.source==='user' ? 'saját ár' : '≈ becsült';
      badge.classList.toggle('user',!unknown && item.source==='user');
      badge.classList.toggle('estimate',unknown || item.source!=='user');
    }
    const priceLine = row.querySelector('.price-line');
    if (priceLine) {
      if (unknown) priceLine.innerHTML = '— <span class="unit">(ár megadása a ✎ gombbal)</span>';
      else {
        const qty=Number(item.qty)||1;
        priceLine.innerHTML = `${money((Number(item.price)||0)*qty)} <span class="unit">(${money(item.price)}/${escapeHtml(item.unit||'db')})</span>`;
      }
    }
  }

  function refreshSummary(items=load(STATE_KEY,[])) {
    if (!totalText) return;
    const unknown = items.filter(i=>i?.price==null || i?.source==='unknown');
    const estimated = items.filter(i=>i?.source==='estimate' || i?.source==='estimate-unit');
    const sum = items.reduce((acc,item)=>{
      const price=Number(item?.price),qty=Number(item?.qty)||0;
      return acc + (Number.isFinite(price)?price*qty:0);
    },0);
    totalText.textContent = unknown.length ? `≈ ${money(sum)} + ?` : `${estimated.length?'≈ ':''}${money(sum)}`;
    if (countText) {
      countText.textContent = countText.textContent.replace(/\s*•\s*\d+\s+ár nélkül/g,'');
      if (unknown.length) countText.textContent += ` • ${unknown.length} ár nélkül`;
    }
  }

  function saveTaggedItem(item) {
    const items = load(STATE_KEY,[]);
    const index = items.findIndex(i=>String(i.id)===String(item.id));
    if (index<0) return;
    items[index] = item;
    save(STATE_KEY,items);
    syncRow(item);
    refreshSummary(items);
  }

  function applyActiveStorePrices() {
    const storeId = activeStoreId();
    const items = load(STATE_KEY,[]);
    let changed = false;
    const changedItems = [];

    for (const item of items) {
      if (!item?.name || !item.unit) continue;
      const remembered = preferredPrice(item.name,item.unit);
      if (remembered) {
        if (Number(item.price)!==Number(remembered.price) || item.source!=='user' || item.priceStore!==storeId) {
          item.price = Number(remembered.price);
          item.source = 'user';
          item.priceStore = storeId;
          item.priceStoreMemory = true;
          changed = true;
          changedItems.push(item);
        }
        continue;
      }

      if (storeId!=='general' && item.priceStore && item.priceStore!==storeId) {
        const estimate = estimateFor(item.name,item.unit);
        if (estimate!=null) {
          item.price = estimate;
          item.source = 'estimate';
        } else {
          item.price = null;
          item.source = 'unknown';
        }
        delete item.priceStore;
        delete item.priceStoreMemory;
        changed = true;
        changedItems.push(item);
      }
    }

    if (changed) {
      save(STATE_KEY,items);
      for (const item of changedItems) syncRow(item);
      refreshSummary(items);
    }
    return changed;
  }

  // A store-modul szándékosan a meglévő globális price-history listener UTÁN töltődik.
  // Így a visszahívott bolti memória nem látszik új kézi árbevitelnek az általános történetben.
  form.addEventListener('submit',()=>{
    const originalRaw = input.value.trim();
    if (!originalRaw) return;
    const explicit = extractPrice(originalRaw).price != null;
    const remembered = explicit ? null : preferredForRaw(originalRaw);
    const storeId = activeStoreId();
    const before = new Map(load(STATE_KEY,[]).map(i=>[String(i.id),{qty:Number(i.qty)||0,price:Number(i.price)||0}]));

    if (remembered) input.value = injectedText(originalRaw,remembered);

    window.setTimeout(()=>{
      const item = changedItem(before);
      if (!item) return;

      if (remembered) {
        item.priceStore = storeId;
        item.priceStoreMemory = true;
        item.source = 'user';
        saveTaggedItem(item);
        return;
      }

      if (explicit && item.source==='user') {
        record(item.name,item.unit,item.price,'input',Date.now(),storeId);
        item.priceStore = storeId;
        item.priceStoreMemory = false;
        saveTaggedItem(item);
        renderPanel();
        return;
      }

      // Konkrét boltban egy másik üzlet globális saját ára ne szivárogjon át.
      if (storeId!=='general' && item.source==='user' && item.priceStore!==storeId) {
        const estimate = estimateFor(item.name,item.unit);
        if (estimate!=null) {
          item.price = estimate;
          item.source = 'estimate';
        } else {
          item.price = null;
          item.source = 'unknown';
        }
        delete item.priceStore;
        delete item.priceStoreMemory;
        saveTaggedItem(item);
      }
    },30);
  },true);

  editForm.addEventListener('submit',()=>{
    const id = editId.value;
    const beforeItem = load(STATE_KEY,[]).find(i=>String(i.id)===String(id));
    if (!beforeItem) return;
    const snapshot = {...beforeItem};
    const typedPrice = Number(editPrice.value);
    const storeId = activeStoreId();

    window.setTimeout(()=>{
      const afterItem = load(STATE_KEY,[]).find(i=>String(i.id)===String(id));
      if (!afterItem) return;
      mergeHistory(snapshot.name,snapshot.unit,afterItem.name,afterItem.unit);

      const priceChanged = Number.isFinite(typedPrice) && typedPrice>0 && (
        Number(afterItem.price)!==Number(snapshot.price) || snapshot.source!=='user' || snapshot.priceStore!==storeId
      );
      if (afterItem.source==='user' && priceChanged) {
        record(afterItem.name,afterItem.unit,afterItem.price,'edit',Date.now(),storeId);
        afterItem.priceStore = storeId;
        afterItem.priceStoreMemory = false;
        saveTaggedItem(afterItem);
      }
      renderPanel();
    },35);
  },true);

  // ---- Szerkesztőpanel ----
  const panel = document.createElement('section');
  panel.className = 'store-price-panel';
  panel.setAttribute('aria-live','polite');
  const aggregatePanel = document.querySelector('.price-history-panel');
  if (aggregatePanel) aggregatePanel.insertAdjacentElement('afterend',panel);
  else editPrice.closest('label')?.insertAdjacentElement('afterend',panel);

  function renderPanel() {
    const item = load(STATE_KEY,[]).find(i=>String(i.id)===String(editId.value));
    if (!item) { panel.hidden=true;panel.innerHTML='';return; }

    const comparison = comparisonFor(item.name,item.unit);
    const currentId = activeStoreId();
    const currentInfo = storeInfo(currentId);
    const currentStats = comparison.stores.find(s=>s.storeId===currentId) || null;
    const rows = comparison.stores;

    let verdict = '';
    if (comparison.qualified.length>=2 && comparison.best) {
      const best = comparison.best;
      const second = comparison.qualified[1];
      const gap = second?.typical ? (second.typical-best.typical)/second.typical : 0;
      verdict = gap < 0.02
        ? 'A te adataid alapján a két legjobb bolt ára eddig nagyon közel van egymáshoz.'
        : `A te adataid alapján ezt általában ${storeLocative(best.storeId,best.storeName)} vetted olcsóbban.`;
    } else if (rows.length>=2) {
      verdict = 'Már több boltból van adat, de a biztos összehasonlításhoz még legalább 2-2 saját ár kell.';
    } else if (rows.length===1) {
      verdict = 'Ha ugyanennek a terméknek másik boltban is megadsz árat, Zoé össze tudja majd hasonlítani.';
    } else {
      verdict = 'Még nincs bolthoz kötött saját ár ehhez a termékhez.';
    }

    panel.hidden=false;
    panel.innerHTML = `
      <div class="store-price-title">
        <span>🏪 Bolt szerinti árak</span>
        <small>Aktív: ${escapeHtml(currentInfo.icon)} ${escapeHtml(currentInfo.name)}</small>
      </div>
      ${currentStats ? `<div class="store-price-current"><span>Ebben a boltban legutóbb</span><strong>${money(currentStats.last.price)}</strong><small>${dateText(currentStats.last.at)} · ${currentStats.count} adat</small></div>` : `<div class="store-price-current is-empty"><span>Ebben a boltban még nincs saját árad</span><small>Adj meg egy árat, és Zoé ide menti.</small></div>`}
      ${rows.length ? `<div class="store-price-rows">${rows.map(s=>`
        <div class="store-price-row ${s.storeId===currentId?'is-current':''}">
          <span class="store-price-name">${escapeHtml(s.storeIcon || '🏪')} ${escapeHtml(s.storeName)}</span>
          <span><small>jellemző</small><strong>${money(s.typical)}</strong></span>
          <span><small>legutóbbi</small><strong>${money(s.last.price)}</strong></span>
          <em>${s.count}×</em>
        </div>`).join('')}</div>` : ''}
      <div class="store-price-verdict">💡 ${escapeHtml(verdict)}</div>`;
  }

  listRoot.addEventListener('click',event=>{
    if (!event.target.closest('button[data-act="edit"]')) return;
    window.setTimeout(renderPanel,0);
  });

  window.addEventListener('zoe-store-route-change',()=>{
    applyActiveStorePrices();
    renderPanel();
    input.dispatchEvent(new Event('input',{bubbles:true}));
  });
  window.addEventListener('storage',event=>{
    if ([STORE_HISTORY_KEY,ACTIVE_STORE_KEY,PROFILES_KEY,STATE_KEY].includes(event.key)) {
      if (event.key===ACTIVE_STORE_KEY) applyActiveStorePrices();
      renderPanel();
    }
  });

  window.ZoeStorePriceMemory2026 = {
    activeStoreId,
    storeInfo,
    storeLabel,
    preferredPrice,
    comparisonFor,
    record,
    applyActiveStorePrices,
    render:renderPanel
  };

  window.setTimeout(applyActiveStorePrices,0);
})();