(() => {
  'use strict';

  // Zoé Lista – papír/írószer, esőfelszerelés és lábbeli családbővítés.
  // A saját ár és a kézzel tanított szabály mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260823;

  const RULES = [
    // RAJZFÜZET / FÜZET / RAJZ- ÉS ÍRÓSZER
    {aliases:['rajzfüzet','rajz fuzet','rajz füzet','rajzfuzet','vázlatfüzet','vazlatfuzet','sketchbook'],label:'Rajzfüzet',category:'Háztartás',icon:'📒',price:899,unit:'db'},
    {aliases:['füzet','fuzet','iskolai füzet','iskolai fuzet'],label:'Füzet',category:'Háztartás',icon:'📓',price:399,unit:'db'},
    {aliases:['spirálfüzet','spiralfuzet','spirál füzet','spiral fuzet'],label:'Spirálfüzet',category:'Háztartás',icon:'📓',price:699,unit:'db'},
    {aliases:['vonalas füzet','vonalas fuzet'],label:'Vonalas füzet',category:'Háztartás',icon:'📓',price:399,unit:'db'},
    {aliases:['kockás füzet','kockas fuzet','négyzetrácsos füzet','negyzetracsos fuzet'],label:'Kockás füzet',category:'Háztartás',icon:'📓',price:399,unit:'db'},
    {aliases:['hangjegyfüzet','hangjegyfuzet','kottafüzet','kotta fuzet'],label:'Hangjegyfüzet',category:'Háztartás',icon:'🎼',price:599,unit:'db'},
    {aliases:['jegyzetfüzet','jegyzetfuzet','notesz','notebook füzet','notebook fuzet'],label:'Jegyzetfüzet',category:'Háztartás',icon:'📔',price:899,unit:'db'},
    {aliases:['rajzlap','rajz lap'],label:'Rajzlap',category:'Háztartás',icon:'📄',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['műszaki rajzlap','muszaki rajzlap'],label:'Műszaki rajzlap',category:'Háztartás',icon:'📄',price:999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['írólap','irolap','író lap','iro lap'],label:'Írólap',category:'Háztartás',icon:'📄',price:499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['színes papír','szines papir','színespapír','szinespapir'],label:'Színes papír',category:'Háztartás',icon:'🟥',price:799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['kartonpapír','kartonpapir','karton papír','karton papir'],label:'Kartonpapír',category:'Háztartás',icon:'📄',price:699,unit:'csomag',legacyDbToDefault:true},
    {aliases:['ceruza','grafitceruza','grafit ceruza'],label:'Grafitceruza',category:'Háztartás',icon:'✏️',price:299,unit:'db'},
    {aliases:['színes ceruza','szines ceruza','színesceruza','szinesceruza'],label:'Színes ceruza',category:'Háztartás',icon:'✏️',price:1499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['filctoll','filc toll','filctoll készlet','filctoll keszlet'],label:'Filctoll',category:'Háztartás',icon:'🖍️',price:1299,unit:'csomag',legacyDbToDefault:true},
    {aliases:['zsírkréta','zsirkreta','zsírkréta készlet','zsirkreta keszlet'],label:'Zsírkréta',category:'Háztartás',icon:'🖍️',price:1199,unit:'csomag',legacyDbToDefault:true},
    {aliases:['vízfesték','vizfestek','vízfesték készlet','vizfestek keszlet'],label:'Vízfesték',category:'Háztartás',icon:'🎨',price:1499,unit:'doboz',legacyDbToDefault:true},
    {aliases:['tempera','temperafesték','temperafestek'],label:'Tempera',category:'Háztartás',icon:'🎨',price:1999,unit:'doboz',legacyDbToDefault:true},
    {aliases:['ecset','festőecset','festő ecset'],label:'Ecset',category:'Háztartás',icon:'🖌️',price:699,unit:'db'},
    {aliases:['radír','radir'],label:'Radír',category:'Háztartás',icon:'🧽',price:299,unit:'db'},
    {aliases:['hegyező','hegyezo','ceruzahegyező','ceruzahegyezo'],label:'Hegyező',category:'Háztartás',icon:'✏️',price:399,unit:'db'},
    {aliases:['vonalzó','vonalzo'],label:'Vonalzó',category:'Háztartás',icon:'📏',price:399,unit:'db'},
    {aliases:['tolltartó','tolltarto'],label:'Tolltartó',category:'Háztartás',icon:'✏️',price:1999,unit:'db'},

    // ESERNYŐ / ESŐFELSZERELÉS
    {aliases:['esernyő','esernyo'],label:'Esernyő',category:'Ruházat',icon:'☂️',price:3499,unit:'db'},
    {aliases:['összecsukható esernyő','osszecsukhato esernyo','mini esernyő','mini esernyo'],label:'Összecsukható esernyő',category:'Ruházat',icon:'☂️',price:3999,unit:'db'},
    {aliases:['automata esernyő','automata esernyo'],label:'Automata esernyő',category:'Ruházat',icon:'☂️',price:4999,unit:'db'},
    {aliases:['gyerek esernyő','gyerek esernyo','gyermek esernyő','gyermek esernyo'],label:'Gyerek esernyő',category:'Ruházat',icon:'☂️',price:2999,unit:'db'},
    {aliases:['golf esernyő','golf esernyo','nagy esernyő','nagy esernyo'],label:'Golfesernyő',category:'Ruházat',icon:'☂️',price:5999,unit:'db'},
    {aliases:['esőkabát','esokabat','eső kabát','eso kabat'],label:'Esőkabát',category:'Ruházat',icon:'🧥',price:7999,unit:'db'},
    {aliases:['esőponcsó','esoponcso','eső poncsó','eso poncso'],label:'Esőponcsó',category:'Ruházat',icon:'🌧️',price:2499,unit:'db'},
    {aliases:['esernyőtok','esernyotok','esernyő tok','esernyo tok'],label:'Esernyőtok',category:'Ruházat',icon:'☂️',price:999,unit:'db'},

    // SPORTCIPŐ / LÁBBELIK – a cipők ára egy párra értendő.
    {aliases:['sportcipő','sportcipo','sport cipő','sport cipo'],label:'Sportcipő',category:'Ruházat',icon:'👟',price:14999,unit:'pár',legacyDbToDefault:true},
    {aliases:['futócipő','futocipo','futó cipő','futo cipo'],label:'Futócipő',category:'Ruházat',icon:'👟',price:19999,unit:'pár',legacyDbToDefault:true},
    {aliases:['edzőcipő','edzocipo','edző cipő','edzo cipo','tréningcipő','treningcipo'],label:'Edzőcipő',category:'Ruházat',icon:'👟',price:14999,unit:'pár',legacyDbToDefault:true},
    {aliases:['tornacipő','tornacipo','torna cipő','torna cipo'],label:'Tornacipő',category:'Ruházat',icon:'👟',price:9999,unit:'pár',legacyDbToDefault:true},
    {aliases:['sneaker','sneakers','utcai sneaker'],label:'Sneaker',category:'Ruházat',icon:'👟',price:14999,unit:'pár',legacyDbToDefault:true},
    {aliases:['utcai cipő','utcai cipo','félcipő','felcipo'],label:'Utcai cipő',category:'Ruházat',icon:'👞',price:14999,unit:'pár',legacyDbToDefault:true},
    {aliases:['túracipő','turacipo','túra cipő','tura cipo','hiking cipő','hiking cipo'],label:'Túracipő',category:'Ruházat',icon:'🥾',price:22999,unit:'pár',legacyDbToDefault:true},
    {aliases:['bakancs','túrabakancs','turabakancs'],label:'Bakancs',category:'Ruházat',icon:'🥾',price:24999,unit:'pár',legacyDbToDefault:true},
    {aliases:['gumicsizma','gumi csizma','esőcsizma','esocsizma'],label:'Gumicsizma',category:'Ruházat',icon:'🥾',price:6999,unit:'pár',legacyDbToDefault:true},
    {aliases:['szandál','szandal'],label:'Szandál',category:'Ruházat',icon:'👡',price:9999,unit:'pár',legacyDbToDefault:true},
    {aliases:['strandpapucs','strand papucs','flip flop','flip-flop'],label:'Strandpapucs',category:'Ruházat',icon:'🩴',price:3999,unit:'pár',legacyDbToDefault:true},
    {aliases:['házipapucs','hazipapucs','házi papucs','hazi papucs'],label:'Házipapucs',category:'Ruházat',icon:'🥿',price:4999,unit:'pár',legacyDbToDefault:true},
    {aliases:['magassarkú','magassarku','magas sarkú cipő','magas sarku cipo'],label:'Magassarkú cipő',category:'Ruházat',icon:'👠',price:14999,unit:'pár',legacyDbToDefault:true},
    {aliases:['gyerekcipő','gyerekcipo','gyerek cipő','gyerek cipo','gyermekcipő','gyermekcipo'],label:'Gyerekcipő',category:'Ruházat',icon:'👟',price:11999,unit:'pár',legacyDbToDefault:true},
    {aliases:['cipőfűző','cipofuzo','cipő fűző','cipo fuzo'],label:'Cipőfűző',category:'Ruházat',icon:'👟',price:999,unit:'pár',legacyDbToDefault:true},
    {aliases:['cipőtalpbetét','cipotalpbetet','talpbetét','talpbetet'],label:'Cipőtalpbetét',category:'Ruházat',icon:'👣',price:2499,unit:'pár',legacyDbToDefault:true},
    {aliases:['cipőápoló','cipoapolo','cipőkrém','cipokrem'],label:'Cipőápoló',category:'Ruházat',icon:'👞',price:1999,unit:'db'}
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
      family:'stationery-rain-footwear',
      builtinVersion:FAMILY_VERSION
    };

    for (const alias of [...entry.aliases, entry.label]) {
      const key = normalize(alias);
      if (!key) continue;
      exactRules[key] = {...rule, legacyDbToDefault:!!entry.legacyDbToDefault};
      const previous = learned[key];
      if (!previous || previous.builtinCatalog) learned[key] = {...rule};
    }
  }

  try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}

  // A már listában lévő fallback becsléseket is átvezetjük az új családra.
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