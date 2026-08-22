(() => {
  'use strict';

  // Zoé Lista – gabona, köret, hüvelyes és mag családbővítés.
  // A felhasználó saját ára/tanítása mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260822;

  const RULES = [
    // BULGUR / KUSZKUSZ / ALTERNATÍV KÖRETEK
    {aliases:['bulgur','búzabulgur','buzabulgur'],label:'Bulgur',category:'Alapélelmiszer',icon:'🌾',price:799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['durva bulgur','nagyszemű bulgur','nagyszemu bulgur'],label:'Durva bulgur',category:'Alapélelmiszer',icon:'🌾',price:899,unit:'csomag'},
    {aliases:['teljes kiőrlésű bulgur','teljes kiorlesu bulgur'],label:'Teljes kiőrlésű bulgur',category:'Alapélelmiszer',icon:'🌾',price:999,unit:'csomag'},
    {aliases:['kuszkusz','couscous','kusz kusz'],label:'Kuszkusz',category:'Alapélelmiszer',icon:'🌾',price:899,unit:'csomag',legacyDbToDefault:true},
    {aliases:['teljes kiőrlésű kuszkusz','teljes kiorlesu kuszkusz','wholegrain couscous'],label:'Teljes kiőrlésű kuszkusz',category:'Alapélelmiszer',icon:'🌾',price:999,unit:'csomag'},
    {aliases:['gyöngykuszkusz','gyongykuszkusz','izraeli kuszkusz','pearl couscous'],label:'Gyöngykuszkusz',category:'Alapélelmiszer',icon:'🌾',price:1199,unit:'csomag'},
    {aliases:['quinoa','kinoa','fehér quinoa','feher quinoa'],label:'Quinoa',category:'Alapélelmiszer',icon:'🌾',price:1499,unit:'csomag'},
    {aliases:['tricolor quinoa','trikolor quinoa','háromszínű quinoa','haromszinu quinoa'],label:'Tricolor quinoa',category:'Alapélelmiszer',icon:'🌾',price:1699,unit:'csomag'},
    {aliases:['köles','koles','hántolt köles','hantolt koles'],label:'Köles',category:'Alapélelmiszer',icon:'🌾',price:799,unit:'csomag'},
    {aliases:['hajdina','pohánka','pohanka'],label:'Hajdina',category:'Alapélelmiszer',icon:'🌾',price:999,unit:'csomag'},
    {aliases:['árpagyöngy','arpagyongy','gersli'],label:'Árpagyöngy / gersli',category:'Alapélelmiszer',icon:'🌾',price:599,unit:'csomag'},
    {aliases:['amaránt','amarant','amaranth'],label:'Amaránt',category:'Alapélelmiszer',icon:'🌾',price:1199,unit:'csomag'},

    // RIZSFAJTÁK
    {aliases:['basmati rizs','basmati'],label:'Basmati rizs',category:'Alapélelmiszer',icon:'🍚',price:1399,unit:'csomag'},
    {aliases:['jázmin rizs','jazmin rizs','jasmine rice'],label:'Jázmin rizs',category:'Alapélelmiszer',icon:'🍚',price:1399,unit:'csomag'},
    {aliases:['barna rizs','barnarizs'],label:'Barna rizs',category:'Alapélelmiszer',icon:'🍚',price:1099,unit:'csomag'},
    {aliases:['parboiled rizs','előfőzött rizs','elofőzott rizs','elofott rizs'],label:'Parboiled rizs',category:'Alapélelmiszer',icon:'🍚',price:999,unit:'csomag'},
    {aliases:['rizottó rizs','rizotto rizs','arborio','arborio rizs'],label:'Rizottó rizs',category:'Alapélelmiszer',icon:'🍚',price:1299,unit:'csomag'},
    {aliases:['sushi rizs','susi rizs'],label:'Sushi rizs',category:'Alapélelmiszer',icon:'🍚',price:1399,unit:'csomag'},
    {aliases:['vad rizs','vadrizs','vad rizs keverék','vad rizs keverek'],label:'Vad rizs / rizskeverék',category:'Alapélelmiszer',icon:'🍚',price:1699,unit:'csomag'},

    // CSICSERIBORSÓ ÉS KRÉMEK
    {aliases:['csicseriborsó','csicseriborso'],label:'Csicseriborsó konzerv',category:'Alapélelmiszer',icon:'🥫',price:599,unit:'db'},
    {aliases:['csicseriborsó konzerv','csicseriborso konzerv','konzerv csicseriborsó','konzerv csicseriborso'],label:'Csicseriborsó konzerv',category:'Alapélelmiszer',icon:'🥫',price:599,unit:'db'},
    {aliases:['száraz csicseriborsó','szaraz csicseriborso','csicseriborsó száraz','csicseriborso szaraz'],label:'Száraz csicseriborsó',category:'Alapélelmiszer',icon:'🫘',price:899,unit:'csomag'},
    {aliases:['pirított csicseriborsó','piritott csicseriborso','ropogós csicseriborsó','ropogos csicseriborso'],label:'Pirított csicseriborsó',category:'Snack és édesség',icon:'🫘',price:899,unit:'csomag'},
    {aliases:['hummusz','humusz','hummus','csicseriborsókrém','csicseriborsokrem'],label:'Hummusz',category:'Alapélelmiszer',icon:'🥣',price:799,unit:'db'},

    // BABOK ÉS LENCSEFÉLÉK
    {aliases:['fehérbab','feherbab','fehér bab','feher bab'],label:'Fehérbab konzerv',category:'Alapélelmiszer',icon:'🥫',price:699,unit:'db'},
    {aliases:['vörösbab','vorosbab','kidney bab','kidney bean'],label:'Vörösbab konzerv',category:'Alapélelmiszer',icon:'🥫',price:699,unit:'db'},
    {aliases:['feketebab','fekete bab','black bean'],label:'Feketebab konzerv',category:'Alapélelmiszer',icon:'🥫',price:749,unit:'db'},
    {aliases:['chilis bab konzerv','chilis bab','chili bab konzerv'],label:'Chilis bab konzerv',category:'Alapélelmiszer',icon:'🥫',price:899,unit:'db'},
    {aliases:['paradicsomos bab','baked beans','sült bab konzerv','sult bab konzerv'],label:'Paradicsomos bab',category:'Alapélelmiszer',icon:'🥫',price:799,unit:'db'},
    {aliases:['száraz fehérbab','szaraz feherbab'],label:'Száraz fehérbab',category:'Alapélelmiszer',icon:'🫘',price:899,unit:'csomag'},
    {aliases:['száraz tarkabab','szaraz tarkabab','tarkabab'],label:'Tarkabab',category:'Alapélelmiszer',icon:'🫘',price:999,unit:'csomag'},
    {aliases:['barna lencse','zöld lencse','zold lencse','lencse'],label:'Lencse',category:'Alapélelmiszer',icon:'🫘',price:799,unit:'csomag'},
    {aliases:['vörös lencse','voros lencse','red lentil'],label:'Vörös lencse',category:'Alapélelmiszer',icon:'🫘',price:899,unit:'csomag'},
    {aliases:['beluga lencse','fekete lencse'],label:'Beluga lencse',category:'Alapélelmiszer',icon:'🫘',price:1199,unit:'csomag'},
    {aliases:['lencse konzerv','konzerv lencse'],label:'Lencse konzerv',category:'Alapélelmiszer',icon:'🥫',price:699,unit:'db'},
    {aliases:['sárgaborsó','sargaborso','felezett sárgaborsó','felezett sargaborso'],label:'Sárgaborsó',category:'Alapélelmiszer',icon:'🫛',price:699,unit:'csomag'},
    {aliases:['mungóbab','mungobab','mung bab','mung bean'],label:'Mungóbab',category:'Alapélelmiszer',icon:'🫘',price:1099,unit:'csomag'},

    // MAGVAK, AMELYEK UGYANEBBEN A POLCBAN GYAKORIAK
    {aliases:['chia mag','chiamag','chia'],label:'Chiamag',category:'Alapélelmiszer',icon:'🌱',price:1099,unit:'csomag'},
    {aliases:['lenmag','len mag'],label:'Lenmag',category:'Alapélelmiszer',icon:'🌱',price:699,unit:'csomag'},
    {aliases:['szezámmag','szezammag','szezám mag','szezam mag'],label:'Szezámmag',category:'Alapélelmiszer',icon:'🌱',price:799,unit:'csomag'},
    {aliases:['napraforgómag','napraforgomag','hántolt napraforgómag','hantolt napraforgomag'],label:'Napraforgómag',category:'Alapélelmiszer',icon:'🌻',price:699,unit:'csomag'},
    {aliases:['tökmag','tokmag','hántolt tökmag','hantolt tokmag'],label:'Tökmag',category:'Alapélelmiszer',icon:'🎃',price:1199,unit:'csomag'}
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

  // A korábban Egyéb/db fallbackként létrejött tételeket helyrerakjuk.
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
