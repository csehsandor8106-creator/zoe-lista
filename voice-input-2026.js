(() => {
  'use strict';

  // Zoé Lista – magyar hangbevitel és többtételes diktálás.
  // A beszédfelismerés a böngésző Web Speech API-ját használja, ha elérhető.
  // A feldolgozás és a termékekre bontás teljesen helyben történik.
  const form = document.getElementById('addForm');
  const input = document.getElementById('itemInput');
  if (!form || !input) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const LEARNED_KEY = 'zoe-lista-learned-v1';

  const NUMBER_WORDS = new Map([
    ['egy',1],['egyet',1],['egyik',1],
    ['ket',2],['kettő',2],['ketto',2],['két',2],['kettőt',2],['kettot',2],
    ['három',3],['harom',3],['négy',4],['negy',4],['öt',5],['ot',5],
    ['hat',6],['hét',7],['het',7],['nyolc',8],['kilenc',9],['tíz',10],['tiz',10],
    ['tizenegy',11],['tizenkettő',12],['tizenkettő',12],['tizenkét',12],['tizenket',12],
    ['tizenhárom',13],['tizenharom',13],['tizennégy',14],['tizennegy',14],
    ['tizenöt',15],['tizenot',15],['tizenhat',16],['tizenhét',17],['tizenhet',17],
    ['tizennyolc',18],['tizenkilenc',19],['húsz',20],['husz',20],
    ['fél',0.5],['fel',0.5],['másfél',1.5],['masfel',1.5]
  ]);

  const UNIT_WORDS = new Map([
    ['kg','kg'],['kiló','kg'],['kilo','kg'],['kilót','kg'],['kilot','kg'],['kilogramm','kg'],['kilogrammot','kg'],
    ['g','g'],['gramm','g'],['grammot','g'],
    ['l','l'],['liter','l'],['litert','l'],
    ['ml','ml'],['milliliter','ml'],['millilitert','ml'],
    ['db','db'],['darab','db'],['darabot','db'],
    ['csomag','csomag'],['csomagot','csomag'],['zacskó','csomag'],['zacsko','csomag'],['zacskót','csomag'],['zacskot','csomag'],
    ['doboz','doboz'],['dobozt','doboz'],
    ['üveg','üveg'],['uveg','üveg'],['üveget','üveg'],['uveget','üveg'],['palack','üveg'],['palackot','üveg'],
    ['flakon','flakon'],['flakont','flakon'],
    ['pár','pár'],['par','pár']
  ]);

  const COMMON_PRODUCTS = [
    'tej','tojás','kenyér','zsemle','kifli','csirkemell','csirkecomb','marhahús','sertéshús','darált hús',
    'sajt','vaj','margarin','joghurt','tejföl','kefir','túró','kávé','tea','cukor','liszt','rizs','tészta','olaj','só',
    'alma','banán','narancs','mandarin','citrom','paradicsom','paprika','sárgarépa','burgonya','hagyma','fokhagyma','uborka',
    'saláta','gomba','brokkoli','karfiol','avokádó','szőlő','eper','áfonya','dinnye','mangó','ananász',
    'ásványvíz','víz','kóla','cola','üdítő','gyümölcslé','sör','bor','pálinka','whisky','vodka','gin',
    'csoki','csokoládé','keksz','chips','popcorn','ropi','cukorka','zabpehely','müzliszelet',
    'sampon','tusfürdő','fogkrém','fogkefe','dezodor','szappan','papírzsebkendő','wc papír','toalettpapír','papírtörlő',
    'mosogatószer','mosószer','öblítő','szemeteszsák','felmosó','szivacs',
    'oregánó','bazsalikom','majoránna','rozmaring','fahéj','bors','cayenne bors','chili','sütőpor','szódabikarbóna',
    'kutyaeledel','macskaeledel','alom','pelenka','bébiétel','tápszer'
  ];

  const normalize = value => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,' ')
    .trim();

  function loadLearnedPhrases() {
    const phrases = new Set(COMMON_PRODUCTS.map(normalize));
    try {
      const learned = JSON.parse(localStorage.getItem(LEARNED_KEY)) || {};
      for (const [key, rule] of Object.entries(learned)) {
        const k = normalize(key);
        if (k.length >= 3 && k.length <= 80) phrases.add(k);
        const label = normalize(rule?.label);
        if (label.length >= 3 && label.length <= 80) phrases.add(label);
      }
    } catch {}
    return [...phrases].sort((a,b) => b.split(' ').length - a.split(' ').length || b.length - a.length);
  }

  function cleanFiller(text) {
    return String(text || '')
      .trim()
      .replace(/^(?:zo[eé]\s+)?(?:kérlek\s+)?(?:adj(?:ál)?\s+hozzá|tegy(?:él)?\s+hozzá|írj\s+fel|vegy(?:él)?\s+fel|kérek|szeretnék|legyen)\s+/i,'')
      .replace(/\s+(?:kérek|kellene|légy szíves|legyen szíves)$/i,'')
      .trim();
  }

  function parseNumberToken(token) {
    const raw = String(token || '').trim().toLowerCase().replace(/[.,]$/,'');
    if (/^\d+(?:[.,]\d+)?$/.test(raw)) return Number(raw.replace(',','.'));
    return NUMBER_WORDS.get(raw) ?? null;
  }

  function parseQuantityPrefix(segment) {
    const words = String(segment || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return null;
    const qty = parseNumberToken(words[0]);
    if (qty == null) return null;
    let index = 1;
    let unit = '';
    const unitKey = String(words[index] || '').toLowerCase().replace(/[.,]$/,'');
    if (UNIT_WORDS.has(unitKey)) {
      unit = UNIT_WORDS.get(unitKey);
      index += 1;
    }
    const product = words.slice(index).join(' ').trim();
    if (!product) return null;
    return {qty, unit, product};
  }

  function formatQuantity(qty, unit, product) {
    const q = String(qty).replace('.',',');
    if (!unit) return `${q} ${product}`;
    return `${q} ${unit} ${product}`;
  }

  function quantityBoundaryParts(text) {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) return [text.trim()];
    const starts = [0];
    for (let i=1;i<words.length;i++) {
      const n = parseNumberToken(words[i]);
      if (n == null) continue;
      // Új tételnek tekintjük a számot, ha előtte már legalább egy valódi szó áll.
      const previous = words.slice(starts[starts.length-1], i);
      const productish = previous.filter(w => !UNIT_WORDS.has(String(w).toLowerCase())).length >= 1;
      if (productish) starts.push(i);
    }
    if (starts.length === 1) return [text.trim()];
    const out = [];
    for (let s=0;s<starts.length;s++) {
      const from = starts[s], to = starts[s+1] ?? words.length;
      const part = words.slice(from,to).join(' ').trim();
      if (part) out.push(part);
    }
    return out;
  }

  function splitKnownSequence(productText) {
    const originalWords = String(productText || '').trim().split(/\s+/).filter(Boolean);
    if (originalWords.length < 2) return [productText.trim()];
    const normWords = originalWords.map(normalize);
    const phrases = loadLearnedPhrases();
    const phraseTokens = phrases.map(p => ({p,t:p.split(' ')}));
    const chunks = [];
    let pos = 0;

    while (pos < normWords.length) {
      let best = null;
      for (const entry of phraseTokens) {
        if (entry.t.length > normWords.length-pos) continue;
        let ok = true;
        for (let j=0;j<entry.t.length;j++) {
          if (normWords[pos+j] !== entry.t[j]) { ok=false; break; }
        }
        if (ok) { best = entry; break; }
      }
      if (!best) return [productText.trim()];
      chunks.push(originalWords.slice(pos,pos+best.t.length).join(' '));
      pos += best.t.length;
    }
    return chunks.length > 1 ? chunks : [productText.trim()];
  }

  function splitExplicit(text) {
    return String(text || '')
      .replace(/[;\n]+/g,'|')
      .replace(/\s*,\s*/g,'|')
      .replace(/\s+(?:és|meg|valamint|plusz)\s+/gi,'|')
      .split('|')
      .map(cleanFiller)
      .filter(Boolean);
  }

  function parseSpeech(text) {
    const raw = cleanFiller(String(text || '').replace(/[.!?]+$/,'').trim());
    if (!raw) return [];
    const explicit = splitExplicit(raw);
    const result = [];

    for (const block of explicit.length ? explicit : [raw]) {
      for (const part of quantityBoundaryParts(block)) {
        const pref = parseQuantityPrefix(part);
        if (pref) {
          const products = splitKnownSequence(pref.product);
          if (products.length > 1) {
            result.push(formatQuantity(pref.qty,pref.unit,products[0]));
            for (const extra of products.slice(1)) result.push(extra);
          } else {
            result.push(formatQuantity(pref.qty,pref.unit,pref.product));
          }
        } else {
          const products = splitKnownSequence(part);
          result.push(...products);
        }
      }
    }

    return result
      .map(v => v.replace(/\s+/g,' ').trim())
      .filter(Boolean)
      .slice(0,40);
  }

  const micButton = document.createElement('button');
  micButton.type = 'button';
  micButton.className = 'voice-input-btn';
  micButton.innerHTML = '<span aria-hidden="true">🎙️</span>';
  micButton.setAttribute('aria-label','Hangbevitel');
  micButton.setAttribute('title','Hangbevitel');
  const barcodeButton = form.querySelector('.barcode-scan-btn');
  (barcodeButton || input).insertAdjacentElement('afterend', micButton);

  const dialog = document.createElement('dialog');
  dialog.className = 'voice-dialog';
  dialog.innerHTML = `
    <section class="voice-card">
      <header class="voice-head">
        <div><h2>🎙️ Hangbevitel</h2><p>Mondj több terméket egy mondatban.</p></div>
        <button type="button" class="icon-btn voice-close" aria-label="Bezárás">✕</button>
      </header>

      <button type="button" class="voice-listen-btn">
        <span class="voice-orb" aria-hidden="true">🎙️</span>
        <span class="voice-listen-label">Beszélés indítása</span>
      </button>
      <div class="voice-status" role="status">Példa: „két tej, egy kiló csirkemell, kávé és három banán”</div>

      <label class="voice-transcript-label">Felismert / diktált szöveg
        <textarea class="voice-transcript" rows="3" placeholder="Ide is írhatsz vagy a telefon billentyűzetének mikrofonjával diktálhatsz."></textarea>
      </label>

      <div class="voice-preview" hidden>
        <div class="voice-preview-head"><strong>Zoé így bontotta fel:</strong><span class="voice-count"></span></div>
        <div class="voice-items"></div>
        <small>A tételek még módosíthatók hozzáadás előtt.</small>
      </div>

      <div class="voice-actions">
        <button type="button" class="soft-btn voice-reparse">↻ Újrafeldolgozás</button>
        <button type="button" class="add-btn voice-add-all" disabled>Hozzáadás</button>
      </div>
    </section>`;
  document.body.appendChild(dialog);

  const closeButton = dialog.querySelector('.voice-close');
  const listenButton = dialog.querySelector('.voice-listen-btn');
  const listenLabel = dialog.querySelector('.voice-listen-label');
  const status = dialog.querySelector('.voice-status');
  const transcript = dialog.querySelector('.voice-transcript');
  const preview = dialog.querySelector('.voice-preview');
  const itemsBox = dialog.querySelector('.voice-items');
  const count = dialog.querySelector('.voice-count');
  const addAll = dialog.querySelector('.voice-add-all');
  const reparse = dialog.querySelector('.voice-reparse');

  let recognition = null;
  let listening = false;
  let finalText = '';

  function setStatus(text, state='') {
    status.textContent = text;
    status.dataset.state = state;
  }

  function setListening(value) {
    listening = value;
    dialog.classList.toggle('is-listening',value);
    micButton.classList.toggle('is-listening',value);
    listenLabel.textContent = value ? 'Hallgatlak… koppints a leállításhoz' : 'Beszélés indítása';
  }

  function renderParsed() {
    const parsed = parseSpeech(transcript.value);
    itemsBox.innerHTML = '';
    for (const value of parsed) {
      const row = document.createElement('div');
      row.className = 'voice-item-row';
      const field = document.createElement('input');
      field.type = 'text';
      field.value = value;
      field.className = 'voice-item-input';
      field.setAttribute('aria-label','Felismert listaelem');
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'voice-remove';
      remove.textContent = '×';
      remove.setAttribute('aria-label','Tétel eltávolítása');
      remove.addEventListener('click',()=>{ row.remove(); updateCount(); });
      row.append(field,remove);
      itemsBox.appendChild(row);
    }
    preview.hidden = parsed.length === 0;
    updateCount();
  }

  function updateCount() {
    const rows = [...itemsBox.querySelectorAll('.voice-item-input')].filter(el => el.value.trim());
    count.textContent = rows.length ? `${rows.length} tétel` : '';
    addAll.disabled = rows.length === 0;
    addAll.textContent = rows.length ? `${rows.length} tétel hozzáadása` : 'Hozzáadás';
    if (!rows.length) preview.hidden = true;
  }

  async function createRecognition() {
    if (!SpeechRecognition) return null;
    const r = new SpeechRecognition();
    r.lang = 'hu-HU';
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;
    return r;
  }

  async function startListening() {
    if (listening) {
      try { recognition?.stop(); } catch {}
      return;
    }
    if (!SpeechRecognition) {
      setStatus('A Brave ezen a készüléken nem ad közvetlen webes beszédfelismerést. Koppints a szövegmezőbe, és használd a telefon billentyűzetének mikrofonját; Zoé ugyanúgy több tételre bontja.', 'warn');
      transcript.focus();
      return;
    }

    finalText = '';
    transcript.value = '';
    preview.hidden = true;
    itemsBox.innerHTML = '';
    addAll.disabled = true;
    recognition = await createRecognition();
    if (!recognition) return;

    recognition.onstart = () => {
      setListening(true);
      setStatus('Hallgatlak… mondd természetesen a bevásárlólistát.', 'listening');
    };
    recognition.onresult = event => {
      let interim = '';
      for (let i=event.resultIndex;i<event.results.length;i++) {
        const value = event.results[i][0]?.transcript || '';
        if (event.results[i].isFinal) finalText += `${value} `;
        else interim += `${value} `;
      }
      transcript.value = `${finalText}${interim}`.trim();
      if (transcript.value) renderParsed();
    };
    recognition.onerror = event => {
      const code = event?.error || '';
      const message = code === 'not-allowed' || code === 'service-not-allowed'
        ? 'A mikrofon vagy a beszédfelismerés nincs engedélyezve. A szövegmezőben a billentyűzet mikrofonja is használható.'
        : code === 'no-speech'
          ? 'Nem hallottam beszédet. Próbáld újra, vagy diktálj a szövegmezőbe.'
          : code === 'network'
            ? 'A böngésző beszédfelismerő szolgáltatása most nem érhető el. A billentyűzetes diktálás továbbra is használható.'
            : 'Nem sikerült a beszédfelismerés. Próbáld újra vagy használd a billentyűzet mikrofonját.';
      setStatus(message,'warn');
    };
    recognition.onend = () => {
      setListening(false);
      if (transcript.value.trim()) {
        renderParsed();
        setStatus(`✓ Feldolgozva: ${itemsBox.querySelectorAll('.voice-item-input').length} tétel. Ellenőrizd, aztán add hozzá.`,'success');
      }
    };

    try { recognition.start(); }
    catch { setStatus('A beszédfelismerést most nem sikerült elindítani. Próbáld újra.','warn'); }
  }

  async function addParsedItems() {
    const values = [...itemsBox.querySelectorAll('.voice-item-input')].map(el => el.value.trim()).filter(Boolean);
    if (!values.length) return;
    addAll.disabled = true;
    setStatus(`${values.length} tétel hozzáadása…`,'listening');
    for (const value of values) {
      input.value = value;
      input.dispatchEvent(new Event('input',{bubbles:true}));
      form.requestSubmit();
      await new Promise(resolve => setTimeout(resolve,55));
    }
    if (dialog.open) dialog.close();
    input.blur();
    const toast = document.createElement('div');
    toast.className = 'voice-toast';
    toast.textContent = `🎙️ ${values.length} tétel hozzáadva`;
    document.body.appendChild(toast);
    requestAnimationFrame(()=>toast.classList.add('show'));
    setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),220);},1800);
  }

  function openVoice() {
    transcript.value = '';
    itemsBox.innerHTML = '';
    preview.hidden = true;
    addAll.disabled = true;
    setStatus('Példa: „két tej, egy kiló csirkemell, kávé és három banán”');
    dialog.showModal();
    setTimeout(startListening,120);
  }

  micButton.addEventListener('click',openVoice);
  listenButton.addEventListener('click',startListening);
  closeButton.addEventListener('click',()=>dialog.close());
  reparse.addEventListener('click',()=>{renderParsed();setStatus('✓ Újrafeldolgozva.','success');});
  addAll.addEventListener('click',addParsedItems);
  transcript.addEventListener('input',()=>{ if (!listening) renderParsed(); });
  itemsBox.addEventListener('input',updateCount);

  dialog.addEventListener('close',()=>{
    if (listening) { try { recognition?.abort(); } catch {} }
    setListening(false);
    recognition = null;
  });
  dialog.addEventListener('cancel',()=>{
    if (listening) { try { recognition?.abort(); } catch {} }
    setListening(false);
  });
  dialog.addEventListener('click',event=>{ if (event.target === dialog) dialog.close(); });

  window.ZoeVoice2026 = {parse:parseSpeech};
})();