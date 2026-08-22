(() => {
  'use strict';

  const LEARNED_KEY = 'zoe-lista-learned-v1';

  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  let learned = {};
  try {
    learned = JSON.parse(localStorage.getItem(LEARNED_KEY)) || {};
  } catch {
    learned = {};
  }

  let changed = false;
  const builtinRules = Object.values(learned).filter(rule =>
    rule && rule.builtinCatalog && typeof rule.label === 'string' && rule.label.trim()
  );

  for (const rule of builtinRules) {
    const canonicalKey = normalize(rule.label);
    if (!canonicalKey) continue;

    const existing = learned[canonicalKey];
    // A felhasználó saját tanítását soha nem írjuk felül.
    if (existing && !existing.builtinCatalog) continue;

    const stableRule = {
      ...rule,
      kind: rule.kind || 'learned',
      canonicalCatalogKey: true
    };

    if (!existing || JSON.stringify(existing) !== JSON.stringify(stableRule)) {
      learned[canonicalKey] = stableRule;
      changed = true;
    }
  }

  if (changed) {
    try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}
  }
})();
