(() => {
  'use strict';

  // Zoé Lista – DEV katalógus regressziós biztonsági háló.
  // Nem módosít felhasználói adatot. A saját tanítás és saját ármemória
  // szándékosan elsőbbséget élvez, ezért az ilyen kulcsokat a teszt kihagyja.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const PRICE_MEMORY_KEY = 'zoe-lista-price-memory-v1';

  const normalize = value => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const load = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };

  const loadLearned = () => load(LEARNED_KEY, {});

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

  // Ezek a próbák már a valódi app.js submit-kezelőjén keresztül futnak,
  // tehát a tényleges parseInput -> recognize -> fallback láncot vizsgálják.
  // Kifejezett saját áras inputot itt még szándékosan nem használunk, mert az
  // parseInput az ármemória objektumát memóriában is tanítaná.
  const ENGINE_TESTS = [
    {input:'ceruzaelem',key:'ceruzaelem',expect:{name:'ceruzaelem',category:'Háztartás',unit:'csomag',price:1499,qty:1}},
    {input:'faszén',key:'faszén',expect:{name:'faszén',category:'Háztartás',unit:'csomag',price:2499,qty:1}},
    {input:'marhahús',key:'marhahús',expect:{name:'marhahús',category:'Hús és felvágott',unit:'kg',qty:1}},
    {input:'marhahus',key:'marhahus',expect:{name:'marhahus',category:'Hús és felvágott',unit:'kg',qty:1}},
    {input:'2 tej',key:'tej',expect:{name:'tej',category:'Tejtermék és tojás',qty:2}},
    {input:'1 kg marhahús',key:'marhahús',expect:{name:'marhahús',category:'Hús és felvágott',unit:'kg',qty:1}},
    {input:'zöldborsó',key:'zöldborsó',expect:{name:'zöldborsó',category:'Zöldség-gyümölcs',unit:'csomag',price:999,qty:1}},
    {input:'smirnoff',key:'smirnoff',expect:{name:'smirnoff',category:'Szeszes italok',unit:'üveg',price:5999,qty:1}}
  ];

  const same = (actual, expected) => String(actual ?? '') === String(expected ?? '');
  let appSubmitHandler = null;

  // A Safety Net az app.js előtt töltődik be. Rövid időre figyeljük az
  // addEventListener hívásokat, és kizárólag azt a submit-kezelőt fogjuk meg,
  // amelynek forrásában a valódi parseInput(input.value) hívás szerepel.
  const nativeAddEventListener = EventTarget.prototype.addEventListener;
  let hookActive = true;

  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (hookActive && type === 'submit' && this === document.getElementById('addForm') && typeof listener === 'function') {
      let source = '';
      try { source = Function.prototype.toString.call(listener); } catch {}
      if (source.includes('parseInput(input.value)') && source.includes('items.find')) {
        appSubmitHandler = listener;
        hookActive = false;
        EventTarget.prototype.addEventListener = nativeAddEventListener;
        if (window.ZoeCatalogRegression2026) window.ZoeCatalogRegression2026.engineReady = true;
        window.setTimeout(() => runEngine({log:true}), 0);
      }
    }
    return nativeAddEventListener.call(this, type, listener, options);
  };

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
      if (result.ok) console.info(`${tag} OK – ${result.passed}/${result.total} katalógusteszt sikeres, ${result.skipped} kihagyva.`);
      else {
        console.warn(`${tag} HIBA – ${result.failed} katalógusteszt elbukott.`);
        console.table(result.failures.map(f => ({input:f.input,problem:f.problem})));
      }
      if (result.skipped) console.info(`${tag} ${result.skipped} teszt saját felhasználói tanítás miatt kihagyva.`);
    }

    return result;
  }

  function userOverrideReason(test) {
    const key = normalize(test.key);
    const learned = loadLearned();
    const memory = load(PRICE_MEMORY_KEY, {});
    const state = load(STATE_KEY, []);
    const rule = learned[key];

    if (rule && !rule.builtinCatalog) return 'saját felhasználói tanítás';
    if (memory[key]) return 'saját ármemória';
    if (Array.isArray(state) && state.some(item => item && !item.done && normalize(item.name) === key)) return 'azonos nyitott tétel már a listán van';
    return '';
  }

  function invokeRealParser(raw) {
    if (typeof appSubmitHandler !== 'function') return {error:'Az app.js submit-kezelője még nem érhető el.'};

    const input = document.getElementById('itemInput');
    if (!input) return {error:'Az itemInput mező nem található.'};

    const oldValue = input.value;
    const nativeUnshift = Array.prototype.unshift;
    const storageProto = window.Storage?.prototype;
    const nativeSetItem = storageProto?.setItem;
    let captured = null;

    try {
      // A parseInput eredményét az items.unshift(parsed) ponton fogjuk meg,
      // de magát a listát nem módosítjuk.
      Array.prototype.unshift = function(...args) {
        const candidate = args[0];
        if (!captured && args.length === 1 && candidate && typeof candidate === 'object' &&
            'category' in candidate && 'qty' in candidate && 'unit' in candidate && 'createdAt' in candidate) {
          captured = {...candidate};
          return this.length + 1;
        }
        return nativeUnshift.apply(this, args);
      };

      // A submit-kezelő save() hívását teljesen ártalmatlanná tesszük a próba idejére.
      if (storageProto && nativeSetItem) storageProto.setItem = function() {};

      input.value = raw;
      appSubmitHandler({preventDefault(){}});
      return captured ? {value:captured} : {error:'A parser nem adott új tételt.'};
    } catch (error) {
      return {error:String(error?.message || error)};
    } finally {
      Array.prototype.unshift = nativeUnshift;
      if (storageProto && nativeSetItem) storageProto.setItem = nativeSetItem;
      input.value = oldValue;
    }
  }

  function runEngine({log=true} = {}) {
    const passed = [];
    const failed = [];
    const skipped = [];

    if (typeof appSubmitHandler !== 'function') {
      const result = {
        ok:false,ready:false,total:ENGINE_TESTS.length,passed:0,failed:0,skipped:ENGINE_TESTS.length,
        passedTests:[],failures:[],skippedTests:ENGINE_TESTS.map(test=>({input:test.input,reason:'app.js motor még nem érhető el'})),
        checkedAt:new Date().toISOString()
      };
      window.ZoeCatalogRegression2026.lastEngineResult = result;
      if (log) console.warn('[Zoé Engine Safety] Az app.js motor még nem érhető el.');
      return result;
    }

    for (const test of ENGINE_TESTS) {
      const overrideReason = userOverrideReason(test);
      if (overrideReason) {
        skipped.push({input:test.input,reason:overrideReason});
        continue;
      }

      const invocation = invokeRealParser(test.input);
      if (invocation.error) {
        failed.push({input:test.input,problem:invocation.error,expected:test.expect,actual:null});
        continue;
      }

      const actual = invocation.value;
      const problems = [];
      for (const [field, expected] of Object.entries(test.expect)) {
        if (field === 'qty') {
          if (Math.abs(Number(actual[field]) - Number(expected)) > 0.0001) problems.push(`${field}: ${actual[field]} ≠ ${expected}`);
        } else if (field === 'name') {
          if (normalize(actual[field]) !== normalize(expected)) problems.push(`${field}: ${actual[field]} ≠ ${expected}`);
        } else if (!same(actual[field], expected)) {
          problems.push(`${field}: ${actual[field]} ≠ ${expected}`);
        }
      }

      if (problems.length) failed.push({input:test.input,problem:problems.join(' · '),expected:test.expect,actual});
      else passed.push({input:test.input,name:actual.name,category:actual.category,qty:actual.qty,unit:actual.unit,price:actual.price});
    }

    const result = {
      ok:failed.length === 0,
      ready:true,
      total:ENGINE_TESTS.length,
      passed:passed.length,
      failed:failed.length,
      skipped:skipped.length,
      passedTests:passed,
      failures:failed,
      skippedTests:skipped,
      checkedAt:new Date().toISOString()
    };

    window.ZoeCatalogRegression2026.lastEngineResult = result;

    if (log) {
      const tag = '[Zoé Engine Safety]';
      if (result.ok) console.info(`${tag} OK – ${result.passed}/${result.total} valódi motorpróba sikeres, ${result.skipped} kihagyva.`);
      else {
        console.warn(`${tag} HIBA – ${result.failed} valódi motorpróba elbukott.`);
        console.table(result.failures.map(f => ({input:f.input,problem:f.problem})));
      }
      if (result.skipped) console.info(`${tag} ${result.skipped} motorpróba saját adat vagy nyitott tétel miatt biztonságosan kihagyva.`);
    }

    return result;
  }

  window.ZoeCatalogRegression2026 = {
    version:2026082602,
    tests:TESTS.map(test => ({...test})),
    engineTests:ENGINE_TESTS.map(test => ({...test,expect:{...test.expect}})),
    run,
    runEngine,
    engineReady:false,
    lastResult:null,
    lastEngineResult:null
  };

  // A beépített exact/alias térképet azonnal, kizárólag olvasással ellenőrizzük.
  // A valódi motorpróbák automatikusan elindulnak, amint az app.js submit-kezelőjét megfogtuk.
  run();
})();
