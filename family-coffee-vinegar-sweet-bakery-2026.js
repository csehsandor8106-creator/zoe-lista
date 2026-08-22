(() => {
  'use strict';

  // Zoé Lista – kávé, ecet és édes péksütemény családbővítés.
  // A saját ár és a kézzel tanított szabály mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260823;

  const RULES = [
    // KÁVÉ – a bolti kávé alapértelmezetten csomagos termék.
    {aliases:['kávé','kave'],label:'Kávé',category:'Alapélelmiszer',icon:'☕',price:1999,unit:'csomag'},
    {aliases:['őrölt kávé','orolt kave','daralt kávé','daralt kave'],label:'Őrölt kávé',category:'Alapélelmiszer',icon:'☕',price:2299,unit:'csomag'},
    {aliases:['szemes kávé','szemes kave','kávébab','kavebab'],label:'Szemes kávé',category:'Alapélelmiszer',icon:'🫘',price:4999,unit:'csomag'},
    {aliases:['instant kávé','instant kave','oldódó kávé','oldodo kave'],label:'Instant kávé',category:'Alapélelmiszer',icon:'☕',price:2499,unit:'csomag'},
    {aliases:['koffeinmentes kávé','koffeinmentes kave','decaf kávé','decaf kave'],label:'Koffeinmentes kávé',category:'Alapélelmiszer',icon:'☕',price:2699,unit:'csomag'},
    {aliases:['espresso kávé','espresso kave','eszpresszó kávé','eszpresszo kave'],label:'Espresso kávé',category:'Alapélelmiszer',icon:'☕',price:2499,unit:'csomag'},
    {aliases:['filterkávé','filter kávé','filterkave','filter kave'],label:'Filterkávé',category:'Alapélelmiszer',icon:'☕',price:2299,unit:'csomag'},
    {aliases:['kávékapszula','kavekapszula','kávé kapszula','kave kapszula'],label:'Kávékapszula',category:'Alapélelmiszer',icon:'☕',price:1999,unit:'doboz'},
    {aliases:['nespresso kapszula','nespresso kávékapszula','nespresso kavekapszula'],label:'Nespresso kompatibilis kapszula',category:'Alapélelmiszer',icon:'☕',price:2199,unit:'doboz'},
    {aliases:['dolce gusto kapszula','dolce gusto kávékapszula','dolce gusto kavekapszula'],label:'Dolce Gusto kapszula',category:'Alapélelmiszer',icon:'☕',price:2499,unit:'doboz'},
    {aliases:['tassimo kapszula','tassimo kávékapszula','tassimo kavekapszula'],label:'Tassimo kapszula',category:'Alapélelmiszer',icon:'☕',price:2699,unit:'doboz'},
    {aliases:['kávépárna','kaveparna','coffee pad','kávé pod','kave pod'],label:'Kávépárna',category:'Alapélelmiszer',icon:'☕',price:1799,unit:'csomag'},
    {aliases:['omnia','douwe egberts omnia','omnia kávé','omnia kave'],label:'Omnia kávé',category:'Alapélelmiszer',icon:'☕',price:2499,unit:'csomag'},
    {aliases:['jacobs','jacobs kávé','jacobs kave'],label:'Jacobs kávé',category:'Alapélelmiszer',icon:'☕',price:2499,unit:'csomag'},
    {aliases:['tchibo','tchibo kávé','tchibo kave'],label:'Tchibo kávé',category:'Alapélelmiszer',icon:'☕',price:2499,unit:'csomag'},
    {aliases:['bravos','bravos kávé','bravos kave'],label:'Bravos kávé',category:'Alapélelmiszer',icon:'☕',price:1999,unit:'csomag'},
    {aliases:['lavazza','lavazza kávé','lavazza kave'],label:'Lavazza kávé',category:'Alapélelmiszer',icon:'☕',price:3499,unit:'csomag'},
    {aliases:['segafredo','segafredo kávé','segafredo kave'],label:'Segafredo kávé',category:'Alapélelmiszer',icon:'☕',price:2999,unit:'csomag'},

    // ECETEK / SAVANYÍTÓK – jellemzően üveges kiszerelés.
    {aliases:['almaecet','alma ecet','apple cider vinegar'],label:'Almaecet',category:'Alapélelmiszer',icon:'🍎',price:999,unit:'üveg'},
    {aliases:['ecet','ételecet','etelecet'],label:'Ételecet',category:'Alapélelmiszer',icon:'🧴',price:399,unit:'üveg'},
    {aliases:['10%-os ecet','10% ecet','10 ecet','tízszázalékos ecet','tizszazalekos ecet'],label:'10%-os ételecet',category:'Alapélelmiszer',icon:'🧴',price:399,unit:'üveg'},
    {aliases:['20%-os ecet','20% ecet','20 ecet','húszszázalékos ecet','huszszazalekos ecet'],label:'20%-os ételecet',category:'Alapélelmiszer',icon:'🧴',price:549,unit:'üveg'},
    {aliases:['balzsamecet','balzsam ecet','balsamic vinegar'],label:'Balzsamecet',category:'Alapélelmiszer',icon:'🍇',price:1499,unit:'üveg'},
    {aliases:['fehérborecet','feherborecet','fehérbor ecet','feherbor ecet'],label:'Fehérborecet',category:'Alapélelmiszer',icon:'🍇',price:1099,unit:'üveg'},
    {aliases:['vörösborecet','vorosborecet','vörösbor ecet','vorosbor ecet'],label:'Vörösborecet',category:'Alapélelmiszer',icon:'🍇',price:1099,unit:'üveg'},
    {aliases:['borecet'],label:'Borecet',category:'Alapélelmiszer',icon:'🍇',price:1099,unit:'üveg'},
    {aliases:['rizsecet','rizs ecet','rice vinegar'],label:'Rizsecet',category:'Alapélelmiszer',icon:'🍚',price:1299,unit:'üveg'},
    {aliases:['sherry ecet','sherryecet'],label:'Sherryecet',category:'Alapélelmiszer',icon:'🍇',price:1999,unit:'üveg'},
    {aliases:['ecetesszencia','ecet esszencia'],label:'Ecetesszencia',category:'Alapélelmiszer',icon:'🧴',price:799,unit:'üveg'},

    // ÉDES PÉKÁRU / PAPUCSOK – a "papucs" önmagában szándékosan nincs aliasnak felvéve.
    {aliases:['magvas szilvás papucs','magvas szilvas papucs'],label:'Magvas szilvás papucs',category:'Pékáru',icon:'🥐',price:399,unit:'db'},
    {aliases:['szilvás papucs','szilvas papucs'],label:'Szilvás papucs',category:'Pékáru',icon:'🥐',price:349,unit:'db'},
    {aliases:['almás papucs','almas papucs'],label:'Almás papucs',category:'Pékáru',icon:'🥐',price:349,unit:'db'},
    {aliases:['meggyes papucs'],label:'Meggyes papucs',category:'Pékáru',icon:'🥐',price:349,unit:'db'},
    {aliases:['barackos papucs'],label:'Barackos papucs',category:'Pékáru',icon:'🥐',price:349,unit:'db'},
    {aliases:['túrós papucs','turos papucs'],label:'Túrós papucs',category:'Pékáru',icon:'🥐',price:399,unit:'db'},
    {aliases:['szilvás párna','szilvas parna'],label:'Szilvás párna',category:'Pékáru',icon:'🥐',price:349,unit:'db'},
    {aliases:['almás párna','almas parna'],label:'Almás párna',category:'Pékáru',icon:'🥐',price:349,unit:'db'},
    {aliases:['meggyes párna','meggyes parna'],label:'Meggyes párna',category:'Pékáru',icon:'🥐',price:349,unit:'db'},
    {aliases:['túrós táska','turos taska'],label:'Túrós táska',category:'Pékáru',icon:'🥐',price:399,unit:'db'},
    {aliases:['kakaós csiga','kakaos csiga'],label:'Kakaós csiga',category:'Pékáru',icon:'🥐',price:349,unit:'db'},
    {aliases:['fahéjas csiga','fahejas csiga'],label:'Fahéjas csiga',category:'Pékáru',icon:'🥐',price:349,unit:'db'},
    {aliases:['lekváros bukta','lekvaros bukta'],label:'Lekváros bukta',category:'Pékáru',icon:'🥐',price:349,unit:'db'},
    {aliases:['túrós bukta','turos bukta'],label:'Túrós bukta',category:'Pékáru',icon:'🥐',price:399,unit:'db'},
    {aliases:['almás rétes','almas retes'],label:'Almás rétes',category:'Pékáru',icon:'🥧',price:499,unit:'db'},
    {aliases:['meggyes rétes','meggyes retes'],label:'Meggyes rétes',category:'Pékáru',icon:'🥧',price:499,unit:'db'},
    {aliases:['túrós rétes','turos retes'],label:'Túrós rétes',category:'Pékáru',icon:'🥧',price:499,unit:'db'},
    {aliases:['rétes','retes'],label:'Rétes',category:'Pékáru',icon:'🥧',price:499,unit:'db'},
    {aliases:['lekváros croissant','lekvaros croissant'],label:'Lekváros croissant',category:'Pékáru',icon:'🥐',price:399,unit:'db'},
    {aliases:['csokis croissant','csokoládés croissant','csokolades croissant'],label:'Csokis croissant',category:'Pékáru',icon:'🥐',price:449,unit:'db'}
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
      family:'coffee-vinegar-sweet-bakery',
      builtinVersion:FAMILY_VERSION
    };

    for (const alias of [...entry.aliases, entry.label]) {
      const key = normalize(alias);
      if (!key) continue;
      exactRules[key] = {...rule};
      const previous = learned[key];
      if (!previous || previous.builtinCatalog) learned[key] = {...rule};
    }
  }

  try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}

  // A már listában lévő becsült tételeket is átvezetjük az új pontos szabályra.
  let state = [];
  try { state = JSON.parse(localStorage.getItem(STATE_KEY)) || []; } catch { state = []; }
  let stateChanged = false;

  for (const item of state) {
    if (!item || !['estimate','estimate-unit','unknown'].includes(item.source)) continue;
    const rule = exactRules[normalize(item.name)];
    if (!rule) continue;

    if (item.name !== rule.label) { item.name = rule.label; stateChanged = true; }
    if (item.category !== rule.category) { item.category = rule.category; stateChanged = true; }
    if (item.icon !== rule.icon) { item.icon = rule.icon; stateChanged = true; }
    if (item.unit !== rule.unit) { item.unit = rule.unit; stateChanged = true; }
    if (item.price !== rule.price) { item.price = rule.price; stateChanged = true; }
    if (item.source !== 'estimate') { item.source = 'estimate'; stateChanged = true; }
  }

  if (stateChanged) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
  }
})();