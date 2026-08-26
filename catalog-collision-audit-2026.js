(() => {
  'use strict';

  // Zoé Lista – DEV aliasütközés-audit.
  // A katalógusfájlok előtt töltődik be, és kizárólag megfigyeli, amikor
  // ugyanazt a normalized learned-kulcsot eltérő BEÉPÍTETT szabályok írják.
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
    } catch { return {}; }
  }

  function sourceName() {
    const src = document.currentScript?.src || '';
    if (!src) return '(ismeretlen script)';
    try {
      const url = new URL(src, location.href);
      return url.pathname.split('/').pop() || src;
    } catch { return src; }
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

  function sameRule(a,b) {
    try { return JSON.stringify(a) === JSON.stringify(b); }
    catch { return false; }
  }

  function normalizedText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function labelsRelated(a,b) {
    const left = normalizedText(a), right = normalizedText(b);
    if (!left || !right) return false;
    if (left === right || left.includes(right) || right.includes(left)) return true;
    const lt = new Set(left.split(' ').filter(t=>t.length >= 4));
    const rt = new Set(right.split(' ').filter(t=>t.length >= 4));
    for (const token of lt) if (rt.has(token)) return true;
    return false;
  }

  function unitGroup(unit) {
    const u = normalizedText(unit);
    if (['kg','g'].includes(u)) return 'mass';
    if (['l','ml'].includes(u)) return 'volume';
    if (['db','csomag','doboz','uveg','flakon','par'].includes(u)) return 'package';
    return u || 'unknown';
  }

  function classify(previousRule,nextRule) {
    const reasons = [];
    let severity = 'low';
    let kind = 'refinement';

    const previousLabel = normalizedText(previousRule.label);
    const nextLabel = normalizedText(nextRule.label);
    const sameLabel = previousLabel === nextLabel;
    const relatedLabel = labelsRelated(previousRule.label,nextRule.label);
    const categoryChanged = previousRule.category !== nextRule.category;
    const unitChanged = previousRule.unit !== nextRule.unit;
    const familyChanged = previousRule.family !== nextRule.family;
    const labelChanged = !sameLabel;
    const categoryFromGeneric = categoryChanged && (previousRule.category === 'Egyéb' || nextRule.category === 'Egyéb');

    if (categoryChanged) reasons.push(`kategória: ${previousRule.category || '—'} → ${nextRule.category || '—'}`);
    if (unitChanged) reasons.push(`egység: ${previousRule.unit || '—'} → ${nextRule.unit || '—'}`);
    if (familyChanged) reasons.push(`család: ${previousRule.family || '—'} → ${nextRule.family || '—'}`);
    if (labelChanged) reasons.push(`termék: ${previousRule.label || '—'} → ${nextRule.label || '—'}`);

    // Valódi szemantikai ütközés: ugyanaz az alias más jelentést és más kategóriát kap.
    if (labelChanged && categoryChanged && !categoryFromGeneric && !relatedLabel) {
      severity = 'critical';
      kind = 'semantic-conflict';
    } else if (labelChanged && categoryChanged && !categoryFromGeneric) {
      severity = 'high';
      kind = 'semantic-category-review';
    } else if (sameLabel && categoryChanged && !categoryFromGeneric) {
      severity = 'high';
      kind = 'category-review';
    } else if (labelChanged && !relatedLabel) {
      severity = 'high';
      kind = 'semantic-review';
    } else if (categoryChanged || labelChanged) {
      severity = 'medium';
      kind = categoryFromGeneric ? 'category-refinement' : 'label-refinement';
    }

    // Az egységpontosítás fontos adatminőségi jel, de önmagában nem alias-szemantikai hiba.
    if (unitChanged && severity === 'low') {
      const oldGroup = unitGroup(previousRule.unit);
      const newGroup = unitGroup(nextRule.unit);
      if (oldGroup === 'package' && newGroup === 'package') {
        severity = 'low';
        kind = 'packaging-refinement';
      } else {
        severity = 'medium';
        kind = 'unit-review';
      }
    }

    // Üres családból konkrét családba lépés tipikusan szándékos katalógusbővítés.
    if (familyChanged && severity === 'low') {
      severity = previousRule.family && nextRule.family ? 'medium' : 'low';
      kind = previousRule.family && nextRule.family ? 'family-review' : 'family-refinement';
    }

    const oldPrice = Number(previousRule.price);
    const newPrice = Number(nextRule.price);
    if (Number.isFinite(oldPrice) && Number.isFinite(newPrice) && oldPrice > 0 && newPrice > 0 && oldPrice !== newPrice) {
      const ratio = Math.abs(newPrice-oldPrice) / Math.max(oldPrice,newPrice);
      const diff = Math.abs(newPrice-oldPrice);
      if (ratio >= .35 || diff >= 1000) {
        reasons.push(`jelentős árkülönbség: ${oldPrice} → ${newPrice} Ft`);
        if (severity === 'low') {
          severity = 'medium';
          kind = 'price-review';
        }
      } else {
        reasons.push(`árkülönbség: ${oldPrice} → ${newPrice} Ft`);
      }
    }

    if (!reasons.length) reasons.push('eltérő builtin szabályazonosság');

    return {
      severity,
      severityHu:SEVERITY_HU[severity],
      score:SEVERITY_ORDER[severity],
      kind,
      reasons,
      requiresAction:severity === 'critical' || severity === 'high'
    };
  }

  function enrichCollision(item) {
    const classification = classify(item.previous.rule,item.next.rule);
    return {
      alias:item.alias,
      severity:classification.severity,
      severityHu:classification.severityHu,
      score:classification.score,
      kind:classification.kind,
      requiresAction:classification.requiresAction,
      reasons:[...classification.reasons],
      previous:{...item.previous,rule:{...item.previous.rule}},
      next:{...item.next,rule:{...item.next.rule}}
    };
  }

  function recordChangedClaims(previous,next,source) {
    for (const [alias,nextRule] of Object.entries(next)) {
      if (!nextRule?.builtinCatalog) continue;
      const previousRule = previous[alias];
      if (sameRule(previousRule,nextRule)) continue;

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

  storageProto.setItem = function(key,value) {
    if (active && this === localStorage && String(key) === LEARNED_KEY) {
      const previous = parse(localStorage.getItem(LEARNED_KEY));
      const next = parse(String(value));
      recordChangedClaims(previous,next,sourceName());
    }
    return nativeSetItem.call(this,key,value);
  };

  function textReport(result = window.ZoeCatalogCollisionAudit2026?.lastResult || report({log:false}), {all=false} = {}) {
    const list = all ? result.collisions : result.collisions.filter(item=>item.requiresAction);
    const lines = [
      `Zoé Alias Audit – ${result.collisionCount} eltérés`,
      `kritikus: ${result.summary.critical}, magas: ${result.summary.high}, közepes: ${result.summary.medium}, alacsony: ${result.summary.low}`,
      `valóban javítandó/átvizsgálandó: ${result.requiresActionCount}`,
      all ? 'lista: minden eltérés' : 'lista: csak kritikus + magas'
    ];

    for (const item of list) {
      lines.push(
        '',
        `[${item.severityHu.toUpperCase()}] ${item.alias} · ${item.kind}`,
        `${item.previous.rule.label || '—'} (${item.previous.source}) → ${item.next.rule.label || '—'} (${item.next.source})`,
        item.reasons.join(' · ')
      );
    }
    if (!list.length) lines.push('','Nincs kritikus vagy magas szemantikai ütközés.');
    return lines.join('\n');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  function renderDebugPanel(result) {
    const params = new URLSearchParams(location.search);
    if (params.get('debug') !== '1') return;

    document.getElementById('zoeAliasAuditPanel')?.remove();
    const panel = document.createElement('section');
    panel.id = 'zoeAliasAuditPanel';
    panel.setAttribute('aria-label','Zoé alias audit');
    panel.style.cssText = [
      'position:relative','z-index:9999','margin:10px','padding:10px','border:1px solid #64748b',
      'border-radius:12px','background:#111827','color:#f8fafc','font:12px/1.4 system-ui,sans-serif',
      'box-shadow:0 8px 24px rgba(0,0,0,.28)','overflow-wrap:anywhere'
    ].join(';');

    const actionable = result.collisions.filter(item=>item.requiresAction);
    const rows = actionable.map(item=>`
      <details style="margin-top:7px;padding:7px;border:1px solid #334155;border-radius:8px;background:#0f172a">
        <summary style="cursor:pointer;font-weight:800">${escapeHtml(item.severityHu.toUpperCase())} · ${escapeHtml(item.alias)}</summary>
        <div style="margin-top:4px;color:#93c5fd">${escapeHtml(item.kind)}</div>
        <div style="margin-top:6px"><b>${escapeHtml(item.previous.rule.label || '—')}</b> <small>(${escapeHtml(item.previous.source)})</small></div>
        <div>↓</div>
        <div><b>${escapeHtml(item.next.rule.label || '—')}</b> <small>(${escapeHtml(item.next.source)})</small></div>
        <div style="margin-top:5px;color:#cbd5e1">${escapeHtml(item.reasons.join(' · '))}</div>
      </details>`).join('');

    panel.innerHTML = `
      <div style="display:flex;gap:8px;align-items:flex-start;justify-content:space-between">
        <div><b style="font-size:14px">🔎 Zoé Alias Audit</b><div style="color:#cbd5e1;margin-top:2px">${result.collisionCount} eltérés · ${result.requiresActionCount} valóban fontos</div></div>
        <button type="button" data-audit-close style="border:0;border-radius:8px;padding:5px 8px;background:#334155;color:#fff">✕</button>
      </div>
      <div style="margin-top:7px">🔴 ${result.summary.critical} kritikus · 🟠 ${result.summary.high} magas · 🟡 ${result.summary.medium} közepes · ⚪ ${result.summary.low} alacsony</div>
      ${actionable.length ? rows : '<div style="margin-top:8px;color:#86efac"><b>Nincs kritikus vagy magas szemantikai ütközés.</b></div>'}
      <div style="margin-top:8px;color:#94a3b8">A közepes/alacsony eltérések többnyire egység-, ár- vagy családpontosítások; külön adatminőségi körben nézzük át őket.</div>
      <button type="button" data-audit-copy style="margin-top:9px;border:0;border-radius:8px;padding:7px 9px;background:#0f766e;color:#fff;font-weight:800">Fontos jelentés másolása</button>
      <span data-audit-status style="margin-left:7px;color:#94a3b8"></span>`;

    panel.querySelector('[data-audit-close]')?.addEventListener('click',()=>panel.remove());
    panel.querySelector('[data-audit-copy]')?.addEventListener('click',async()=>{
      const status = panel.querySelector('[data-audit-status]');
      try {
        await navigator.clipboard.writeText(textReport(result));
        if (status) status.textContent = 'Másolva ✓';
      } catch {
        if (status) status.textContent = 'Másolás nem sikerült';
      }
    });

    const shell = document.querySelector('.app-shell');
    if (shell?.parentNode) shell.parentNode.insertBefore(panel,shell);
    else document.body.prepend(panel);
  }

  function report({log=true} = {}) {
    const enriched = collisions
      .map(enrichCollision)
      .sort((a,b)=>b.score-a.score || a.alias.localeCompare(b.alias,'hu',{sensitivity:'base'}));

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
        console.info(`${tag} OK – nem találtam builtin eltérést.`);
      } else {
        const headline = `${tag} ${result.collisionCount} eltérés · ${summary.critical} kritikus · ${summary.high} magas · ${summary.medium} közepes · ${summary.low} alacsony.`;
        if (result.requiresActionCount) console.warn(`${headline} ${result.requiresActionCount} valóban fontos.`);
        else console.info(`${headline} Nincs kritikus/magas szemantikai konfliktus.`);

        console.table(result.collisions.filter(item=>item.requiresAction).map(item=>({
          súlyosság:item.severityHu,
          típus:item.kind,
          alias:item.alias,
          előző:item.previous.rule.label || '(nincs címke)',
          előző_fájl:item.previous.source,
          új:item.next.rule.label || '(nincs címke)',
          új_fájl:item.next.source,
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
    const result = report({log:true});
    renderDebugPanel(result);
    return result;
  }

  const wrappedSetItem = storageProto.setItem;

  window.ZoeCatalogCollisionAudit2026 = {
    version:2026082604,
    report,
    finalize,
    textReport,
    renderDebugPanel,
    lastResult:null,
    get collisions(){ return collisions.map(item=>({...item})); }
  };

  document.addEventListener('DOMContentLoaded',finalize,{once:true});
})();
