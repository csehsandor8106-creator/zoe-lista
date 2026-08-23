(() => {
  'use strict';

  const STATE_KEY = 'zoe-lista-state-v1';
  const PRICE_MEMORY_KEY = 'zoe-lista-price-memory-v1';
  const FLASH_KEY = 'zoe-lista-qr-import-flash-v1';
  const PREFIX = 'ZL1:';
  const CATEGORIES = ['Zöldség-gyümölcs','Tejtermék és tojás','Pékáru','Hús és felvágott','Hal és tenger gyümölcsei','Alapélelmiszer','Snack és édesség','Italok','Szeszes italok','Fagyasztott','Háztartás','Higiénia','Állateledel','Baba és gyermek','Ruházat','Virág és ajándék','Egyéb'];
  const UNITS = ['db','pár','kg','l','csomag','doboz','üveg'];
  const CATEGORY_ICONS = {'Zöldség-gyümölcs':'🥕','Tejtermék és tojás':'🥛','Pékáru':'🥖','Hús és felvágott':'🥩','Hal és tenger gyümölcsei':'🐟','Alapélelmiszer':'🍚','Snack és édesség':'🍿','Italok':'🥤','Szeszes italok':'🥃','Fagyasztott':'❄️','Háztartás':'🧽','Higiénia':'🧴','Állateledel':'🐾','Baba és gyermek':'🍼','Ruházat':'👕','Virág és ajándék':'💐','Egyéb':'🛒'};

  const toolbar = document.querySelector('.toolbar');
  if (!toolbar || !window.ZoeQR) return;

  const loadJson = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };
  const normalize = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const clampNumber = (value, fallback, min, max) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function encodeUnit(unit) {
    const idx = UNITS.indexOf(String(unit || ''));
    return idx >= 0 ? idx : String(unit || 'db').slice(0,20);
  }
  function decodeUnit(value) {
    if (Number.isInteger(value) && UNITS[value]) return UNITS[value];
    const text = String(value || 'db').trim().slice(0,20);
    return text || 'db';
  }
  function encodeCategory(category) {
    const idx = CATEGORIES.indexOf(String(category || ''));
    return idx >= 0 ? idx : CATEGORIES.length - 1;
  }
  function decodeCategory(value) {
    return Number.isInteger(value) && CATEGORIES[value] ? CATEGORIES[value] : 'Egyéb';
  }

  function serializeList(items) {
    const rows = items.map(item => [
      String(item?.name || '').trim().slice(0,160),
      +clampNumber(item?.qty,1,.01,99999).toFixed(2),
      encodeUnit(item?.unit),
      Math.round(clampNumber(item?.price,0,0,1000000000)),
      encodeCategory(item?.category),
      String(item?.icon || '').slice(0,12),
      item?.source === 'user' ? 1 : 0
    ]).filter(row => row[0]);
    return PREFIX + JSON.stringify([1,rows]);
  }

  function parsePayload(raw) {
    const text = String(raw || '').trim();
    if (!text.startsWith(PREFIX)) throw new Error('Ez nem Zoé Lista QR-kód.');
    let data;
    try { data = JSON.parse(text.slice(PREFIX.length)); }
    catch { throw new Error('A QR-kód tartalma sérült vagy hiányos.'); }
    if (!Array.isArray(data) || data[0] !== 1 || !Array.isArray(data[1])) throw new Error('Nem támogatott Zoé Lista QR-verzió.');
    if (data[1].length > 250) throw new Error('A megosztott lista túl sok tételt tartalmaz.');

    const now = Date.now();
    const items = [];
    for (let index=0; index<data[1].length; index++) {
      const row = data[1][index];
      if (!Array.isArray(row)) continue;
      const name = String(row[0] || '').trim().slice(0,160);
      if (!name) continue;
      const category = decodeCategory(row[4]);
      items.push({
        id:uid(),
        name,
        qty:+clampNumber(row[1],1,.01,99999).toFixed(2),
        unit:decodeUnit(row[2]),
        price:Math.round(clampNumber(row[3],0,0,1000000000)),
        category,
        icon:String(row[5] || CATEGORY_ICONS[category] || '🛒').slice(0,12) || CATEGORY_ICONS[category] || '🛒',
        source:row[6] === 1 ? 'user' : 'estimate',
        done:false,
        createdAt:now + index
      });
    }
    if (!items.length) throw new Error('A megosztott lista nem tartalmaz használható tételt.');
    return items;
  }

  function updatePriceMemory(items) {
    const memory = loadJson(PRICE_MEMORY_KEY, {});
    for (const item of items) {
      if (item.source !== 'user') continue;
      memory[normalize(item.name)] = {price:item.price, unit:item.unit};
    }
    try { localStorage.setItem(PRICE_MEMORY_KEY, JSON.stringify(memory)); } catch {}
  }

  function mergeItems(imported, replace=false) {
    const existing = replace ? [] : loadJson(STATE_KEY, []);
    const list = Array.isArray(existing) ? existing : [];
    for (const incoming of imported) {
      const match = list.find(item => !item?.done && normalize(item?.name) === normalize(incoming.name) && String(item?.unit) === incoming.unit);
      if (match) {
        match.qty = +(clampNumber(match.qty,0,0,99999) + incoming.qty).toFixed(2);
        if (incoming.source === 'user') { match.price = incoming.price; match.source = 'user'; }
        if (match.category === 'Egyéb' && incoming.category !== 'Egyéb') { match.category = incoming.category; match.icon = incoming.icon; }
      } else {
        list.unshift(incoming);
      }
    }
    localStorage.setItem(STATE_KEY, JSON.stringify(list));
    updatePriceMemory(imported);
    sessionStorage.setItem(FLASH_KEY, `${imported.length} tétel importálva`);
    location.reload();
  }

  const shareButton = document.createElement('button');
  shareButton.type = 'button';
  shareButton.className = 'soft-btn qr-share-btn';
  shareButton.innerHTML = '<span aria-hidden="true">▦</span> Lista QR';
  shareButton.title = 'Lista megosztása vagy QR-kód beolvasása';
  toolbar.appendChild(shareButton);

  const dialog = document.createElement('dialog');
  dialog.className = 'qr-share-dialog';
  dialog.innerHTML = `
    <section class="qr-share-card">
      <header class="qr-share-head">
        <div><h2>▦ Lista QR</h2><p>Lista átadása két Zoé között.</p></div>
        <button type="button" class="icon-btn qr-share-close" aria-label="Bezárás">✕</button>
      </header>

      <div class="qr-send-view">
        <div class="qr-box" aria-live="polite"></div>
        <div class="qr-meta"></div>
        <p class="qr-help">A másik telefonon nyisd meg a Zoé Listát, válaszd a <b>Lista QR</b> gombot, majd a <b>QR beolvasása</b> lehetőséget.</p>
        <div class="qr-actions">
          <button type="button" class="soft-btn qr-copy">Megosztási kód másolása</button>
          <button type="button" class="add-btn qr-open-scan">📷 QR beolvasása</button>
        </div>
      </div>

      <div class="qr-scan-view" hidden>
        <div class="qr-camera-wrap">
          <video class="qr-video" playsinline muted></video>
          <div class="qr-guide" aria-hidden="true"></div>
          <div class="qr-camera-placeholder">▦<br><small>QR-kamera indul…</small></div>
        </div>
        <div class="qr-status" role="status">Kamera előkészítése…</div>
        <div class="qr-paste-wrap">
          <label>Vagy illeszd be a megosztási kódot
            <textarea class="qr-paste" rows="3" placeholder="ZL1:..."></textarea>
          </label>
          <button type="button" class="soft-btn qr-paste-import">Kód beolvasása</button>
        </div>
        <div class="qr-actions">
          <button type="button" class="soft-btn qr-back-send">← Saját QR</button>
        </div>
      </div>

      <div class="qr-import-view" hidden>
        <div class="qr-import-ok">✓ Zoé Lista felismerve</div>
        <h3 class="qr-import-title"></h3>
        <div class="qr-import-preview"></div>
        <p class="qr-import-note">A beolvasott tételek kipipálatlanul kerülnek a fogadó listára.</p>
        <div class="qr-import-actions">
          <button type="button" class="soft-btn qr-import-append">Hozzáfűzés</button>
          <button type="button" class="add-btn qr-import-replace">Lista cseréje</button>
        </div>
        <button type="button" class="qr-link-btn qr-import-cancel">Mégse, újraolvasom</button>
      </div>
    </section>`;
  document.body.appendChild(dialog);

  const sendView = dialog.querySelector('.qr-send-view');
  const scanView = dialog.querySelector('.qr-scan-view');
  const importView = dialog.querySelector('.qr-import-view');
  const qrBox = dialog.querySelector('.qr-box');
  const qrMeta = dialog.querySelector('.qr-meta');
  const video = dialog.querySelector('.qr-video');
  const placeholder = dialog.querySelector('.qr-camera-placeholder');
  const status = dialog.querySelector('.qr-status');
  const paste = dialog.querySelector('.qr-paste');
  let currentPayload = '';
  let importedItems = [];
  let stream = null, detector = null, scanning = false, timer = 0, candidate = '', hits = 0;

  function show(view) {
    sendView.hidden = view !== 'send';
    scanView.hidden = view !== 'scan';
    importView.hidden = view !== 'import';
  }
  function stopCamera() {
    scanning = false;
    if (timer) { clearTimeout(timer); timer = 0; }
    if (stream) { stream.getTracks().forEach(track => track.stop()); stream = null; }
    try { video.pause(); } catch {}
    video.srcObject = null;
    video.classList.remove('is-live');
    placeholder.hidden = false;
    candidate = ''; hits = 0;
  }
  function setStatus(text, state='') { status.textContent = text; status.dataset.state = state; }

  function renderOwnQr() {
    const items = loadJson(STATE_KEY, []);
    if (!Array.isArray(items) || !items.length) {
      currentPayload = '';
      qrBox.innerHTML = '<div class="qr-empty">A lista üres – nincs mit QR-kóddá alakítani. 🛒</div>';
      qrMeta.textContent = '';
      return;
    }
    currentPayload = serializeList(items);
    try {
      qrBox.innerHTML = window.ZoeQR.createSvg(currentPayload,{size:420,label:`Zoé Lista – ${items.length} tétel`});
      const bytes = new TextEncoder().encode(currentPayload).length;
      const version = qrBox.querySelector('svg')?.dataset.qrVersion || '?';
      qrMeta.textContent = `${items.length} tétel · helyi QR · v${version} · ${bytes} bájt`;
    } catch (error) {
      qrBox.innerHTML = `<div class="qr-empty">${escapeHtml(error?.message || 'Nem sikerült QR-kódot készíteni.')}</div>`;
      qrMeta.textContent = 'A megosztási kód továbbra is kimásolható.';
    }
  }

  function previewImport(raw) {
    try {
      importedItems = parsePayload(raw);
    } catch (error) {
      setStatus(error?.message || 'Nem olvasható Zoé Lista QR.', 'warn');
      return false;
    }
    stopCamera();
    dialog.querySelector('.qr-import-title').textContent = `${importedItems.length} tétel érkezett`;
    const names = importedItems.slice(0,8).map(item => `<span>${escapeHtml(item.icon)} ${escapeHtml(item.name)}</span>`).join('');
    dialog.querySelector('.qr-import-preview').innerHTML = names + (importedItems.length>8 ? `<span class="qr-more">+ ${importedItems.length-8} további tétel</span>` : '');
    show('import');
    return true;
  }

  async function createDetector() {
    if (!('BarcodeDetector' in window)) return null;
    try {
      const supported = typeof BarcodeDetector.getSupportedFormats === 'function' ? await BarcodeDetector.getSupportedFormats() : ['qr_code'];
      if (!supported.includes('qr_code')) return null;
      return new BarcodeDetector({formats:['qr_code']});
    } catch { return null; }
  }

  async function scanFrame() {
    if (!scanning || !detector) return;
    if (video.readyState < 2) { timer=setTimeout(scanFrame,100); return; }
    try {
      const results = await detector.detect(video);
      const hit = results?.find(result => String(result.rawValue || '').trim());
      if (hit) {
        const value = String(hit.rawValue || '').trim();
        if (candidate === value) hits += 1; else { candidate=value; hits=1; }
        setStatus(hits >= 2 ? '✓ QR-kód felismerve' : 'QR-kód észlelve… tartsd stabilan.', 'reading');
        if (hits >= 2) { previewImport(value); return; }
      }
    } catch {}
    if (scanning) timer=setTimeout(scanFrame,130);
  }

  async function startCamera() {
    stopCamera();
    show('scan');
    setStatus('Kamera előkészítése…');
    detector = await createDetector();
    if (!detector) {
      setStatus('Ez a böngésző nem támogatja a QR-kód kamerás felismerését. A megosztási kódot lent beillesztheted.', 'warn');
      placeholder.innerHTML = '▦<br><small>Kód beillesztéssel importálható</small>';
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('A kamera nem érhető el. A megosztási kódot lent beillesztheted.', 'warn');
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});
      video.srcObject = stream;
      await video.play();
      video.classList.add('is-live');
      placeholder.hidden = true;
      scanning = true;
      setStatus('Irányítsd a kamerát egy Zoé Lista QR-kódra.', 'reading');
      scanFrame();
    } catch (error) {
      const denied = error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError';
      setStatus(denied ? 'A kameraengedély nincs megadva. Engedélyezd, vagy illeszd be lent a megosztási kódot.' : 'Nem sikerült elindítani a kamerát. A kód beillesztése továbbra is működik.', 'warn');
    }
  }

  async function copyPayload() {
    if (!currentPayload) return;
    try {
      await navigator.clipboard.writeText(currentPayload);
      const b = dialog.querySelector('.qr-copy');
      const old=b.textContent; b.textContent='✓ Kimásolva'; setTimeout(()=>b.textContent=old,1200);
    } catch {
      paste.value = currentPayload;
      show('scan');
      paste.focus(); paste.select();
      setStatus('A böngésző nem engedte a vágólapot. A kódot kijelöltem, így kézzel másolható.', 'warn');
    }
  }

  function openDialog() {
    stopCamera();
    importedItems=[];
    show('send');
    renderOwnQr();
    dialog.showModal();
  }

  shareButton.addEventListener('click', openDialog);
  dialog.querySelector('.qr-share-close').addEventListener('click',()=>dialog.close());
  dialog.querySelector('.qr-copy').addEventListener('click',copyPayload);
  dialog.querySelector('.qr-open-scan').addEventListener('click',startCamera);
  dialog.querySelector('.qr-back-send').addEventListener('click',()=>{stopCamera();show('send');renderOwnQr();});
  dialog.querySelector('.qr-paste-import').addEventListener('click',()=>previewImport(paste.value));
  dialog.querySelector('.qr-import-append').addEventListener('click',()=>{if(importedItems.length)mergeItems(importedItems,false);});
  dialog.querySelector('.qr-import-replace').addEventListener('click',()=>{if(importedItems.length)mergeItems(importedItems,true);});
  dialog.querySelector('.qr-import-cancel').addEventListener('click',startCamera);
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  dialog.addEventListener('close',stopCamera);
  dialog.addEventListener('cancel',stopCamera);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&dialog.open)stopCamera();});

  const flash = sessionStorage.getItem(FLASH_KEY);
  if (flash) {
    sessionStorage.removeItem(FLASH_KEY);
    const toast=document.createElement('div');
    toast.className='qr-import-toast';
    toast.textContent=`✓ ${flash}`;
    document.body.appendChild(toast);
    setTimeout(()=>toast.classList.add('show'),30);
    setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),220);},2400);
  }

  window.ZoeQRShare = { serializeList, parsePayload };
})();