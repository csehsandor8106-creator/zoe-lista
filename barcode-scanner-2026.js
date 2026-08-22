(() => {
  'use strict';

  // Zoé Lista – kamerás EAN/UPC vonalkódolvasó, helyi tanulómemóriával.
  // Külső adatbázis nélkül működik: az ismeretlen kódot a felhasználó egyszer megtanítja,
  // utána ugyanaz a vonalkód egy koppintás nélkül hozzáadható a meglévő lista-motoron át.
  const MEMORY_KEY = 'zoe-lista-barcode-memory-v1';
  const form = document.getElementById('addForm');
  const input = document.getElementById('itemInput');
  const addButton = form?.querySelector('.add-btn');
  if (!form || !input || !addButton) return;

  function loadMemory() {
    try { return JSON.parse(localStorage.getItem(MEMORY_KEY)) || {}; }
    catch { return {}; }
  }
  function saveMemory(memory) {
    try { localStorage.setItem(MEMORY_KEY, JSON.stringify(memory)); } catch {}
  }
  function cleanCode(value) {
    return String(value || '').replace(/\s+/g, '').trim();
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

  function setStatus(text, state = '') {
    status.textContent = text;
    status.dataset.state = state;
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
    return memory[code] || null;
  }

  function rememberBarcode(code, name) {
    const memory = loadMemory();
    const prev = memory[code] || {};
    memory[code] = {
      name,
      learnedAt:prev.learnedAt || Date.now(),
      lastUsed:Date.now(),
      scans:(Number(prev.scans) || 0) + 1
    };
    saveMemory(memory);
  }

  function touchKnown(code, entry) {
    const memory = loadMemory();
    memory[code] = {
      ...entry,
      lastUsed:Date.now(),
      scans:(Number(entry.scans) || 0) + 1
    };
    saveMemory(memory);
  }

  function showTeach(code) {
    stopCamera();
    pendingCode = code;
    currentCode.textContent = code;
    teachForm.hidden = false;
    manualForm.hidden = true;
    setStatus('Ezt a kódot még nem ismerem. Tanítsd meg egyszer. 🙂', 'unknown');
    productName.value = '';
    productPrice.value = '';
    setTimeout(() => productName.focus({preventScroll:true}), 30);
  }

  function acceptCode(rawValue, format = '') {
    const code = cleanCode(rawValue);
    if (!code) return;

    // Az EAN-8/EAN-13/UPC-A kódoknál ellenőrizzük a check digit-et is.
    // UPC-E más ellenőrzési szabályt igényel, ezért azt a detektorra bízzuk.
    const gtinFormat = /^(ean_8|ean_13|upc_a)$/i.test(format);
    if (gtinFormat && !validGtin(code)) {
      setStatus('A kód nem olvasható biztosan – tartsd egy pillanatra stabilabban.', 'warn');
      return;
    }

    const entry = knownProduct(code);
    if (entry?.name) {
      stopCamera();
      touchKnown(code, entry);
      setStatus(`✓ Felismerve: ${entry.name}`, 'success');
      setTimeout(() => {
        if (dialog.open) dialog.close();
        addThroughExistingApp(entry.name);
      }, 260);
      return;
    }

    showTeach(code);
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
          // Két egymást követő azonos találat kell: kevesebb téves beolvasás mozgó kameránál.
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
    stopCamera();
    teachForm.hidden = true;
    manualForm.hidden = false;
    pendingCode = '';
    placeholder.innerHTML = '📷<br><small>Kamera indul…</small>';
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
    } catch (err) {
      const denied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
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
  dialog.addEventListener('close', stopCamera);
  dialog.addEventListener('cancel', stopCamera);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  manualForm.addEventListener('submit', event => {
    event.preventDefault();
    const code = cleanCode(codeInput.value);
    if (!code) return;
    codeInput.value = '';
    // Kézi beírásnál nem találgatjuk a formátumot (pl. 8 számjegy UPC-E is lehet).
    acceptCode(code, 'manual');
  });

  teachForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = productName.value.trim();
    if (!pendingCode || !name) return;
    const price = moneyInput(productPrice.value);
    rememberBarcode(pendingCode, name);
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
    if (document.hidden && dialog.open) stopCamera();
  });
})();
