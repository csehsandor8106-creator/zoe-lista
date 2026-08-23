(() => {
  'use strict';

  // Zoé Lista – kamerás EAN/UPC vonalkódolvasó.
  // Felismerési sorrend:
  // 1) helyi Zoé vonalkód-memória / beépített biztos találatok
  // 2) gyors Open Food Facts v2 élelmiszer-keresés
  // 3) univerzális Open Facts v3 keresés (food / beauty / petfood / product)
  // 4) kézi tanítás, ha egyik sem találja
  const MEMORY_KEY = 'zoe-lista-barcode-memory-v1';
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const OPEN_FOOD_V2_API = 'https://world.openfoodfacts.org/api/v2/product/';
  const OPEN_FACTS_V3_API = 'https://world.openfoodfacts.org/api/v3/product/';
  const OPEN_FACTS_FIELDS = [
    'code','product_type','product_name','product_name_hu','abbreviated_product_name',
    'abbreviated_product_name_hu','generic_name','generic_name_hu','brands','quantity',
    'product_quantity','product_quantity_unit','categories','categories_tags'
  ].join(',');
  const FOOD_TIMEOUT_MS = 3200;
  const ALL_TIMEOUT_MS = 4500;
  const ONLINE_RULE_VERSION = 20260823;

  const SOURCE_LABELS = {
    food:'Open Food Facts',
    beauty:'Open Beauty Facts',
    petfood:'Open Pet Food Facts',
    product:'Open Products Facts'
  };

  // Biztos helyi találatok. Ezeket első használatkor a normál helyi memóriába is átmásoljuk.
  const BUILTIN_BARCODES = {
    '5051007103305': {
      name:'Tesco szódabikarbóna',
      source:'builtin',
      sourceName:'Zoé beépített katalógus',
      productType:'food',
      brand:'Tesco',
      quantity:'100 g',
      categories:'szódabikarbóna'
    }
  };

  const form = document.getElementById('addForm');
  const input = document.getElementById('itemInput');
  const addButton = form?.querySelector('.add-btn');
  if (!form || !input || !addButton) return;

  function loadJson(key, fallback = {}) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function saveJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
  function loadMemory() { return loadJson(MEMORY_KEY, {}); }
  function saveMemory(memory) { saveJson(MEMORY_KEY, memory); }
  function cleanCode(value) {
    return String(value || '').replace(/\s+/g, '').trim();
  }
  function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }
  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }
  function validGtin(value) {
    const code = String(value || '');
    if (!/^\d+$/.test(code) || ![8,12,13,14].includes(code.length)) return false;
    const digits = [...code].map(Number);
    const check = digits.pop();
    let sum = 0;
    let weight = 3;
    for (let i = digits.length - 1; i >= 0; i--) {
      sum += digits[i] * weight;
      weight = weight === 3 ? 1 : 3;
    }
    return (10 - (sum % 10)) % 10 === check;
  }
  function moneyInput(value) {
    const n = Number(String(value || '').replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  }
  function firstText(...values) {
    for (const value of values) {
      const text = cleanText(value);
      if (text) return text;
    }
    return '';
  }
  function productLabel(product) {
    const name = firstText(
      product?.product_name_hu,
      product?.product_name,
      product?.abbreviated_product_name_hu,
      product?.abbreviated_product_name,
      product?.generic_name_hu,
      product?.generic_name
    );
    const brands = firstText(product?.brands);
    const brand = brands.split(',')[0]?.trim() || '';
    if (!name) return brand;
    if (!brand) return name;
    const lowerName = name.toLocaleLowerCase('hu-HU');
    const lowerBrand = brand.toLocaleLowerCase('hu-HU');
    return lowerName.includes(lowerBrand) ? name : `${brand} ${name}`;
  }
  function sourceLabel(productType) {
    return SOURCE_LABELS[productType] || 'Open Food Facts';
  }
  function resultFromProduct(product, forcedType = '', forcedSource = '') {
    if (!product || typeof product !== 'object') return {found:false, reason:'not-found'};
    const label = productLabel(product);
    if (!label) {
      return {found:false, reason:'no-name', suggestedName:firstText(product?.brands)};
    }
    const productType = cleanText(forcedType || product?.product_type || 'food');
    return {
      found:true,
      label,
      productType,
      brand:firstText(product?.brands),
      quantity:firstText(product?.quantity),
      categories:firstText(product?.categories),
      source:forcedSource || sourceLabel(productType)
    };
  }

  const scanButton = document.createElement('button');
  scanButton.type = 'button';
  scanButton.className = 'barcode-scan-btn';
  scanButton.innerHTML = '<span aria-hidden="true">▦</span>';
  scanButton.setAttribute('aria-label', 'Vonalkód beolvasása');
  scanButton.setAttribute('title', 'Vonalkód beolvasása');
  input.insertAdjacentElement('afterend', scanButton);

  const dialog = document.createElement('dialog');
  dialog.className = 'barcode-dialog';
  dialog.innerHTML = `
    <section class="barcode-card">
      <header class="barcode-head">
        <div>
          <h2>▦ Vonalkód olvasó</h2>
          <p>Irányítsd a kamerát az EAN/UPC vonalkódra.</p>
        </div>
        <button class="icon-btn barcode-close" type="button" aria-label="Bezárás">✕</button>
      </header>

      <div class="barcode-camera-wrap">
        <video class="barcode-video" playsinline muted></video>
        <div class="barcode-guide" aria-hidden="true"><span></span></div>
        <div class="barcode-camera-placeholder">📷<br><small>Kamera indul…</small></div>
      </div>

      <div class="barcode-status" role="status">Kamera előkészítése…</div>

      <form class="barcode-manual-form" autocomplete="off">
        <label>
          <span>Kód kézi megadása</span>
          <div class="barcode-manual-row">
            <input class="barcode-code-input" inputmode="numeric" autocomplete="off" placeholder="pl. 5991234567890" />
            <button class="soft-btn" type="submit">OK</button>
          </div>
        </label>
      </form>

      <form class="barcode-teach-form" autocomplete="off" hidden>
        <div class="barcode-unknown">
          <strong>Új vonalkód</strong>
          <code class="barcode-current-code"></code>
        </div>
        <label>Mi ez a termék?
          <input class="barcode-product-name" autocomplete="off" placeholder="pl. Milka tejcsokoládé" required />
        </label>
        <label>Egységár – opcionális (Ft)
          <input class="barcode-product-price" inputmode="numeric" type="number" min="1" step="1" placeholder="pl. 599" />
        </label>
        <div class="barcode-teach-actions">
          <button class="soft-btn barcode-rescan" type="button">↻ Újraolvasás</button>
          <button class="add-btn" type="submit">Megjegyzés + hozzáadás</button>
        </div>
      </form>

      <div class="barcode-source-note">
        Automatikus termékadatok: <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer">Open Food Facts</a>
        és testvéradatbázisai · ODbL
      </div>
    </section>`;
  document.body.appendChild(dialog);

  const video = dialog.querySelector('.barcode-video');
  const placeholder = dialog.querySelector('.barcode-camera-placeholder');
  const status = dialog.querySelector('.barcode-status');
  const closeButton = dialog.querySelector('.barcode-close');
  const manualForm = dialog.querySelector('.barcode-manual-form');
  const codeInput = dialog.querySelector('.barcode-code-input');
  const teachForm = dialog.querySelector('.barcode-teach-form');
  const currentCode = dialog.querySelector('.barcode-current-code');
  const productName = dialog.querySelector('.barcode-product-name');
  const productPrice = dialog.querySelector('.barcode-product-price');
  const rescanButton = dialog.querySelector('.barcode-rescan');

  let stream = null;
  let detector = null;
  let scanning = false;
  let scanTimer = 0;
  let pendingCode = '';
  let candidate = '';
  let candidateHits = 0;
  let lookupController = null;

  function setStatus(text, state = '') {
    status.textContent = text;
    status.dataset.state = state;
  }

  function cancelLookup() {
    if (lookupController) {
      try { lookupController.abort(); } catch {}
      lookupController = null;
    }
  }

  function stopCamera() {
    scanning = false;
    if (scanTimer) {
      clearTimeout(scanTimer);
      scanTimer = 0;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    try { video.pause(); } catch {}
    video.srcObject = null;
    video.classList.remove('is-live');
    placeholder.hidden = false;
    candidate = '';
    candidateHits = 0;
  }

  function addThroughExistingApp(name, price = null) {
    const text = price ? `${name} ${price} Ft` : name;
    input.value = text;
    input.dispatchEvent(new Event('input', {bubbles:true}));
    form.requestSubmit();
  }

  function knownProduct(code) {
    const memory = loadMemory();
    return memory[code] || BUILTIN_BARCODES[code] || null;
  }

  function rememberBarcode(code, name, meta = {}) {
    const memory = loadMemory();
    const prev = memory[code] || {};
    memory[code] = {
      ...prev,
      ...meta,
      name,
      learnedAt:prev.learnedAt || Date.now(),
      lastUsed:Date.now(),
      scans:(Number(prev.scans) || 0) + 1
    };
    saveMemory(memory);
  }

  function touchKnown(code, entry) {
    const memory = loadMemory();
    const prev = memory[code] || {};
    memory[code] = {
      ...entry,
      learnedAt:prev.learnedAt || entry.learnedAt || Date.now(),
      lastUsed:Date.now(),
      scans:(Number(prev.scans ?? entry.scans) || 0) + 1
    };
    saveMemory(memory);
  }

  // Ha az online adatbázis hosszú, részletes nevet ad, a családfelismerésből
  // azonnal készítünk pontos szabályt. Így már az ELSŐ scanneres hozzáadás is jó kategóriába kerül.
  function teachRecognition(label, categories = '') {
    const matcher = window.ZoeExtraFamily2026?.match;
    if (typeof matcher !== 'function') return;
    const hint = matcher(`${label} ${categories}`);
    if (!hint) return;

    const key = normalizeText(label);
    if (!key) return;
    const learned = loadJson(LEARNED_KEY, {});
    const previous = learned[key];
    if (previous && !previous.builtinCatalog && !previous.onlineCatalog) return;

    learned[key] = {
      ...hint,
      label,
      kind:'learned',
      builtinCatalog:true,
      familyCatalog:true,
      onlineCatalog:true,
      family:'online-barcode-hint',
      builtinVersion:ONLINE_RULE_VERSION
    };
    saveJson(LEARNED_KEY, learned);
  }

  function showTeach(code, message = 'Ezt a kódot még nem ismerem. Tanítsd meg egyszer. 🙂', suggestedName = '') {
    stopCamera();
    cancelLookup();
    pendingCode = code;
    currentCode.textContent = code;
    teachForm.hidden = false;
    manualForm.hidden = true;
    setStatus(message, 'unknown');
    productName.value = suggestedName;
    productPrice.value = '';
    setTimeout(() => productName.focus({preventScroll:true}), 30);
  }

  async function fetchJson(url, timeoutMs) {
    cancelLookup();
    const controller = new AbortController();
    lookupController = controller;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method:'GET',
        mode:'cors',
        cache:'no-store',
        headers:{Accept:'application/json'},
        signal:controller.signal
      });
      if (!response.ok) {
        return {ok:false, reason:response.status === 404 ? 'not-found' : 'network', status:response.status};
      }
      return {ok:true, json:await response.json()};
    } catch (error) {
      return {ok:false, reason:error?.name === 'AbortError' ? 'timeout' : 'network'};
    } finally {
      clearTimeout(timeout);
      if (lookupController === controller) lookupController = null;
    }
  }

  async function lookupFoodV2(code) {
    const params = new URLSearchParams({
      fields:OPEN_FACTS_FIELDS,
      cc:'hu',
      lc:'hu'
    });
    const request = await fetchJson(
      `${OPEN_FOOD_V2_API}${encodeURIComponent(code)}.json?${params.toString()}`,
      FOOD_TIMEOUT_MS
    );
    if (!request.ok) return {found:false, reason:request.reason};

    const json = request.json || {};
    if (Number(json.status) === 0 || !json.product) return {found:false, reason:'not-found'};
    return resultFromProduct(json.product, 'food', 'Open Food Facts');
  }

  async function lookupAllV3(code) {
    const params = new URLSearchParams({
      product_type:'all',
      cc:'hu',
      lc:'hu',
      fields:OPEN_FACTS_FIELDS
    });
    const request = await fetchJson(
      `${OPEN_FACTS_V3_API}${encodeURIComponent(code)}?${params.toString()}`,
      ALL_TIMEOUT_MS
    );
    if (!request.ok) return {found:false, reason:request.reason};

    const product = request.json?.product && typeof request.json.product === 'object'
      ? request.json.product
      : null;
    return resultFromProduct(product);
  }

  async function lookupOpenFacts(code) {
    if (navigator.onLine === false) return {found:false, reason:'network'};

    setStatus('🔎 Gyors keresés az Open Food Factsban…', 'reading');
    const food = await lookupFoodV2(code);
    if (food.found || food.reason === 'no-name') return food;

    if (!dialog.open || pendingCode !== code) return {found:false, reason:'cancelled'};
    setStatus('🔎 Más termékadatbázisokban is keresek…', 'reading');
    const all = await lookupAllV3(code);
    if (all.found || all.reason === 'no-name') return all;

    // Ha legalább az egyik keresés szabályosan lefutott és csak nem talált semmit,
    // ne nevezzük hálózati hibának. Timeout csak akkor legyen, ha nem kaptunk valódi választ.
    if (food.reason === 'not-found' || all.reason === 'not-found') return {found:false, reason:'not-found'};
    if (food.reason === 'timeout' || all.reason === 'timeout') return {found:false, reason:'timeout'};
    return {found:false, reason:'network'};
  }

  async function acceptCode(rawValue, format = '') {
    const code = cleanCode(rawValue);
    if (!code) return;

    const gtinFormat = /^(ean_8|ean_13|upc_a|gtin_14)$/i.test(format);
    if (gtinFormat && !validGtin(code)) {
      setStatus('A kód nem olvasható biztosan – tartsd egy pillanatra stabilabban.', 'warn');
      return;
    }

    const entry = knownProduct(code);
    if (entry?.name) {
      stopCamera();
      touchKnown(code, entry);
      teachRecognition(entry.name, entry.categories || '');
      const from = entry.sourceName ? ` · ${entry.sourceName}` : '';
      setStatus(`✓ Felismerve: ${entry.name}${from}`, 'success');
      setTimeout(() => {
        if (dialog.open) dialog.close();
        addThroughExistingApp(entry.name);
      }, 260);
      return;
    }

    stopCamera();
    pendingCode = code;
    teachForm.hidden = true;
    manualForm.hidden = true;
    setStatus('🔎 Keresem a nyilvános termékadatbázisban…', 'reading');

    const result = await lookupOpenFacts(code);
    if (!dialog.open || pendingCode !== code || result.reason === 'cancelled') return;

    if (result.found) {
      rememberBarcode(code, result.label, {
        source:'openfacts',
        sourceName:result.source,
        productType:result.productType,
        brand:result.brand,
        quantity:result.quantity,
        categories:result.categories
      });
      teachRecognition(result.label, result.categories || '');
      pendingCode = '';
      const qty = result.quantity ? ` · ${result.quantity}` : '';
      setStatus(`✓ ${result.label}${qty} · ${result.source}`, 'success');
      setTimeout(() => {
        if (dialog.open) dialog.close();
        addThroughExistingApp(result.label);
      }, 420);
      return;
    }

    if (result.reason === 'timeout') {
      showTeach(code, 'Az online adatbázis most lassan válaszol. Megtaníthatod kézzel, és Zoé megjegyzi.');
    } else if (result.reason === 'network') {
      showTeach(code, 'Most nem érem el az online termékadatbázist. Offline is megtaníthatod ezt a kódot.');
    } else if (result.reason === 'no-name') {
      showTeach(code, 'A kód szerepel az adatbázisban, de nincs használható terméknév. Egészítsd ki egyszer.', result.suggestedName || '');
    } else {
      showTeach(code, 'A nyilvános adatbázisban sincs találat. Tanítsd meg egyszer, és legközelebb már tudni fogom. 🙂');
    }
  }

  async function scanFrame() {
    if (!scanning || !detector) return;
    if (video.readyState < 2) {
      scanTimer = setTimeout(scanFrame, 100);
      return;
    }
    try {
      const results = await detector.detect(video);
      if (results?.length) {
        const hit = results.find(result => cleanCode(result.rawValue));
        if (hit) {
          const value = cleanCode(hit.rawValue);
          if (candidate === value) candidateHits += 1;
          else { candidate = value; candidateHits = 1; }
          setStatus(candidateHits >= 2 ? `Kód: ${value}` : 'Vonalkód észlelve… tartsd stabilan.', 'reading');
          if (candidateHits >= 2) {
            acceptCode(value, hit.format || '');
            return;
          }
        }
      }
    } catch {
      // Egy-egy képkocka hibája ne állítsa le a kamerát.
    }
    if (scanning) scanTimer = setTimeout(scanFrame, 140);
  }

  async function createDetector() {
    if (!('BarcodeDetector' in window)) return null;
    const desired = ['ean_13','ean_8','upc_a','upc_e','code_128','itf'];
    try {
      const supported = typeof BarcodeDetector.getSupportedFormats === 'function'
        ? await BarcodeDetector.getSupportedFormats()
        : desired;
      const formats = desired.filter(format => supported.includes(format));
      return formats.length ? new BarcodeDetector({formats}) : new BarcodeDetector();
    } catch {
      try { return new BarcodeDetector(); } catch { return null; }
    }
  }

  async function startCamera() {
    cancelLookup();
    stopCamera();
    teachForm.hidden = true;
    manualForm.hidden = false;
    pendingCode = '';
    setStatus('Kamera előkészítése…');

    detector = await createDetector();
    if (!detector) {
      setStatus('A böngésződ nem támogatja a kamerás vonalkód-felismerést. A kódot lent kézzel is megadhatod.', 'warn');
      placeholder.innerHTML = '▦<br><small>Kézi kódbevitel használható</small>';
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('A kamera ezen a böngészőn nem érhető el. A kódot lent kézzel is megadhatod.', 'warn');
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video:{
          facingMode:{ideal:'environment'},
          width:{ideal:1280},
          height:{ideal:720}
        },
        audio:false
      });
      video.srcObject = stream;
      await video.play();
      video.classList.add('is-live');
      placeholder.hidden = true;
      scanning = true;
      setStatus('Keresem a vonalkódot…', 'reading');
      scanFrame();
    } catch (error) {
      const denied = error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError';
      setStatus(denied
        ? 'A kameraengedély nincs megadva. Engedélyezd a kamerát, vagy írd be lent a kódot.'
        : 'Nem sikerült elindítani a kamerát. A kézi kódbevitel továbbra is használható.', 'warn');
    }
  }

  function openScanner() {
    productName.blur();
    input.blur();
    dialog.showModal();
    startCamera();
  }

  scanButton.addEventListener('click', openScanner);
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    cancelLookup();
    stopCamera();
    pendingCode = '';
  });
  dialog.addEventListener('cancel', () => {
    cancelLookup();
    stopCamera();
    pendingCode = '';
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  manualForm.addEventListener('submit', event => {
    event.preventDefault();
    const code = cleanCode(codeInput.value);
    if (!code) return;
    codeInput.value = '';
    const format = /^\d{8}$/.test(code) ? 'ean_8'
      : /^\d{12}$/.test(code) ? 'upc_a'
      : /^\d{13}$/.test(code) ? 'ean_13'
      : /^\d{14}$/.test(code) ? 'gtin_14'
      : 'manual';
    acceptCode(code, format);
  });

  teachForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = productName.value.trim();
    if (!pendingCode || !name) return;
    const price = moneyInput(productPrice.value);
    rememberBarcode(pendingCode, name, {source:'user', sourceName:'Saját tanítás'});
    teachRecognition(name);
    setStatus(`✓ Megjegyeztem: ${name}`, 'success');
    const code = pendingCode;
    pendingCode = '';
    setTimeout(() => {
      if (dialog.open) dialog.close();
      addThroughExistingApp(name, price);
      window.dispatchEvent(new CustomEvent('zoe-barcode-learned', {detail:{code,name}}));
    }, 180);
  });

  rescanButton.addEventListener('click', () => {
    teachForm.hidden = true;
    manualForm.hidden = false;
    startCamera();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && dialog.open) {
      cancelLookup();
      stopCamera();
    }
  });
})();
