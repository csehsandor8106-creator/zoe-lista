(() => {
  'use strict';

  // Zoé Lista – sütési csokoládék, bögrék/csészék és lakástextil családbővítés.
  // A felhasználó saját ára és saját tanítása mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260822;

  const RULES = [
    // SÜTÉSI CSOKOLÁDÉK / KAKAÓS ALAPANYAGOK
    {aliases:['főzőcsokoládé','fozocsokolade','főző csokoládé','fozo csokolade','sütőcsoki','sutocsoki','sütő csoki','suto csoki'],label:'Főzőcsokoládé',category:'Alapélelmiszer',icon:'🍫',price:799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['ét főzőcsokoládé','et fozocsokolade','étcsoki sütéshez','etcsoki suteshez'],label:'Ét főzőcsokoládé',category:'Alapélelmiszer',icon:'🍫',price:899,unit:'csomag',legacyDbToDefault:true},
    {aliases:['tej főzőcsokoládé','tej fozocsokolade','tejcsoki sütéshez','tejcsoki suteshez'],label:'Tej főzőcsokoládé',category:'Alapélelmiszer',icon:'🍫',price:899,unit:'csomag',legacyDbToDefault:true},
    {aliases:['fehér főzőcsokoládé','feher fozocsokolade','fehércsoki sütéshez','fehercsoki suteshez'],label:'Fehér főzőcsokoládé',category:'Alapélelmiszer',icon:'🍫',price:999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['tortabevonó','tortabevono','csokibevonó','csokibevono','csokoládébevonó','csokoladebevono'],label:'Tortabevonó',category:'Alapélelmiszer',icon:'🍫',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['kuvertúra','kuvertura','couverture','csokoládé kuvertúra','csokolade kuvertura'],label:'Csokoládé-kuvertúra',category:'Alapélelmiszer',icon:'🍫',price:1299,unit:'csomag',legacyDbToDefault:true},
    {aliases:['csokicsepp','csoki csepp','csokoládécsepp','csokoladecsepp','chocolate chips'],label:'Csokoládécsepp',category:'Alapélelmiszer',icon:'🍫',price:1099,unit:'csomag',legacyDbToDefault:true},
    {aliases:['csokidarab','csoki darab','csokoládédarab','csokoladedarab'],label:'Csokoládédarab sütéshez',category:'Alapélelmiszer',icon:'🍫',price:999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['kakaópor','kakaopor','sütőkakaó','sutokakao','sütő kakaó','suto kakao'],label:'Kakaópor',category:'Alapélelmiszer',icon:'🍫',price:899,unit:'csomag',legacyDbToDefault:true},
    {aliases:['holland kakaópor','holland kakaopor'],label:'Holland kakaópor',category:'Alapélelmiszer',icon:'🍫',price:1299,unit:'csomag',legacyDbToDefault:true},
    {aliases:['cukrozatlan kakaópor','cukrozatlan kakaopor'],label:'Cukrozatlan kakaópor',category:'Alapélelmiszer',icon:'🍫',price:1099,unit:'csomag',legacyDbToDefault:true},

    // BÖGRÉK / CSÉSZÉK / POHARAK
    {aliases:['kávésbögre','kavesbogre','kávés bögre','kaves bogre'],label:'Kávésbögre',category:'Háztartás',icon:'☕',price:1499,unit:'db',legacyDbToDefault:true},
    {aliases:['bögre','bogre'],label:'Bögre',category:'Háztartás',icon:'☕',price:1299,unit:'db'},
    {aliases:['teásbögre','teasbogre','teás bögre','teas bogre'],label:'Teásbögre',category:'Háztartás',icon:'🍵',price:1499,unit:'db'},
    {aliases:['latte bögre','latte bogre','latte pohár','latte pohar'],label:'Latte bögre',category:'Háztartás',icon:'☕',price:1699,unit:'db'},
    {aliases:['kávéscsésze','kavescsesze','kávés csésze','kaves csesze','presszós csésze','presszos csesze','espresso csésze','espresso csesze'],label:'Kávéscsésze',category:'Háztartás',icon:'☕',price:999,unit:'db'},
    {aliases:['teáscsésze','teascsesze','teás csésze','teas csesze'],label:'Teáscsésze',category:'Háztartás',icon:'🍵',price:1199,unit:'db'},
    {aliases:['csészealj','cseszealj','csésze alj','csesze alj'],label:'Csészealj',category:'Háztartás',icon:'🍽️',price:699,unit:'db'},
    {aliases:['vizespohár','vizespohar','vizes pohár','vizes pohar'],label:'Vizespohár',category:'Háztartás',icon:'🥛',price:699,unit:'db'},
    {aliases:['borospohár','borospohar','boros pohár','boros pohar'],label:'Borospohár',category:'Háztartás',icon:'🍷',price:999,unit:'db'},
    {aliases:['pezsgőspohár','pezsgospohar','pezsgős pohár','pezsgos pohar'],label:'Pezsgőspohár',category:'Háztartás',icon:'🥂',price:999,unit:'db'},
    {aliases:['söröskorsó','soroskorsó','soroskorsó','sörös korsó','soros korso','söröskorsó'],label:'Söröskorsó',category:'Háztartás',icon:'🍺',price:1499,unit:'db'},
    {aliases:['termoszbögre','termoszbogre','termosz bögre','termosz bogre','utazóbögre','utazobogre','travel mug'],label:'Termoszbögre',category:'Háztartás',icon:'☕',price:3499,unit:'db'},
    {aliases:['bögreszett','bogreszett','bögre szett','bogre szett'],label:'Bögreszett',category:'Háztartás',icon:'☕',price:3999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['pohárkészlet','poharkeszlet','pohár készlet','pohar keszlet'],label:'Pohárkészlet',category:'Háztartás',icon:'🥛',price:3999,unit:'csomag',legacyDbToDefault:true},

    // ÁGYNEMŰ / LAKÁSTEXTIL
    {aliases:['párnahuzat','parnahuzat','párna huzat','parna huzat'],label:'Párnahuzat',category:'Háztartás',icon:'🛏️',price:1499,unit:'db',legacyDbToDefault:true},
    {aliases:['díszpárnahuzat','diszparnahuzat','díszpárna huzat','diszparna huzat'],label:'Díszpárnahuzat',category:'Háztartás',icon:'🛋️',price:1999,unit:'db'},
    {aliases:['paplanhuzat','paplan huzat'],label:'Paplanhuzat',category:'Háztartás',icon:'🛏️',price:3999,unit:'db'},
    {aliases:['ágyneműhuzat','agynemuhuzat','ágynemű huzat','agynemu huzat'],label:'Ágyneműhuzat',category:'Háztartás',icon:'🛏️',price:6999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['ágyneműgarnitúra','agynemugarnitura','ágynemű garnitúra','agynemu garnitura','ágyneműszett','agynemuszette'],label:'Ágyneműgarnitúra',category:'Háztartás',icon:'🛏️',price:7999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['lepedő','lepedo'],label:'Lepedő',category:'Háztartás',icon:'🛏️',price:2999,unit:'db'},
    {aliases:['gumis lepedő','gumis lepedo','gumilepedő','gumilepedo'],label:'Gumis lepedő',category:'Háztartás',icon:'🛏️',price:3499,unit:'db'},
    {aliases:['matracvédő','matracvedo','matrac védő','matrac vedo'],label:'Matracvédő',category:'Háztartás',icon:'🛏️',price:5999,unit:'db'},
    {aliases:['párna','parna','alvópárna','alvoparna'],label:'Párna',category:'Háztartás',icon:'🛏️',price:3999,unit:'db'},
    {aliases:['paplan'],label:'Paplan',category:'Háztartás',icon:'🛏️',price:8999,unit:'db'},
    {aliases:['takaró','takaro','pléd','pled'],label:'Takaró / pléd',category:'Háztartás',icon:'🧶',price:4999,unit:'db'},
    {aliases:['ágytakaró','agytakaro','ágy takaró','agy takaro'],label:'Ágytakaró',category:'Háztartás',icon:'🛏️',price:6999,unit:'db'},
    {aliases:['törölköző','torolkozo'],label:'Törölköző',category:'Háztartás',icon:'🧺',price:2499,unit:'db'},
    {aliases:['kéztörlő','keztorlo','kéztörlő törölköző','keztorlo torolkozo'],label:'Kéztörlő',category:'Háztartás',icon:'🧺',price:1299,unit:'db'},
    {aliases:['fürdőlepedő','furdolepedo','fürdő törölköző','furdo torolkozo'],label:'Fürdőlepedő',category:'Háztartás',icon:'🧺',price:3499,unit:'db'}
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
      family:'kitchen-baking-textile',
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

  // A korábbi Egyéb/699 Ft fallbackből felvett becsült tételek helyrerakása.
  let state = [];
  try { state = JSON.parse(localStorage.getItem(STATE_KEY)) || []; } catch { state = []; }
  let stateChanged = false;

  for (const item of state) {
    if (!item || !['estimate','estimate-unit','unknown'].includes(item.source)) continue;
    const entry = exactRules[normalize(item.name)];
    if (!entry) continue;

    const wasFallback = item.category === 'Egyéb' || item.price === 699 || item.source === 'unknown';
    if (!wasFallback && !entry.legacyDbToDefault) continue;

    if (item.name !== entry.label) { item.name = entry.label; stateChanged = true; }
    if (item.category !== entry.category) { item.category = entry.category; stateChanged = true; }
    if (item.icon !== entry.icon) { item.icon = entry.icon; stateChanged = true; }
    if (item.unit !== entry.unit) { item.unit = entry.unit; stateChanged = true; }
    if (item.price !== entry.price) { item.price = entry.price; stateChanged = true; }
    if (item.source !== 'estimate') { item.source = 'estimate'; stateChanged = true; }
  }

  if (stateChanged) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
  }
})();
