(() => {
  'use strict';

  // Zoé Lista – kiszerelésfelismerés.
  // A vásárlási mennyiség és a csomag mérete külön adat:
  // 2 Milka 100 g 599 Ft => 2 db csomag, 100 g/csomag, 599 Ft/csomag.
  const STATE_KEY = 'zoe-lista-state-v1';
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const INTERNAL_RE = /\s*⟦\s*(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|db)\s*⟧\s*$/i;
  const FRESH_CATEGORIES = new Set(['Zöldség-gyümölcs','Hús és felvágott','Hal és tenger gyümölcsei']);
  const DISCRETE_UNITS = new Set(['db','csomag','doboz','üveg','flakon','pár']);

  const form = document.getElementById('addForm');
  const input = document.getElementById('itemInput');
  const listRoot = document.getElementById('listRoot');
  const editForm = document.getElementById('editForm');
  const editId = document.getElementById('editId');
  const editName = document.getElementById('editName');
  const editUnit = document.getElementById('editUnit');
  const editPrice = document.getElementById('editPrice');
  if (!form || !input || !listRoot || !editForm || !editId || !editName || !editUnit || !editPrice) return;

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
  function normalize(value) {
    return String(value || '').toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  }
  function num(value) {
    return new Intl.NumberFormat('hu-HU',{maximumFractionDigits:2}).format(Number(value) || 0);
  }
  function money(value) {
    return new Intl.NumberFormat('hu-HU',{maximumFractionDigits:0}).format(Math.round(Number(value) || 0)) + ' Ft';
  }
  function canonicalUnit(unit) {
    const u = normalize(unit);
    if (u==='uveg' || u==='üveg') return 'üveg';
    if (u==='par' || u==='pár') return 'pár';
    if (u==='cs' || u==='zacsko' || u==='zacskó') return 'csomag';
    return u;
  }
  function standardUnit(unit) {
    const u = canonicalUnit(unit);
    if (u==='g' || u==='kg') return 'kg';
    if (u==='ml' || u==='l') return 'l';
    if (u==='db') return 'db';
    return u;
  }
  function standardAmount(value, unit) {
    const n = Number(value);
    const u = canonicalUnit(unit);
    if (!(n > 0)) return null;
    if (u==='g') return n/1000;
    if (u==='ml') return n/1000;
    return n;
  }
  function packLabel(pack) {
    return pack ? `${num(pack.value)} ${canonicalUnit(pack.unit)}` : '';
  }
  function compactPack(pack) {
    const n = String(Number(pack.value)).replace('.',',');
    return `${n}${canonicalUnit(pack.unit)}`;
  }
  function internalName(baseName, pack) {
    return `${String(baseName || '').trim()} ⟦${compactPack(pack)}⟧`.trim();
  }
  function cleanInternal(value) {
    return String(value || '').replace(INTERNAL_RE, (_,v,u)=>` ${num(String(v).replace(',','.'))} ${canonicalUnit(u)}`).trim();
  }
  function baseFromInternal(value) {
    return String(value || '').replace(INTERNAL_RE,'').trim();
  }
  function packFromInternal(value) {
    const m = String(value || '').match(INTERNAL_RE);
    if (!m) return null;
    return makePack(Number(String(m[1]).replace(',','.')),m[2]);
  }
  function makePack(value, unit) {
    const v = Number(value), u = canonicalUnit(unit);
    if (!(v > 0) || !['g','kg','ml','l','db'].includes(u)) return null;
    return {value:v,unit:u,standardUnit:standardUnit(u),standardAmount:standardAmount(v,u)};
  }

  function safeRule(name) {
    const learned = load(LEARNED_KEY,{});
    const key = normalize(name);
    if (learned[key]) return learned[key];
    const padded = ` ${key} `;
    let best = null, bestAlias = '';
    for (const [alias,rule] of Object.entries(learned)) {
      if (!rule || alias.length < 5) continue;
      if (padded.includes(` ${alias} `) && alias.length > bestAlias.length) {
        best = rule; bestAlias = alias;
      }
    }
    return best;
  }

  function splitPrice(raw) {
    const text = String(raw || '').trim();
    const m = text.match(/(?:^|\s)(\d[\d\s.,]*)\s*(?:ft|forint)\s*$/i);
    if (!m) return {body:text,price:null,priceText:''};
    const price = Number(m[1].replace(/\s/g,'').replace(',','.'));
    return {body:text.slice(0,m.index).trim(),price:Number.isFinite(price)?price:null,priceText:`${m[1].trim()} Ft`};
  }

  function splitPurchasePrefix(body) {
    const text = String(body || '').trim();
    const m = text.match(/^(\d+(?:[.,]\d+)?)\s*(db|csomag|doboz|üveg|uveg|flakon|pár|par)?\s+(.+)$/i);
    if (!m) return {rest:text,qty:null,unit:null};
    // „100 g Milka” ne legyen 100 darab Milka.
    if (!m[2] && /^(g|kg|ml|l)\b/i.test(m[3])) return {rest:text,qty:null,unit:null};
    return {
      rest:m[3].trim(),
      qty:Number(m[1].replace(',','.')),
      unit:m[2] ? canonicalUnit(m[2]) : null
    };
  }

  function likelyPackaging(baseName, pack, rule, hasPurchasePrefix, explicitPrice) {
    if (!pack || !baseName) return false;
    if (hasPurchasePrefix) return true;

    const defUnit = canonicalUnit(rule?.unit || '');
    const defStandard = standardUnit(defUnit);
    const packStandard = pack.standardUnit;
    const category = rule?.category || '';

    if (pack.unit === 'db') {
      if (defUnit && defUnit !== 'db') return true;
      return /\b(toj[aá]s|kapszula|tabletta|tasak|filter)\b/i.test(baseName);
    }

    // Ha a katalógus alapegysége más, ez tipikusan csomagméret:
    // Milka(db) 100 g, Cola(db) 1,75 l, kávé(csomag) 500 g.
    if (defUnit && defStandard !== packStandard) return true;
    if (defUnit && DISCRETE_UNITS.has(defUnit)) return true;

    // Kimért hús/zöldség/hal esetén a kg/g továbbra is vásárlási mennyiség.
    if (FRESH_CATEGORIES.has(category) && defStandard === packStandard) return false;

    // Azonos kg/l alapegységnél ár nélkül maradjon a régi mennyiségértelmezés.
    // Saját ár mellett viszont a csomagár erős jel (pl. rizs 2 kg 1599 Ft).
    if (explicitPrice != null && defStandard === packStandard) return true;

    // Ismeretlen, de tipikus fogyasztói kiszerelés: óvatos tartalék.
    if (!rule && explicitPrice != null) return true;
    if (!rule && ['g','ml'].includes(pack.unit)) return true;
    if (!rule && pack.unit==='l' && pack.value <= 5) return true;
    return false;
  }

  function parse(raw) {
    const priced = splitPrice(raw);
    let body = priced.body;

    // Már belső névvel meghívott submit (pl. bolti ár-visszahívás) is felismerhető.
    const existingPack = packFromInternal(body);
    if (existingPack) {
      const baseName = baseFromInternal(body).replace(/^\d+(?:[.,]\d+)?\s+(?:db|csomag|doboz|üveg|flakon|pár)\s+/i,'').trim();
      const prefix = splitPurchasePrefix(body.replace(INTERNAL_RE, m=>m));
      const rule = safeRule(baseName);
      return {
        isPack:true,baseName,pack:existingPack,rule,
        purchaseQty:prefix.qty || 1,
        purchaseUnit:prefix.unit || (DISCRETE_UNITS.has(canonicalUnit(rule?.unit)) ? canonicalUnit(rule.unit) : 'db'),
        explicitPrice:priced.price,
        internalName:internalName(baseName,existingPack),
        rewritten:String(raw || '').trim()
      };
    }

    const prefix = splitPurchasePrefix(body);
    const candidate = prefix.rest;
    const m = candidate.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|db)\s*$/i);
    if (!m) return {isPack:false};

    const baseName = m[1].trim();
    const pack = makePack(Number(m[2].replace(',','.')),m[3]);
    const rule = safeRule(baseName);
    if (!likelyPackaging(baseName,pack,rule,prefix.qty != null,priced.price)) return {isPack:false};

    const ruleUnit = canonicalUnit(rule?.unit || '');
    const purchaseUnit = prefix.unit || (DISCRETE_UNITS.has(ruleUnit) ? ruleUnit : 'db');
    const purchaseQty = prefix.qty ?? 1;
    const hiddenName = internalName(baseName,pack);
    const qtyText = `${num(purchaseQty)} ${purchaseUnit}`;
    const rewritten = `${qtyText} ${hiddenName}${priced.priceText ? ` ${priced.priceText}` : ''}`.trim();

    return {
      isPack:true,baseName,pack,rule,purchaseQty,purchaseUnit,
      explicitPrice:priced.price,internalName:hiddenName,rewritten
    };
  }

  function unitPrice(price, pack) {
    const p = Number(price);
    if (!(p >= 0) || !pack?.standardAmount || !(pack.standardAmount > 0)) return null;
    return {price:p/pack.standardAmount,unit:pack.standardUnit};
  }

  function attachMetadata(parsed) {
    if (!parsed?.isPack) return null;
    const items = load(STATE_KEY,[]);
    const key = normalize(parsed.internalName);
    const matches = items.filter(i=>normalize(i?.name)===key);
    if (!matches.length) return null;
    // A legfrissebb az érintett tétel; összevonásnál ugyanaz az objektum marad.
    const item = matches.sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0))[0];
    item.displayName = parsed.baseName;
    item.pack = {...parsed.pack,label:packLabel(parsed.pack)};
    item.packVersion = 1;
    save(STATE_KEY,items);
    return item;
  }

  let pending = null;
  form.addEventListener('submit',()=>{
    const parsed = parse(input.value);
    if (!parsed.isPack) { pending = null; return; }
    pending = parsed;
    input.value = parsed.rewritten;
    window.setTimeout(()=>{
      attachMetadata(parsed);
      decorateAll();
      pending = null;
    },18);
  },true);

  // ---- Szerkesztő: külön kiszerelés mező ----
  const packLabelEl = document.createElement('label');
  packLabelEl.className = 'pack-edit-label';
  packLabelEl.textContent = 'Kiszerelés';
  const packInput = document.createElement('input');
  packInput.id = 'editPackSize';
  packInput.inputMode = 'decimal';
  packInput.placeholder = 'pl. 100 g • 1,75 l • 10 db';
  packLabelEl.appendChild(packInput);
  editUnit.closest('label')?.insertAdjacentElement('afterend',packLabelEl);

  listRoot.addEventListener('click',event=>{
    if (!event.target.closest('button[data-act="edit"]')) return;
    window.setTimeout(()=>{
      const item = load(STATE_KEY,[]).find(i=>String(i?.id)===String(editId.value));
      if (!item) return;
      const pack = item.pack || packFromInternal(item.name);
      editName.value = item.displayName || baseFromInternal(item.name) || item.name;
      packInput.value = pack ? packLabel(pack) : '';
    },0);
  });

  let pendingEdit = null;
  editForm.addEventListener('submit',()=>{
    const id = editId.value;
    const baseName = String(editName.value || '').trim();
    const m = String(packInput.value || '').trim().match(/^(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|db)$/i);
    const pack = m ? makePack(Number(m[1].replace(',','.')),m[2]) : null;
    pendingEdit = {id,baseName,pack};
    if (pack) editName.value = internalName(baseName,pack);
    window.setTimeout(()=>{
      const items = load(STATE_KEY,[]);
      const item = items.find(i=>String(i?.id)===String(id));
      if (!item) return;
      if (pack) {
        item.name = internalName(baseName,pack);
        item.displayName = baseName;
        item.pack = {...pack,label:packLabel(pack)};
        item.packVersion = 1;
      } else {
        item.name = baseName || baseFromInternal(item.name) || item.name;
        delete item.displayName;
        delete item.pack;
        delete item.packVersion;
      }
      save(STATE_KEY,items);
      decorateAll();
      pendingEdit = null;
    },18);
  },true);

  function repairStateFromMarkers() {
    const items = load(STATE_KEY,[]);
    let changed = false;
    for (const item of items) {
      if (!item?.name) continue;
      const pack = item.pack || packFromInternal(item.name);
      if (!pack) continue;
      const base = item.displayName || baseFromInternal(item.name);
      if (!item.pack || !item.displayName) {
        item.displayName = base;
        item.pack = {...pack,label:packLabel(pack)};
        item.packVersion = 1;
        changed = true;
      }
    }
    if (changed) save(STATE_KEY,items);
    return items;
  }

  function decorateItem(row,item) {
    const pack = item?.pack || packFromInternal(item?.name);
    if (!pack) return;
    const base = item.displayName || baseFromInternal(item.name);
    const name = row.querySelector('.item-name');
    if (name && name.textContent !== base) name.textContent = base;

    const chips = row.querySelector('.chips');
    if (chips) {
      let badge = chips.querySelector('.pack-size-pill');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'pill pack-size-pill';
        chips.appendChild(badge);
      }
      badge.textContent = `📦 ${packLabel(pack)}`;
    }

    const line = row.querySelector('.price-line');
    const up = unitPrice(item.price,pack);
    if (line) {
      let unitEl = line.querySelector('.pack-unit-price');
      if (up && Number.isFinite(up.price)) {
        if (!unitEl) {
          unitEl = document.createElement('span');
          unitEl.className = 'pack-unit-price';
          line.appendChild(unitEl);
        }
        unitEl.textContent = ` · ${money(up.price)}/${up.unit}`;
      } else if (unitEl) unitEl.remove();
    }
  }

  function cleanHelperTexts(root=document) {
    const selectors = ['.habit-pick strong','.missing-item-copy strong','.frequent-item-name','.frequent-pick strong'];
    for (const el of root.querySelectorAll(selectors.join(','))) {
      if (el.textContent?.includes('⟦')) el.textContent = cleanInternal(el.textContent);
    }
  }

  function decoratePreview() {
    const parsed = parse(input.value);
    if (!parsed.isPack) return;
    const preview = document.getElementById('inputPreview');
    if (!preview || preview.hidden) return;

    const meta = preview.querySelector('.preview-meta');
    if (!meta) return;
    const first = meta.querySelector('span');
    if (first) first.textContent = `${num(parsed.purchaseQty)} ${parsed.purchaseUnit}`;

    const memory = window.ZoeStorePriceMemory2026?.preferredPrice?.(parsed.internalName,parsed.purchaseUnit) || null;
    const fallback = Number(parsed.rule?.price);
    const price = parsed.explicitPrice ?? memory?.price ?? (Number.isFinite(fallback) ? fallback : null);
    const priceEl = meta.querySelector('.preview-price');
    if (priceEl && price != null) {
      const label = parsed.explicitPrice != null ? 'saját ár' : memory ? `${memory.storeLabel || 'bolti'} memória` : '≈ becsült';
      priceEl.textContent = `${label}: ${money(price)}/${parsed.purchaseUnit}`;
    }

    let packEl = meta.querySelector('.pack-preview-unit');
    if (!packEl) {
      packEl = document.createElement('span');
      packEl.className = 'pack-preview-unit';
      meta.appendChild(packEl);
    }
    const up = price != null ? unitPrice(price,parsed.pack) : null;
    packEl.textContent = up ? `📦 ${packLabel(parsed.pack)} · ${money(up.price)}/${up.unit}` : `📦 ${packLabel(parsed.pack)}`;

    const total = meta.querySelector('.preview-total');
    if (parsed.purchaseQty !== 1 && price != null) {
      if (total) total.textContent = `össz. ${money(price*parsed.purchaseQty)}`;
    } else if (total) total.remove();
  }

  function decoratePackPriceWatch() {
    const parsed = parse(input.value);
    if (!parsed.isPack || parsed.explicitPrice == null) return;
    const panel = document.querySelector('.price-watch-live');
    if (!panel || !window.ZoePriceWatch2026?.analyze) return;
    const analysis = window.ZoePriceWatch2026.analyze(parsed.internalName,parsed.purchaseUnit,parsed.explicitPrice);
    if (!analysis) {
      panel.hidden = true;
      panel.innerHTML = '';
      return;
    }
    const same = Math.round(analysis.low) === Math.round(analysis.high);
    const range = same ? `korábban jellemzően ${money(analysis.typical)}` : `a megszokott sávod ${money(analysis.low)}–${money(analysis.high)}`;
    const source = analysis.scope==='store' ? `${analysis.sourceLabel} saját adatai alapján` : 'a saját ártörténeted alapján';
    panel.innerHTML = `<span class="price-watch-icon" aria-hidden="true">📉</span><span class="price-watch-copy"><strong>Ez most a megszokottnál drágább.</strong><small>${range}; a mostani ${money(analysis.current)} kb. ${Math.max(1,analysis.percent)}%-kal van a jellemző árad fölött · ${source}.</small></span>`;
    panel.hidden = false;
  }

  let decorating = false;
  function decorateAll() {
    if (decorating) return;
    decorating = true;
    const items = repairStateFromMarkers();
    const byId = new Map(items.map(i=>[String(i.id),i]));
    for (const row of listRoot.querySelectorAll('.item[data-id]')) {
      decorateItem(row,byId.get(String(row.dataset.id)));
    }
    cleanHelperTexts();
    decoratePreview();
    decorating = false;
  }

  function lateDecorate() {
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      decorateAll();
      decoratePackPriceWatch();
    }));
  }

  input.addEventListener('input',lateDecorate);
  input.addEventListener('focus',lateDecorate);
  window.addEventListener('zoe-store-route-change',lateDecorate);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)lateDecorate();});

  const observer = new MutationObserver(()=>lateDecorate());
  observer.observe(listRoot,{childList:true,subtree:true});

  window.ZoePackSize2026 = {
    parse,unitPrice,packLabel,internalName,cleanInternal,packFromInternal,baseFromInternal
  };

  decorateAll();
})();