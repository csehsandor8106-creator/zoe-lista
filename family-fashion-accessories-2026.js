(() => {
  'use strict';

  // Zoé Lista – fehérnemű, ruházati alapdarabok, ékszerek és divatkiegészítők.
  // A felhasználó saját tanítása és saját ára mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260822;

  const RULES = [
    // NŐI FEHÉRNEMŰ
    {aliases:['bugyi','női bugyi','noi bugyi','alsó','also','női alsó','noi also'],label:'Bugyi',category:'Ruházat',icon:'🩲',price:1499,unit:'db'},
    {aliases:['tanga','tanga bugyi'],label:'Tanga',category:'Ruházat',icon:'🩲',price:1499,unit:'db'},
    {aliases:['brazil bugyi','brazil fazonú bugyi','brazil fazonu bugyi'],label:'Brazil bugyi',category:'Ruházat',icon:'🩲',price:1699,unit:'db'},
    {aliases:['magas derekú bugyi','magas dereku bugyi','alakformáló bugyi','alakformalo bugyi'],label:'Magas derekú / alakformáló bugyi',category:'Ruházat',icon:'🩲',price:2499,unit:'db'},
    {aliases:['menstruációs bugyi','menstruacios bugyi','menstruációs alsó','menstruacios also'],label:'Menstruációs bugyi',category:'Ruházat',icon:'🩲',price:4999,unit:'db'},
    {aliases:['melltartó','melltarto','cici tartó','cici tarto','bra'],label:'Melltartó',category:'Ruházat',icon:'👙',price:3999,unit:'db'},
    {aliases:['sportmelltartó','sportmelltarto','sport melltartó','sport melltarto'],label:'Sportmelltartó',category:'Ruházat',icon:'👙',price:4499,unit:'db'},
    {aliases:['bralette','bralett'],label:'Bralette',category:'Ruházat',icon:'👙',price:3499,unit:'db'},
    {aliases:['merevítő nélküli melltartó','merevito nelkuli melltarto','merevítő nélküli melltarto'],label:'Merevítő nélküli melltartó',category:'Ruházat',icon:'👙',price:3999,unit:'db'},
    {aliases:['push up melltartó','push-up melltartó','push up melltarto','pushup melltartó','pushup melltarto'],label:'Push-up melltartó',category:'Ruházat',icon:'👙',price:4499,unit:'db'},
    {aliases:['melltartóbetét','melltartobetet','melltartó betét','melltarto betet'],label:'Melltartóbetét',category:'Ruházat',icon:'👙',price:1499,unit:'csomag',legacyDbToDefault:true},

    // FÉRFI / UNISZEX FEHÉRNEMŰ
    {aliases:['alsónadrág','alsonadrag','férfi alsó','ferfi also','gatya'],label:'Alsónadrág',category:'Ruházat',icon:'🩲',price:2999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['boxer','boxeralsó','boxeralso','boxer alsó','boxer also'],label:'Boxeralsó',category:'Ruházat',icon:'🩲',price:2999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['fecske alsó','fecske also','slip alsó','slip also'],label:'Fecske alsó',category:'Ruházat',icon:'🩲',price:2499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['atlétatrikó','atletatriko','atléta','atleta','alsó trikó','also triko'],label:'Alsótrikó',category:'Ruházat',icon:'👕',price:1999,unit:'db'},

    // HARISNYA / ZOKNI / OTTHONI RUHÁZAT
    {aliases:['zokni','női zokni','noi zokni','férfi zokni','ferfi zokni'],label:'Zokni',category:'Ruházat',icon:'🧦',price:1499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['bokazokni','boka zokni'],label:'Bokazokni',category:'Ruházat',icon:'🧦',price:1499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['harisnya','harisnyanadrág','harisnyanadrag'],label:'Harisnyanadrág',category:'Ruházat',icon:'🧦',price:1999,unit:'db'},
    {aliases:['combfix','comb fix'],label:'Combfix',category:'Ruházat',icon:'🧦',price:2499,unit:'db'},
    {aliases:['leggings','legins','cicanadrág','cicanadrag'],label:'Leggings',category:'Ruházat',icon:'👖',price:3499,unit:'db'},
    {aliases:['pizsama','pizsi'],label:'Pizsama',category:'Ruházat',icon:'👚',price:5999,unit:'db'},
    {aliases:['hálóing','haloing','hálóruha','haloruha'],label:'Hálóing',category:'Ruházat',icon:'👗',price:4999,unit:'db'},
    {aliases:['köntös','kontos','fürdőköpeny','furdokopeny'],label:'Köntös',category:'Ruházat',icon:'🥋',price:7999,unit:'db'},

    // FÜRDŐRUHA
    {aliases:['bikini'],label:'Bikini',category:'Ruházat',icon:'👙',price:6999,unit:'db'},
    {aliases:['fürdőruha','furdoruha','úszódressz','uszodressz'],label:'Fürdőruha',category:'Ruházat',icon:'👙',price:6999,unit:'db'},
    {aliases:['úszónadrág','uszonadrag','fürdőnadrág','furdonadrag'],label:'Úszónadrág',category:'Ruházat',icon:'🩳',price:4999,unit:'db'},

    // ÉKSZEREK
    {aliases:['fülbevaló','fulbevalo','fül bevaló','ful bevalo','earring','earrings'],label:'Fülbevaló',category:'Ruházat',icon:'💎',price:2499,unit:'db'},
    {aliases:['bedugós fülbevaló','bedugos fulbevalo','stud fülbevaló','stud fulbevalo'],label:'Bedugós fülbevaló',category:'Ruházat',icon:'💎',price:1999,unit:'db'},
    {aliases:['karika fülbevaló','karika fulbevalo','karikafülbevaló','karikafulbevalo'],label:'Karika fülbevaló',category:'Ruházat',icon:'💎',price:2499,unit:'db'},
    {aliases:['nyaklánc','nyaklanc','lánc','lanc'],label:'Nyaklánc',category:'Ruházat',icon:'📿',price:3499,unit:'db'},
    {aliases:['karkötő','karkoto','karperec'],label:'Karkötő',category:'Ruházat',icon:'📿',price:2999,unit:'db'},
    {aliases:['gyűrű','gyuru','gyürű','ring'],label:'Gyűrű',category:'Ruházat',icon:'💍',price:2999,unit:'db'},
    {aliases:['medál','medal','nyaklánc medál','nyaklanc medal'],label:'Medál',category:'Ruházat',icon:'💎',price:2499,unit:'db'},
    {aliases:['bokakarkötő','bokakarkoto','bokalánc','bokalanc'],label:'Bokalánc',category:'Ruházat',icon:'📿',price:2499,unit:'db'},
    {aliases:['bizsu','bizsu ékszer','bizsu ekszer'],label:'Bizsu ékszer',category:'Ruházat',icon:'💎',price:1999,unit:'db'},
    {aliases:['ékszerszett','ekszerszett','ékszer szett','ekszer szett'],label:'Ékszerszett',category:'Ruházat',icon:'💎',price:4999,unit:'csomag',legacyDbToDefault:true},

    // HAJ- ÉS DIVATKIEGÉSZÍTŐK
    {aliases:['hajgumi','haj gumi'],label:'Hajgumi',category:'Ruházat',icon:'🎀',price:999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['hajcsat','haj csat'],label:'Hajcsat',category:'Ruházat',icon:'🎀',price:999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['hajpánt','hajpant','haj pánt','haj pant'],label:'Hajpánt',category:'Ruházat',icon:'🎀',price:1499,unit:'db'},
    {aliases:['scrunchie','scrunchy'],label:'Scrunchie hajgumi',category:'Ruházat',icon:'🎀',price:999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['öv','ov','nadrágszíj','nadragszij'],label:'Öv',category:'Ruházat',icon:'👖',price:3499,unit:'db'},
    {aliases:['pénztárca','penztarca','pénztárca női','penztarca noi','pénztárca férfi','penztarca ferfi'],label:'Pénztárca',category:'Ruházat',icon:'👛',price:4999,unit:'db'},
    {aliases:['napszemüveg','napszemuveg'],label:'Napszemüveg',category:'Ruházat',icon:'🕶️',price:3999,unit:'db'},
    {aliases:['sál','sal','nyaksál','nyaksal'],label:'Sál',category:'Ruházat',icon:'🧣',price:2999,unit:'db'},
    {aliases:['sapka','kötött sapka','kotott sapka'],label:'Sapka',category:'Ruházat',icon:'🧢',price:2999,unit:'db'},
    {aliases:['baseball sapka','baseballsapka','siltes sapka','sildes sapka'],label:'Baseball sapka',category:'Ruházat',icon:'🧢',price:3499,unit:'db'},
    {aliases:['kesztyű','kesztyu','téli kesztyű','teli kesztyu'],label:'Kesztyű',category:'Ruházat',icon:'🧤',price:2999,unit:'db'},

    // ALAP RUHADARABOK – a már meglévő Ruházat kategória szélesítése
    {aliases:['póló','polo','basic póló','basic polo','rövid ujjú póló','rovid ujju polo'],label:'Póló',category:'Ruházat',icon:'👕',price:2499,unit:'db'},
    {aliases:['ing'],label:'Ing',category:'Ruházat',icon:'👔',price:4999,unit:'db'},
    {aliases:['blúz','bluz'],label:'Blúz',category:'Ruházat',icon:'👚',price:4499,unit:'db'},
    {aliases:['pulóver','pulover'],label:'Pulóver',category:'Ruházat',icon:'👕',price:5999,unit:'db'},
    {aliases:['kapucnis pulóver','kapucnis pulover','hoodie'],label:'Kapucnis pulóver',category:'Ruházat',icon:'👕',price:6999,unit:'db'},
    {aliases:['farmer','farmernadrág','farmernadrag','jeans'],label:'Farmer',category:'Ruházat',icon:'👖',price:7999,unit:'db'},
    {aliases:['nadrág','nadrag'],label:'Nadrág',category:'Ruházat',icon:'👖',price:5999,unit:'db'},
    {aliases:['rövidnadrág','rovidnadrag','short','sort'],label:'Rövidnadrág',category:'Ruházat',icon:'🩳',price:3999,unit:'db'},
    {aliases:['szoknya'],label:'Szoknya',category:'Ruházat',icon:'👗',price:4999,unit:'db'},
    {aliases:['ruha','női ruha','noi ruha','dress'],label:'Ruha',category:'Ruházat',icon:'👗',price:7999,unit:'db'}
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
      family:'fashion-accessories',
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

  // A korábban Egyéb / 699 Ft fallbackként létrejött becsült tételek helyrerakása.
  let state = [];
  try { state = JSON.parse(localStorage.getItem(STATE_KEY)) || []; } catch { state = []; }
  let stateChanged = false;

  for (const item of state) {
    if (!item || item.source !== 'estimate') continue;
    const rule = exactRules[normalize(item.name)];
    if (!rule) continue;

    const wasLegacyDb = item.category === 'Egyéb' && item.unit === 'db';

    if (item.name !== rule.label) { item.name = rule.label; stateChanged = true; }
    if (item.category !== rule.category) { item.category = rule.category; stateChanged = true; }
    if (item.icon !== rule.icon) { item.icon = rule.icon; stateChanged = true; }

    if (wasLegacyDb && rule.legacyDbToDefault && rule.unit !== 'db') {
      item.unit = rule.unit;
      stateChanged = true;
    }

    if (item.unit === rule.unit && item.price !== rule.price) {
      item.price = rule.price;
      stateChanged = true;
    }
  }

  if (stateChanged) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
  }
})();
