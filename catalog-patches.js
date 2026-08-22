(() => {
  'use strict';

  // Zoé Lista – tesztelés közben kifogott, kurált katalógus-kiegészítések.
  // Csak a beépített katalógus szabályait írhatják felül; a felhasználó saját tanításait nem.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const PATCH_VERSION = 1;

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
    }
  ];

  function normalize(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  }

  let learned = {};
  try { learned = JSON.parse(localStorage.getItem(LEARNED_KEY)) || {}; } catch { learned = {}; }

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
      const previous = learned[key];
      if (!previous || previous.builtinCatalog) learned[key] = {...rule};
    }
  }

  try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}
})();
