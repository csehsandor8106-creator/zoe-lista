(() => {
  'use strict';

  // Zoé Lista – puliszka/dara, buci/pékáru és virág-ajándék családbővítés.
  // A felhasználó saját tanítása és saját ára mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260822;

  const RULES = [
    // PULISZKA / POLENTA / DARÁK ÉS KÁSÁK
    {aliases:['puliszka','puliska'],label:'Puliszka',category:'Alapélelmiszer',icon:'🌽',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['polenta','instant polenta','kukoricapolenta'],label:'Polenta',category:'Alapélelmiszer',icon:'🌽',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['kukoricadara','kukorica dara'],label:'Kukoricadara',category:'Alapélelmiszer',icon:'🌽',price:499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['búzadara','buzadara','gríz','griz'],label:'Búzadara / gríz',category:'Alapélelmiszer',icon:'🌾',price:499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['kukoricaliszt','kukorica liszt'],label:'Kukoricaliszt',category:'Alapélelmiszer',icon:'🌽',price:599,unit:'csomag',legacyDbToDefault:true},
    {aliases:['zabkása','zabkasa','instant zabkása','instant zabkasa'],label:'Zabkása',category:'Alapélelmiszer',icon:'🥣',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['rizskása','rizskasa','instant rizskása','instant rizskasa'],label:'Rizskása',category:'Alapélelmiszer',icon:'🥣',price:799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['köleskása','koleskasa'],label:'Köleskása',category:'Alapélelmiszer',icon:'🥣',price:799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['hajdinakása','hajdinakasa'],label:'Hajdinakása',category:'Alapélelmiszer',icon:'🥣',price:899,unit:'csomag',legacyDbToDefault:true},

    // BUCI / ZSEMLE / SZENDVICSPÉKÁRU
    {aliases:['buci','péksüti buci','peksuti buci'],label:'Buci',category:'Pékáru',icon:'🥯',price:149,unit:'db'},
    {aliases:['hamburgerbuci','hamburger buci','hamburger zsemle','hamburgerzsömle','hamburger zsomle','burger buci','burgerbuci'],label:'Hamburgerbuci',category:'Pékáru',icon:'🍔',price:799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['szezámmagos hamburgerbuci','szezammagos hamburgerbuci','szezámos buci','szezamos buci'],label:'Szezámmagos hamburgerbuci',category:'Pékáru',icon:'🍔',price:899,unit:'csomag',legacyDbToDefault:true},
    {aliases:['hot dog kifli','hotdog kifli','hot-dog kifli','hot dog buci','hotdog buci'],label:'Hot dog kifli',category:'Pékáru',icon:'🌭',price:799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['mini buci','minibuci','mini hamburgerbuci'],label:'Mini buci',category:'Pékáru',icon:'🥯',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['briós','brios'],label:'Briós',category:'Pékáru',icon:'🥐',price:249,unit:'db'},
    {aliases:['császárzsemle','csaszarzsemle','császár zsömle','csaszar zsomle'],label:'Császárzsemle',category:'Pékáru',icon:'🥯',price:179,unit:'db'},
    {aliases:['tejes zsemle','tejes zsömle','tejes zsomle'],label:'Tejes zsemle',category:'Pékáru',icon:'🥯',price:149,unit:'db'},
    {aliases:['magvas zsemle','magvas zsömle','magvas zsomle','magvas buci'],label:'Magvas zsemle',category:'Pékáru',icon:'🥯',price:199,unit:'db'},
    {aliases:['teljes kiőrlésű zsemle','teljes kiorlesu zsemle','teljes kiőrlésű zsömle','teljes kiorlesu zsomle'],label:'Teljes kiőrlésű zsemle',category:'Pékáru',icon:'🥯',price:199,unit:'db'},
    {aliases:['bagel','bejgli bagel'],label:'Bagel',category:'Pékáru',icon:'🥯',price:399,unit:'db'},

    // VIRÁG / CSOKOR / CSEREPES NÖVÉNY
    {aliases:['virágcsokor','viragcsokor','virág csokor','virag csokor','csokor virág','csokor virag'],label:'Virágcsokor',category:'Virág és ajándék',icon:'💐',price:3999,unit:'db'},
    {aliases:['vegyes virágcsokor','vegyes viragcsokor','vegyes csokor'],label:'Vegyes virágcsokor',category:'Virág és ajándék',icon:'💐',price:3999,unit:'db'},
    {aliases:['rózsacsokor','rozsacsokor','rózsa csokor','rozsa csokor'],label:'Rózsacsokor',category:'Virág és ajándék',icon:'💐',price:4999,unit:'db'},
    {aliases:['tulipáncsokor','tulipancsokor','tulipán csokor','tulipan csokor'],label:'Tulipáncsokor',category:'Virág és ajándék',icon:'💐',price:2999,unit:'db'},
    {aliases:['vágott virág','vagott virag'],label:'Vágott virág',category:'Virág és ajándék',icon:'💐',price:2499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['rózsa','rozsa'],label:'Rózsa',category:'Virág és ajándék',icon:'🌹',price:999,unit:'db'},
    {aliases:['tulipán','tulipan'],label:'Tulipán',category:'Virág és ajándék',icon:'🌷',price:699,unit:'db'},
    {aliases:['gerbera'],label:'Gerbera',category:'Virág és ajándék',icon:'🌼',price:799,unit:'db'},
    {aliases:['liliom'],label:'Liliom',category:'Virág és ajándék',icon:'🌸',price:1299,unit:'db'},
    {aliases:['krizantém','krizantem'],label:'Krizantém',category:'Virág és ajándék',icon:'🌼',price:999,unit:'db'},
    {aliases:['szegfű','szegfu'],label:'Szegfű',category:'Virág és ajándék',icon:'🌸',price:699,unit:'db'},
    {aliases:['orchidea'],label:'Orchidea',category:'Virág és ajándék',icon:'🌸',price:3999,unit:'db'},
    {aliases:['cserepes virág','cserepes virag','cserepes növény','cserepes noveny'],label:'Cserepes virág',category:'Virág és ajándék',icon:'🪴',price:2499,unit:'db'},
    {aliases:['szobanövény','szobanoveny'],label:'Szobanövény',category:'Virág és ajándék',icon:'🪴',price:2999,unit:'db'},

    // VIRÁGHOZ / AJÁNDÉKHOZ KÖZELI TERMÉKEK
    {aliases:['virágföld','viragfold','virág föld','virag fold'],label:'Virágföld',category:'Háztartás',icon:'🪴',price:1699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['ajándéktasak','ajandektasak','ajándék tasak','ajandek tasak'],label:'Ajándéktasak',category:'Virág és ajándék',icon:'🎁',price:999,unit:'db'},
    {aliases:['csomagolópapír','csomagolopapir','ajándékcsomagoló papír','ajandekcsomagolo papir'],label:'Csomagolópapír',category:'Virág és ajándék',icon:'🎁',price:799,unit:'db'},
    {aliases:['képeslap','kepeslap','üdvözlőlap','udvozlolap'],label:'Képeslap',category:'Virág és ajándék',icon:'💌',price:599,unit:'db'}
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
      family:'pantry-bakery-gifts',
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

  // Korábban Egyéb/db fallbackből létrejött becsült tételek helyrerakása.
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

    // Csak akkor adjuk rá a becsült árat, ha az egység tényleg egyezik.
    if (item.unit === rule.unit && item.price !== rule.price) {
      item.price = rule.price;
      stateChanged = true;
    }
  }

  if (stateChanged) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
  }
})();
