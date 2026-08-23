(() => {
  'use strict';

  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const BARCODE_KEY = 'zoe-lista-barcode-memory-v1';
  const FAMILY_VERSION = 2026082302;

  const RULES = [
    // FŰSZEREK
    {aliases:['chili cayenne','chilli cayenne','cayenne','cayenne bors','cayenne pepper','chili cayenne kotanyi','chili cayenne kotányi','kotanyi chili cayenne','kotányi chili cayenne','kotányi őrölt chili cayenne','kotanyi orolt chili cayenne'],label:'Cayenne bors',category:'Alapélelmiszer',icon:'🌶️',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['chili por','chilipor','chilli por','őrölt chili','orolt chili'],label:'Chilipor',category:'Alapélelmiszer',icon:'🌶️',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['chili pehely','chilipehely','chilli flakes','chili flakes'],label:'Chilipehely',category:'Alapélelmiszer',icon:'🌶️',price:799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['fekete bors','őrölt fekete bors','orolt fekete bors','black pepper'],label:'Fekete bors',category:'Alapélelmiszer',icon:'🧂',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['fehér bors','feher bors','white pepper'],label:'Fehér bors',category:'Alapélelmiszer',icon:'🧂',price:799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['színes bors','szines bors','borskeverék','borskeverek','pepper mix'],label:'Borskeverék',category:'Alapélelmiszer',icon:'🧂',price:899,unit:'csomag',legacyDbToDefault:true},
    {aliases:['fűszerpaprika','fuszerpaprika','pirospaprika','őrölt paprika','orolt paprika','édesnemes paprika','edesnemes paprika'],label:'Fűszerpaprika',category:'Alapélelmiszer',icon:'🌶️',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['fokhagymapor','fokhagyma por','fokhagymagranulátum','fokhagymagranulatum'],label:'Fokhagymapor / granulátum',category:'Alapélelmiszer',icon:'🧄',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['hagymapor','hagyma por','vöröshagymapor','voroshagymapor'],label:'Hagymapor',category:'Alapélelmiszer',icon:'🧅',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['kömény','komeny','őrölt kömény','orolt komeny','cumin','caraway'],label:'Kömény',category:'Alapélelmiszer',icon:'🧂',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['kurkuma','turmeric'],label:'Kurkuma',category:'Alapélelmiszer',icon:'🟡',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['curry','currypor','curry por'],label:'Curry',category:'Alapélelmiszer',icon:'🟡',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['fahéj','fahej','őrölt fahéj','orolt fahej','cinnamon'],label:'Fahéj',category:'Alapélelmiszer',icon:'🟤',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['oregánó','oregano','szurokfű','szurokfu','morzsolt oregánó','morzsolt oregano','lucullus morzsolt oregánó','lucullus morzsolt oregano','morzsolt oregánó lucullus','morzsolt oregano lucullus'],label:'Oregánó',category:'Alapélelmiszer',icon:'🌿',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['bazsalikom','basil'],label:'Bazsalikom',category:'Alapélelmiszer',icon:'🌿',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['majoránna','majoranna','marjoram'],label:'Majoránna',category:'Alapélelmiszer',icon:'🌿',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['kakukkfű','kakukkfu','thyme'],label:'Kakukkfű',category:'Alapélelmiszer',icon:'🌿',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['rozmaring','rosemary'],label:'Rozmaring',category:'Alapélelmiszer',icon:'🌿',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['szerecsendió','szerecsendio','nutmeg'],label:'Szerecsendió',category:'Alapélelmiszer',icon:'🧂',price:799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['babérlevél','baberlevel','bay leaf'],label:'Babérlevél',category:'Alapélelmiszer',icon:'🌿',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['kotányi','kotanyi'],label:'Kotányi fűszer',category:'Alapélelmiszer',icon:'🧂',price:699,unit:'csomag',legacyDbToDefault:true},

    // SÜTÉSI SEGÉDANYAGOK
    {aliases:['szódabikarbóna','szodabikarbona','baking soda','bicarbonate of soda','sodium bicarbonate','jedlá soda','jedla soda'],label:'Szódabikarbóna',category:'Alapélelmiszer',icon:'🧂',price:199,unit:'csomag',legacyDbToDefault:true},
    {aliases:['sütőpor','sutopor','baking powder'],label:'Sütőpor',category:'Alapélelmiszer',icon:'🧁',price:299,unit:'csomag',legacyDbToDefault:true},
    {aliases:['vaníliás cukor','vanilias cukor','vaníliacukor','vaniliacukor','vanilla sugar'],label:'Vaníliás cukor',category:'Alapélelmiszer',icon:'🧁',price:249,unit:'csomag',legacyDbToDefault:true},
    {aliases:['élesztő','eleszto','szárított élesztő','szaritott eleszto','dry yeast'],label:'Élesztő',category:'Alapélelmiszer',icon:'🧁',price:299,unit:'csomag',legacyDbToDefault:true},
    {aliases:['citromsav','citric acid'],label:'Citromsav',category:'Alapélelmiszer',icon:'🍋',price:399,unit:'csomag',legacyDbToDefault:true},
    {aliases:['zselatin','gelatin','gelatine'],label:'Zselatin',category:'Alapélelmiszer',icon:'🧁',price:499,unit:'csomag',legacyDbToDefault:true},

    // PAPÍRZSEBKENDŐ / TISSUES
    {aliases:['papírzsebkendő','papirzsebkendo','papír zsebkendő','papir zsebkendo','zsebkendő','zsebkendo','zsepi','tissue','tissues','facial tissue','facial tissues','paper tissues','tesco tissues'],label:'Papírzsebkendő',category:'Higiénia',icon:'🤧',price:499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['dobozos papírzsebkendő','dobozos papirzsebkendo','box tissues','boxed tissues','facial tissue box'],label:'Dobozos papírzsebkendő',category:'Higiénia',icon:'🤧',price:699,unit:'doboz',legacyDbToDefault:true}
  ];

  // Megerősített EAN-kódok. A Kotányi 20 g-os Chili Cayenne két csomagolási kóddal is forgalomban van.
  const BARCODES = {
    '5995863015085': {name:'Kotányi Chili Cayenne 20 g', source:'builtin', sourceName:'Zoé beépített katalógus', productType:'food', brand:'Kotányi', quantity:'20 g', categories:'chili cayenne, fűszer'},
    '5995863015603': {name:'Kotányi Chili Cayenne 20 g', source:'builtin', sourceName:'Zoé beépített katalógus', productType:'food', brand:'Kotányi', quantity:'20 g', categories:'chili cayenne, fűszer'},
    '5997359134720': {name:'Lucullus morzsolt oregánó 5 g', source:'builtin', sourceName:'Zoé beépített katalógus', productType:'food', brand:'Lucullus', quantity:'5 g', categories:'oregánó, fűszer'},
    '5997359192850': {name:'Lucullus Gastro morzsolt oregánó 100 g', source:'builtin', sourceName:'Zoé beépített katalógus', productType:'food', brand:'Lucullus Gastro', quantity:'100 g', categories:'oregánó, fűszer'}
  };

  function normalize(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  }

  const aliasRules = [];
  const exactRules = {};
  let learned = {};
  try { learned = JSON.parse(localStorage.getItem(LEARNED_KEY)) || {}; } catch { learned = {}; }

  for (const entry of RULES) {
    const rule = {
      label:entry.label, category:entry.category, icon:entry.icon, price:entry.price, unit:entry.unit,
      kind:'learned', builtinCatalog:true, familyCatalog:true,
      family:'spices-baking-paper', builtinVersion:FAMILY_VERSION,
      legacyDbToDefault:!!entry.legacyDbToDefault
    };
    for (const alias of [...entry.aliases, entry.label]) {
      const key = normalize(alias);
      if (!key) continue;
      exactRules[key] = rule;
      aliasRules.push({key, rule});
      const previous = learned[key];
      if (!previous || previous.builtinCatalog) learned[key] = {...rule};
    }
  }
  aliasRules.sort((a,b) => b.key.length - a.key.length);

  function match(text) {
    const key = normalize(text);
    if (!key) return null;
    if (exactRules[key]) return {...exactRules[key]};
    for (const candidate of aliasRules) {
      if (candidate.key.length < 5) continue;
      if (` ${key} `.includes(` ${candidate.key} `)) return {...candidate.rule};
    }
    return null;
  }

  try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}

  // A megerősített EAN-kódok bekerülnek a scanner helyi memóriájába.
  // Saját tanítást soha nem írunk felül.
  let barcodeMemory = {};
  try { barcodeMemory = JSON.parse(localStorage.getItem(BARCODE_KEY)) || {}; } catch { barcodeMemory = {}; }
  let barcodeChanged = false;
  for (const [code, entry] of Object.entries(BARCODES)) {
    const previous = barcodeMemory[code];
    if (!previous || previous.source === 'builtin') {
      barcodeMemory[code] = {
        ...previous,
        ...entry,
        learnedAt:previous?.learnedAt || Date.now(),
        lastUsed:previous?.lastUsed || 0,
        scans:Number(previous?.scans) || 0
      };
      barcodeChanged = true;
    }
  }
  if (barcodeChanged) {
    try { localStorage.setItem(BARCODE_KEY, JSON.stringify(barcodeMemory)); } catch {}
  }

  // Régi scanner-találatok javítása úgy, hogy a részletes terméknév és a saját ár megmaradjon.
  let state = [];
  try { state = JSON.parse(localStorage.getItem(STATE_KEY)) || []; } catch { state = []; }
  let stateChanged = false;

  for (const item of state) {
    if (!item) continue;
    const rule = match(item.name);
    if (!rule) continue;

    const originalName = item.name;
    const wasOther = item.category === 'Egyéb';
    const wasLegacyDb = wasOther && item.unit === 'db';

    // Automatikus átsorolás csak a bizonytalan Egyéb tételeknél; kézzel választott más kategóriát békén hagyjuk.
    if (wasOther && item.category !== rule.category) { item.category = rule.category; stateChanged = true; }
    if (wasOther && item.icon !== rule.icon) { item.icon = rule.icon; stateChanged = true; }
    if (wasLegacyDb && rule.legacyDbToDefault && rule.unit !== 'db') { item.unit = rule.unit; stateChanged = true; }

    // Saját árat nem írunk felül. Becsült ár csak becsült forrású tételhez kerülhet.
    if (item.source === 'estimate' && item.unit === rule.unit && (!Number(item.price) || Number(item.price) === 699)) {
      if (item.price !== rule.price) { item.price = rule.price; stateChanged = true; }
    }

    // A hosszú scanneres név pontos szabályként is megmarad.
    const fullKey = normalize(originalName);
    const previous = learned[fullKey];
    if (fullKey && (!previous || previous.builtinCatalog)) {
      learned[fullKey] = {...rule, label:originalName};
    }
  }

  if (stateChanged) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
  }
  try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}

  window.ZoeExtraFamily2026 = { match };
})();