(() => {
  'use strict';

  // Zoé Lista – családi katalógusbővítés, 2026-08.
  // Egy hiányzó termék köré a közeli, hétköznapi rokon termékeket is felvesszük.
  // Saját felhasználói tanítás/ár mindig erősebb marad.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260822;

  const RULES = [
    // PANÍROZÁS, SÜTÉS, KONYHAI ALAPOK
    {aliases:['zsemlemorzsa','zsemle morzsa','prézli','prezli','kenyérmorzsa','kenyermorzsa','breadcrumbs'],label:'Zsemlemorzsa',category:'Alapélelmiszer',icon:'🥖',price:499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['panko','panko morzsa','japán morzsa','japan morzsa'],label:'Panko morzsa',category:'Alapélelmiszer',icon:'🥖',price:899,unit:'csomag'},
    {aliases:['gluténmentes zsemlemorzsa','glutenmentes zsemlemorzsa','gm zsemlemorzsa'],label:'Gluténmentes zsemlemorzsa',category:'Alapélelmiszer',icon:'🥖',price:999,unit:'csomag'},
    {aliases:['panírmorzsa','panirmorzsa','fűszeres panírmorzsa','fuszeres panirmorzsa'],label:'Panírmorzsa',category:'Alapélelmiszer',icon:'🥖',price:699,unit:'csomag'},
    {aliases:['búzadara','buzadara','gríz','griz'],label:'Búzadara',category:'Alapélelmiszer',icon:'🌾',price:499,unit:'csomag'},
    {aliases:['kukoricadara','kukorica dara','polenta','puliszkadara'],label:'Kukoricadara',category:'Alapélelmiszer',icon:'🌽',price:599,unit:'csomag'},
    {aliases:['étkezési keményítő','etkezesi kemenyito','kukoricakeményítő','kukoricakemenyito','maizena'],label:'Étkezési keményítő',category:'Alapélelmiszer',icon:'🌾',price:599,unit:'csomag'},
    {aliases:['sütőpor','sutopor'],label:'Sütőpor',category:'Alapélelmiszer',icon:'🧁',price:249,unit:'csomag'},
    {aliases:['vaníliás cukor','vanilias cukor','vanillincukor','vanillin cukor'],label:'Vaníliás cukor',category:'Alapélelmiszer',icon:'🧁',price:199,unit:'csomag'},
    {aliases:['szárított élesztő','szaritott eleszto','instant élesztő','instant eleszto'],label:'Szárított élesztő',category:'Alapélelmiszer',icon:'🍞',price:299,unit:'csomag'},
    {aliases:['friss élesztő','friss eleszto','élesztő kocka','eleszto kocka'],label:'Friss élesztő',category:'Alapélelmiszer',icon:'🍞',price:129,unit:'db'},
    {aliases:['kakaópor','kakaopor','holland kakaópor','holland kakaopor'],label:'Kakaópor',category:'Alapélelmiszer',icon:'🍫',price:999,unit:'csomag'},

    // SPÁRGA ÉS RITKÁBB FRISS ZÖLDSÉGEK
    {aliases:['spárga','sparga','friss spárga','friss sparga','asparagus'],label:'Spárga',category:'Zöldség-gyümölcs',icon:'🌱',price:1499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['zöld spárga','zold sparga'],label:'Zöld spárga',category:'Zöldség-gyümölcs',icon:'🌱',price:1499,unit:'csomag'},
    {aliases:['fehér spárga','feher sparga'],label:'Fehér spárga',category:'Zöldség-gyümölcs',icon:'🌱',price:1699,unit:'csomag'},
    {aliases:['articsóka','articsoka','artichoke'],label:'Articsóka',category:'Zöldség-gyümölcs',icon:'🌿',price:699,unit:'db'},
    {aliases:['édeskömény','edeskomeny','gumós kömény','gumos komeny','fennel'],label:'Édeskömény',category:'Zöldség-gyümölcs',icon:'🌿',price:799,unit:'db'},
    {aliases:['szárzeller','szarzeller','angol zeller','halványító zeller','halvanyito zeller','celery'],label:'Szárzeller',category:'Zöldség-gyümölcs',icon:'🥬',price:799,unit:'db'},
    {aliases:['pak choi','pak choy','bok choy','bordáskel','bordaskel'],label:'Pak choi',category:'Zöldség-gyümölcs',icon:'🥬',price:799,unit:'csomag'},
    {aliases:['mángold','mangold','chard'],label:'Mángold',category:'Zöldség-gyümölcs',icon:'🥬',price:699,unit:'csomag'},
    {aliases:['kelbimbó','kelbimbo','brüsszeli kel','brusszeli kel'],label:'Kelbimbó',category:'Zöldség-gyümölcs',icon:'🥬',price:1499,unit:'kg'},
    {aliases:['paszternák','paszternak'],label:'Paszternák',category:'Zöldség-gyümölcs',icon:'🥕',price:1199,unit:'kg'},
    {aliases:['karalábé','karalabe'],label:'Karalábé',category:'Zöldség-gyümölcs',icon:'🥬',price:399,unit:'db'},
    {aliases:['petrezselyemzöld','petrezselyem zöld','petrezselyemzold','petrezselyem zold'],label:'Petrezselyemzöld',category:'Zöldség-gyümölcs',icon:'🌿',price:299,unit:'csomag'},
    {aliases:['kapor','friss kapor'],label:'Kapor',category:'Zöldség-gyümölcs',icon:'🌿',price:299,unit:'csomag'},
    {aliases:['koriander','friss koriander'],label:'Koriander',category:'Zöldség-gyümölcs',icon:'🌿',price:399,unit:'csomag'},

    // VAJBAB / ZÖLDBAB / HÜVELYESEK – FRISS
    {aliases:['vajbab','sárgahüvelyű bab','sargahuvelyu bab','sárga hüvelyű bab','sarga huvelyu bab'],label:'Vajbab',category:'Zöldség-gyümölcs',icon:'🫘',price:1599,unit:'kg',legacyDbToDefault:true},
    {aliases:['zöldbab','zoldbab','zöld hüvelyű bab','zold huvelyu bab'],label:'Zöldbab',category:'Zöldség-gyümölcs',icon:'🫘',price:1699,unit:'kg'},
    {aliases:['futóbab','futobab'],label:'Futóbab',category:'Zöldség-gyümölcs',icon:'🫘',price:1799,unit:'kg'},
    {aliases:['friss zöldborsó','friss zoldborso','zöldborsó hüvelyes','zoldborso huvelyes'],label:'Friss zöldborsó',category:'Zöldség-gyümölcs',icon:'🫛',price:1999,unit:'kg'},
    {aliases:['cukorborsó','cukorborso','sugar snap','sugarsnap'],label:'Cukorborsó',category:'Zöldség-gyümölcs',icon:'🫛',price:1499,unit:'csomag'},

    // FAGYASZTOTT HÜVELYESEK
    {aliases:['fagyasztott vajbab','mirelit vajbab','gyorsfagyasztott vajbab'],label:'Fagyasztott vajbab',category:'Fagyasztott',icon:'🫘',price:899,unit:'csomag'},
    {aliases:['fagyasztott zöldbab','fagyasztott zoldbab','mirelit zöldbab','mirelit zoldbab'],label:'Fagyasztott zöldbab',category:'Fagyasztott',icon:'🫘',price:899,unit:'csomag'},
    {aliases:['fagyasztott zöldborsó','fagyasztott zoldborso','mirelit zöldborsó','mirelit zoldborso'],label:'Fagyasztott zöldborsó',category:'Fagyasztott',icon:'🫛',price:799,unit:'csomag'},
    {aliases:['edamame','fagyasztott edamame','szójabab hüvely','szojabab huvely'],label:'Edamame',category:'Fagyasztott',icon:'🫛',price:1099,unit:'csomag'},

    // KONZERV ÉS SZÁRAZ HÜVELYESEK
    {aliases:['konzerv zöldbab','konzerv zoldbab','zöldbab konzerv','zoldbab konzerv'],label:'Zöldbab konzerv',category:'Alapélelmiszer',icon:'🥫',price:699,unit:'db'},
    {aliases:['fehérbab konzerv','feherbab konzerv','konzerv fehérbab','konzerv feherbab'],label:'Fehérbab konzerv',category:'Alapélelmiszer',icon:'🥫',price:699,unit:'db'},
    {aliases:['vörösbab konzerv','vorosbab konzerv','kidney bab','kidney bean'],label:'Vörösbab konzerv',category:'Alapélelmiszer',icon:'🥫',price:699,unit:'db'},
    {aliases:['csicseriborsó konzerv','csicseriborso konzerv','konzerv csicseriborsó','konzerv csicseriborso'],label:'Csicseriborsó konzerv',category:'Alapélelmiszer',icon:'🥫',price:699,unit:'db'},
    {aliases:['lencse konzerv','konzerv lencse'],label:'Lencse konzerv',category:'Alapélelmiszer',icon:'🥫',price:699,unit:'db'},
    {aliases:['szárazbab','szarazbab','tarkabab','fejtett bab'],label:'Szárazbab',category:'Alapélelmiszer',icon:'🫘',price:899,unit:'csomag'},
    {aliases:['lencse','száraz lencse','szaraz lencse'],label:'Lencse',category:'Alapélelmiszer',icon:'🫘',price:799,unit:'csomag'},
    {aliases:['vörös lencse','voros lencse'],label:'Vörös lencse',category:'Alapélelmiszer',icon:'🫘',price:899,unit:'csomag'},
    {aliases:['sárgaborsó','sargaborso','felezett sárgaborsó','felezett sargaborso'],label:'Sárgaborsó',category:'Alapélelmiszer',icon:'🫛',price:699,unit:'csomag'},
    {aliases:['száraz csicseriborsó','szaraz csicseriborso','csicseriborsó száraz','csicseriborso szaraz'],label:'Száraz csicseriborsó',category:'Alapélelmiszer',icon:'🫘',price:899,unit:'csomag'}
  ];

  function normalize(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  }

  let learned = {};
  try { learned = JSON.parse(localStorage.getItem(LEARNED_KEY)) || {}; } catch { learned = {}; }
  const exactRules = {};

  for (const entry of RULES) {
    const rule = {
      label:entry.label,
      category:entry.category,
      icon:entry.icon,
      price:entry.price,
      unit:entry.unit,
      kind:'learned',
      builtinCatalog:true,
      familyCatalog:true,
      builtinVersion:FAMILY_VERSION
    };
    for (const alias of entry.aliases) {
      const key = normalize(alias);
      if (!key) continue;
      exactRules[key] = {...rule, legacyDbToDefault:!!entry.legacyDbToDefault};
      const previous = learned[key];
      if (!previous || previous.builtinCatalog) learned[key] = {...rule};
    }
  }

  try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}

  // Korábbi fallback-ból létrejött, csak becsült tételek helyrerakása.
  try {
    const items = JSON.parse(localStorage.getItem(STATE_KEY)) || [];
    let changed = false;
    for (const item of items) {
      if (!item || !['estimate','estimate-unit','unknown'].includes(item.source)) continue;
      const rule = exactRules[normalize(item.name)];
      if (!rule) continue;
      const oldCategory = item.category;

      if (item.name !== rule.label) { item.name = rule.label; changed = true; }
      if (item.category !== rule.category) { item.category = rule.category; changed = true; }
      if (item.icon !== rule.icon) { item.icon = rule.icon; changed = true; }

      // Régi fallback esetén a db nem valódi felhasználói egység volt, hanem alapérték.
      if ((oldCategory === 'Egyéb' || rule.legacyDbToDefault) && item.unit === 'db' && rule.unit !== 'db') {
        item.unit = rule.unit;
        changed = true;
      }

      if (item.unit === rule.unit) {
        if (item.price !== rule.price) { item.price = rule.price; changed = true; }
        if (item.source === 'unknown') { item.source = 'estimate'; changed = true; }
      } else if (item.source !== 'unknown') {
        // Eltérő explicit egységnél ne másoljuk át vakon a család alapárát.
        item.price = null;
        item.source = 'unknown';
        changed = true;
      }
    }
    if (changed) localStorage.setItem(STATE_KEY, JSON.stringify(items));
  } catch {}
})();
