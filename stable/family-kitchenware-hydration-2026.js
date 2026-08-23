(() => {
  'use strict';

  // Zoé Lista – tányér/étkészlet, főzőedény és kulacs/ivóedény családbővítés.
  // A saját ár és a kézzel tanított szabály mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260823;

  const RULES = [
    // TÁNYÉR / TÁL / ÉTKÉSZLET
    {aliases:['tányér','tanyer'],label:'Tányér',category:'Háztartás',icon:'🍽️',price:1499,unit:'db'},
    {aliases:['lapostányér','lapos tányér','lapostanyer','lapos tanyer'],label:'Lapostányér',category:'Háztartás',icon:'🍽️',price:1499,unit:'db'},
    {aliases:['mélytányér','mély tányér','melytanyer','mely tanyer'],label:'Mélytányér',category:'Háztartás',icon:'🥣',price:1499,unit:'db'},
    {aliases:['desszerttányér','desszert tányér','desszerttanyer','desszert tanyer','kistányér','kis tányér','kistanyer','kis tanyer'],label:'Desszerttányér',category:'Háztartás',icon:'🍽️',price:1199,unit:'db'},
    {aliases:['gyerektányér','gyerek tányér','gyerektanyer','gyerek tanyer'],label:'Gyerektányér',category:'Háztartás',icon:'🍽️',price:1299,unit:'db'},
    {aliases:['műanyag tányér','muanyag tanyer'],label:'Műanyag tányér',category:'Háztartás',icon:'🍽️',price:699,unit:'db'},
    {aliases:['papírtányér','papír tányér','papirtanyer','papir tanyer','eldobható tányér','eldobhato tanyer'],label:'Papírtányér',category:'Háztartás',icon:'🍽️',price:799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['tányérkészlet','tányér készlet','tanyerkeszlet','tanyer keszlet'],label:'Tányérkészlet',category:'Háztartás',icon:'🍽️',price:9999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['étkészlet','etkeszlet','étkező készlet','etkezo keszlet'],label:'Étkészlet',category:'Háztartás',icon:'🍽️',price:14999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['tál','tal','tálka','talka'],label:'Tál / tálka',category:'Háztartás',icon:'🥣',price:1299,unit:'db'},
    {aliases:['salátástál','salátás tál','salatastal','salatas tal'],label:'Salátástál',category:'Háztartás',icon:'🥗',price:2499,unit:'db'},
    {aliases:['müzlistál','müzlis tál','muzlistal','muzlis tal','reggelizőtál','reggelizo tal'],label:'Müzlistál',category:'Háztartás',icon:'🥣',price:1299,unit:'db'},
    {aliases:['levesestál','leveses tál','levesestal','leveses tal'],label:'Levesestál',category:'Háztartás',icon:'🥣',price:2999,unit:'db'},
    {aliases:['szervírozótál','szervirozotal','kínálótál','kinalotal'],label:'Kínálótál',category:'Háztartás',icon:'🍽️',price:2999,unit:'db'},
    {aliases:['evőeszköz készlet','evoeszkoz keszlet','evőeszközkészlet','evoeszkozkeszlet'],label:'Evőeszközkészlet',category:'Háztartás',icon:'🍴',price:5999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['villa','evővilla','evovilla'],label:'Villa',category:'Háztartás',icon:'🍴',price:699,unit:'db'},
    {aliases:['evőkanál','evokanal','kanál','kanal'],label:'Evőkanál',category:'Háztartás',icon:'🥄',price:699,unit:'db'},
    {aliases:['teáskanál','teaskanal','kiskanál','kiskanal'],label:'Teáskanál',category:'Háztartás',icon:'🥄',price:499,unit:'db'},
    {aliases:['étkezési kés','etkezesi kes','evőkés','evokes'],label:'Étkezési kés',category:'Háztartás',icon:'🍴',price:799,unit:'db'},

    // SERPENYŐ / EDÉNY / SÜTŐ-FŐZŐ ESZKÖZÖK
    {aliases:['serpenyő','serpenyo'],label:'Serpenyő',category:'Háztartás',icon:'🍳',price:5999,unit:'db'},
    {aliases:['tapadásmentes serpenyő','tapadasmentes serpenyo','teflon serpenyő','teflon serpenyo'],label:'Tapadásmentes serpenyő',category:'Háztartás',icon:'🍳',price:6999,unit:'db'},
    {aliases:['öntöttvas serpenyő','ontottvas serpenyo','vas serpenyő','vas serpenyo'],label:'Öntöttvas serpenyő',category:'Háztartás',icon:'🍳',price:8999,unit:'db'},
    {aliases:['grillserpenyő','grill serpenyő','grillserpenyo','grill serpenyo'],label:'Grillserpenyő',category:'Háztartás',icon:'🍳',price:7999,unit:'db'},
    {aliases:['palacsintasütő','palacsinta sütő','palacsintasuto','palacsinta suto','palacsintaserpenyő','palacsintaserpenyo'],label:'Palacsintasütő',category:'Háztartás',icon:'🥞',price:5999,unit:'db'},
    {aliases:['wok','wok serpenyő','wok serpenyo'],label:'Wok',category:'Háztartás',icon:'🍳',price:7999,unit:'db'},
    {aliases:['lábas','labas'],label:'Lábas',category:'Háztartás',icon:'🍲',price:5999,unit:'db'},
    {aliases:['fazék','fazek'],label:'Fazék',category:'Háztartás',icon:'🍲',price:6999,unit:'db'},
    {aliases:['nyeles lábas','nyeles labas','szószos lábas','szoszos labas'],label:'Nyeles lábas',category:'Háztartás',icon:'🍲',price:4999,unit:'db'},
    {aliases:['kukta','gyorsfőző','gyorsfozo','gyorsfőző edény','gyorsfozo edeny'],label:'Kukta',category:'Háztartás',icon:'🍲',price:17999,unit:'db'},
    {aliases:['edénykészlet','edenykeszlet','lábas készlet','labas keszlet'],label:'Edénykészlet',category:'Háztartás',icon:'🍲',price:24999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['tepsi','sütőtepsi','sutotepsi','sütő tepsi','suto tepsi'],label:'Tepsi',category:'Háztartás',icon:'🍽️',price:3999,unit:'db'},
    {aliases:['pizzatepsi','pizza tepsi'],label:'Pizzatepsi',category:'Háztartás',icon:'🍕',price:2999,unit:'db'},
    {aliases:['sütőforma','sutoforma','sütő forma','suto forma'],label:'Sütőforma',category:'Háztartás',icon:'🧁',price:2999,unit:'db'},
    {aliases:['tortaforma','torta forma','kapcsos tortaforma'],label:'Tortaforma',category:'Háztartás',icon:'🎂',price:3999,unit:'db'},
    {aliases:['jénai','jenai','jénai tál','jenai tal','hőálló tál','hoallo tal'],label:'Jénai tál',category:'Háztartás',icon:'🍲',price:4999,unit:'db'},
    {aliases:['fedő','fedo','edényfedő','edenyfedo','serpenyőfedő','serpenyofedo'],label:'Edényfedő',category:'Háztartás',icon:'🍲',price:2499,unit:'db'},
    {aliases:['fakanál','fakanal'],label:'Fakanál',category:'Háztartás',icon:'🥄',price:799,unit:'db'},
    {aliases:['spatula','lapátkanál','lapatkanal'],label:'Spatula',category:'Háztartás',icon:'🍳',price:1299,unit:'db'},
    {aliases:['merőkanál','merokanal'],label:'Merőkanál',category:'Háztartás',icon:'🥄',price:1299,unit:'db'},
    {aliases:['habverő','habvero','kézi habverő','kezi habvero'],label:'Kézi habverő',category:'Háztartás',icon:'🥣',price:1499,unit:'db'},
    {aliases:['konyhai fogó','konyhai fogo','húsfogó','husfogo'],label:'Konyhai fogó',category:'Háztartás',icon:'🍴',price:1499,unit:'db'},

    // KULACS / IVÓPALACK / TERMOSZ
    {aliases:['kulacs','vizes kulacs','viz kulacs'],label:'Kulacs',category:'Háztartás',icon:'🚰',price:3499,unit:'db'},
    {aliases:['sportkulacs','sport kulacs'],label:'Sportkulacs',category:'Háztartás',icon:'🚰',price:2999,unit:'db'},
    {aliases:['gyerekkulacs','gyerek kulacs','gyermek kulacs'],label:'Gyerekkulacs',category:'Háztartás',icon:'🧃',price:2999,unit:'db'},
    {aliases:['fém kulacs','fem kulacs','acél kulacs','acel kulacs'],label:'Fém kulacs',category:'Háztartás',icon:'🚰',price:4499,unit:'db'},
    {aliases:['hőtartó kulacs','hotarto kulacs','termo kulacs','termo palack'],label:'Hőtartó kulacs',category:'Háztartás',icon:'🧊',price:5999,unit:'db'},
    {aliases:['ivópalack','ivopalack','ivó palack','ivo palack','újratölthető palack','ujratoltheto palack'],label:'Ivópalack',category:'Háztartás',icon:'🚰',price:2999,unit:'db'},
    {aliases:['sportpalack','sport palack','biciklis kulacs','kerékpáros kulacs','kerekparos kulacs'],label:'Sportpalack',category:'Háztartás',icon:'🚴',price:2999,unit:'db'},
    {aliases:['termosz','termosz palack','vákuumtermosz','vakuumtermosz'],label:'Termosz',category:'Háztartás',icon:'🫗',price:5999,unit:'db'},
    {aliases:['ételtermosz','eteltermosz','étel termosz','etel termosz'],label:'Ételtermosz',category:'Háztartás',icon:'🍲',price:6999,unit:'db'},
    {aliases:['shaker','protein shaker','fehérje shaker','feherje shaker'],label:'Shaker',category:'Háztartás',icon:'🥤',price:2499,unit:'db'},
    {aliases:['szívószálas kulacs','szivoszalas kulacs','szívószálas palack','szivoszalas palack'],label:'Szívószálas kulacs',category:'Háztartás',icon:'🥤',price:3499,unit:'db'},
    {aliases:['kulacstartó','kulacstarto','kulacs tartó','kulacs tarto'],label:'Kulacstartó',category:'Háztartás',icon:'🚰',price:1999,unit:'db'},
    {aliases:['kulacskefe','kulacs kefe','palackkefe','palack kefe'],label:'Kulacskefe',category:'Háztartás',icon:'🧽',price:1299,unit:'db'}
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
      family:'kitchenware-hydration',
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

  // A már listában lévő Egyéb / 699 Ft fallback tételek helyrerakása.
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
