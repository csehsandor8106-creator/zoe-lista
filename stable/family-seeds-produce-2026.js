(() => {
  'use strict';

  // Zoé Lista – vetőmagok, ültetési szaporítóanyagok és ritkább zöldségek.
  // A vetőmagok alapértelmezett egysége csomag; kg csak valóban tömegre vásárolt
  // szaporítóanyagnál (pl. dughagyma, vetőburgonya). A saját ár/tanítás mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260822;

  const seed = (aliases,label,icon='🌱',price=599) => ({
    aliases,label,category:'Háztartás',icon,price,unit:'csomag',forceDefaultUnit:true
  });
  const growKg = (aliases,label,icon,price) => ({
    aliases,label,category:'Háztartás',icon,price,unit:'kg',forceDefaultUnit:true
  });
  const vegKg = (aliases,label,icon,price) => ({
    aliases,label,category:'Zöldség-gyümölcs',icon,price,unit:'kg',legacyDbToDefault:true
  });

  const RULES = [
    // ÁLTALÁNOS VETŐMAG – ha nincs pontosabb növény megadva
    seed(['vetőmag','vetomag','zöldség vetőmag','zoldseg vetomag','kerti vetőmag','kerti vetomag'],'Vetőmag','🌱',599),

    // GYÖKÉR- ÉS HAGYMAFÉLÉK VETŐMAGJAI – csomag, nem kg
    seed(['vetőmag sárgarépa','vetomag sargarepa','sárgarépa vetőmag','sargarepa vetomag','sárgarépamag','sargarepamag','sárgarépa mag','sargarepa mag'],'Sárgarépa vetőmag','🥕',499),
    seed(['vetőmag petrezselyem','vetomag petrezselyem','petrezselyem vetőmag','petrezselyem vetomag','petrezselyemmag','petrezselyem mag'],'Petrezselyem vetőmag','🌿',499),
    seed(['vetőmag retek','vetomag retek','retek vetőmag','retek vetomag','retekmag','retek mag'],'Retek vetőmag','🌱',449),
    seed(['vetőmag cékla','vetomag cekla','cékla vetőmag','cekla vetomag','céklamag','ceklamag','cékla mag','cekla mag'],'Cékla vetőmag','🌱',499),
    seed(['vetőmag paszternák','vetomag paszternak','paszternák vetőmag','paszternak vetomag','paszternákmag','paszternakmag'],'Paszternák vetőmag','🌱',549),
    seed(['vetőmag zeller','vetomag zeller','zeller vetőmag','zeller vetomag','zellermag','zeller mag'],'Zeller vetőmag','🌿',599),
    seed(['vetőmag vöröshagyma','vetomag voroshagyma','vöröshagyma vetőmag','voroshagyma vetomag','hagymamag','hagyma mag'],'Vöröshagyma vetőmag','🧅',499),
    seed(['vetőmag póréhagyma','vetomag porehagyma','póréhagyma vetőmag','porehagyma vetomag','póréhagymamag','porehagymamag'],'Póréhagyma vetőmag','🧅',599),

    // TERMÉSZETESEN KG-RA IS VÁSÁROLT ÜLTETÉSI ANYAGOK
    growKg(['dughagyma','ültetőhagyma','ultetohagyma','hagymadughagyma'],'Dughagyma','🧅',1499),
    growKg(['vetőburgonya','vetoburgonya','vető krumpli','veto krumpli','ültetőburgonya','ultetoburgonya','ültető krumpli','ulteto krumpli'],'Vetőburgonya','🥔',899),
    growKg(['dugfokhagyma','dug fokhagyma','ültető fokhagyma','ulteto fokhagyma','vetőfokhagyma','vetofokhagyma'],'Ültető fokhagyma','🧄',2499),

    // KABAKOSOK – vetőmag mindig csomag
    seed(['vetőmag cukkini','vetomag cukkini','vetőmag cukkíni','cukkini vetőmag','cukkini vetomag','cukkínimag','cukkinimag','cukkini mag'],'Cukkini vetőmag','🥒',599),
    seed(['vetőmag csillagtök','vetomag csillagtok','csillagtök vetőmag','csillagtok vetomag','csillagtökmag','csillagtokmag','patiszon vetőmag','patiszon vetomag','patiszonmag'],'Csillagtök / patiszon vetőmag','🎃',599),
    seed(['vetőmag tök','vetomag tok','tök vetőmag','tok vetomag','tökmag vetéshez','tokmag veteshez'],'Tök vetőmag','🎃',599),
    seed(['vetőmag sütőtök','vetomag sutotok','sütőtök vetőmag','sutotok vetomag','sütőtökmag','sutotokmag'],'Sütőtök vetőmag','🎃',649),
    seed(['vetőmag uborka','vetomag uborka','uborka vetőmag','uborka vetomag','uborkamag','uborka mag'],'Uborka vetőmag','🥒',599),
    seed(['vetőmag görögdinnye','vetomag gorogdinnye','görögdinnye vetőmag','gorogdinnye vetomag','dinnyemag vetéshez','dinnyemag veteshez'],'Görögdinnye vetőmag','🍉',699),
    seed(['vetőmag sárgadinnye','vetomag sargadinnye','sárgadinnye vetőmag','sargadinnye vetomag'],'Sárgadinnye vetőmag','🍈',699),

    // PARADICSOM / PAPRIKA / TOJÁSGYÜMÖLCS
    seed(['vetőmag paradicsom','vetomag paradicsom','paradicsom vetőmag','paradicsom vetomag','paradicsommag','paradicsom mag'],'Paradicsom vetőmag','🍅',599),
    seed(['vetőmag koktélparadicsom','vetomag koktelparadicsom','koktélparadicsom vetőmag','koktelparadicsom vetomag'],'Koktélparadicsom vetőmag','🍅',699),
    seed(['vetőmag paprika','vetomag paprika','paprika vetőmag','paprika vetomag','paprikamag','paprika mag'],'Paprika vetőmag','🫑',599),
    seed(['vetőmag chili','vetomag chili','chili vetőmag','chili vetomag','chilipaprika vetőmag','chilipaprika vetomag'],'Chilipaprika vetőmag','🌶️',699),
    seed(['vetőmag padlizsán','vetomag padlizsan','padlizsán vetőmag','padlizsan vetomag','padlizsánmag','padlizsanmag'],'Padlizsán vetőmag','🍆',599),

    // LEVÉLZÖLDSÉGEK / KÁPOSZTAFÉLÉK
    seed(['vetőmag saláta','vetomag salata','saláta vetőmag','salata vetomag','salátamag','salatamag'],'Saláta vetőmag','🥬',499),
    seed(['vetőmag spenót','vetomag spenot','spenót vetőmag','spenot vetomag','spenótmag','spenotmag'],'Spenót vetőmag','🥬',499),
    seed(['vetőmag mángold','vetomag mangold','mángold vetőmag','mangold vetomag'],'Mángold vetőmag','🥬',599),
    seed(['vetőmag káposzta','vetomag kaposzta','káposzta vetőmag','kaposzta vetomag','káposztamag','kaposztamag'],'Káposzta vetőmag','🥬',599),
    seed(['vetőmag kelkáposzta','vetomag kelkaposzta','kelkáposzta vetőmag','kelkaposzta vetomag'],'Kelkáposzta vetőmag','🥬',599),
    seed(['vetőmag brokkoli','vetomag brokkoli','brokkoli vetőmag','brokkoli vetomag'],'Brokkoli vetőmag','🥦',599),
    seed(['vetőmag karfiol','vetomag karfiol','karfiol vetőmag','karfiol vetomag'],'Karfiol vetőmag','🥦',599),
    seed(['vetőmag karalábé','vetomag karalabe','karalábé vetőmag','karalabe vetomag'],'Karalábé vetőmag','🥬',599),
    seed(['vetőmag kelbimbó','vetomag kelbimbo','kelbimbó vetőmag','kelbimbo vetomag'],'Kelbimbó vetőmag','🥬',649),

    // HÜVELYESEK / KUKORICA
    seed(['vetőmag zöldborsó','vetomag zoldborso','zöldborsó vetőmag','zoldborso vetomag','borsó vetőmag','borso vetomag','vetőborsó','vetoborso'],'Borsó vetőmag','🫛',699),
    seed(['vetőmag zöldbab','vetomag zoldbab','zöldbab vetőmag','zoldbab vetomag','bab vetőmag','bab vetomag','vetőbab','vetobab'],'Bab vetőmag','🫘',799),
    seed(['vetőmag csemegekukorica','vetomag csemegekukorica','csemegekukorica vetőmag','csemegekukorica vetomag','kukorica vetőmag','kukorica vetomag'],'Csemegekukorica vetőmag','🌽',799),

    // FŰSZER- ÉS GYÓGYNÖVÉNYMAGOK
    seed(['vetőmag bazsalikom','vetomag bazsalikom','bazsalikom vetőmag','bazsalikom vetomag','bazsalikommag'],'Bazsalikom vetőmag','🌿',499),
    seed(['vetőmag kapor','vetomag kapor','kapor vetőmag','kapor vetomag','kapormag'],'Kapor vetőmag','🌿',449),
    seed(['vetőmag koriander','vetomag koriander','koriander vetőmag','koriander vetomag','koriandermag'],'Koriander vetőmag','🌿',499),
    seed(['vetőmag metélőhagyma','vetomag metelohagyma','metélőhagyma vetőmag','metelohagyma vetomag'],'Metélőhagyma vetőmag','🌿',499),
    seed(['vetőmag oregánó','vetomag oregano','oregánó vetőmag','oregano vetomag'],'Oregánó vetőmag','🌿',549),
    seed(['vetőmag kakukkfű','vetomag kakukkfu','kakukkfű vetőmag','kakukkfu vetomag'],'Kakukkfű vetőmag','🌿',549),
    seed(['vetőmag levendula','vetomag levendula','levendula vetőmag','levendula vetomag'],'Levendula vetőmag','🪻',699),

    // VIRÁGMAGOK
    seed(['virágmag','viragmag','virág vetőmag','virag vetomag'],'Virágmag','🌼',599),
    seed(['vetőmag napraforgó','vetomag napraforgo','napraforgó vetőmag','napraforgo vetomag','napraforgómag vetéshez','napraforgomag veteshez'],'Napraforgó vetőmag','🌻',599),
    seed(['vetőmag körömvirág','vetomag koromvirag','körömvirág vetőmag','koromvirag vetomag'],'Körömvirág vetőmag','🌼',499),
    seed(['vetőmag bársonyvirág','vetomag barsonyvirag','büdöske vetőmag','budoske vetomag'],'Bársonyvirág vetőmag','🌼',499),
    seed(['vetőmag petúnia','vetomag petunia','petúnia vetőmag','petunia vetomag'],'Petúnia vetőmag','🌸',599),
    seed(['vetőmag rézvirág','vetomag rezvirag','rézvirág vetőmag','rezvirag vetomag','zinnia vetőmag','zinnia vetomag'],'Rézvirág vetőmag','🌸',549),
    seed(['vetőmag sarkantyúka','vetomag sarkantyuka','sarkantyúka vetőmag','sarkantyuka vetomag'],'Sarkantyúka vetőmag','🌼',599),

    // RITKÁBB ZÖLDSÉGEK – önmagukban ételként, nem vetőmagként
    vegKg(['csillagtök','csillagtok','patiszon','patisszon'],'Csillagtök / patiszon','🎃',899),
    vegKg(['cukkini','cukkíni'],'Cukkini','🥒',999),
    vegKg(['padlizsán','padlizsan'],'Padlizsán','🍆',1299),
    vegKg(['mángold','mangold'],'Mángold','🥬',1499)
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
      family:'seeds-produce',
      builtinVersion:FAMILY_VERSION
    };

    const aliases = [...entry.aliases, entry.label];
    for (const alias of aliases) {
      const key = normalize(alias);
      if (!key) continue;
      exactRules[key] = {
        ...rule,
        legacyDbToDefault:!!entry.legacyDbToDefault,
        forceDefaultUnit:!!entry.forceDefaultUnit
      };
      const previous = learned[key];
      if (!previous || previous.builtinCatalog) learned[key] = {...rule};
    }
  }

  try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}

  // Korábban félreismert becsült tételek javítása.
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

    // Vetőmagoknál a korábbi téves kg/db egységet is határozottan javítjuk.
    // A dughagyma/vetőburgonya/ültető fokhagyma szabály eleve kg-ra mutat.
    if (rule.forceDefaultUnit && item.unit !== rule.unit) {
      item.unit = rule.unit;
      stateChanged = true;
    } else if (wasLegacyDb && rule.legacyDbToDefault && rule.unit !== 'db') {
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
