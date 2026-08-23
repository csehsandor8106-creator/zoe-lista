(() => {
  'use strict';

  // Zoé Lista – magazinok/könyvek és olvasószemüveg-optika családbővítés.
  // A felhasználó saját ára és saját tanítása mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260822;

  const RULES = [
    // MAGAZINOK / ÚJSÁGOK / PERIODIKÁK
    {aliases:['magazin','magazine'],label:'Magazin',category:'Háztartás',icon:'📰',price:1499,unit:'db',legacyDbToDefault:true},
    {aliases:['női magazin','noi magazin'],label:'Női magazin',category:'Háztartás',icon:'📰',price:1299,unit:'db'},
    {aliases:['gasztro magazin','gasztromagazin','receptmagazin','recept magazin'],label:'Gasztromagazin',category:'Háztartás',icon:'📰',price:1499,unit:'db'},
    {aliases:['tech magazin','technológiai magazin','technologiai magazin','számítástechnikai magazin','szamitastechnikai magazin'],label:'Technológiai magazin',category:'Háztartás',icon:'📰',price:1799,unit:'db'},
    {aliases:['autós magazin','autos magazin','autómagazin','automagazin'],label:'Autós magazin',category:'Háztartás',icon:'📰',price:1699,unit:'db'},
    {aliases:['horgász magazin','horgasz magazin','horgászújság','horgaszujsag'],label:'Horgászmagazin',category:'Háztartás',icon:'📰',price:1499,unit:'db'},
    {aliases:['kertészeti magazin','kerteszeti magazin','kertmagazin','kert magazin'],label:'Kertészeti magazin',category:'Háztartás',icon:'📰',price:1499,unit:'db'},
    {aliases:['lakberendezési magazin','lakberendezesi magazin','otthon magazin'],label:'Lakberendezési magazin',category:'Háztartás',icon:'📰',price:1699,unit:'db'},
    {aliases:['újság','ujsag','napilap','napi lap'],label:'Napilap',category:'Háztartás',icon:'🗞️',price:699,unit:'db'},
    {aliases:['hetilap','heti lap'],label:'Hetilap',category:'Háztartás',icon:'🗞️',price:999,unit:'db'},
    {aliases:['tv újság','tv ujsag','tv műsorújság','tv musorujsag','műsorújság','musorujsag'],label:'TV-műsorújság',category:'Háztartás',icon:'📺',price:799,unit:'db'},
    {aliases:['rejtvényújság','rejtvenyujsag','rejtvény magazin','rejtveny magazin','keresztrejtvény újság','keresztrejtveny ujsag'],label:'Rejtvényújság',category:'Háztartás',icon:'🧩',price:899,unit:'db'},
    {aliases:['sudoku magazin','sudoku újság','sudoku ujsag'],label:'Sudoku magazin',category:'Háztartás',icon:'🔢',price:899,unit:'db'},
    {aliases:['képregény','kepregeny','comic','comics'],label:'Képregény',category:'Háztartás',icon:'💬',price:1999,unit:'db'},

    // KÖNYVEK / REGÉNYEK
    {aliases:['regény','regeny','novel'],label:'Regény',category:'Háztartás',icon:'📖',price:4999,unit:'db',legacyDbToDefault:true},
    {aliases:['könyv','konyv'],label:'Könyv',category:'Háztartás',icon:'📚',price:4999,unit:'db'},
    {aliases:['puhatáblás könyv','puhatablas konyv','puhafedeles könyv','puhafedeles konyv','paperback'],label:'Puhatáblás könyv',category:'Háztartás',icon:'📖',price:3999,unit:'db'},
    {aliases:['keménytáblás könyv','kemenytablas konyv','keményfedeles könyv','kemenyfedeles konyv','hardcover'],label:'Keménytáblás könyv',category:'Háztartás',icon:'📕',price:5999,unit:'db'},
    {aliases:['krimi','krimiregény','krimiregeny','bűnügyi regény','bunugyi regeny'],label:'Krimi',category:'Háztartás',icon:'🔎',price:4999,unit:'db'},
    {aliases:['thriller','thriller regény','thriller regeny'],label:'Thriller',category:'Háztartás',icon:'📖',price:4999,unit:'db'},
    {aliases:['romantikus regény','romantikus regeny','szerelmes regény','szerelmes regeny'],label:'Romantikus regény',category:'Háztartás',icon:'💕',price:4999,unit:'db'},
    {aliases:['fantasy','fantasy regény','fantasy regeny','fantasy könyv','fantasy konyv'],label:'Fantasy könyv',category:'Háztartás',icon:'🐉',price:5499,unit:'db'},
    {aliases:['sci-fi','sci fi','sci-fi regény','sci fi regeny','science fiction'],label:'Sci-fi könyv',category:'Háztartás',icon:'🚀',price:5499,unit:'db'},
    {aliases:['történelmi regény','tortenelmi regeny'],label:'Történelmi regény',category:'Háztartás',icon:'🏰',price:5499,unit:'db'},
    {aliases:['klasszikus regény','klasszikus regeny','klasszikus könyv','klasszikus konyv'],label:'Klasszikus regény',category:'Háztartás',icon:'📜',price:3999,unit:'db'},
    {aliases:['novelláskötet','novellaskotet','novella kötet','novella kotet'],label:'Novelláskötet',category:'Háztartás',icon:'📖',price:4499,unit:'db'},
    {aliases:['verseskötet','verseskotet','verses kötet','verses kotet'],label:'Verseskötet',category:'Háztartás',icon:'📜',price:3999,unit:'db'},
    {aliases:['szakácskönyv','szakacskonyv','receptkönyv','receptkonyv'],label:'Szakácskönyv',category:'Háztartás',icon:'👨‍🍳',price:5999,unit:'db'},
    {aliases:['gyerekkönyv','gyerekkonyv','gyermekkönyv','gyermekkonyv'],label:'Gyerekkönyv',category:'Háztartás',icon:'📚',price:3999,unit:'db'},
    {aliases:['mesekönyv','mesekonyv'],label:'Mesekönyv',category:'Háztartás',icon:'🧚',price:3499,unit:'db'},
    {aliases:['színező','szinezo','színezőkönyv','szinezokonyv'],label:'Színezőkönyv',category:'Háztartás',icon:'🖍️',price:1999,unit:'db'},
    {aliases:['foglalkoztató könyv','foglalkoztato konyv','foglalkoztató','foglalkoztato'],label:'Foglalkoztató könyv',category:'Háztartás',icon:'✏️',price:2499,unit:'db'},
    {aliases:['atlasz','világatlasz','vilagatlasz'],label:'Atlasz',category:'Háztartás',icon:'🌍',price:5999,unit:'db'},
    {aliases:['szótár','szotar','kéziszótár','keziszotar'],label:'Szótár',category:'Háztartás',icon:'📘',price:6999,unit:'db'},
    {aliases:['útikönyv','utikonyv','útikalauz','utikalauz','travel guide'],label:'Útikönyv',category:'Háztartás',icon:'🗺️',price:4999,unit:'db'},

    // OLVASÓSZEMÜVEG / OPTIKAI KIEGÉSZÍTŐK
    {aliases:['olvasószemüveg','olvasoszemuveg','olvasó szemüveg','olvaso szemuveg','reading glasses'],label:'Olvasószemüveg',category:'Ruházat',icon:'👓',price:3499,unit:'db',legacyDbToDefault:true},
    {aliases:['+1 olvasószemüveg','+1 olvasoszemuveg','1 dioptriás olvasószemüveg','1 dioptrias olvasoszemuveg'],label:'Olvasószemüveg +1,0',category:'Ruházat',icon:'👓',price:3499,unit:'db'},
    {aliases:['+1.5 olvasószemüveg','+1,5 olvasószemüveg','+1.5 olvasoszemuveg','+1,5 olvasoszemuveg','1.5 dioptriás olvasószemüveg','1,5 dioptriás olvasószemüveg'],label:'Olvasószemüveg +1,5',category:'Ruházat',icon:'👓',price:3499,unit:'db'},
    {aliases:['+2 olvasószemüveg','+2 olvasoszemuveg','2 dioptriás olvasószemüveg','2 dioptrias olvasoszemuveg'],label:'Olvasószemüveg +2,0',category:'Ruházat',icon:'👓',price:3499,unit:'db'},
    {aliases:['+2.5 olvasószemüveg','+2,5 olvasószemüveg','+2.5 olvasoszemuveg','+2,5 olvasoszemuveg','2.5 dioptriás olvasószemüveg','2,5 dioptriás olvasószemüveg'],label:'Olvasószemüveg +2,5',category:'Ruházat',icon:'👓',price:3499,unit:'db'},
    {aliases:['+3 olvasószemüveg','+3 olvasoszemuveg','3 dioptriás olvasószemüveg','3 dioptrias olvasoszemuveg'],label:'Olvasószemüveg +3,0',category:'Ruházat',icon:'👓',price:3499,unit:'db'},
    {aliases:['kékfényszűrő szemüveg','kekfenyszuro szemuveg','kék fény szűrő szemüveg','kek feny szuro szemuveg','blue light glasses'],label:'Kékfényszűrő szemüveg',category:'Ruházat',icon:'👓',price:4999,unit:'db'},
    {aliases:['számítógépes szemüveg','szamitogepes szemuveg','monitor szemüveg','monitor szemuveg'],label:'Számítógépes szemüveg',category:'Ruházat',icon:'👓',price:4999,unit:'db'},
    {aliases:['szemüvegtok','szemuvegtok','szemüveg tok','szemuveg tok'],label:'Szemüvegtok',category:'Ruházat',icon:'👓',price:1999,unit:'db'},
    {aliases:['szemüvegtörlő','szemuvegtorlo','szemüvegtörlő kendő','szemuvegtorlo kendo','mikroszálas szemüvegkendő','mikroszalas szemuvegkendo'],label:'Szemüvegtörlő kendő',category:'Ruházat',icon:'🧻',price:699,unit:'db'},
    {aliases:['szemüvegtisztító','szemuvegtisztito','szemüvegtisztító spray','szemuvegtisztito spray'],label:'Szemüvegtisztító',category:'Ruházat',icon:'🧴',price:1299,unit:'db'},
    {aliases:['szemüveglánc','szemuveglanc','szemüveg lánc','szemuveg lanc'],label:'Szemüveglánc',category:'Ruházat',icon:'🔗',price:1499,unit:'db'},
    {aliases:['nagyító','nagyito','olvasónagyító','olvasonagyito'],label:'Nagyító',category:'Ruházat',icon:'🔍',price:2499,unit:'db'}
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
      family:'reading-media-optics',
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

  // Régi Egyéb/699 Ft becslések migrálása az új családi szabályokra.
  let state = [];
  try { state = JSON.parse(localStorage.getItem(STATE_KEY)) || []; } catch { state = []; }
  let stateChanged = false;

  for (const item of state) {
    if (!item || !['estimate','estimate-unit','unknown'].includes(item.source)) continue;
    const entry = exactRules[normalize(item.name)];
    if (!entry) continue;

    const wasFallback = item.category === 'Egyéb' || item.price === 699 || item.source === 'unknown';
    if (!wasFallback && !entry.legacyDbToDefault) continue;

    if (item.name !== entry.label) { item.name = entry.label; stateChanged = true; }
    if (item.category !== entry.category) { item.category = entry.category; stateChanged = true; }
    if (item.icon !== entry.icon) { item.icon = entry.icon; stateChanged = true; }
    if (item.unit !== entry.unit) { item.unit = entry.unit; stateChanged = true; }
    if (item.price !== entry.price) { item.price = entry.price; stateChanged = true; }
    if (item.source !== 'estimate') { item.source = 'estimate'; stateChanged = true; }
  }

  if (stateChanged) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
  }
})();
