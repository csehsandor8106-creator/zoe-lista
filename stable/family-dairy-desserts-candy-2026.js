(() => {
  'use strict';

  // Zoé Lista – sajtok, cukrászsütemények és drazsék/cukorkák családbővítés.
  // A felhasználó saját tanítása és saját ára mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260822;

  const RULES = [
    // DRAZSÉK / CUKORKÁK / APRÓ ÉDESSÉGEK
    {aliases:['dunakavics','duna kavics','duna-kavics'],label:'Dunakavics',category:'Snack és édesség',icon:'🍬',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['franciadrazsé','francia drazsé','franciadrazse','francia drazse'],label:'Francia drazsé',category:'Snack és édesség',icon:'🍬',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['drazsé','drazse','csokidrazsé','csokidrazse','cukordrazsé','cukordrazse'],label:'Drazsé',category:'Snack és édesség',icon:'🍬',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['m&m','m&m’s','m&ms','m and m','mms'],label:'M&M’s',category:'Snack és édesség',icon:'🍬',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['smarties','smarties drazsé','smarties drazse'],label:'Smarties',category:'Snack és édesség',icon:'🍬',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['skittles'],label:'Skittles',category:'Snack és édesség',icon:'🍬',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['mentos'],label:'Mentos',category:'Snack és édesség',icon:'🍬',price:499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['tic tac','tictac'],label:'Tic Tac',category:'Snack és édesség',icon:'🍬',price:499,unit:'doboz',legacyDbToDefault:true},
    {aliases:['pez','pez cukorka'],label:'PEZ cukorka',category:'Snack és édesség',icon:'🍬',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['negro','negro cukorka'],label:'Negro cukorka',category:'Snack és édesség',icon:'🍬',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['werther’s','werthers','werther'],label:'Werther’s Original',category:'Snack és édesség',icon:'🍬',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['savanyúcukor','savanyu cukor','savanyú cukorka','savanyu cukorka'],label:'Savanyú cukorka',category:'Snack és édesség',icon:'🍬',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['keménycukor','kemenycukor','kemény cukorka','kemeny cukorka'],label:'Keménycukorka',category:'Snack és édesség',icon:'🍬',price:599,unit:'csomag',legacyDbToDefault:true},

    // SAJTFÉLÉK – csomagos/db és kg termékek külön
    {aliases:['parenyica','parenica','parenitza'],label:'Parenyica',category:'Tejtermék és tojás',icon:'🧀',price:1099,unit:'csomag',legacyDbToDefault:true},
    {aliases:['füstölt parenyica','fustolt parenyica','füstölt parenica','fustolt parenica'],label:'Füstölt parenyica',category:'Tejtermék és tojás',icon:'🧀',price:1199,unit:'csomag',legacyDbToDefault:true},
    {aliases:['gomolya','gomolya sajt'],label:'Gomolya sajt',category:'Tejtermék és tojás',icon:'🧀',price:3499,unit:'kg'},
    {aliases:['trappista','trappista sajt'],label:'Trappista sajt',category:'Tejtermék és tojás',icon:'🧀',price:2899,unit:'kg'},
    {aliases:['edami','edámi','edami sajt','edámi sajt'],label:'Edami sajt',category:'Tejtermék és tojás',icon:'🧀',price:3299,unit:'kg'},
    {aliases:['gouda','gouda sajt'],label:'Gouda sajt',category:'Tejtermék és tojás',icon:'🧀',price:3499,unit:'kg'},
    {aliases:['cheddar','cheddar sajt'],label:'Cheddar sajt',category:'Tejtermék és tojás',icon:'🧀',price:3999,unit:'kg'},
    {aliases:['ementáli','ementali','emmental','ementáli sajt','ementali sajt'],label:'Ementáli sajt',category:'Tejtermék és tojás',icon:'🧀',price:4299,unit:'kg'},
    {aliases:['maasdamer','maasdam','maasdamer sajt'],label:'Maasdamer sajt',category:'Tejtermék és tojás',icon:'🧀',price:3999,unit:'kg'},
    {aliases:['mozzarella','mozzarella golyó','mozzarella golyo'],label:'Mozzarella',category:'Tejtermék és tojás',icon:'🧀',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['mini mozzarella','mozzarella mini'],label:'Mini mozzarella',category:'Tejtermék és tojás',icon:'🧀',price:799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['feta','feta sajt'],label:'Feta sajt',category:'Tejtermék és tojás',icon:'🧀',price:1299,unit:'csomag',legacyDbToDefault:true},
    {aliases:['camembert','camembert sajt'],label:'Camembert',category:'Tejtermék és tojás',icon:'🧀',price:899,unit:'csomag',legacyDbToDefault:true},
    {aliases:['brie','brie sajt'],label:'Brie sajt',category:'Tejtermék és tojás',icon:'🧀',price:999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['kéksajt','keksajt','márványsajt','marvanysajt','blue cheese'],label:'Kéksajt / márványsajt',category:'Tejtermék és tojás',icon:'🧀',price:1199,unit:'csomag',legacyDbToDefault:true},
    {aliases:['grillsajt','grill sajt','halloumi','hallumi'],label:'Grillsajt / halloumi',category:'Tejtermék és tojás',icon:'🧀',price:1499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['krémsajt','kremsajt','cream cheese'],label:'Krémsajt',category:'Tejtermék és tojás',icon:'🧀',price:799,unit:'doboz',legacyDbToDefault:true},
    {aliases:['ömlesztett sajt','omlesztett sajt','mackósajt','mackosajt'],label:'Ömlesztett sajt',category:'Tejtermék és tojás',icon:'🧀',price:899,unit:'doboz',legacyDbToDefault:true},
    {aliases:['lapkasajt','lapka sajt','szeletelt sajt'],label:'Lapkasajt',category:'Tejtermék és tojás',icon:'🧀',price:999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['mascarpone'],label:'Mascarpone',category:'Tejtermék és tojás',icon:'🧀',price:1099,unit:'doboz',legacyDbToDefault:true},
    {aliases:['ricotta'],label:'Ricotta',category:'Tejtermék és tojás',icon:'🧀',price:999,unit:'doboz',legacyDbToDefault:true},
    {aliases:['kecskesajt','kecske sajt'],label:'Kecskesajt',category:'Tejtermék és tojás',icon:'🧀',price:1499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['juhsajt','juh sajt'],label:'Juhsajt',category:'Tejtermék és tojás',icon:'🧀',price:1599,unit:'csomag',legacyDbToDefault:true},

    // NEM ÁTFEDŐ TORTÁS TÉTELEK – a teljes tortacsalád gazdája a frissebb family-shopping-gaps-2026.js
    {aliases:['tortaszelet','torta szelet','szelet torta'],label:'Tortaszelet',category:'Pékáru',icon:'🍰',price:899,unit:'db'},
    {aliases:['mousse torta','moussetorta'],label:'Mousse torta',category:'Pékáru',icon:'🎂',price:6499,unit:'db'},

    // CUKRÁSZSÜTEMÉNYEK / DESSZERTEK
    {aliases:['krémes','kremes'],label:'Krémes',category:'Pékáru',icon:'🍰',price:699,unit:'db'},
    {aliases:['francia krémes','francia kremes'],label:'Francia krémes',category:'Pékáru',icon:'🍰',price:799,unit:'db'},
    {aliases:['zserbó','zserbo'],label:'Zserbó',category:'Pékáru',icon:'🍰',price:699,unit:'db'},
    {aliases:['isler','ischler'],label:'Isler',category:'Pékáru',icon:'🍪',price:599,unit:'db'},
    {aliases:['linzer','linzerkarika','linzer karika'],label:'Linzer',category:'Pékáru',icon:'🍪',price:499,unit:'db'},
    {aliases:['képviselőfánk','kepviselofank','képviselő fánk','kepviselo fank'],label:'Képviselőfánk',category:'Pékáru',icon:'🍩',price:699,unit:'db'},
    {aliases:['ekler','éclair','eclair'],label:'Éclair / ekler',category:'Pékáru',icon:'🍰',price:699,unit:'db'},
    {aliases:['brownie'],label:'Brownie',category:'Pékáru',icon:'🍫',price:599,unit:'db'},
    {aliases:['muffin'],label:'Muffin',category:'Pékáru',icon:'🧁',price:499,unit:'db'},
    {aliases:['cupcake'],label:'Cupcake',category:'Pékáru',icon:'🧁',price:699,unit:'db'},
    {aliases:['piskótatekercs','piskotatekercs','piskóta tekercs','piskota tekercs'],label:'Piskótatekercs',category:'Pékáru',icon:'🍰',price:999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['somlói','somloi','somlói galuska','somloi galuska'],label:'Somlói galuska',category:'Pékáru',icon:'🍨',price:999,unit:'doboz',legacyDbToDefault:true},
    {aliases:['tiramisu'],label:'Tiramisu',category:'Pékáru',icon:'🍰',price:1299,unit:'doboz',legacyDbToDefault:true},
    {aliases:['profiterol','profiterole'],label:'Profiterol',category:'Pékáru',icon:'🍰',price:1299,unit:'doboz',legacyDbToDefault:true},
    {aliases:['desszert','cukrászsütemény','cukraszsutemeny','sütemény','sutemeny'],label:'Sütemény / desszert',category:'Pékáru',icon:'🍰',price:699,unit:'db'}
  ];

  function normalize(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9&]+/g,' ').trim();
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
      family:'dairy-desserts-candy',
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

  let state = [];
  try { state = JSON.parse(localStorage.getItem(STATE_KEY)) || []; } catch { state = []; }
  let changed = false;

  for (const item of state) {
    if (!item || item.source !== 'estimate') continue;
    const rule = exactRules[normalize(item.name)];
    if (!rule) continue;

    const wasLegacy = item.category === 'Egyéb' && item.unit === 'db';
    if (item.name !== rule.label) { item.name = rule.label; changed = true; }
    if (item.category !== rule.category) { item.category = rule.category; changed = true; }
    if (item.icon !== rule.icon) { item.icon = rule.icon; changed = true; }
    if (wasLegacy && rule.legacyDbToDefault && rule.unit !== 'db') { item.unit = rule.unit; changed = true; }
    if (item.unit === rule.unit && item.price !== rule.price) { item.price = rule.price; changed = true; }
  }

  if (changed) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
  }
})();
