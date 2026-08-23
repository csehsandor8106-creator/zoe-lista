(() => {
  'use strict';

  // Zoé Lista – hús, belsőség és májas termékcsalád.
  // A felhasználó saját tanítása és saját ára mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260822;

  const RULES = [
    // KENHETŐ MÁJASOK / MÁJKRÉMEK
    {aliases:['kenőmájas','kenomajas','kenő májas','keno majas'],label:'Kenőmájas',category:'Hús és felvágott',icon:'🥫',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['májkrém','majkrem','máj krém','maj krem'],label:'Májkrém',category:'Hús és felvágott',icon:'🥫',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['baromfimájas','baromfi májas','baromfi majas'],label:'Baromfimájas',category:'Hús és felvágott',icon:'🥫',price:649,unit:'csomag',legacyDbToDefault:true},
    {aliases:['sertésmájas','sertesmajas','sertés májas','sertes majas'],label:'Sertésmájas',category:'Hús és felvágott',icon:'🥫',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['csirkemájas','csirkemajas','csirke májas','csirke majas'],label:'Csirkemájas',category:'Hús és felvágott',icon:'🥫',price:649,unit:'csomag',legacyDbToDefault:true},
    {aliases:['libamájkrém','libamajkrem','libamáj krém','libamaj krem'],label:'Libamájkrém',category:'Hús és felvágott',icon:'🥫',price:1399,unit:'csomag',legacyDbToDefault:true},
    {aliases:['kacsamájkrém','kacsamajkrem','kacsamáj krém','kacsamaj krem'],label:'Kacsamájkrém',category:'Hús és felvágott',icon:'🥫',price:1199,unit:'csomag',legacyDbToDefault:true},
    {aliases:['májas','majas'],label:'Májas',category:'Hús és felvágott',icon:'🥫',price:699,unit:'csomag',legacyDbToDefault:true},

    // HURKA / HIDEGKONYHAI HÚSKÉSZÍTMÉNYEK
    {aliases:['májas hurka','majas hurka','májashurka','majashurka'],label:'Májas hurka',category:'Hús és felvágott',icon:'🌭',price:2299,unit:'kg'},
    {aliases:['véres hurka','veres hurka','véreshurka','vereshurka'],label:'Véres hurka',category:'Hús és felvágott',icon:'🌭',price:2299,unit:'kg'},
    {aliases:['hurka'],label:'Hurka',category:'Hús és felvágott',icon:'🌭',price:2299,unit:'kg'},
    {aliases:['disznósajt','disznosajt','disznó sajt','diszno sajt'],label:'Disznósajt',category:'Hús és felvágott',icon:'🥩',price:2999,unit:'kg'},

    // CSIRKE BELSŐSÉGEK
    {aliases:['csirkemáj','csirkemaj','csirke máj','csirke maj'],label:'Csirkemáj',category:'Hús és felvágott',icon:'🍗',price:899,unit:'kg'},
    {aliases:['csirkeszív','csirkesziv','csirke szív','csirke sziv'],label:'Csirkeszív',category:'Hús és felvágott',icon:'🍗',price:1199,unit:'kg'},
    {aliases:['csirkezúza','csirkezuza','csirke zúza','csirke zuza'],label:'Csirkezúza',category:'Hús és felvágott',icon:'🍗',price:1299,unit:'kg'},
    {aliases:['csirke belsőség','csirke belsoseg','csirkebelsőség','csirkebelsoseg'],label:'Csirke belsőség',category:'Hús és felvágott',icon:'🍗',price:1099,unit:'kg'},

    // PULYKA BELSŐSÉGEK ÉS HÚSRÉSZEK
    {aliases:['pulykahere','pulyka here'],label:'Pulykahere',category:'Hús és felvágott',icon:'🥩',price:1699,unit:'kg',legacyDbToDefault:true},
    {aliases:['pulykamáj','pulykamaj','pulyka máj','pulyka maj'],label:'Pulykamáj',category:'Hús és felvágott',icon:'🍗',price:1299,unit:'kg'},
    {aliases:['pulykaszív','pulykasziv','pulyka szív','pulyka sziv'],label:'Pulykaszív',category:'Hús és felvágott',icon:'🍗',price:1399,unit:'kg'},
    {aliases:['pulykazúza','pulykazúza','pulykazuza','pulyka zúza','pulyka zuza'],label:'Pulykazúza',category:'Hús és felvágott',icon:'🍗',price:1399,unit:'kg'},
    {aliases:['pulykanyak','pulyka nyak'],label:'Pulykanyak',category:'Hús és felvágott',icon:'🍗',price:1099,unit:'kg'},
    {aliases:['pulykacomb','pulyka comb'],label:'Pulykacomb',category:'Hús és felvágott',icon:'🍗',price:2199,unit:'kg'},
    {aliases:['pulykaszárny','pulykaszarny','pulyka szárny','pulyka szarny'],label:'Pulykaszárny',category:'Hús és felvágott',icon:'🍗',price:1499,unit:'kg'},
    {aliases:['pulykafarhát','pulykafarhat','pulyka farhát','pulyka farhat'],label:'Pulykafarhát',category:'Hús és felvágott',icon:'🍗',price:899,unit:'kg'},
    {aliases:['pulykamellfilé','pulykamellfile','pulyka mellfilé','pulyka mellfile'],label:'Pulykamellfilé',category:'Hús és felvágott',icon:'🍗',price:2999,unit:'kg'},

    // KACSA / LIBA BELSŐSÉGEK
    {aliases:['kacsamáj','kacsamaj','kacsa máj','kacsa maj'],label:'Kacsamáj',category:'Hús és felvágott',icon:'🦆',price:3499,unit:'kg'},
    {aliases:['kacsazúza','kacsazuza','kacsa zúza','kacsa zuza'],label:'Kacsazúza',category:'Hús és felvágott',icon:'🦆',price:1699,unit:'kg'},
    {aliases:['kacsaszív','kacsasziv','kacsa szív','kacsa sziv'],label:'Kacsaszív',category:'Hús és felvágott',icon:'🦆',price:1799,unit:'kg'},
    {aliases:['libamáj','libamaj','liba máj','liba maj'],label:'Libamáj',category:'Hús és felvágott',icon:'🪿',price:11999,unit:'kg'},
    {aliases:['libazúza','libazuza','liba zúza','liba zuza'],label:'Libazúza',category:'Hús és felvágott',icon:'🪿',price:1799,unit:'kg'},

    // SERTÉS / MARHA BELSŐSÉGEK
    {aliases:['sertésmáj','sertesmaj','sertés máj','sertes maj','disznómáj','disznomaj'],label:'Sertésmáj',category:'Hús és felvágott',icon:'🥩',price:1199,unit:'kg'},
    {aliases:['marhamáj','marhamaj','marha máj','marha maj'],label:'Marhamáj',category:'Hús és felvágott',icon:'🥩',price:1799,unit:'kg'},
    {aliases:['sertésvese','sertesvese','sertés vese','sertes vese'],label:'Sertésvese',category:'Hús és felvágott',icon:'🥩',price:1199,unit:'kg'},
    {aliases:['marhavese','marha vese'],label:'Marhavese',category:'Hús és felvágott',icon:'🥩',price:1599,unit:'kg'},
    {aliases:['sertésszív','sertessziv','sertés szív','sertes sziv'],label:'Sertésszív',category:'Hús és felvágott',icon:'🥩',price:1299,unit:'kg'},
    {aliases:['marhaszív','marhasziv','marha szív','marha sziv'],label:'Marhaszív',category:'Hús és felvágott',icon:'🥩',price:1699,unit:'kg'},
    {aliases:['sertésnyelv','sertesnyelv','sertés nyelv','sertes nyelv'],label:'Sertésnyelv',category:'Hús és felvágott',icon:'🥩',price:1999,unit:'kg'},
    {aliases:['marhanyelv','marha nyelv'],label:'Marhanyelv',category:'Hús és felvágott',icon:'🥩',price:2999,unit:'kg'},
    {aliases:['velő','velo','csontvelő','csontvelo'],label:'Velő',category:'Hús és felvágott',icon:'🦴',price:1899,unit:'kg'},
    {aliases:['pacal','marhapacal'],label:'Pacal',category:'Hús és felvágott',icon:'🥩',price:2499,unit:'kg'},
    {aliases:['tüdő','tudo','sertéstüdő','sertestudo'],label:'Tüdő',category:'Hús és felvágott',icon:'🥩',price:999,unit:'kg'},
    {aliases:['kakashere','kakas here'],label:'Kakashere',category:'Hús és felvágott',icon:'🥩',price:1999,unit:'kg'},

    // ÁLTALÁNOS BELSŐSÉG – csak pontos megnevezésre
    {aliases:['belsőség','belsoseg'],label:'Belsőség',category:'Hús és felvágott',icon:'🥩',price:1499,unit:'kg'},
    {aliases:['máj','maj'],label:'Máj',category:'Hús és felvágott',icon:'🥩',price:1499,unit:'kg'}
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
      family:'meat-offal',
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

  // A korábban fallbackből Egyéb/db-ként eltárolt becsült tételek egyszeri helyrerakása.
  let state = [];
  try { state = JSON.parse(localStorage.getItem(STATE_KEY)) || []; } catch { state = []; }
  let stateChanged = false;

  for (const item of state) {
    if (!item || item.source !== 'estimate') continue;
    const rule = exactRules[normalize(item.name)];
    if (!rule) continue;

    if (item.name !== rule.label) { item.name = rule.label; stateChanged = true; }
    if (item.category !== rule.category) { item.category = rule.category; stateChanged = true; }
    if (item.icon !== rule.icon) { item.icon = rule.icon; stateChanged = true; }

    const legacyFallback = item.category === 'Egyéb' || item.unit === 'db';
    if (rule.legacyDbToDefault && item.unit === 'db' && rule.unit !== 'db') {
      item.unit = rule.unit;
      stateChanged = true;
    }

    if (item.unit === rule.unit && item.price !== rule.price) {
      item.price = rule.price;
      stateChanged = true;
    } else if (legacyFallback && rule.legacyDbToDefault && item.unit === rule.unit && item.price !== rule.price) {
      item.price = rule.price;
      stateChanged = true;
    }
  }

  if (stateChanged) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
  }
})();
