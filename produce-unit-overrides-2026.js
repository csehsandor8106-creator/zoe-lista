(() => {
  'use strict';

  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const VERSION = 20260823;

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,' ')
      .trim();
  }

  let learned = {};
  try { learned = JSON.parse(localStorage.getItem(LEARNED_KEY)) || {}; } catch { learned = {}; }

  const bananaRule = {
    label:'Banán',
    category:'Zöldség-gyümölcs',
    icon:'🍌',
    price:199,
    unit:'db',
    pricesByUnit:{db:199,kg:699},
    kind:'learned',
    builtinCatalog:true,
    catalogPatch:true,
    familyCatalog:true,
    family:'produce-unit-overrides',
    builtinVersion:VERSION
  };

  for (const alias of ['banán','banan']) {
    const key = normalize(alias);
    const previous = learned[key];
    if (!previous || previous.builtinCatalog) learned[key] = {...bananaRule};
  }

  try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}
})();