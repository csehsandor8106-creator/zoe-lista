(() => {
  'use strict';

  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';

  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function builtinVersion(rule) {
    const value = Number(rule?.builtinVersion);
    return Number.isFinite(value) ? value : 0;
  }

  let learned = load(LEARNED_KEY, {});
  let changed = false;

  // 1) A katalógus kanonikus megjelenített neveit is tanuljuk meg pontos kulcsként.
  // Fontos: ugyanarra a kanonikus névre több régi family fájl is adhat szabályt.
  // Ilyenkor a legújabb builtinVersion nyer. Azonos verziónál az a szabály kap
  // elsőbbséget, amelyik eleve a kanonikus exact kulcson található. Így egy régi
  // alias nem tud később visszaírni egy frissebb családszabályt.
  const canonicalWinners = new Map();

  for (const [alias, rule] of Object.entries(learned)) {
    if (!rule?.builtinCatalog || typeof rule.label !== 'string' || !rule.label.trim()) continue;

    const canonicalKey = normalize(rule.label);
    if (!canonicalKey) continue;

    const candidate = {
      alias,
      rule,
      version:builtinVersion(rule),
      exactCanonical:alias === canonicalKey
    };
    const current = canonicalWinners.get(canonicalKey);

    if (!current ||
        candidate.version > current.version ||
        (candidate.version === current.version && candidate.exactCanonical && !current.exactCanonical)) {
      canonicalWinners.set(canonicalKey, candidate);
    }
  }

  for (const [canonicalKey, winner] of canonicalWinners) {
    const existing = learned[canonicalKey];
    // A felhasználó saját tanítását soha nem írjuk felül.
    if (existing && !existing.builtinCatalog) continue;

    const stableRule = {
      ...winner.rule,
      kind:winner.rule.kind || 'learned',
      canonicalCatalogKey:true
    };

    if (!existing || JSON.stringify(existing) !== JSON.stringify(stableRule)) {
      learned[canonicalKey] = stableRule;
      changed = true;
    }
  }

  // 2) A már listában lévő, kiegészített neveket is stabilizáljuk.
  // Példa: „Jégkrém (tescós)” tartalmazza a teljes „jégkrém” szót, ezért
  // ugyanahhoz a katalógusszabályhoz kötjük. Csak szóhatáros és legalább
  // 5 karakteres alias lehet találat, így a régi „lé” / „Fa” jellegű hibák
  // nem térhetnek vissza.
  function findLongestBuiltinRule(key) {
    const padded = ` ${key} `;
    let best = null;
    let bestAlias = '';

    for (const [alias, rule] of Object.entries(learned)) {
      if (!rule?.builtinCatalog || !rule.unit || alias.length < 5) continue;
      if (alias === key) continue;
      if (padded.includes(` ${alias} `) && alias.length > bestAlias.length) {
        best = rule;
        bestAlias = alias;
      }
    }

    return best ? {rule:best, alias:bestAlias} : null;
  }

  const items = load(STATE_KEY, []);
  for (const item of items) {
    if (!item || !['estimate','estimate-unit','unknown'].includes(item.source)) continue;

    const key = normalize(item.name);
    if (!key) continue;

    const existing = learned[key];
    if (existing && !existing.builtinCatalog) continue;
    if (existing?.builtinCatalog) continue;

    const match = findLongestBuiltinRule(key);
    if (!match) continue;

    learned[key] = {
      ...match.rule,
      kind:match.rule.kind || 'learned',
      derivedCatalogAlias:true,
      derivedFromAlias:match.alias
    };
    changed = true;
  }

  if (changed) {
    try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}
  }
})();
