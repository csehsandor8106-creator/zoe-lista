(() => {
  'use strict';

  // Zoé Lista – kert/növényápolás és szépségápolás családbővítés.
  // A felhasználó saját tanítása és saját ára mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const FAMILY_VERSION = 20260822;

  const RULES = [
    // KERT / NÖVÉNYÁPOLÁS – TÁPANYAGOK
    {aliases:['műtrágya','mutragya','mű trágya','mu tragya'],label:'Műtrágya',category:'Háztartás',icon:'🌱',price:2499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['szerves trágya','szerves tragya','organikus trágya','organikus tragya'],label:'Szerves trágya',category:'Háztartás',icon:'🌱',price:2499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['granulált műtrágya','granulalt mutragya','granulátum műtrágya','granulatum mutragya'],label:'Granulált műtrágya',category:'Háztartás',icon:'🌱',price:2999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['növénytáp','novenytap','növény táp','noveny tap'],label:'Növénytáp',category:'Háztartás',icon:'🪴',price:1699,unit:'db'},
    {aliases:['tápoldat','tapoldat','növénytápoldat','novenytapoldat'],label:'Tápoldat',category:'Háztartás',icon:'🪴',price:1499,unit:'db'},
    {aliases:['virágtáp','viragtap','virág táp','virag tap','virágtápoldat','viragtapoldat'],label:'Virágtáp',category:'Háztartás',icon:'🌸',price:1499,unit:'db'},
    {aliases:['orchidea táp','orchidea tap','orchideatáp','orchideatap','orchidea tápoldat','orchidea tapoldat'],label:'Orchidea táp',category:'Háztartás',icon:'🌸',price:1599,unit:'db'},
    {aliases:['muskátli táp','muskatli tap','muskátlitáp','muskatlitap'],label:'Muskátli táp',category:'Háztartás',icon:'🌺',price:1499,unit:'db'},
    {aliases:['paradicsom táp','paradicsom tap','zöldségtáp','zoldsegtap','zöldség táp','zoldseg tap'],label:'Zöldségtáp',category:'Háztartás',icon:'🍅',price:1699,unit:'db'},
    {aliases:['gyeptrágya','gyeptragya','gyep trágya','gyep tragya','fűtrágya','futragya','fű trágya','fu tragya'],label:'Gyeptrágya',category:'Háztartás',icon:'🌿',price:3999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['marhatrágya','marhatragya','marha trágya','marha tragya','szárított marhatrágya','szaritott marhatragya'],label:'Marhatrágya',category:'Háztartás',icon:'🌱',price:2999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['csirketrágya','csirketragya','csirketrágya pellet','csirketragya pellet'],label:'Csirketrágya pellet',category:'Háztartás',icon:'🌱',price:2999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['komposzt','kerti komposzt'],label:'Komposzt',category:'Háztartás',icon:'🌱',price:2299,unit:'csomag',legacyDbToDefault:true},

    // KERT / NÖVÉNYÁPOLÁS – ÜLTETÉS ÉS GYEP
    {aliases:['fűmag','fumag','fű mag','fu mag','gyepmag','gyep mag'],label:'Fűmag',category:'Háztartás',icon:'🌾',price:2999,unit:'csomag',legacyDbToDefault:true},
    {aliases:['árnyéktűrő fűmag','arnyekturo fumag','sport fűmag','sport fumag'],label:'Speciális fűmag',category:'Háztartás',icon:'🌾',price:3499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['kéregmulcs','keregmulcs','kéreg mulcs','kereg mulcs','fenyőkéreg','fenyokereg'],label:'Kéregmulcs',category:'Háztartás',icon:'🌳',price:2499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['mulcs','kerti mulcs'],label:'Mulcs',category:'Háztartás',icon:'🌳',price:2299,unit:'csomag',legacyDbToDefault:true},
    {aliases:['perlit','kertészeti perlit','kerteszeti perlit'],label:'Perlit',category:'Háztartás',icon:'🪴',price:1499,unit:'csomag',legacyDbToDefault:true},
    {aliases:['agyaggranulátum','agyaggranulatum','agyag granulátum','agyag granulatum'],label:'Agyaggranulátum',category:'Háztartás',icon:'🪴',price:1799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['virágcserép','viragcserep','virág cserép','virag cserep','cserép','cserep'],label:'Virágcserép',category:'Háztartás',icon:'🪴',price:999,unit:'db'},
    {aliases:['kaspó','kaspo','virágkaspó','viragkaspo'],label:'Kaspó',category:'Háztartás',icon:'🪴',price:1499,unit:'db'},
    {aliases:['locsolókanna','locsolokanna','öntözőkanna','ontozokanna'],label:'Locsolókanna',category:'Háztartás',icon:'🚿',price:1999,unit:'db'},
    {aliases:['metszőolló','metszoollo','metsző olló','metszo ollo'],label:'Metszőolló',category:'Háztartás',icon:'✂️',price:2999,unit:'db'},
    {aliases:['kerti kesztyű','kerti kesztyu','kertészkesztyű','kerteszkesztyu'],label:'Kerti kesztyű',category:'Háztartás',icon:'🧤',price:1299,unit:'pár'},

    // SZEMSMINK
    {aliases:['szempillaspirál','szempillaspiral','szempilla spirál','szempilla spiral','mascara'],label:'Szempillaspirál',category:'Higiénia',icon:'👁️',price:2499,unit:'db'},
    {aliases:['vízálló szempillaspirál','vizallo szempillaspiral','waterproof mascara'],label:'Vízálló szempillaspirál',category:'Higiénia',icon:'👁️',price:2799,unit:'db'},
    {aliases:['szempillagöndörítő','szempillagondorito','szempilla göndörítő','szempilla gondorito'],label:'Szempillagöndörítő',category:'Higiénia',icon:'👁️',price:1999,unit:'db'},
    {aliases:['műszempilla','muszempilla','mű szempilla','mu szempilla'],label:'Műszempilla',category:'Higiénia',icon:'👁️',price:1799,unit:'csomag',legacyDbToDefault:true},
    {aliases:['műszempilla ragasztó','muszempilla ragaszto','szempillaragasztó','szempillaragaszto'],label:'Műszempilla-ragasztó',category:'Higiénia',icon:'👁️',price:1699,unit:'db'},
    {aliases:['szemceruza','szem ceruza','eye pencil'],label:'Szemceruza',category:'Higiénia',icon:'✏️',price:1499,unit:'db'},
    {aliases:['szemhéjtus','szemhejtus','tus szemre','eyeliner'],label:'Szemhéjtus',category:'Higiénia',icon:'👁️',price:1999,unit:'db'},
    {aliases:['szemhéjpúder','szemhejpuder','szemhéj púder','szemhej puder','szemfesték','szemfestek'],label:'Szemhéjpúder',category:'Higiénia',icon:'🎨',price:2499,unit:'db'},
    {aliases:['szemöldökceruza','szemoldokceruza','szemöldök ceruza','szemoldok ceruza'],label:'Szemöldökceruza',category:'Higiénia',icon:'✏️',price:1699,unit:'db'},
    {aliases:['szemöldökzselé','szemoldokzsele','szemöldök gél','szemoldok gel'],label:'Szemöldökzselé',category:'Higiénia',icon:'👁️',price:1999,unit:'db'},

    // AJAKSMINK
    {aliases:['rúzs','ruzs','ajakrúzs','ajakruzs','lipstick'],label:'Rúzs',category:'Higiénia',icon:'💄',price:1999,unit:'db'},
    {aliases:['folyékony rúzs','folyekony ruzs','liquid lipstick'],label:'Folyékony rúzs',category:'Higiénia',icon:'💄',price:2299,unit:'db'},
    {aliases:['szájfény','szajfeny','ajakfény','ajakfeny','lip gloss','lipgloss'],label:'Szájfény',category:'Higiénia',icon:'💋',price:1799,unit:'db'},
    {aliases:['ajakbalzsam','ajak balzsam','lip balm','lipbalm'],label:'Ajakbalzsam',category:'Higiénia',icon:'💋',price:1299,unit:'db'},
    {aliases:['ajakkontúr ceruza','ajakkontur ceruza','szájkontúr ceruza','szajkontur ceruza','lip liner'],label:'Ajakkontúr ceruza',category:'Higiénia',icon:'✏️',price:1499,unit:'db'},

    // ARCSMINK
    {aliases:['alapozó','alapozo','foundation'],label:'Alapozó',category:'Higiénia',icon:'🧴',price:3499,unit:'db'},
    {aliases:['korrektor','concealer'],label:'Korrektor',category:'Higiénia',icon:'🧴',price:2499,unit:'db'},
    {aliases:['púder','puder','arcpúder','arcpuder'],label:'Púder',category:'Higiénia',icon:'🪞',price:2499,unit:'db'},
    {aliases:['pirosító','pirosito','blush'],label:'Pirosító',category:'Higiénia',icon:'🌸',price:2299,unit:'db'},
    {aliases:['bronzosító','bronzosito','bronzer'],label:'Bronzosító',category:'Higiénia',icon:'🪞',price:2499,unit:'db'},
    {aliases:['highlighter','kiemelő púder','kiemelo puder'],label:'Highlighter',category:'Higiénia',icon:'✨',price:2499,unit:'db'},

    // SMINKESZKÖZÖK ÉS LEMOSÁS
    {aliases:['sminklemosó','sminklemoso','smink lemosó','smink lemoso'],label:'Sminklemosó',category:'Higiénia',icon:'🧴',price:1799,unit:'db'},
    {aliases:['micellás víz','micellas viz','micellásvíz','micellasviz'],label:'Micellás víz',category:'Higiénia',icon:'🧴',price:1999,unit:'db'},
    {aliases:['sminkszivacs','smink szivacs','beauty blender','beautyblender'],label:'Sminkszivacs',category:'Higiénia',icon:'🧽',price:1299,unit:'db'},
    {aliases:['sminkecset','smink ecset','sminkecset készlet','sminkecset keszlet'],label:'Sminkecset',category:'Higiénia',icon:'🖌️',price:1999,unit:'db'},
    {aliases:['csipesz','szemöldökcsipesz','szemoldokcsipesz'],label:'Csipesz',category:'Higiénia',icon:'✂️',price:999,unit:'db'},
    {aliases:['körömlakk','koromlakk','köröm lakk','korom lakk','nail polish'],label:'Körömlakk',category:'Higiénia',icon:'💅',price:1499,unit:'db'},
    {aliases:['körömlakklemosó','koromlakklemoso','körömlakk lemosó','koromlakk lemoso'],label:'Körömlakklemosó',category:'Higiénia',icon:'💅',price:999,unit:'db'}
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
      family:'garden-beauty',
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

  // A korábbi Egyéb/db fallbackből létrejött becsült tételek helyrerakása.
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