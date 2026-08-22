(() => {
  'use strict';

  // Zoé Lista – száraztészták, levesbetétek és babaételek/tápszerek családbővítés.
  // A felhasználó saját tanítása és saját ára mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260822;

  const RULES = [
    // SZÁRAZTÉSZTÁK – alapból csomagos termékek
    {aliases:['makaróni','makaroni','macaroni'],label:'Makaróni',category:'Alapélelmiszer',icon:'🍝',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['spagetti','spaghetti'],label:'Spagetti',category:'Alapélelmiszer',icon:'🍝',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['penne','penne rigate'],label:'Penne',category:'Alapélelmiszer',icon:'🍝',price:649,unit:'csomag',legacyDbToDefault:true},
    {aliases:['fusilli','orsótészta','orsoteszta','csavart tészta','csavart teszta'],label:'Fusilli / orsótészta',category:'Alapélelmiszer',icon:'🍝',price:649,unit:'csomag',legacyDbToDefault:true},
    {aliases:['farfalle','masnitészta','masniteszta','pillangótészta','pillangoteszta'],label:'Farfalle / masnitészta',category:'Alapélelmiszer',icon:'🍝',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['tagliatelle','metélt','metelt','szélesmetélt','szelesmetelt'],label:'Tagliatelle / szélesmetélt',category:'Alapélelmiszer',icon:'🍝',price:799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['lasagne','lasagna','lasagne tészta','lasagne teszta'],label:'Lasagne tészta',category:'Alapélelmiszer',icon:'🍝',price:999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['cannelloni','kanelloni'],label:'Cannelloni',category:'Alapélelmiszer',icon:'🍝',price:1099,unit:'csomag',legacyDbToDefault:true},
    {aliases:['szarvacska','szarvacskatészta','szarvacska tészta','szarvacska teszta'],label:'Szarvacska',category:'Alapélelmiszer',icon:'🍝',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['kagylótészta','kagyloteszta','kagyló tészta','kagylo teszta'],label:'Kagylótészta',category:'Alapélelmiszer',icon:'🍝',price:649,unit:'csomag',legacyDbToDefault:true},
    {aliases:['csőtészta','csoteszta','cső tészta','cso teszta'],label:'Csőtészta',category:'Alapélelmiszer',icon:'🍝',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['kockatészta','kockateszta','kocka tészta','kocka teszta'],label:'Kockatészta',category:'Alapélelmiszer',icon:'🍝',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['nagy kocka','nagykocka','nagy kockatészta','nagy kockateszta'],label:'Nagy kocka tészta',category:'Alapélelmiszer',icon:'🍝',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['tarhonya','gépi tarhonya','gepi tarhonya','házi tarhonya','hazi tarhonya'],label:'Tarhonya',category:'Alapélelmiszer',icon:'🍝',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['gnocchi','nyokki'],label:'Gnocchi',category:'Alapélelmiszer',icon:'🥔',price:999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['tortellini','tortellíni'],label:'Tortellini',category:'Alapélelmiszer',icon:'🍝',price:1299,unit:'csomag',legacyDbToDefault:true},
    {aliases:['ravioli','ravióli'],label:'Ravioli',category:'Alapélelmiszer',icon:'🍝',price:1299,unit:'csomag',legacyDbToDefault:true},
    {aliases:['teljes kiőrlésű tészta','teljes kiorlesu teszta','teljes kiőrlésű spagetti','teljes kiorlesu spagetti'],label:'Teljes kiőrlésű tészta',category:'Alapélelmiszer',icon:'🍝',price:899,unit:'csomag',legacyDbToDefault:true},
    {aliases:['gluténmentes tészta','glutenmentes teszta','gm tészta','gm teszta'],label:'Gluténmentes tészta',category:'Alapélelmiszer',icon:'🍝',price:1299,unit:'csomag',legacyDbToDefault:true},

    // LEVESTÉSZTÁK / LEVESBETÉTEK
    {aliases:['levestészta','levesteszta','leves tészta','leves teszta','levesbetét','levesbetet'],label:'Levestészta',category:'Alapélelmiszer',icon:'🍜',price:499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['cérnametélt','cernametelt','cérna metélt','cerna metelt'],label:'Cérnametélt',category:'Alapélelmiszer',icon:'🍜',price:499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['eperlevél','eperlevel','eper levél','eper level'],label:'Eperlevél tészta',category:'Alapélelmiszer',icon:'🍜',price:549,unit:'csomag',legacyDbToDefault:true},
    {aliases:['csigatészta','csigateszta','csiga tészta','csiga teszta'],label:'Csigatészta',category:'Alapélelmiszer',icon:'🍜',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['lúdgége','ludgege','lúd gége','lud gege'],label:'Lúdgége tészta',category:'Alapélelmiszer',icon:'🍜',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['betűtészta','betuteszta','betű tészta','betu teszta'],label:'Betűtészta',category:'Alapélelmiszer',icon:'🔤',price:549,unit:'csomag',legacyDbToDefault:true},
    {aliases:['csillagtészta','csillagteszta','csillag tészta','csillag teszta'],label:'Csillagtészta',category:'Alapélelmiszer',icon:'⭐',price:549,unit:'csomag',legacyDbToDefault:true},
    {aliases:['kiskocka','kis kocka','kis kockatészta','kis kockateszta'],label:'Kiskocka tészta',category:'Alapélelmiszer',icon:'🍜',price:549,unit:'csomag',legacyDbToDefault:true},
    {aliases:['grízgaluska','grizgaluska','daragaluska','dara galuska'],label:'Grízgaluska / daragaluska alap',category:'Alapélelmiszer',icon:'🥣',price:699,unit:'csomag',legacyDbToDefault:true},

    // BÉBITÁP / TÁPSZER – dobozos poralapú termékek
    {aliases:['bébitáp','bebitap','baba táp','baba tap','csecsemőtáp','csecsemotap'],label:'Bébitáp / tápszer',category:'Baba és gyermek',icon:'🍼',price:3999,unit:'doboz',legacyDbToDefault:true},
    {aliases:['tápszer','tapszer','csecsemőtápszer','csecsemotapszer'],label:'Tápszer',category:'Baba és gyermek',icon:'🍼',price:3999,unit:'doboz',legacyDbToDefault:true},
    {aliases:['1-es tápszer','1 es tapszer','kezdő tápszer','kezdo tapszer'],label:'1-es kezdő tápszer',category:'Baba és gyermek',icon:'🍼',price:3999,unit:'doboz',legacyDbToDefault:true},
    {aliases:['2-es tápszer','2 es tapszer','követő tápszer','koveto tapszer'],label:'2-es követő tápszer',category:'Baba és gyermek',icon:'🍼',price:4299,unit:'doboz',legacyDbToDefault:true},
    {aliases:['3-as tápszer','3 as tapszer','junior tápszer','junior tapszer'],label:'3-as junior tápszer',category:'Baba és gyermek',icon:'🍼',price:4499,unit:'doboz',legacyDbToDefault:true},
    {aliases:['ha tápszer','ha tapszer','hipoallergén tápszer','hipoallergen tapszer'],label:'HA tápszer',category:'Baba és gyermek',icon:'🍼',price:4999,unit:'doboz',legacyDbToDefault:true},
    {aliases:['ar tápszer','ar tapszer','antireflux tápszer','antireflux tapszer'],label:'AR tápszer',category:'Baba és gyermek',icon:'🍼',price:5299,unit:'doboz',legacyDbToDefault:true},

    // BÉBIÉTELEK
    {aliases:['bébiétel','bebietel','babaétel','babaetel','üveges bébiétel','uveges bebietel'],label:'Bébiétel',category:'Baba és gyermek',icon:'🥣',price:899,unit:'üveg',legacyDbToDefault:true},
    {aliases:['gyümölcsös bébiétel','gyumolcsos bebietel','gyümölcspüré baba','gyumolcspure baba'],label:'Gyümölcsös bébiétel',category:'Baba és gyermek',icon:'🍎',price:799,unit:'üveg',legacyDbToDefault:true},
    {aliases:['zöldséges bébiétel','zoldseges bebietel'],label:'Zöldséges bébiétel',category:'Baba és gyermek',icon:'🥕',price:899,unit:'üveg',legacyDbToDefault:true},
    {aliases:['húsos bébiétel','husos bebietel'],label:'Húsos bébiétel',category:'Baba és gyermek',icon:'🍗',price:999,unit:'üveg',legacyDbToDefault:true},
    {aliases:['bébipüré','bebipure','babapüré','babapure','gyümölcspüré','gyumolcspure'],label:'Bébipüré',category:'Baba és gyermek',icon:'🍎',price:699,unit:'db'},
    {aliases:['tasakos bébipüré','tasakos bebipure','pouch baba','bébi pouch','bebi pouch'],label:'Tasakos bébipüré',category:'Baba és gyermek',icon:'🍎',price:699,unit:'db'},
    {aliases:['babakása','babakasa','bébikása','bebikasa','tejbegríz baba','tejbegriz baba'],label:'Babakása',category:'Baba és gyermek',icon:'🥣',price:1699,unit:'doboz',legacyDbToDefault:true},
    {aliases:['rizskása baba','rizskasa baba','rizspép','rizspep'],label:'Baba rizskása',category:'Baba és gyermek',icon:'🥣',price:1699,unit:'doboz',legacyDbToDefault:true},
    {aliases:['babakeksz','baba keksz','bébikeksz','bebikeksz'],label:'Babakeksz',category:'Baba és gyermek',icon:'🍪',price:899,unit:'csomag',legacyDbToDefault:true},
    {aliases:['babatea','baba tea','bébi tea','bebi tea'],label:'Babatea',category:'Baba és gyermek',icon:'🍵',price:999,unit:'doboz',legacyDbToDefault:true},
    {aliases:['babavíz','babaviz','bébivíz','bebiviz','baba víz','baba viz'],label:'Babavíz',category:'Baba és gyermek',icon:'💧',price:399,unit:'l'},

    // GYAKORI BABÁS MÁRKÁK / TERMÉKCSALÁDOK
    {aliases:['hipp bébiétel','hipp bebietel'],label:'Hipp bébiétel',category:'Baba és gyermek',icon:'🥣',price:999,unit:'üveg',legacyDbToDefault:true},
    {aliases:['kecskeméti bébiétel','kecskemeti bebietel'],label:'Kecskeméti bébiétel',category:'Baba és gyermek',icon:'🥣',price:899,unit:'üveg',legacyDbToDefault:true},
    {aliases:['milupa tápszer','milupa tapszer','milupa bébitáp','milupa bebitap'],label:'Milupa tápszer',category:'Baba és gyermek',icon:'🍼',price:4499,unit:'doboz',legacyDbToDefault:true},
    {aliases:['beba tápszer','beba tapszer','beba'],label:'BEBA tápszer',category:'Baba és gyermek',icon:'🍼',price:4999,unit:'doboz',legacyDbToDefault:true},
    {aliases:['aptamil tápszer','aptamil tapszer','aptamil'],label:'Aptamil tápszer',category:'Baba és gyermek',icon:'🍼',price:5499,unit:'doboz',legacyDbToDefault:true},
    {aliases:['humana tápszer','humana tapszer','humana'],label:'Humana tápszer',category:'Baba és gyermek',icon:'🍼',price:4999,unit:'doboz',legacyDbToDefault:true}
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
      family:'pasta-baby',
      builtinVersion:FAMILY_VERSION
    };

    for (const alias of [...entry.aliases, entry.label]) {
      const key = normalize(alias);
      if (!key) continue;
      exactRules[key] = {...rule, legacyDbToDefault:!!entry.legacyDbToDefault};
      const old = learned[key];
      if (!old || old.builtinCatalog) learned[key] = {...rule};
    }
  }

  try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}

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

      if ((oldCategory === 'Egyéb' || rule.legacyDbToDefault) && item.unit === 'db' && rule.unit !== 'db') {
        item.unit = rule.unit;
        changed = true;
      }

      if (item.unit === rule.unit) {
        if (item.price !== rule.price) { item.price = rule.price; changed = true; }
        if (item.source === 'unknown') { item.source = 'estimate'; changed = true; }
      } else if (item.source !== 'unknown') {
        item.price = null;
        item.source = 'unknown';
        changed = true;
      }
    }
    if (changed) localStorage.setItem(STATE_KEY, JSON.stringify(items));
  } catch {}
})();
