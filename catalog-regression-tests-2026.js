(() => {
  'use strict';

  // Zoé Lista – DEV katalógus regressziós biztonsági háló.
  // Nem módosít felhasználói adatot. A saját tanítás szándékosan elsőbbséget élvez,
  // ezért az ilyen kulcsokat a teszt kihagyja ahelyett, hogy hibának jelölné.
  const LEARNED_KEY = 'zoe-lista-learned-v1';

  const normalize = value => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const loadLearned = () => {
    try { return JSON.parse(localStorage.getItem(LEARNED_KEY)) || {}; }
    catch { return {}; }
  };

  const TESTS = [
    {input:'aromagyertya',label:'Aromagyertya',category:'Háztartás',price:1499,unit:'db'},
    {input:'illatgyertya',label:'Aromagyertya',category:'Háztartás',price:1499,unit:'db'},
    {input:'teamécses',label:'Teamécses',category:'Háztartás',price:799,unit:'csomag'},
    {input:'füstölő',label:'Füstölő',category:'Háztartás',price:899,unit:'csomag'},
    {input:'füstölőkúp',label:'Füstölőkúp',category:'Háztartás',price:999,unit:'csomag'},
    {input:'palo santo',label:'Palo Santo',category:'Háztartás',price:1799,unit:'csomag'},
    {input:'illóolaj',label:'Illóolaj',category:'Háztartás',price:1499,unit:'üveg'},
    {input:'levendula illóolaj',label:'Levendula illóolaj',category:'Háztartás',price:1599,unit:'üveg'},
    {input:'zöldborsó',label:'Zöldborsó',category:'Zöldség-gyümölcs',price:999,unit:'csomag'},
    {input:'fagyasztott zöldborsó',label:'Fagyasztott zöldborsó',category:'Fagyasztott',price:999,unit:'csomag'},
    {input:'konzerv zöldborsó',label:'Konzerv zöldborsó',category:'Alapélelmiszer',price:699,unit:'db'},
    {input:'zöldborsó bébirépa mix',label:'Zöldborsó-bébirépa mix',category:'Fagyasztott',price:1099,unit:'csomag'},
    {input:'aloe vera ital',label:'Aloe vera ital',category:'Italok',price:699,unit:'db'},
    {input:'bébi spenót',label:'Bébi spenót',category:'Zöldség-gyümölcs',price:899,unit:'csomag'},
    {input:'libatepertő',label:'Libatepertő',category:'Hús és felvágott',price:1999,unit:'csomag'},
    {input:'libazsír',label:'Libazsír',category:'Alapélelmiszer',price:2299,unit:'db'},
    {input:'smirnoff',label:'Smirnoff',category:'Szeszes italok',price:5999,unit:'üveg'},
    {input:'vodka',label:'Vodka',category:'Szeszes italok',price:5499,unit:'üveg'},
    {input:'mák',label:'Mák',category:'Alapélelmiszer',price:495,unit:'csomag'},
    {input:'darált mák',label:'Darált mák',category:'Alapélelmiszer',price:495,unit:'csomag'}
  ];

  const same = (actual, expected) => String(actual ?? '') === String(expected ?? '');

  function run({log=true} = {}) {
    const learned = loadLearned();
    const passed = [];
    const failed = [];
    const skipped = [];

    for (const test of TESTS) {
      const key = normalize(test.input);
      const rule = learned[key];

      if (rule && !rule.builtinCatalog) {
        skipped.push({input:test.input,reason:'saját felhasználói tanítás'});
        continue;
      }

      if (!rule) {
        failed.push({input:test.input,problem:'hiányzó beépített exact/alias szabály',expected:test,actual:null});
        continue;
      }

      const problems = [];
      for (const field of ['label','category','price','unit']) {
        if (!same(rule[field],test[field])) problems.push(`${field}: ${rule[field]} ≠ ${test[field]}`);
      }

      if (problems.length) failed.push({input:test.input,problem:problems.join(' · '),expected:test,actual:rule});
      else passed.push({input:test.input,label:rule.label,category:rule.category,price:rule.price,unit:rule.unit});
    }

    const result = {
      ok:failed.length === 0,
      total:TESTS.length,
      passed:passed.length,
      failed:failed.length,
      skipped:skipped.length,
      passedTests:passed,
      failures:failed,
      skippedTests:skipped,
      checkedAt:new Date().toISOString()
    };

    window.ZoeCatalogRegression2026.lastResult = result;

    if (log) {
      const tag = '[Zoé Catalog Safety]';
      if (result.ok) console.info(`${tag} OK – ${result.passed}/${result.total} teszt sikeres, ${result.skipped} kihagyva.`);
      else {
        console.warn(`${tag} HIBA – ${result.failed} regressziós teszt elbukott.`);
        console.table(result.failures.map(f => ({input:f.input,problem:f.problem})));
      }
      if (result.skipped) console.info(`${tag} ${result.skipped} teszt saját felhasználói tanítás miatt kihagyva.`);
    }

    return result;
  }

  window.ZoeCatalogRegression2026 = {
    version:20260826,
    tests:TESTS.map(test => ({...test})),
    run,
    lastResult:null
  };

  // DEV-ben betöltéskor azonnal, kizárólag olvasással ellenőrizzük a katalógust.
  run();
})();
