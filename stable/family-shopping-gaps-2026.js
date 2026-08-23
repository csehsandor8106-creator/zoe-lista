(() => {
  'use strict';

  // Zoé Lista – valós bevásárlás közben előkerült, eddig hiányzó termékcsaládok.
  // Exact/alias alapú, óvatos felismerés. A felhasználó saját tanítása és saját ára mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260823;

  const RULES = [
    // TORTÁK / SZELETELT DESSZERTTORTÁK
    {family:'cakes',aliases:['feketeerdő torta','feketeerdo torta','fekete erdő torta','fekete erdo torta'],label:'Feketeerdő torta',category:'Snack és édesség',icon:'🎂',price:3499,unit:'db'},
    {family:'cakes',aliases:['dobostorta','dobos torta'],label:'Dobostorta',category:'Snack és édesség',icon:'🎂',price:3999,unit:'db'},
    {family:'cakes',aliases:['eszterházy torta','eszterhazy torta','eszterházy-torta','eszterhazy-torta'],label:'Eszterházy torta',category:'Snack és édesség',icon:'🎂',price:4499,unit:'db'},
    {family:'cakes',aliases:['sacher torta','sachertorta','sacher-torta'],label:'Sacher torta',category:'Snack és édesség',icon:'🎂',price:3999,unit:'db'},
    {family:'cakes',aliases:['csokoládétorta','csokoladetorta','csokoládé torta','csokolade torta','csokitorta','csoki torta'],label:'Csokoládétorta',category:'Snack és édesség',icon:'🎂',price:3499,unit:'db'},
    {family:'cakes',aliases:['sajttorta','sajt torta','cheesecake'],label:'Sajttorta',category:'Snack és édesség',icon:'🍰',price:3999,unit:'db'},
    {family:'cakes',aliases:['gyümölcstorta','gyumolcstorta','gyümölcs torta','gyumolcs torta'],label:'Gyümölcstorta',category:'Snack és édesség',icon:'🍰',price:3499,unit:'db'},
    {family:'cakes',aliases:['oroszkrém torta','oroszkrem torta','oroszkrémtorta','oroszkremtorta'],label:'Oroszkrém torta',category:'Snack és édesség',icon:'🎂',price:3999,unit:'db'},
    {family:'cakes',aliases:['répatorta','repatorta','répa torta','repa torta'],label:'Répatorta',category:'Snack és édesség',icon:'🍰',price:3299,unit:'db'},
    {family:'cakes',aliases:['torta'],label:'Torta',category:'Snack és édesség',icon:'🎂',price:3999,unit:'db'},

    // ELEKTROMOS HOSSZABBÍTÓK / ELOSZTÓK
    {family:'extension-cords',aliases:['hosszabbító 1m','hosszabbito 1m','hosszabbító 1 m','hosszabbito 1 m','1m hosszabbító','1m hosszabbito'],label:'Hosszabbító 1 m',category:'Háztartás',icon:'🔌',price:1999,unit:'db'},
    {family:'extension-cords',aliases:['hosszabbító 3m','hosszabbito 3m','hosszabbító 3 m','hosszabbito 3 m','3m hosszabbító','3m hosszabbito'],label:'Hosszabbító 3 m',category:'Háztartás',icon:'🔌',price:2799,unit:'db'},
    {family:'extension-cords',aliases:['hosszabbító 5m','hosszabbito 5m','hosszabbító 5 m','hosszabbito 5 m','5m hosszabbító','5m hosszabbito'],label:'Hosszabbító 5 m',category:'Háztartás',icon:'🔌',price:3499,unit:'db'},
    {family:'extension-cords',aliases:['hosszabbító 10m','hosszabbito 10m','hosszabbító 10 m','hosszabbito 10 m','10m hosszabbító','10m hosszabbito'],label:'Hosszabbító 10 m',category:'Háztartás',icon:'🔌',price:5999,unit:'db'},
    {family:'extension-cords',aliases:['hosszabbító','hosszabbito','hosszabbító kábel','hosszabbito kabel'],label:'Hosszabbító',category:'Háztartás',icon:'🔌',price:2499,unit:'db'},
    {family:'extension-cords',aliases:['3-as elosztó','3 as eloszto','hármas elosztó','harmas eloszto'],label:'3-as elosztó',category:'Háztartás',icon:'🔌',price:2999,unit:'db'},
    {family:'extension-cords',aliases:['5-ös elosztó','5 os eloszto','ötös elosztó','otos eloszto'],label:'5-ös elosztó',category:'Háztartás',icon:'🔌',price:4499,unit:'db'},
    {family:'extension-cords',aliases:['túlfeszültségvédős elosztó','tulfeszultsegvedos eloszto','túlfeszültség védős elosztó','tulfeszultseg vedos eloszto'],label:'Túlfeszültségvédős elosztó',category:'Háztartás',icon:'🔌',price:5999,unit:'db'},
    {family:'extension-cords',aliases:['elosztó','eloszto'],label:'Elosztó',category:'Háztartás',icon:'🔌',price:2999,unit:'db'},

    // SZALONNÁK
    {family:'bacon-slab',aliases:['kolozsvári szalonna','kolozsvari szalonna','kolozsvári','kolozsvari'],label:'Kolozsvári szalonna',category:'Hús és felvágott',icon:'🥓',price:3999,unit:'kg',legacyDbToDefault:true},
    {family:'bacon-slab',aliases:['császárszalonna','csaszarszalonna','császár szalonna','csaszar szalonna'],label:'Császárszalonna',category:'Hús és felvágott',icon:'🥓',price:3699,unit:'kg',legacyDbToDefault:true},
    {family:'bacon-slab',aliases:['füstölt szalonna','fustolt szalonna'],label:'Füstölt szalonna',category:'Hús és felvágott',icon:'🥓',price:3299,unit:'kg',legacyDbToDefault:true},
    {family:'bacon-slab',aliases:['kenyérszalonna','kenyerszalonna','kenyér szalonna','kenyer szalonna'],label:'Kenyérszalonna',category:'Hús és felvágott',icon:'🥓',price:2799,unit:'kg',legacyDbToDefault:true},
    {family:'bacon-slab',aliases:['csemegeszalonna','csemege szalonna'],label:'Csemegeszalonna',category:'Hús és felvágott',icon:'🥓',price:2999,unit:'kg',legacyDbToDefault:true},
    {family:'bacon-slab',aliases:['paprikás szalonna','paprikas szalonna'],label:'Paprikás szalonna',category:'Hús és felvágott',icon:'🥓',price:3299,unit:'kg',legacyDbToDefault:true},
    {family:'bacon-slab',aliases:['szalonna'],label:'Szalonna',category:'Hús és felvágott',icon:'🥓',price:3299,unit:'kg',legacyDbToDefault:true},

    // KONYHAI RESZELŐK
    {family:'graters',aliases:['reszelő','reszelo'],label:'Reszelő',category:'Háztartás',icon:'🧀',price:1499,unit:'db'},
    {family:'graters',aliases:['sajtreszelő','sajtreszelo','sajt reszelő','sajt reszelo'],label:'Sajtreszelő',category:'Háztartás',icon:'🧀',price:1499,unit:'db'},
    {family:'graters',aliases:['négyoldalú reszelő','negyoldalu reszelo','4 oldalú reszelő','4 oldalu reszelo'],label:'Négyoldalú reszelő',category:'Háztartás',icon:'🧀',price:1799,unit:'db'},
    {family:'graters',aliases:['zöldségreszelő','zoldsegreszelo','zöldség reszelő','zoldseg reszelo'],label:'Zöldségreszelő',category:'Háztartás',icon:'🥕',price:1999,unit:'db'},
    {family:'graters',aliases:['almareszelő','almareszelo','alma reszelő','alma reszelo'],label:'Almareszelő',category:'Háztartás',icon:'🍎',price:999,unit:'db'},
    {family:'graters',aliases:['citrusreszelő','citrusreszelo','citrus reszelő','citrus reszelo','zester'],label:'Citrusreszelő',category:'Háztartás',icon:'🍋',price:1299,unit:'db'},
    {family:'graters',aliases:['reszelőkészlet','reszelokeszlet','reszelő készlet','reszelo keszlet'],label:'Reszelőkészlet',category:'Háztartás',icon:'🧀',price:2999,unit:'db'},
    {family:'graters',aliases:['mandolin szeletelő','mandolin szeletelo','mandolin'],label:'Mandolin szeletelő',category:'Háztartás',icon:'🔪',price:3999,unit:'db'},

    // VIENNETTA / FAGYASZTOTT DESSZERTEK
    {family:'frozen-desserts',aliases:['vienetta','viennetta'],label:'Viennetta',category:'Fagyasztott',icon:'🍨',price:1599,unit:'db'},
    {family:'frozen-desserts',aliases:['vienetta vanília','vienetta vanilia','viennetta vanília','viennetta vanilia'],label:'Viennetta vanília',category:'Fagyasztott',icon:'🍨',price:1599,unit:'db'},
    {family:'frozen-desserts',aliases:['vienetta csokoládé','vienetta csokolade','viennetta csokoládé','viennetta csokolade','vienetta csoki','viennetta csoki'],label:'Viennetta csokoládé',category:'Fagyasztott',icon:'🍨',price:1599,unit:'db'},
    {family:'frozen-desserts',aliases:['vienetta karamell','viennetta karamell'],label:'Viennetta karamell',category:'Fagyasztott',icon:'🍨',price:1699,unit:'db'},
    {family:'frozen-desserts',aliases:['jégkrémtorta','jegkremtorta','jégkrém torta','jegkrem torta'],label:'Jégkrémtorta',category:'Fagyasztott',icon:'🍨',price:2299,unit:'db'},
    {family:'frozen-desserts',aliases:['fagylalttorta','fagylalt torta','fagyi torta'],label:'Fagylalttorta',category:'Fagyasztott',icon:'🍨',price:2999,unit:'db'},
    {family:'frozen-desserts',aliases:['parfétorta','parfetorta','parfé torta','parfe torta'],label:'Parfétorta',category:'Fagyasztott',icon:'🍨',price:2999,unit:'db'},
    {family:'frozen-desserts',aliases:['jégkrémdesszert','jegkremdesszert','jégkrém desszert','jegkrem desszert'],label:'Jégkrémdesszert',category:'Fagyasztott',icon:'🍨',price:1599,unit:'db'}
  ];

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
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
      family:entry.family,
      builtinVersion:FAMILY_VERSION
    };

    for (const alias of [...entry.aliases, entry.label]) {
      const key = normalize(alias);
      if (!key) continue;
      exactRules[key] = {...rule, legacyDbToDefault:!!entry.legacyDbToDefault};
      const previous = learned[key];
      if (!previous || previous.builtinCatalog) learned[key] = {...rule};
    }
  }

  try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}

  // A már listán lévő, fallbackből Egyéb/db-ként felvett becsült tételeket helyrerakjuk.
  // Saját árat vagy saját tanítást nem írunk felül.
  let state = [];
  try { state = JSON.parse(localStorage.getItem(STATE_KEY)) || []; } catch { state = []; }
  let changed = false;

  for (const item of state) {
    if (!item || item.source !== 'estimate') continue;
    const rule = exactRules[normalize(item.name)];
    if (!rule) continue;

    const oldUnit = item.unit || 'db';
    if (item.name !== rule.label) { item.name = rule.label; changed = true; }
    if (item.category !== rule.category) { item.category = rule.category; changed = true; }
    if (item.icon !== rule.icon) { item.icon = rule.icon; changed = true; }

    if (rule.legacyDbToDefault && oldUnit === 'db' && rule.unit !== 'db') {
      item.unit = rule.unit;
      changed = true;
    }

    if ((item.unit || oldUnit) === rule.unit && Number(item.price) !== Number(rule.price)) {
      item.price = rule.price;
      changed = true;
    }
  }

  if (changed) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
  }
})();
