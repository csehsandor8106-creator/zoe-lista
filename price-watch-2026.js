(() => {
  'use strict';

  // Zoé Lista – saját múltból tanuló árfigyelő.
  // Elsődlegesen az aktív bolt biztosan oda kötött árait használja.
  // Ha ott még nincs elég adat, az összesített saját ártörténet a tartalék.
  const STATE_KEY = 'zoe-lista-state-v1';
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const GLOBAL_HISTORY_KEY = 'zoe-lista-price-history-v1';
  const STORE_HISTORY_KEY = 'zoe-lista-store-price-memory-v1';
  const ACTIVE_STORE_KEY = 'zoe-lista-active-store-v1';
  const MIN_STORE_SAMPLES = 2;
  const MIN_GLOBAL_SAMPLES = 3;

  const input = document.getElementById('itemInput');
  const form = document.getElementById('addForm');
  const editPrice = document.getElementById('editPrice');
  const editId = document.getElementById('editId');
  const editForm = document.getElementById('editForm');
  if (!input || !form || !editPrice || !editId || !editForm) return;

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,' ')
      .trim();
  }

  function money(value) {
    return new Intl.NumberFormat('hu-HU',{maximumFractionDigits:0}).format(Math.round(Number(value)||0)) + ' Ft';
  }

  function median(values) {
    const sorted = values.map(Number).filter(Number.isFinite).sort((a,b)=>a-b);
    if (!sorted.length) return null;
    const mid = Math.floor(sorted.length/2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
  }

  function quantile(values, q) {
    const sorted = values.map(Number).filter(Number.isFinite).sort((a,b)=>a-b);
    if (!sorted.length) return null;
    if (sorted.length === 1) return sorted[0];
    const pos = (sorted.length-1)*q;
    const base = Math.floor(pos);
    const rest = pos-base;
    return sorted[base+1] == null ? sorted[base] : sorted[base] + rest*(sorted[base+1]-sorted[base]);
  }

  function robustBand(prices) {
    const clean = prices.map(Number).filter(v=>Number.isFinite(v)&&v>0).sort((a,b)=>a-b);
    if (!clean.length) return null;

    const rawMedian = median(clean);
    let inliers = clean;
    if (clean.length >= 5) {
      const mad = median(clean.map(v=>Math.abs(v-rawMedian))) || 0;
      // Ha a múltban már volt egy nagyon akciós vagy nagyon drága kilengés,
      // az ne tágítsa korlátlanul a „megszokott” sávot.
      const tolerance = Math.max(35, mad*2.8, rawMedian*0.08);
      const filtered = clean.filter(v=>Math.abs(v-rawMedian)<=tolerance);
      if (filtered.length >= 3) inliers = filtered;
    }

    const typical = median(inliers);
    let low = Math.min(...inliers);
    let high = Math.max(...inliers);
    if (inliers.length >= 7) {
      // Sok adatnál a szélső 10%-ot nem tekintjük a hétköznapi ársáv részének.
      low = quantile(inliers,.10);
      high = quantile(inliers,.90);
    }

    return {typical,low,high,count:clean.length,inlierCount:inliers.length};
  }

  function storeInfo(storeId) {
    return window.ZoeStorePriceMemory2026?.storeInfo?.(storeId)
      || {id:storeId,name:storeId==='general'?'Általános bolt':'aktuális bolt',icon:'🏪'};
  }

  function exactHistoryBucket(history, name, unit) {
    const nameKey = normalize(name);
    const unitKey = normalize(unit || '');
    const direct = history[`${nameKey}|${unitKey || 'db'}`];
    if (direct) return direct;

    const matches = Object.values(history || {}).filter(bucket =>
      bucket?.name && normalize(bucket.name)===nameKey && (!unitKey || normalize(bucket.unit||'db')===unitKey)
    );
    if (matches.length === 1) return matches[0];
    return null;
  }

  function storePricesFor(name, unit) {
    const storeId = localStorage.getItem(ACTIVE_STORE_KEY) || 'general';
    const history = load(STORE_HISTORY_KEY,{});
    const bucket = exactHistoryBucket(history,name,unit);
    const entries = (bucket?.stores?.[storeId]?.entries || [])
      .map(e=>Number(e?.price))
      .filter(v=>Number.isFinite(v)&&v>0);
    if (entries.length < MIN_STORE_SAMPLES) return null;
    const info = storeInfo(storeId);
    return {
      prices:entries,
      scope:'store',
      sourceLabel:`${info.icon || '🏪'} ${info.name}`,
      storeId
    };
  }

  function globalPricesFor(name, unit) {
    const history = load(GLOBAL_HISTORY_KEY,{});
    const bucket = exactHistoryBucket(history,name,unit);
    // Az egyszeri régi price-memory migráció csak kezdőpont volt; önmagában ne adjon riasztást.
    const entries = (bucket?.entries || [])
      .filter(e=>Number(e?.price)>0 && e?.source!=='import')
      .map(e=>Number(e.price));
    if (entries.length < MIN_GLOBAL_SAMPLES) return null;
    return {prices:entries,scope:'global',sourceLabel:'összes saját árad'};
  }

  function baselineFor(name, unit) {
    return storePricesFor(name,unit) || globalPricesFor(name,unit) || null;
  }

  function analyze(name, unit, currentPrice) {
    const current = Number(currentPrice);
    if (!name || !Number.isFinite(current) || current<=0) return null;
    const base = baselineFor(name,unit);
    if (!base) return null;
    const band = robustBand(base.prices);
    if (!band?.typical || !band.high) return null;

    // Két zajszűrő egyszerre: relatív és abszolút eltérés.
    // Legalább kb. 8–12% ÉS legalább 50 Ft-os érdemi kilengést várunk.
    const relativeLimit = Math.max(band.high*1.08, band.typical*1.12);
    const absoluteLimit = band.high + Math.max(50, band.typical*0.04);
    const threshold = Math.max(relativeLimit,absoluteLimit);
    if (current < threshold) return null;

    const percent = Math.round(((current-band.typical)/band.typical)*100);
    return {
      ...band,
      current,
      threshold,
      percent,
      scope:base.scope,
      sourceLabel:base.sourceLabel
    };
  }

  function learnedUnit(name) {
    const learned = load(LEARNED_KEY,{});
    const key = normalize(name);
    if (learned[key]?.unit) return learned[key].unit;
    const padded = ` ${key} `;
    let best = null;
    let bestAlias = '';
    for (const [alias,rule] of Object.entries(learned)) {
      if (!rule?.unit || alias.length<5) continue;
      if (padded.includes(` ${alias} `) && alias.length>bestAlias.length) {
        best = rule;
        bestAlias = alias;
      }
    }
    return best?.unit || null;
  }

  function parseTyped(raw) {
    const text = String(raw || '').trim();
    const priceMatch = text.match(/(?:^|\s)(\d[\d\s.,]*)\s*(?:ft|forint)\s*$/i);
    if (!priceMatch) return null;
    const price = Number(priceMatch[1].replace(/\s/g,'').replace(',','.'));
    if (!(price>0)) return null;

    let body = text.slice(0,priceMatch.index).trim();
    let unit = null;
    const U = 'kg|g|l|ml|db|pár|par|csomag|cs|doboz|üveg|uveg|flakon|zacskó|zacsko';
    let match = body.match(new RegExp('^(\\d+(?:[.,]\\d+)?)\\s*('+U+')\\s+(.+)$','i'));
    if (match) {
      unit = normalize(match[2]);
      body = match[3].trim();
    } else {
      match = body.match(new RegExp('^(.+?)\\s+(\\d+(?:[.,]\\d+)?)\\s*('+U+')$','i'));
      if (match) {
        body = match[1].trim();
        unit = normalize(match[3]);
      } else {
        match = body.match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/);
        if (match) body = match[2].trim();
        else {
          match = body.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)$/);
          if (match) body = match[1].trim();
        }
      }
    }

    if (unit==='g') unit='kg';
    if (unit==='ml') unit='l';
    if (unit==='uveg'||unit==='üveg') unit='üveg';
    if (unit==='zacsko'||unit==='zacskó'||unit==='cs') unit='csomag';
    if (unit==='par'||unit==='pár') unit='pár';
    unit = unit || learnedUnit(body) || inferUniqueUnit(body) || 'db';
    return {name:body,unit,price};
  }

  function inferUniqueUnit(name) {
    const wanted = normalize(name);
    const units = new Set();
    for (const history of [load(STORE_HISTORY_KEY,{}),load(GLOBAL_HISTORY_KEY,{})]) {
      for (const bucket of Object.values(history || {})) {
        if (bucket?.name && normalize(bucket.name)===wanted && bucket.unit) units.add(bucket.unit);
      }
    }
    return units.size===1 ? [...units][0] : null;
  }

  const livePanel = document.createElement('div');
  livePanel.className = 'price-watch price-watch-live';
  livePanel.hidden = true;
  livePanel.setAttribute('aria-live','polite');
  const preview = document.getElementById('inputPreview');
  const help = document.querySelector('.composer .quick-help');
  (preview || help)?.insertAdjacentElement('afterend',livePanel);

  const editPanel = document.createElement('div');
  editPanel.className = 'price-watch price-watch-edit';
  editPanel.hidden = true;
  editPanel.setAttribute('aria-live','polite');
  const storePanel = document.querySelector('.store-price-panel');
  const aggregatePanel = document.querySelector('.price-history-panel');
  (storePanel || aggregatePanel || editPrice.closest('label'))?.insertAdjacentElement('afterend',editPanel);

  function renderWarning(panel, analysis) {
    if (!analysis) {
      panel.hidden = true;
      panel.innerHTML = '';
      return;
    }
    const rangeSame = Math.round(analysis.low)===Math.round(analysis.high);
    const range = rangeSame
      ? `korábban jellemzően ${money(analysis.typical)}`
      : `a megszokott sávod ${money(analysis.low)}–${money(analysis.high)}`;
    const source = analysis.scope==='store'
      ? `${analysis.sourceLabel} saját adatai alapján`
      : 'a saját ártörténeted alapján';

    panel.innerHTML = `
      <span class="price-watch-icon" aria-hidden="true">📉</span>
      <span class="price-watch-copy">
        <strong>Ez most a megszokottnál drágább.</strong>
        <small>${range}; a mostani ${money(analysis.current)} kb. ${Math.max(1,analysis.percent)}%-kal van a jellemző árad fölött · ${source}.</small>
      </span>`;
    panel.hidden = false;
  }

  function renderLive() {
    const parsed = parseTyped(input.value);
    if (!parsed) return renderWarning(livePanel,null);
    renderWarning(livePanel,analyze(parsed.name,parsed.unit,parsed.price));
  }

  function renderEdit() {
    const item = load(STATE_KEY,[]).find(i=>String(i?.id)===String(editId.value));
    const price = Number(editPrice.value);
    if (!item || !(price>0)) return renderWarning(editPanel,null);
    renderWarning(editPanel,analyze(item.name,item.unit,price));
  }

  let frame = 0;
  function scheduleLive() {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(()=>{frame=0;renderLive();});
  }

  input.addEventListener('input',scheduleLive);
  input.addEventListener('focus',scheduleLive);
  form.addEventListener('submit',()=>setTimeout(renderLive,0));
  editPrice.addEventListener('input',renderEdit);
  editPrice.addEventListener('focus',renderEdit);
  document.getElementById('listRoot')?.addEventListener('click',event=>{
    if (event.target.closest('button[data-act="edit"]')) setTimeout(renderEdit,0);
  });
  editForm.addEventListener('submit',()=>setTimeout(()=>renderWarning(editPanel,null),0));
  window.addEventListener('zoe-store-route-change',()=>{scheduleLive();renderEdit();});
  window.addEventListener('storage',event=>{
    if ([STORE_HISTORY_KEY,GLOBAL_HISTORY_KEY,ACTIVE_STORE_KEY].includes(event.key)) {
      scheduleLive();
      renderEdit();
    }
  });

  window.ZoePriceWatch2026 = {analyze,baselineFor,robustBand};
  renderLive();
})();