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

  const SEVERITY_ORDER = {critical:4,high:3,medium:2,low:1};
  const SEVERITY_HU = {critical:'kritikus',high:'magas',medium:'közepes',low:'alacsony'};

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

  function normalizedText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,' ')
      .trim();
  }

  function classify(previousRule, nextRule) {
    const reasons = [];
    let severity = 'low';

    const categoryChanged = previousRule.category !== nextRule.category;
    const unitChanged = previousRule.unit !== nextRule.unit;
    const familyChanged = previousRule.family !== nextRule.family;
    const labelChanged = previousRule.label !== nextRule.label;
    const sameNormalizedLabel = normalizedText(previousRule.label) === normalizedText(nextRule.label);

    if (categoryChanged) reasons.push(`kategória: ${previousRule.category || '—'} → ${nextRule.category || '—'}`);
    if (unitChanged) reasons.push(`egység: ${previousRule.unit || '—'} → ${nextRule.unit || '—'}`);
    if (familyChanged) reasons.push(`család: ${previousRule.family || '—'} → ${nextRule.family || '—'}`);
    if (labelChanged) reasons.push(`termék: ${previousRule.label || '—'} → ${nextRule.label || '—'}`);

    if (categoryChanged || unitChanged) {
      severity = 'critical';
    } else if (familyChanged && labelChanged && !sameNormalizedLabel) {
      severity = 'high';
    } else if (familyChanged || labelChanged) {
      severity = 'medium';
    }

    const oldPrice = Number(previousRule.price);
    const newPrice = Number(nextRule.price);
    if (Number.isFinite(oldPrice) && Number.isFinite(newPrice) && oldPrice > 0 && newPrice > 0 && oldPrice !== newPrice) {
      const ratio = Math.abs(newPrice-oldPrice) / Math.max(oldPrice,newPrice);
      const diff = Math.abs(newPrice-oldPrice);
      if (ratio >= .35 || diff >= 1000) {
        reasons.push(`jelentős árkülönbség: ${oldPrice} → ${newPrice} Ft`);
        if (severity === 'low') severity = 'medium';
      } else {
        reasons.push(`árkülönbség: ${oldPrice} → ${newPrice} Ft`);
      }
    }

    if (!reasons.length) reasons.push('eltérő builtin szabályazonosság');

    return {
      severity,
      severityHu:SEVERITY_HU[severity],
      score:SEVERITY_ORDER[severity],
      reasons,
      requiresAction:severity === 'critical' || severity === 'high'
    };
  }

  function enrichCollision(item) {
    const classification = classify(item.previous.rule, item.next.rule);
    return {
      alias:item.alias,
      severity:classification.severity,
      severityHu:classification.severityHu,
      score:classification.score,
      requiresAction:classification.requiresAction,
      reasons:[...classification.reasons],
      previous:{...item.previous,rule:{...item.previous.rule}},
      next:{...item.next,rule:{...item.next.rule}}
    };
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

  function textReport(result = window.ZoeCatalogCollisionAudit2026?.lastResult || report({log:false})) {
    const lines = [
      `Zoé Alias Audit – ${result.collisionCount} ütközés`,
      `kritikus: ${result.summary.critical}, magas: ${result.summary.high}, közepes: ${result.summary.medium}, alacsony: ${result.summary.low}`,
      `javítandó: ${result.requiresActionCount}`
    ];

    for (const item of result.collisions) {
      lines.push(
        '',
        `[${item.severityHu.toUpperCase()}] ${item.alias}`,
        `${item.previous.rule.label || '—'} (${item.previous.source}) → ${item.next.rule.label || '—'} (${item.next.source})`,
        item.reasons.join(' · ')
      );
    }
    return lines.join('\n');
  }

  function report({log=true} = {}) {
    const enriched = collisions
      .map(enrichCollision)
      .sort((a,b) => b.score-a.score || a.alias.localeCompare(b.alias,'hu',{sensitivity:'base'}));

    const summary = {critical:0,high:0,medium:0,low:0};
    for (const item of enriched) summary[item.severity] += 1;

    const result = {
      ok:enriched.length === 0,
      safe:summary.critical === 0 && summary.high === 0,
      collisionCount:enriched.length,
      requiresActionCount:enriched.filter(item=>item.requiresAction).length,
      summary,
      collisions:enriched,
      checkedAt:new Date().toISOString()
    };

    window.ZoeCatalogCollisionAudit2026.lastResult = result;

    if (log) {
      const tag = '[Zoé Alias Audit]';
      if (result.ok) {
        console.info(`${tag} OK – nem találtam eltérő builtin szabályok közti aliasütközést.`);
      } else {
        const headline = `${tag} ${result.collisionCount} ütközés · ${summary.critical} kritikus · ${summary.high} magas · ${summary.medium} közepes · ${summary.low} alacsony.`;
        if (result.requiresActionCount) console.warn(`${headline} ${result.requiresActionCount} javítást igényel.`);
        else console.info(headline);

        console.table(result.collisions.map(item => ({
          súlyosság:item.severityHu,
          alias:item.alias,
          előző:item.previous.rule.label || '(nincs címke)',
          előző_fájl:item.previous.source,
          új:item.next.rule.label || '(nincs címke)',
          új_fájl:item.next.source,
          ok:item.requiresAction ? 'JAVÍTANDÓ' : 'ellenőrizendő',
          okok:item.reasons.join(' · ')
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
    version:2026082602,
    report,
    finalize,
    textReport,
    lastResult:null,
    get collisions() { return collisions.map(item => ({...item})); }
  };

  // Minden defer script lefut a DOMContentLoaded előtt, ezért itt már teljes
  // képet kapunk a katalógus-felépítés közbeni builtin felülírásokról.
  document.addEventListener('DOMContentLoaded', finalize, {once:true});
})();
