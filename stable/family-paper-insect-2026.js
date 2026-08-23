(() => {
  'use strict';

  // Zoé Lista – papíráruk, légyfogók és szúnyog-/rovarriasztók családja.
  // A felhasználó saját tanítása és saját ára mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260822;

  const RULES = [
    // HÁZTARTÁSI PAPÍRÁRUK
    {aliases:['wc papír','wc papir','wcpapír','wcpapir','vc papír','vc papir','vécé papír','vece papir','toalettpapír','toalettpapir','toalett papír','toalett papir'],label:'WC-papír',category:'Háztartás',icon:'🧻',price:1599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['nedves wc papír','nedves wc papir','nedves vécépapír','nedves vecepapir','nedves toalettpapír','nedves toalettpapir'],label:'Nedves toalettpapír',category:'Higiénia',icon:'🧻',price:899,unit:'csomag',legacyDbToDefault:true},
    {aliases:['papírtörlő','papirtorlo','papír törlő','papir torlo','konyhai papírtörlő','konyhai papirtorlo','konyhai törlő','konyhai torlo'],label:'Papírtörlő',category:'Háztartás',icon:'🧻',price:899,unit:'csomag',legacyDbToDefault:true},
    {aliases:['szalvéta','szalveta','papírszalvéta','papirszalveta'],label:'Szalvéta',category:'Háztartás',icon:'🧻',price:499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['papírzsebkendő','papirzsebkendo','papír zsebkendő','papir zsebkendo','zsebkendő','zsebkendo','zsepi'],label:'Papírzsebkendő',category:'Higiénia',icon:'🤧',price:499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['arctörlő kendő','arctorlo kendo','papír arctörlő','papir arctorlo'],label:'Arctörlő kendő',category:'Higiénia',icon:'🧻',price:699,unit:'csomag',legacyDbToDefault:true},

    // LÉGYPAPÍR / ROVARFOGÓ
    {aliases:['légypapír','legypapir','légy papír','legy papir','ragadós légypapír','ragados legypapir'],label:'Légypapír',category:'Háztartás',icon:'🪰',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['légyfogó','legyfogo','ragacsos légyfogó','ragacsos legyfogo','légycsapda','legycsapda'],label:'Légyfogó',category:'Háztartás',icon:'🪰',price:799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['légycsapó','legycsapo'],label:'Légycsapó',category:'Háztartás',icon:'🪰',price:499,unit:'db'},
    {aliases:['rovarfogó lap','rovarfogo lap','ragacslap','ragacs lap','rovarcsapda','rovar csapda'],label:'Rovarfogó lap',category:'Háztartás',icon:'🪰',price:799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['muslicacsapda','muslica csapda','gyümölcslégy csapda','gyumolcslegy csapda'],label:'Muslicacsapda',category:'Háztartás',icon:'🪰',price:1299,unit:'db'},

    // SZÚNYOGRIASZTÁS / ROVARIRTÁS
    {aliases:['szúnyogriasztó','szunyogriaszto','szúnyogriasztó spray','szunyogriaszto spray','szúnyog spray','szunyog spray'],label:'Szúnyogriasztó',category:'Háztartás',icon:'🦟',price:1499,unit:'db'},
    {aliases:['szúnyogriasztó krém','szunyogriaszto krem','szúnyogriasztó gél','szunyogriaszto gel'],label:'Szúnyogriasztó krém / gél',category:'Háztartás',icon:'🦟',price:1499,unit:'db'},
    {aliases:['szúnyogriasztó karkötő','szunyogriaszto karkoto','szúnyog karkötő','szunyog karkoto'],label:'Szúnyogriasztó karkötő',category:'Háztartás',icon:'🦟',price:1299,unit:'db'},
    {aliases:['konnektoros szúnyogriasztó','konnektoros szunyogriaszto','elektromos szúnyogriasztó','elektromos szunyogriaszto'],label:'Konnektoros szúnyogriasztó',category:'Háztartás',icon:'🦟',price:1999,unit:'db'},
    {aliases:['szúnyogriasztó utántöltő','szunyogriaszto utantolto','szúnyogirtó utántöltő','szunyogirto utantolto','utántöltő szúnyogriasztóhoz','utantolto szunyogriasztohoz'],label:'Szúnyogriasztó utántöltő',category:'Háztartás',icon:'🦟',price:1399,unit:'csomag',legacyDbToDefault:true},
    {aliases:['szúnyogirtó lap','szunyogirto lap','elektromos szúnyogirtó lap','elektromos szunyogirto lap'],label:'Szúnyogirtó lap',category:'Háztartás',icon:'🦟',price:999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['szúnyogspirál','szunyogspiral','szúnyogriasztó spirál','szunyogriaszto spiral'],label:'Szúnyogriasztó spirál',category:'Háztartás',icon:'🦟',price:999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['rovarirtó spray','rovarirto spray','rovarirtó','rovarirto','bogárirtó spray','bogarirto spray'],label:'Rovarirtó spray',category:'Háztartás',icon:'🪳',price:1499,unit:'db'},
    {aliases:['hangyairtó','hangyairto','hangyairtó szer','hangyairto szer','hangyacsapda','hangya csapda'],label:'Hangyairtó',category:'Háztartás',icon:'🐜',price:1299,unit:'db'},
    {aliases:['csótányirtó','csotanyirto','csótánycsapda','csotanycsapda'],label:'Csótányirtó',category:'Háztartás',icon:'🪳',price:1599,unit:'db'},
    {aliases:['molyirtó','molyirto','molycsapda','moly csapda','ruhamolyirtó','ruhamolyirto'],label:'Molyirtó',category:'Háztartás',icon:'🦋',price:1199,unit:'db'},
    {aliases:['szúnyogháló','szunyoghalo','ablak szúnyogháló','ablak szunyoghalo'],label:'Szúnyogháló',category:'Háztartás',icon:'🪟',price:2499,unit:'db'},

    // GYAKORI MÁRKÁK – pontos márkanévre
    {aliases:['raid'],label:'Raid rovarirtó',category:'Háztartás',icon:'🪳',price:1599,unit:'db'},
    {aliases:['bros'],label:'Bros rovarirtó / rovarfogó',category:'Háztartás',icon:'🪰',price:1299,unit:'db'},
    {aliases:['protect'],label:'Protect rovarriasztó',category:'Háztartás',icon:'🦟',price:1499,unit:'db'},
    {aliases:['off!','off'],label:'OFF! szúnyogriasztó',category:'Háztartás',icon:'🦟',price:1599,unit:'db'},
    {aliases:['zewa'],label:'Zewa papírtermék',category:'Háztartás',icon:'🧻',price:1599,unit:'csomag'},
    {aliases:['regina'],label:'Regina papírtermék',category:'Háztartás',icon:'🧻',price:1499,unit:'csomag'},
    {aliases:['ooops!','ooops'],label:'Ooops! papírtermék',category:'Háztartás',icon:'🧻',price:1399,unit:'csomag'}
  ];

  function normalize(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  }

  let learned = {};
  try { learned = JSON.parse(localStorage.getItem(LEARNED_KEY)) || {}; } catch { learned = {}; }
  const exactRules = {};

  for (const entry of RULES) {
    const rule = {
      label:entry.label,
      category:entry.category,
      icon:entry.icon,
      price:entry.price,
      unit:entry.unit,
      kind:'learned',
      builtinCatalog:true,
      familyCatalog:true,
      family:'paper-insect-household',
      builtinVersion:FAMILY_VERSION
    };

    const aliases = [...entry.aliases, entry.label];
    for (const alias of aliases) {
      const key = normalize(alias);
      if (!key) continue;
      exactRules[key] = {...rule, legacyDbToDefault:!!entry.legacyDbToDefault};
      const previous = learned[key];
      if (!previous || previous.builtinCatalog) learned[key] = {...rule};
    }
  }

  try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}

  // A korábbi Egyéb/db fallbackból létrejött becsült tételek helyrerakása.
  let state = [];
  try { state = JSON.parse(localStorage.getItem(STATE_KEY)) || []; } catch { state = []; }
  let stateChanged = false;

  for (const item of state) {
    if (!item || item.source !== 'estimate') continue;
    const rule = exactRules[normalize(item.name)];
    if (!rule) continue;

    const oldCategory = item.category;
    const wasLegacyDb = oldCategory === 'Egyéb' && item.unit === 'db';

    if (item.name !== rule.label) { item.name = rule.label; stateChanged = true; }
    if (item.category !== rule.category) { item.category = rule.category; stateChanged = true; }
    if (item.icon !== rule.icon) { item.icon = rule.icon; stateChanged = true; }

    if (wasLegacyDb && rule.legacyDbToDefault && rule.unit !== 'db') {
      item.unit = rule.unit;
      stateChanged = true;
    }

    // Csak megfelelő egységhez adunk becsült árat.
    if (item.unit === rule.unit && item.price !== rule.price) {
      item.price = rule.price;
      stateChanged = true;
    }
  }

  if (stateChanged) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
  }
})();
