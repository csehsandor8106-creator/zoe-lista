(() => {
  'use strict';

  // Zoé Lista – tesztelés közben kifogott, kurált katalógus-kiegészítések.
  // Csak a beépített katalógus szabályait írhatják felül; a felhasználó saját tanításait nem.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const PATCH_VERSION = 4;

  const PATCHES = [
    {
      aliases:['tejszínhab','tejszinhab','spray tejszínhab','spray tejszinhab','hab spray','habspray'],
      label:'Tejszínhab',
      category:'Tejtermék és tojás',
      icon:'🍦',
      price:899,
      unit:'db'
    },
    {
      aliases:['piskótatallér','piskotataller','piskóta tallér','piskota taller','csokis piskótatallér','csokis piskotataller'],
      label:'Piskótatallér',
      category:'Snack és édesség',
      icon:'🍪',
      price:799,
      unit:'csomag'
    },
    {
      aliases:['zokni','cs zokni','csomag zokni','1 cs zokni','1 csomag zokni'],
      label:'Zokni',
      category:'Ruházat',
      icon:'🧦',
      price:1499,
      unit:'csomag'
    },
    {
      aliases:['kukorica csöves','kukorica csoves','csöves kukorica','csoves kukorica','kukorica, csöves','kukorica, csoves'],
      label:'Csöves kukorica',
      category:'Zöldség-gyümölcs',
      icon:'🌽',
      price:299,
      unit:'db'
    },
    {
      aliases:['fogpiszkáló','fogpiszkalo','fogniszkáló','fogniszkalo','fog piszkáló','fog piszkalo','toothpick'],
      label:'Fogpiszkáló',
      category:'Háztartás',
      icon:'🦷',
      price:399,
      unit:'csomag'
    },
    {
      aliases:['póló','polo','basic póló','basic polo','póló basic','polo basic','póló (basic)','polo (basic)','trikó','triko'],
      label:'Basic póló',
      category:'Ruházat',
      icon:'👕',
      price:2499,
      unit:'db'
    },
    {
      aliases:['gatya','alsónadrág','alsónadrag','alsó nadrág','also nadrag','boxer','boxeralsó','boxeralso','boxeralsó csomag'],
      label:'Alsónadrág',
      category:'Ruházat',
      icon:'🩲',
      price:2999,
      unit:'csomag'
    }
  ];

  function normalize(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  }

  let learned = {};
  try { learned = JSON.parse(localStorage.getItem(LEARNED_KEY)) || {}; } catch { learned = {}; }
  const patchRules = {};

  for (const patch of PATCHES) {
    const rule = {
      label:patch.label,
      category:patch.category,
      icon:patch.icon,
      price:patch.price,
      unit:patch.unit,
      kind:'learned',
      builtinCatalog:true,
      catalogPatch:true,
      builtinVersion:PATCH_VERSION
    };

    for (const alias of patch.aliases) {
      const key = normalize(alias);
      if (!key) continue;
      patchRules[key] = rule;
      const previous = learned[key];
      if (!previous || previous.builtinCatalog) learned[key] = {...rule};
    }
  }

  try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}

  // A régebben, még hibás felismeréssel felvett becsült tételeket is javítjuk.
  try {
    const items = JSON.parse(localStorage.getItem(STATE_KEY)) || [];
    let changed = false;
    for (const item of items) {
      if (!item || item.source !== 'estimate') continue;
      const rule = patchRules[normalize(item.name)];
      if (!rule) continue;
      const oldCategory = item.category;
      if (item.name !== rule.label) { item.name = rule.label; changed = true; }
      if (item.category !== rule.category) { item.category = rule.category; changed = true; }
      if (item.icon !== rule.icon) { item.icon = rule.icon; changed = true; }
      if (item.price !== rule.price) { item.price = rule.price; changed = true; }
      if ((oldCategory === 'Egyéb' || !item.unit) && item.unit !== rule.unit) { item.unit = rule.unit; changed = true; }
    }
    if (changed) localStorage.setItem(STATE_KEY, JSON.stringify(items));
  } catch {}
})();
