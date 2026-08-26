(() => {
  'use strict';

  // Zoé Lista – DEV aliasütközés-audit.
  // A katalógusfájlok előtt töltődik be, és kizárólag megfigyeli, amikor
  // ugyanazt a normalizált learned-kulcsot eltérő BEÉPÍTETT szabályok írják.
  // Saját felhasználói tanítást nem tekint ütközésnek és semmit nem módosít.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const storageProto = window.Storage?.prototype;
  const nativeSetItem = storageProto?.setItem;
  if (!storageProto || typeof nativeSetItem !== 'function') return;

  const claims = new Map();
  const collisions = [];
  let active = true;

  function parse(raw) {
    try {
      const value = JSON.parse(raw);
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch {
      return {};
    }
  }

  function sourceName() {
    const src = document.currentScript?.src || '';
    if (!src) return '(ismeretlen script)';
    try {
      const url = new URL(src, location.href);
      return url.pathname.split('/').pop() || src;
    } catch {
      return src;
    }
  }

  function identity(rule) {
    if (!rule || !rule.builtinCatalog) return '';
    return [
      String(rule.family || ''),
      String(rule.label || ''),
      String(rule.category || ''),
      String(rule.unit || '')
    ].join('|');
  }

  function snapshot(rule) {
    return {
      family:rule?.family || '',
      label:rule?.label || '',
      category:rule?.category || '',
      unit:rule?.unit || '',
      price:Number.isFinite(Number(rule?.price)) ? Number(rule.price) : null,
      builtinVersion:rule?.builtinVersion ?? null
    };
  }

  function sameRule(a, b) {
    try { return JSON.stringify(a) === JSON.stringify(b); }
    catch { return false; }
  }

  function recordChangedClaims(previous, next, source) {
    for (const [alias, nextRule] of Object.entries(next)) {
      if (!nextRule?.builtinCatalog) continue;
      const previousRule = previous[alias];
      if (sameRule(previousRule, nextRule)) continue;

      const nextIdentity = identity(nextRule);
      if (!nextIdentity) continue;

      const priorClaim = claims.get(alias);
      if (priorClaim && priorClaim.identity !== nextIdentity) {
        const duplicate = collisions.some(item =>
          item.alias === alias &&
          item.previous.identity === priorClaim.identity &&
          item.next.identity === nextIdentity &&
          item.next.source === source
        );

        if (!duplicate) {
          collisions.push({
            alias,
            previous:{...priorClaim},
            next:{identity:nextIdentity,source,rule:snapshot(nextRule)}
          });
        }
      }

      claims.set(alias,{identity:nextIdentity,source,rule:snapshot(nextRule)});
    }
  }

  storageProto.setItem = function(key, value) {
    if (active && this === localStorage && String(key) === LEARNED_KEY) {
      const previous = parse(localStorage.getItem(LEARNED_KEY));
      const next = parse(String(value));
      recordChangedClaims(previous, next, sourceName());
    }
    return nativeSetItem.call(this, key, value);
  };

  function report({log=true} = {}) {
    const result = {
      ok:collisions.length === 0,
      collisionCount:collisions.length,
      collisions:collisions.map(item => ({
        alias:item.alias,
        previous:{...item.previous,rule:{...item.previous.rule}},
        next:{...item.next,rule:{...item.next.rule}}
      })),
      checkedAt:new Date().toISOString()
    };

    window.ZoeCatalogCollisionAudit2026.lastResult = result;

    if (log) {
      const tag = '[Zoé Alias Audit]';
      if (result.ok) {
        console.info(`${tag} OK – nem találtam eltérő builtin szabályok közti aliasütközést.`);
      } else {
        console.warn(`${tag} ${result.collisionCount} aliasütközést találtam.`);
        console.table(result.collisions.map(item => ({
          alias:item.alias,
          előző:item.previous.rule.label || '(nincs címke)',
          előző_fájl:item.previous.source,
          új:item.next.rule.label || '(nincs címke)',
          új_fájl:item.next.source,
          előző_család:item.previous.rule.family || '',
          új_család:item.next.rule.family || ''
        })));
      }
    }

    return result;
  }

  function finalize() {
    if (!active) return report({log:false});
    active = false;
    if (storageProto.setItem === wrappedSetItem) storageProto.setItem = nativeSetItem;
    return report({log:true});
  }

  const wrappedSetItem = storageProto.setItem;

  window.ZoeCatalogCollisionAudit2026 = {
    version:20260826,
    report,
    finalize,
    lastResult:null,
    get collisions() { return collisions.map(item => ({...item})); }
  };

  // Minden defer script lefut a DOMContentLoaded előtt, ezért itt már teljes
  // képet kapunk a katalógus-felépítés közbeni builtin felülírásokról.
  document.addEventListener('DOMContentLoaded', finalize, {once:true});
})();
