(() => {
  'use strict';

  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260822;

  const RULES = [
    // SERTÉSHÚSRÉSZEK – jellemzően kg-os termékek
    {aliases:['sertéscsülök','sertescsulok','sertés csülök','sertes csulok','disznócsülök','disznocsulok'],label:'Sertéscsülök',category:'Hús és felvágott',icon:'🥩',price:2199,unit:'kg',legacyDbToDefault:true},
    {aliases:['füstölt csülök','fustolt csulok','füstölt sertéscsülök','fustolt sertescsulok'],label:'Füstölt sertéscsülök',category:'Hús és felvágott',icon:'🥩',price:2999,unit:'kg'},
    {aliases:['sertéslapocka','serteslapocka','sertés lapocka','sertes lapocka'],label:'Sertéslapocka',category:'Hús és felvágott',icon:'🥩',price:2299,unit:'kg'},
    {aliases:['sertéscomb','sertescomb','sertés comb','sertes comb'],label:'Sertéscomb',category:'Hús és felvágott',icon:'🥩',price:2299,unit:'kg'},
    {aliases:['sertésoldalas','sertesoldalas','sertés oldalas','sertes oldalas','oldalas'],label:'Sertésoldalas',category:'Hús és felvágott',icon:'🥩',price:2599,unit:'kg'},
    {aliases:['sertésdagadó','sertesdagado','sertés dagadó','sertes dagado','dagadó','dagado'],label:'Sertésdagadó',category:'Hús és felvágott',icon:'🥩',price:2499,unit:'kg'},
    {aliases:['sertéstarja','sertestarja','sertés tarja','sertes tarja'],label:'Sertéstarja',category:'Hús és felvágott',icon:'🥩',price:2699,unit:'kg'},
    {aliases:['sertéskaraj','serteskaraj','sertés karaj','sertes karaj'],label:'Sertéskaraj',category:'Hús és felvágott',icon:'🥩',price:2499,unit:'kg'},
    {aliases:['sertésszűz','sertesszuz','sertésszűzpecsenye','sertesszuzpecsenye','szűzpecsenye','szuzpecsenye'],label:'Sertésszűz',category:'Hús és felvágott',icon:'🥩',price:3999,unit:'kg'},
    {aliases:['sertésköröm','serteskorom','sertés köröm','sertes korom','disznóköröm','disznokorom'],label:'Sertésköröm',category:'Hús és felvágott',icon:'🥩',price:1299,unit:'kg'},
    {aliases:['sertésfül','sertesful','sertés fül','sertes ful'],label:'Sertésfül',category:'Hús és felvágott',icon:'🥩',price:1499,unit:'kg'},
    {aliases:['sertésfej','sertesfej','sertés fej','sertes fej'],label:'Sertésfej',category:'Hús és felvágott',icon:'🥩',price:1199,unit:'kg'},
    {aliases:['sertéscsont','sertescsont','sertés csont','sertes csont','húsos csont','husos csont'],label:'Húsos sertéscsont',category:'Hús és felvágott',icon:'🦴',price:999,unit:'kg'},

    // KEKSZCSALÁD – alapértelmezetten csomagos
    {aliases:['keksz','cookie','cookies'],label:'Keksz',category:'Snack és édesség',icon:'🍪',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['háztartási keksz','haztartasi keksz'],label:'Háztartási keksz',category:'Snack és édesség',icon:'🍪',price:599,unit:'csomag'},
    {aliases:['vajas keksz','vajaskeksz'],label:'Vajas keksz',category:'Snack és édesség',icon:'🍪',price:899,unit:'csomag'},
    {aliases:['zabkeksz','zab keksz'],label:'Zabkeksz',category:'Snack és édesség',icon:'🍪',price:899,unit:'csomag'},
    {aliases:['kakaós keksz','kakaos keksz'],label:'Kakaós keksz',category:'Snack és édesség',icon:'🍪',price:799,unit:'csomag'},
    {aliases:['csokis keksz','csokoládés keksz','csokolades keksz'],label:'Csokis keksz',category:'Snack és édesség',icon:'🍪',price:899,unit:'csomag'},
    {aliases:['töltött keksz','toltott keksz','szendvicskeksz'],label:'Töltött keksz',category:'Snack és édesség',icon:'🍪',price:899,unit:'csomag'},
    {aliases:['omlós keksz','omlos keksz'],label:'Omlós keksz',category:'Snack és édesség',icon:'🍪',price:799,unit:'csomag'},
    {aliases:['digestive','digestive keksz'],label:'Digestive keksz',category:'Snack és édesség',icon:'🍪',price:1099,unit:'csomag'},
    {aliases:['babapiskóta','babapiskota'],label:'Babapiskóta',category:'Snack és édesség',icon:'🍪',price:799,unit:'csomag'},
    {aliases:['oreo'],label:'Oreo keksz',category:'Snack és édesség',icon:'🍪',price:999,unit:'csomag'},
    {aliases:['pilóta keksz','pilota keksz','pilóta'],label:'Pilóta keksz',category:'Snack és édesség',icon:'🍪',price:899,unit:'csomag'},
    {aliases:['győri édes','gyori edes'],label:'Győri Édes keksz',category:'Snack és édesség',icon:'🍪',price:799,unit:'csomag'},

    // MÜZLI- / GABONA- / FEHÉRJESZELETEK – egyedi szelet db, multipack csomag
    {aliases:['müzli szelet','müzliszelet','muzli szelet','muzliszelet'],label:'Müzliszelet',category:'Snack és édesség',icon:'🌾',price:299,unit:'db',legacyDbToDefault:true},
    {aliases:['gabon szelet','gabonás szelet','gabonaszelet','gabonászelet'],label:'Gabonaszelet',category:'Snack és édesség',icon:'🌾',price:299,unit:'db'},
    {aliases:['zabszelet','zab szelet'],label:'Zabszelet',category:'Snack és édesség',icon:'🌾',price:349,unit:'db'},
    {aliases:['gyümölcsszelet','gyumolcsszelet','gyümölcs szelet','gyumolcs szelet'],label:'Gyümölcsszelet',category:'Snack és édesség',icon:'🍓',price:349,unit:'db'},
    {aliases:['fehérjeszelet','feherjeszelet','protein szelet','proteinszelet','protein bar'],label:'Fehérjeszelet',category:'Snack és édesség',icon:'💪',price:699,unit:'db'},
    {aliases:['energiaszelet','energia szelet','energy bar'],label:'Energiaszelet',category:'Snack és édesség',icon:'⚡',price:499,unit:'db'},
    {aliases:['müzliszelet csomag','müzli szelet csomag','muzliszelet csomag','müzliszelet multipack','muzliszelet multipack'],label:'Müzliszelet multipack',category:'Snack és édesség',icon:'🌾',price:1199,unit:'csomag'},
    {aliases:['protein szelet csomag','fehérjeszelet csomag','feherjeszelet csomag','protein bar multipack'],label:'Fehérjeszelet multipack',category:'Snack és édesség',icon:'💪',price:2499,unit:'csomag'},
    {aliases:['corny','corny szelet'],label:'Corny müzliszelet',category:'Snack és édesség',icon:'🌾',price:349,unit:'db'},
    {aliases:['nestlé fitness szelet','nestle fitness szelet','fitness szelet'],label:'Fitness gabonaszelet',category:'Snack és édesség',icon:'🌾',price:349,unit:'db'}
  ];

  function normalize(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  }

  let learned = {};
  try { learned = JSON.parse(localStorage.getItem(LEARNED_KEY)) || {}; } catch { learned = {}; }
  const exactRules = {};

  for (const entry of RULES) {
    const rule = {label:entry.label,category:entry.category,icon:entry.icon,price:entry.price,unit:entry.unit,kind:'learned',builtinCatalog:true,familyCatalog:true,family:'pork-biscuits-bars',builtinVersion:FAMILY_VERSION};
    for (const alias of [...entry.aliases, entry.label]) {
      const key = normalize(alias);
      if (!key) continue;
      exactRules[key] = {...rule, legacyDbToDefault:!!entry.legacyDbToDefault};
      const previous = learned[key];
      if (!previous || previous.builtinCatalog) learned[key] = {...rule};
    }
  }

  try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}

  let state = [];
  try { state = JSON.parse(localStorage.getItem(STATE_KEY)) || []; } catch { state = []; }
  let stateChanged = false;

  for (const item of state) {
    if (!item || !['estimate','estimate-unit','unknown'].includes(item.source)) continue;
    const rule = exactRules[normalize(item.name)];
    if (!rule) continue;
    const wasFallback = item.category === 'Egyéb' || item.price === 699 || item.source === 'unknown' || rule.legacyDbToDefault;
    if (!wasFallback) continue;
    if (item.name !== rule.label) { item.name = rule.label; stateChanged = true; }
    if (item.category !== rule.category) { item.category = rule.category; stateChanged = true; }
    if (item.icon !== rule.icon) { item.icon = rule.icon; stateChanged = true; }
    if (item.unit !== rule.unit) { item.unit = rule.unit; stateChanged = true; }
    if (item.price !== rule.price) { item.price = rule.price; stateChanged = true; }
    if (item.source !== 'estimate') { item.source = 'estimate'; stateChanged = true; }
  }

  if (stateChanged) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
  }
})();
