(() => {
  'use strict';

  // Zoé Lista – hordozható világítás, porszívók és dezodorok családbővítése.
  // A felhasználó saját ára és saját tanítása mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260822;

  const RULES = [
    // HORDOZHATÓ VILÁGÍTÁS
    {aliases:['zseblámpa','zseblampa','elemlámpa','elemlampa'],label:'Zseblámpa',category:'Háztartás',icon:'🔦',price:2499,unit:'db',legacyDbToDefault:true},
    {aliases:['led zseblámpa','led zseblampa'],label:'LED zseblámpa',category:'Háztartás',icon:'🔦',price:2999,unit:'db'},
    {aliases:['mini zseblámpa','mini zseblampa','kulcstartó lámpa','kulcstarto lampa'],label:'Mini zseblámpa',category:'Háztartás',icon:'🔦',price:1499,unit:'db'},
    {aliases:['tölthető zseblámpa','toltheto zseblampa','akkus zseblámpa','akkus zseblampa','usb zseblámpa','usb zseblampa'],label:'Tölthető zseblámpa',category:'Háztartás',icon:'🔦',price:3999,unit:'db'},
    {aliases:['fejlámpa','fejlampa','homloklámpa','homloklampa'],label:'Fejlámpa',category:'Háztartás',icon:'🔦',price:2999,unit:'db'},
    {aliases:['munkalámpa','munkalampa','szerelőlámpa','szerelolampa'],label:'Munkalámpa',category:'Háztartás',icon:'💡',price:4999,unit:'db'},
    {aliases:['kempinglámpa','kempinglampa','kemping lámpa','kemping lampa','camping lámpa','camping lampa'],label:'Kempinglámpa',category:'Háztartás',icon:'🏕️',price:3999,unit:'db'},
    {aliases:['lámpás','lampas','led lámpás','led lampas'],label:'LED lámpás',category:'Háztartás',icon:'🏮',price:3499,unit:'db'},
    {aliases:['vészlámpa','veszlampa','vészvilágítás','veszvilagitas'],label:'Vészlámpa',category:'Háztartás',icon:'🚨',price:4499,unit:'db'},
    {aliases:['kerékpárlámpa','kerekparlampa','biciklilámpa','biciklilampa','bringalámpa','bringalampa'],label:'Kerékpárlámpa',category:'Háztartás',icon:'🚲',price:3499,unit:'db'},

    // PORSZÍVÓK ÉS TARTOZÉKOK
    {aliases:['robotporszívó','robotporszivo','robot porszívó','robot porszivo','robot vacuum'],label:'Robotporszívó',category:'Háztartás',icon:'🤖',price:69990,unit:'db',legacyDbToDefault:true},
    {aliases:['porszívó','porszivo'],label:'Porszívó',category:'Háztartás',icon:'🧹',price:39990,unit:'db'},
    {aliases:['álló porszívó','allo porszivo','állóporszívó','alloporszivo'],label:'Álló porszívó',category:'Háztartás',icon:'🧹',price:49990,unit:'db'},
    {aliases:['vezeték nélküli porszívó','vezetek nelkuli porszivo','akkus porszívó','akkus porszivo'],label:'Vezeték nélküli porszívó',category:'Háztartás',icon:'🧹',price:59990,unit:'db'},
    {aliases:['kézi porszívó','kezi porszivo','kéziporszívó','keziporszivo'],label:'Kézi porszívó',category:'Háztartás',icon:'🧹',price:19990,unit:'db'},
    {aliases:['morzsaporszívó','morzsaporszivo','morzsa porszívó','morzsa porszivo'],label:'Morzsaporszívó',category:'Háztartás',icon:'🧹',price:15990,unit:'db'},
    {aliases:['porzsákos porszívó','porzsakos porszivo'],label:'Porzsákos porszívó',category:'Háztartás',icon:'🧹',price:34990,unit:'db'},
    {aliases:['porzsák nélküli porszívó','porzsak nelkuli porszivo','ciklon porszívó','ciklon porszivo'],label:'Porzsák nélküli porszívó',category:'Háztartás',icon:'🧹',price:39990,unit:'db'},
    {aliases:['nedves száraz porszívó','nedves szaraz porszivo','vizes porszívó','vizes porszivo','műhelyporszívó','muhelyporszivo'],label:'Nedves-száraz porszívó',category:'Háztartás',icon:'🧹',price:29990,unit:'db'},
    {aliases:['porszívózsák','porszivozsak','porszívó zsák','porszivo zsak'],label:'Porszívózsák',category:'Háztartás',icon:'🧺',price:2499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['porszívófilter','porszivofilter','porszívó szűrő','porszivo szuro','hepa szűrő porszívó','hepa szuro porszivo'],label:'Porszívószűrő',category:'Háztartás',icon:'🧽',price:2999,unit:'db'},
    {aliases:['robotporszívó mop','robotporszivo mop','robotporszívó felmosóbetét','robotporszivo felmosobetet'],label:'Robotporszívó mopbetét',category:'Háztartás',icon:'🧽',price:3999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['robotporszívó kefe','robotporszivo kefe','oldalkefe robotporszívó','oldalkefe robotporszivo'],label:'Robotporszívó kefe',category:'Háztartás',icon:'🧹',price:2999,unit:'csomag',legacyDbToDefault:true},

    // DEZODOR / IZZADÁSGÁTLÓ
    {aliases:['deo','deó','dezodor'],label:'Dezodor',category:'Higiénia',icon:'🧴',price:1299,unit:'db',legacyDbToDefault:true},
    {aliases:['spray dezodor','dezodor spray','deo spray'],label:'Dezodor spray',category:'Higiénia',icon:'🧴',price:1299,unit:'db'},
    {aliases:['golyós dezodor','golyos dezodor','roll on dezodor','roll-on dezodor','rollon dezodor'],label:'Golyós dezodor',category:'Higiénia',icon:'🧴',price:1199,unit:'db'},
    {aliases:['stift dezodor','dezodor stift','deo stift','stick dezodor'],label:'Stift dezodor',category:'Higiénia',icon:'🧴',price:1399,unit:'db'},
    {aliases:['izzadásgátló','izzadasgatlo','antiperspirant','antiperszpiráns','antiperszpirans'],label:'Izzadásgátló',category:'Higiénia',icon:'🧴',price:1399,unit:'db'},
    {aliases:['férfi dezodor','ferfi dezodor','férfi deo','ferfi deo'],label:'Férfi dezodor',category:'Higiénia',icon:'🧴',price:1399,unit:'db'},
    {aliases:['női dezodor','noi dezodor','női deo','noi deo'],label:'Női dezodor',category:'Higiénia',icon:'🧴',price:1399,unit:'db'},
    {aliases:['testpermet','body spray','body mist'],label:'Testpermet',category:'Higiénia',icon:'🧴',price:1699,unit:'db'},
    {aliases:['lábdezodor','labdezodor','láb spray','lab spray','cipődezodor','cipodezodor'],label:'Láb- és cipődezodor',category:'Higiénia',icon:'🧴',price:1499,unit:'db'},
    {aliases:['nivea deo','nivea dezodor','nivea men deo','nivea men dezodor'],label:'Nivea dezodor',category:'Higiénia',icon:'🧴',price:1499,unit:'db'},
    {aliases:['rexona deo','rexona dezodor'],label:'Rexona dezodor',category:'Higiénia',icon:'🧴',price:1499,unit:'db'},
    {aliases:['dove deo','dove dezodor'],label:'Dove dezodor',category:'Higiénia',icon:'🧴',price:1499,unit:'db'},
    {aliases:['axe deo','axe dezodor','axe body spray'],label:'Axe dezodor',category:'Higiénia',icon:'🧴',price:1699,unit:'db'},
    {aliases:['old spice deo','old spice dezodor'],label:'Old Spice dezodor',category:'Higiénia',icon:'🧴',price:1699,unit:'db'},
    {aliases:['adidas deo','adidas dezodor'],label:'Adidas dezodor',category:'Higiénia',icon:'🧴',price:1399,unit:'db'},
    {aliases:['fa deo','fa dezodor'],label:'Fa dezodor',category:'Higiénia',icon:'🧴',price:1299,unit:'db'}
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
      family:'home-tech-hygiene',
      builtinVersion:FAMILY_VERSION
    };

    const aliases = [...entry.aliases, entry.label];
    for (const alias of aliases) {
      const key = normalize(alias);
      if (!key) continue;
      exactRules[key] = {...rule, legacyDbToDefault:!!entry.legacyDbToDefault};
      const previous = learned[key];
      if (!previous || previous.builtinCatalog) learned[key] = {...rule};
    }
  }

  try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}

  // A korábbi Egyéb/db fallbackből felvett becsült tételeket rögtön javítjuk.
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
