(() => {
  'use strict';

  // Zoé Lista – hígítók/festési vegyszerek, powerbankok és mobil töltés családbővítése.
  // A felhasználó saját ára és saját tanítása mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260822;

  const RULES = [
    // HÍGÍTÓK / FESTÉSI VEGYSZEREK
    {aliases:['hígító','higito','festékhígító','festekhigito','festék hígító','festek higito'],label:'Hígító',category:'Háztartás',icon:'🧪',price:1999,unit:'l',legacyDbToDefault:true},
    {aliases:['nitrohígító','nitrohigito','nitro hígító','nitro higito'],label:'Nitrohígító',category:'Háztartás',icon:'🧪',price:2199,unit:'l',legacyDbToDefault:true},
    {aliases:['szintetikus hígító','szintetikus higito','szinti hígító','szinti higito'],label:'Szintetikus hígító',category:'Háztartás',icon:'🧪',price:1999,unit:'l',legacyDbToDefault:true},
    {aliases:['univerzális hígító','univerzalis higito','univerzál hígító','univerzal higito'],label:'Univerzális hígító',category:'Háztartás',icon:'🧪',price:2299,unit:'l',legacyDbToDefault:true},
    {aliases:['terpentin','terpentin hígító','terpentin higito'],label:'Terpentin',category:'Háztartás',icon:'🧪',price:2499,unit:'l',legacyDbToDefault:true},
    {aliases:['lakkbenzin','lakk benzin','white spirit'],label:'Lakkbenzin',category:'Háztartás',icon:'🧪',price:2199,unit:'l',legacyDbToDefault:true},
    {aliases:['aceton','acetone'],label:'Aceton',category:'Háztartás',icon:'🧪',price:2499,unit:'l',legacyDbToDefault:true},
    {aliases:['denaturált szesz','denaturalt szesz','denatszesz','denat szesz'],label:'Denaturált szesz',category:'Háztartás',icon:'🧪',price:2199,unit:'l',legacyDbToDefault:true},
    {aliases:['ecsetmosó','ecsetmoso','ecsettisztító','ecsettisztito'],label:'Ecsetmosó',category:'Háztartás',icon:'🖌️',price:1999,unit:'l',legacyDbToDefault:true},
    {aliases:['festéklemosó','festeklemoso','festék lemosó','festek lemoso','festékeltávolító','festekeltavolito'],label:'Festéklemosó',category:'Háztartás',icon:'🖌️',price:2999,unit:'db',legacyDbToDefault:true},
    {aliases:['rozsdaoldó','rozsdaoldo'],label:'Rozsdaoldó',category:'Háztartás',icon:'🧪',price:2499,unit:'db'},
    {aliases:['zsírtalanító','zsirtalanito','felülettisztító festéshez','felulettisztito festeshez'],label:'Zsírtalanító',category:'Háztartás',icon:'🧪',price:1999,unit:'db'},

    // POWERBANK / MOBIL ENERGIA
    {aliases:['powerbank','power bank','külső akkumulátor','kulso akkumulator','külső aksi','kulso aksi'],label:'Powerbank',category:'Háztartás',icon:'🔋',price:9990,unit:'db',legacyDbToDefault:true},
    {aliases:['5000 mah powerbank','powerbank 5000','5000mah powerbank'],label:'Powerbank 5000 mAh',category:'Háztartás',icon:'🔋',price:6990,unit:'db'},
    {aliases:['10000 mah powerbank','powerbank 10000','10000mah powerbank'],label:'Powerbank 10 000 mAh',category:'Háztartás',icon:'🔋',price:9990,unit:'db'},
    {aliases:['20000 mah powerbank','powerbank 20000','20000mah powerbank'],label:'Powerbank 20 000 mAh',category:'Háztartás',icon:'🔋',price:14990,unit:'db'},
    {aliases:['30000 mah powerbank','powerbank 30000','30000mah powerbank'],label:'Powerbank 30 000 mAh',category:'Háztartás',icon:'🔋',price:19990,unit:'db'},
    {aliases:['magsafe powerbank','mágneses powerbank','magneses powerbank','vezeték nélküli powerbank','vezetek nelkuli powerbank'],label:'Mágneses powerbank',category:'Háztartás',icon:'🔋',price:14990,unit:'db'},
    {aliases:['napelemes powerbank','solar powerbank'],label:'Napelemes powerbank',category:'Háztartás',icon:'🔋',price:17990,unit:'db'},

    // TÖLTŐKÁBELEK / ADATKÁBELEK
    {aliases:['töltőkábel','toltokabel','töltő kábel','tolto kabel','telefon töltőkábel','telefon toltokabel'],label:'Töltőkábel',category:'Háztartás',icon:'🔌',price:2499,unit:'db',legacyDbToDefault:true},
    {aliases:['usb c kábel','usb-c kábel','usb c kabel','type c kábel','type-c kábel','type c kabel'],label:'USB-C kábel',category:'Háztartás',icon:'🔌',price:2499,unit:'db'},
    {aliases:['usb c usb c kábel','usb-c usb-c kábel','usb c to usb c','usb-c to usb-c','c to c kábel','c to c kabel'],label:'USB-C–USB-C kábel',category:'Háztartás',icon:'🔌',price:2999,unit:'db'},
    {aliases:['usb a usb c kábel','usb-a usb-c kábel','usb a to usb c','usb-a to usb-c'],label:'USB-A–USB-C kábel',category:'Háztartás',icon:'🔌',price:2499,unit:'db'},
    {aliases:['lightning kábel','lightning kabel','iphone kábel','iphone kabel'],label:'Lightning kábel',category:'Háztartás',icon:'🔌',price:3499,unit:'db'},
    {aliases:['usb c lightning kábel','usb-c lightning kábel','usb c lightning kabel'],label:'USB-C–Lightning kábel',category:'Háztartás',icon:'🔌',price:3999,unit:'db'},
    {aliases:['micro usb kábel','micro-usb kábel','micro usb kabel','mikro usb kábel','mikro usb kabel'],label:'Micro-USB kábel',category:'Háztartás',icon:'🔌',price:1999,unit:'db'},
    {aliases:['gyorstöltő kábel','gyorstolto kabel','gyors töltőkábel','gyors toltokabel','fast charge cable'],label:'Gyorstöltő kábel',category:'Háztartás',icon:'⚡',price:2999,unit:'db'},
    {aliases:['fonott kábel','fonott kabel','szövet kábel','szovet kabel','braided cable'],label:'Fonott töltőkábel',category:'Háztartás',icon:'🔌',price:2999,unit:'db'},
    {aliases:['1 m töltőkábel','1m töltőkábel','1m toltokabel'],label:'Töltőkábel 1 m',category:'Háztartás',icon:'🔌',price:2499,unit:'db'},
    {aliases:['2 m töltőkábel','2m töltőkábel','2m toltokabel'],label:'Töltőkábel 2 m',category:'Háztartás',icon:'🔌',price:3499,unit:'db'},

    // TÖLTŐFEJEK / ADAPTEREK
    {aliases:['telefontöltő','telefontolto','telefon töltő','telefon tolto','hálózati töltő','halozati tolto'],label:'Telefontöltő',category:'Háztartás',icon:'🔌',price:4999,unit:'db'},
    {aliases:['usb töltő','usb tolto','usb töltőfej','usb toltofej'],label:'USB töltőfej',category:'Háztartás',icon:'🔌',price:3999,unit:'db'},
    {aliases:['usb c töltő','usb-c töltő','usb c tolto','usb-c tolto','usb c töltőfej','usb c toltofej'],label:'USB-C töltőfej',category:'Háztartás',icon:'🔌',price:5999,unit:'db'},
    {aliases:['gyorstöltő','gyorstolto','gyors töltő','gyors tolto','fast charger'],label:'Gyorstöltő',category:'Háztartás',icon:'⚡',price:6999,unit:'db'},
    {aliases:['gan töltő','gan tolto','gan charger'],label:'GaN töltő',category:'Háztartás',icon:'⚡',price:9990,unit:'db'},
    {aliases:['autós töltő','autos tolto','szivargyújtós töltő','szivargyujtos tolto','car charger'],label:'Autós töltő',category:'Háztartás',icon:'🚗',price:4999,unit:'db'},
    {aliases:['vezeték nélküli töltő','vezetek nelkuli tolto','wireless charger','qi töltő','qi tolto'],label:'Vezeték nélküli töltő',category:'Háztartás',icon:'⚡',price:6999,unit:'db'},
    {aliases:['magsafe töltő','magsafe tolto','mágneses töltő','magneses tolto'],label:'Mágneses töltő',category:'Háztartás',icon:'⚡',price:9990,unit:'db'},
    {aliases:['töltőadapter','toltoadapter','töltő adapter','tolto adapter'],label:'Töltőadapter',category:'Háztartás',icon:'🔌',price:4999,unit:'db'},
    {aliases:['usb adapter','usb átalakító','usb atalakitó','usb atalakitó','usb atalakitó'],label:'USB adapter',category:'Háztartás',icon:'🔌',price:2999,unit:'db'},
    {aliases:['usb c adapter','usb-c adapter','type c adapter','type-c adapter'],label:'USB-C adapter',category:'Háztartás',icon:'🔌',price:3499,unit:'db'}
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
      family:'mobile-charging-paint',
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
