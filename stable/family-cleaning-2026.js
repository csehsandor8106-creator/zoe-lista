(() => {
  'use strict';

  // Zoé Lista – takarítás, fertőtlenítés és háztartási eszköz családbővítés.
  // A felhasználó saját ára és saját tanítása mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260822;

  const RULES = [
    // FERTŐTLENÍTÉS / SANYTOL ÉS ROKON TERMÉKEK
    {aliases:['sanytol'],label:'Sanytol fertőtlenítő',category:'Háztartás',icon:'🧴',price:1599,unit:'db',legacyDbToDefault:true},
    {aliases:['sanytol spray','sanytol fertőtlenítő spray','sanytol fertotlenito spray'],label:'Sanytol fertőtlenítő spray',category:'Háztartás',icon:'🧴',price:1799,unit:'db'},
    {aliases:['sanytol mosószeradalék','sanytol mososzeradalek','sanytol ruhafertőtlenítő','sanytol ruhafertotlenito'],label:'Sanytol ruhafertőtlenítő',category:'Háztartás',icon:'🧺',price:2199,unit:'db'},
    {aliases:['fertőtlenítő','fertotlenito','fertőtlenítő spray','fertotlenito spray'],label:'Fertőtlenítő spray',category:'Háztartás',icon:'🧴',price:1499,unit:'db'},
    {aliases:['detol','dettol','dettol fertőtlenítő','dettol fertotlenito'],label:'Dettol fertőtlenítő',category:'Háztartás',icon:'🧴',price:1699,unit:'db'},
    {aliases:['domestos','domestos fertőtlenítő','domestos fertotlenito'],label:'Domestos fertőtlenítő',category:'Háztartás',icon:'🧴',price:1299,unit:'db'},
    {aliases:['hypo','hipó','hipo','fehérítő','feherito'],label:'Hipó / fehérítő',category:'Háztartás',icon:'🧴',price:999,unit:'db'},

    // ÁLTALÁNOS TISZTÍTÓSZEREK ÉS MÁRKÁK
    {aliases:['cif'],label:'Cif tisztítószer',category:'Háztartás',icon:'🧽',price:1299,unit:'db'},
    {aliases:['ajax'],label:'Ajax tisztítószer',category:'Háztartás',icon:'🧽',price:1299,unit:'db'},
    {aliases:['frosch'],label:'Frosch tisztítószer',category:'Háztartás',icon:'🧽',price:1499,unit:'db'},
    {aliases:['mr proper','mr. proper','mister proper'],label:'Mr. Proper tisztítószer',category:'Háztartás',icon:'🧽',price:1399,unit:'db'},
    {aliases:['sidolux'],label:'Sidolux tisztítószer',category:'Háztartás',icon:'🧽',price:1399,unit:'db'},
    {aliases:['pronto'],label:'Pronto bútorápoló',category:'Háztartás',icon:'🪑',price:1599,unit:'db'},
    {aliases:['clin','clin ablaktisztító','clin ablaktisztito'],label:'Clin ablaktisztító',category:'Háztartás',icon:'🪟',price:1199,unit:'db'},
    {aliases:['ablaktisztító','ablaktisztito','üvegtisztító','uvegtisztito'],label:'Ablaktisztító',category:'Háztartás',icon:'🪟',price:1099,unit:'db'},
    {aliases:['általános tisztítószer','altalanos tisztitoszer','univerzális tisztító','univerzalis tisztito'],label:'Általános tisztítószer',category:'Háztartás',icon:'🧽',price:1199,unit:'db'},
    {aliases:['padlótisztító','padlotisztito','felmosószer','felmososzer'],label:'Padlótisztító',category:'Háztartás',icon:'🧹',price:1299,unit:'db'},
    {aliases:['konyhai tisztító','konyhai tisztito','zsíroldó','zsiroldo','hideg zsíroldó','hideg zsiroldo'],label:'Konyhai zsíroldó',category:'Háztartás',icon:'🧽',price:1299,unit:'db'},
    {aliases:['fürdőszobai tisztító','furdoszobai tisztito','fürdőtisztító','furdotisztito'],label:'Fürdőszobai tisztító',category:'Háztartás',icon:'🛁',price:1299,unit:'db'},
    {aliases:['vízkőoldó','vizkooldo','vízkő eltávolító','vizko eltavolito'],label:'Vízkőoldó',category:'Háztartás',icon:'🧴',price:1199,unit:'db'},
    {aliases:['penészeltávolító','peneszeltavolito','penészirtó','peneszirtó','penesz irto'],label:'Penészeltávolító',category:'Háztartás',icon:'🧴',price:1599,unit:'db'},
    {aliases:['lefolyótisztító','lefolyotisztito','lefolyó tisztító','lefolyo tisztito'],label:'Lefolyótisztító',category:'Háztartás',icon:'🧴',price:1399,unit:'db'},

    // WC-TISZTÍTÁS
    {aliases:['bref','bref wc','bref power'],label:'Bref WC-tisztító',category:'Háztartás',icon:'🚽',price:1299,unit:'db'},
    {aliases:['duck','toilet duck','wc duck'],label:'Duck WC-tisztító',category:'Háztartás',icon:'🚽',price:1199,unit:'db'},
    {aliases:['wc tisztító','wc tisztito','wc gél','wc gel'],label:'WC-tisztító gél',category:'Háztartás',icon:'🚽',price:1099,unit:'db'},
    {aliases:['wc illatosító','wc illatosito','wc blokk','wc kosár','wc kosar'],label:'WC-illatosító',category:'Háztartás',icon:'🚽',price:999,unit:'csomag'},
    {aliases:['wc kefe','wc-kefe','vécékefe','vecekefe'],label:'WC-kefe',category:'Háztartás',icon:'🪠',price:1499,unit:'db'},

    // VILEDA ÉS TAKARÍTÓESZKÖZÖK
    {aliases:['vileda'],label:'Vileda takarítóeszköz',category:'Háztartás',icon:'🧽',price:1499,unit:'db',legacyDbToDefault:true},
    {aliases:['vileda felmosó','vileda felmoso','vileda mop'],label:'Vileda felmosó',category:'Háztartás',icon:'🧹',price:4999,unit:'db'},
    {aliases:['vileda felmosófej','vileda felmosofej','vileda mop fej','vileda mopfej'],label:'Vileda felmosófej',category:'Háztartás',icon:'🧹',price:2499,unit:'db'},
    {aliases:['vileda kendő','vileda kendo','vileda mikroszálas kendő','vileda mikroszalas kendo'],label:'Vileda törlőkendő',category:'Háztartás',icon:'🧽',price:1299,unit:'csomag'},
    {aliases:['vileda szivacs','vileda dörzsi','vileda dorzsi'],label:'Vileda szivacs',category:'Háztartás',icon:'🧽',price:999,unit:'csomag'},
    {aliases:['vileda gumikesztyű','vileda gumikesztyu'],label:'Vileda gumikesztyű',category:'Háztartás',icon:'🧤',price:1299,unit:'pár'},

    // FELMOSÁS / SEPRÉS / PORTALANÍTÁS
    {aliases:['felmosó','felmoso','mop','mop felmosó','mop felmoso'],label:'Felmosó',category:'Háztartás',icon:'🧹',price:2999,unit:'db',legacyDbToDefault:true},
    {aliases:['felmosófej','felmosofej','mopfej','mop fej'],label:'Felmosófej',category:'Háztartás',icon:'🧹',price:1499,unit:'db'},
    {aliases:['felmosónyél','felmosonyel','felmosó nyél','felmoso nyel'],label:'Felmosónyél',category:'Háztartás',icon:'🧹',price:1999,unit:'db'},
    {aliases:['felmosóvödör','felmosovodor','felmosó vödör','felmoso vodor','mop vödör','mop vodor'],label:'Felmosóvödör',category:'Háztartás',icon:'🪣',price:2999,unit:'db'},
    {aliases:['vödör','vodor','takarítóvödör','takaritovodor'],label:'Vödör',category:'Háztartás',icon:'🪣',price:1499,unit:'db'},
    {aliases:['seprű','sepru','partvis'],label:'Seprű / partvis',category:'Háztartás',icon:'🧹',price:1999,unit:'db'},
    {aliases:['szemétlapát','szemetlapat','lapát seprűhöz','lapat sepruhöz','lapat sepruhoz'],label:'Szemétlapát',category:'Háztartás',icon:'🧹',price:999,unit:'db'},
    {aliases:['kézi seprű','kezi sepru','kisseprű','kissepru'],label:'Kézi seprű',category:'Háztartás',icon:'🧹',price:999,unit:'db'},
    {aliases:['portörlő','portorlo','poroló','porolo'],label:'Portörlő',category:'Háztartás',icon:'🪶',price:1499,unit:'db'},
    {aliases:['mikroszálas kendő','mikroszalas kendo','mikroszálas törlőkendő','mikroszalas torlokendo'],label:'Mikroszálas kendő',category:'Háztartás',icon:'🧽',price:999,unit:'csomag'},
    {aliases:['törlőkendő','torlokendo','háztartási kendő','haztartasi kendo'],label:'Törlőkendő',category:'Háztartás',icon:'🧽',price:799,unit:'csomag'},
    {aliases:['mosogatószivacs','mosogatoszivacs','szivacs','dörzsszivacs','dorzsszivacs','dörzsi','dorzsi'],label:'Mosogatószivacs',category:'Háztartás',icon:'🧽',price:699,unit:'csomag'},
    {aliases:['gumikesztyű','gumikesztyu','takarítókesztyű','takaritokesztyu'],label:'Gumikesztyű',category:'Háztartás',icon:'🧤',price:899,unit:'pár'},
    {aliases:['ablaklehúzó','ablaklehuzo','ablaktörlő lehúzó','ablaktorlo lehuzo'],label:'Ablaklehúzó',category:'Háztartás',icon:'🪟',price:1499,unit:'db'},

    // MOSOGATÁS – KÖZELI HÁZTARTÁSI CSALÁD
    {aliases:['jar','jar mosogatószer','jar mosogatoszer'],label:'Jar mosogatószer',category:'Háztartás',icon:'🧴',price:1299,unit:'db'},
    {aliases:['pur','pur mosogatószer','pur mosogatoszer'],label:'Pur mosogatószer',category:'Háztartás',icon:'🧴',price:1099,unit:'db'},
    {aliases:['finish','finish tabletta','finish mosogatógép tabletta','finish mosogatogep tabletta'],label:'Finish mosogatógép-tabletta',category:'Háztartás',icon:'🍽️',price:3999,unit:'csomag'},
    {aliases:['somat','somat tabletta','somat mosogatógép tabletta','somat mosogatogep tabletta'],label:'Somat mosogatógép-tabletta',category:'Háztartás',icon:'🍽️',price:3699,unit:'csomag'},
    {aliases:['mosogatógép tabletta','mosogatogep tabletta','mosogatógéptabletta','mosogatogeptabletta'],label:'Mosogatógép-tabletta',category:'Háztartás',icon:'🍽️',price:2999,unit:'csomag'},
    {aliases:['mosogatógép só','mosogatogep so','gépi mosogatósó','gepi mosogatoso'],label:'Mosogatógép-só',category:'Háztartás',icon:'🧂',price:999,unit:'csomag'},
    {aliases:['mosogatógép öblítő','mosogatogep oblito','gépi öblítő','gepi oblito'],label:'Mosogatógép-öblítő',category:'Háztartás',icon:'🧴',price:1299,unit:'db'}
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

  // A korábban Egyébként létrejött becsült tételeket helyrerakjuk.
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
