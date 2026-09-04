(() => {
  'use strict';

  // Zoé Lista – tesztelés közben kifogott, kurált katalógus-kiegészítések.
  // Csak a beépített katalógus szabályait írhatják felül; a felhasználó saját tanításait nem.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const STATE_KEY = 'zoe-lista-state-v1';
  const PATCH_VERSION = 8;

  const PATCHES = [
    {
      aliases:['tejszínhab','tejszinhab','spray tejszínhab','spray tejszinhab','hab spray','habspray'],
      label:'Tejszínhab',
      category:'Tejtermék és tojás',
      icon:'🍦',
      price:899,
      unit:'db'
    },
    {
      aliases:['piskótatallér','piskotataller','piskóta tallér','piskota taller','csokis piskótatallér','csokis piskotataller'],
      label:'Piskótatallér',
      category:'Snack és édesség',
      icon:'🍪',
      price:799,
      unit:'csomag'
    },
    {
      aliases:['zokni','cs zokni','csomag zokni','1 cs zokni','1 csomag zokni'],
      label:'Zokni',
      category:'Ruházat',
      icon:'🧦',
      price:1499,
      unit:'csomag'
    },
    {
      aliases:['kukorica csöves','kukorica csoves','csöves kukorica','csoves kukorica','kukorica, csöves','kukorica, csoves'],
      label:'Csöves kukorica',
      category:'Zöldség-gyümölcs',
      icon:'🌽',
      price:299,
      unit:'db'
    },
    {
      aliases:['fogpiszkáló','fogpiszkalo','fogniszkáló','fogniszkalo','fog piszkáló','fog piszkalo','toothpick'],
      label:'Fogpiszkáló',
      category:'Háztartás',
      icon:'🦷',
      price:399,
      unit:'csomag'
    },
    {
      aliases:['póló','polo','basic póló','basic polo','póló basic','polo basic','póló (basic)','polo (basic)','trikó','triko'],
      label:'Basic póló',
      category:'Ruházat',
      icon:'👕',
      price:2499,
      unit:'db'
    },
    {
      aliases:['gatya','alsónadrág','alsónadrag','alsó nadrág','also nadrag','boxer','boxeralsó','boxeralso','boxeralsó csomag'],
      label:'Alsónadrág',
      category:'Ruházat',
      icon:'🩲',
      price:2999,
      unit:'csomag'
    },
    {
      aliases:['fokhagyma'],
      label:'Fokhagyma',
      category:'Zöldség-gyümölcs',
      icon:'🧄',
      price:1999,
      unit:'kg',
      pricesByUnit:{kg:1999,db:199}
    },
    {
      aliases:['kaliforniai paprika','kaliforniai paprika kg'],
      label:'Kaliforniai paprika',
      category:'Zöldség-gyümölcs',
      icon:'🫑',
      price:1499,
      unit:'kg',
      pricesByUnit:{kg:1499,db:399}
    },
    {
      aliases:['kaliforniai paprika db','kaliforniai paprika darab'],
      label:'Kaliforniai paprika',
      category:'Zöldség-gyümölcs',
      icon:'🫑',
      price:399,
      unit:'db',
      pricesByUnit:{kg:1499,db:399},
      forceUnit:true
    },
    {
      aliases:['betét','betet','egészségügyi betét','egeszsegugyi betet','intim betét','intim betet','menstruációs betét','menstruacios betet','always betét','always betet','libresse betét','libresse betet','naturella betét','naturella betet'],
      label:'Egészségügyi betét',
      category:'Higiénia',
      icon:'🩸',
      price:1499,
      unit:'csomag'
    },
    {
      aliases:['nesquik','nesquick','nesqik','nesquik gabonapehely','nesquick gabonapehely','nesquik cereal'],
      label:'Nesquik gabonapehely',
      category:'Alapélelmiszer',
      icon:'🥣',
      price:1699,
      unit:'doboz'
    },
    {
      aliases:['chokapic','chocapic','chokapik','chokapic gabonapehely','chocapic gabonapehely'],
      label:'Chokapic gabonapehely',
      category:'Alapélelmiszer',
      icon:'🥣',
      price:1699,
      unit:'doboz'
    },
    {
      aliases:['savanyúkáposzta','savanyukaposzta','savanyú káposzta','savanyu kaposzta','savanyított káposzta','savanyitott kaposzta'],
      label:'Savanyú káposzta',
      category:'Zöldség-gyümölcs',
      icon:'🥬',
      price:699,
      unit:'csomag'
    },
    {
      aliases:['fánk','fank','donut','doughnut','lekváros fánk','lekvaros fank','csokis fánk','csokis fank'],
      label:'Fánk',
      category:'Pékáru',
      icon:'🍩',
      price:399,
      unit:'db'
    },

    // Gyakori sörmárkák – az egyszerű márkanév is sörként értelmezhető.
    {aliases:['gösser','gosser','gösser sör','gosser sor'],label:'Gösser sör',category:'Szeszes italok',icon:'🍺',price:449,unit:'db'},
    {aliases:['holsten','holsten sör','holsten sor'],label:'Holsten sör',category:'Szeszes italok',icon:'🍺',price:399,unit:'db'},
    {aliases:['soproni','soproni sör','soproni sor'],label:'Soproni sör',category:'Szeszes italok',icon:'🍺',price:399,unit:'db'},
    {aliases:['dreher','dreher sör','dreher sor'],label:'Dreher sör',category:'Szeszes italok',icon:'🍺',price:429,unit:'db'},
    {aliases:['borsodi','borsodi sör','borsodi sor'],label:'Borsodi sör',category:'Szeszes italok',icon:'🍺',price:379,unit:'db'},
    {aliases:['arany ászok','arany aszok','aranyászok','aranyaszok'],label:'Arany Ászok sör',category:'Szeszes italok',icon:'🍺',price:349,unit:'db'},
    {aliases:['kőbányai','kobanyai','kőbányai sör','kobanyai sor'],label:'Kőbányai sör',category:'Szeszes italok',icon:'🍺',price:349,unit:'db'},
    {aliases:['heineken','heineken sör','heineken sor'],label:'Heineken sör',category:'Szeszes italok',icon:'🍺',price:549,unit:'db'},
    {aliases:['stella artois','stella','stella sör','stella sor'],label:'Stella Artois sör',category:'Szeszes italok',icon:'🍺',price:549,unit:'db'},
    {aliases:["beck's",'becks','becks sör','becks sor'],label:"Beck's sör",category:'Szeszes italok',icon:'🍺',price:499,unit:'db'},
    {aliases:['carlsberg','carlsberg sör','carlsberg sor'],label:'Carlsberg sör',category:'Szeszes italok',icon:'🍺',price:499,unit:'db'},
    {aliases:['tuborg','tuborg sör','tuborg sor'],label:'Tuborg sör',category:'Szeszes italok',icon:'🍺',price:449,unit:'db'},
    {aliases:['kozel','kozel sör','kozel sor'],label:'Kozel sör',category:'Szeszes italok',icon:'🍺',price:449,unit:'db'},
    {aliases:['staropramen','staropramen sör','staropramen sor'],label:'Staropramen sör',category:'Szeszes italok',icon:'🍺',price:499,unit:'db'},
    {aliases:['pilsner urquell','pilsner urquell sör','pilsner urquell sor'],label:'Pilsner Urquell sör',category:'Szeszes italok',icon:'🍺',price:599,unit:'db'},
    {aliases:['corona','corona extra','corona sör','corona sor'],label:'Corona sör',category:'Szeszes italok',icon:'🍺',price:699,unit:'db'},
    {aliases:['peroni','peroni sör','peroni sor'],label:'Peroni sör',category:'Szeszes italok',icon:'🍺',price:599,unit:'db'},
    {aliases:['birra moretti','moretti','moretti sör','moretti sor'],label:'Birra Moretti sör',category:'Szeszes italok',icon:'🍺',price:599,unit:'db'},
    {aliases:['guinness','guinness sör','guinness sor'],label:'Guinness sör',category:'Szeszes italok',icon:'🍺',price:799,unit:'db'},

    // Üveges zöldségek, olívák és gyakori savanyúságok.
    {
      aliases:['olívabogyó','olivabogyo','olíva bogyó','oliva bogyo','zöld olívabogyó','zold olivabogyo','fekete olívabogyó','fekete olivabogyo','magozott olívabogyó','magozott olivabogyo','töltött olívabogyó','toltott olivabogyo'],
      label:'Olívabogyó',category:'Alapélelmiszer',icon:'🫒',price:899,unit:'üveg'
    },
    {aliases:['kapribogyó','kapribogyo','kapri bogyó','kapri bogyo','capers'],label:'Kapribogyó',category:'Alapélelmiszer',icon:'🫒',price:799,unit:'üveg'},
    {aliases:['csemegeuborka','csemege uborka','savanyú uborka','savanyu uborka','ecetes uborka'],label:'Csemegeuborka',category:'Alapélelmiszer',icon:'🥒',price:899,unit:'üveg'},
    {aliases:['kovászos uborka','kovaszos uborka','kovi ubi'],label:'Kovászos uborka',category:'Alapélelmiszer',icon:'🥒',price:1099,unit:'üveg'},
    {aliases:['jalapeño','jalapeno','jalapeño paprika','jalapeno paprika'],label:'Jalapeño',category:'Alapélelmiszer',icon:'🌶️',price:899,unit:'üveg'},
    {aliases:['ecetes gyöngyhagyma','ecetes gyongyhagyma','gyöngyhagyma','gyongyhagyma'],label:'Ecetes gyöngyhagyma',category:'Alapélelmiszer',icon:'🧅',price:799,unit:'üveg'},
    {aliases:['savanyított cékla','savanyitott cekla','ecetes cékla','ecetes cekla'],label:'Savanyított cékla',category:'Alapélelmiszer',icon:'🫙',price:799,unit:'üveg'},
    {aliases:['csalamádé','csalamade','vegyes vágott','vegyes vagott','vegyes savanyúság','vegyes savanyusag'],label:'Csalamádé',category:'Alapélelmiszer',icon:'🫙',price:799,unit:'üveg'}
  ];

  function normalize(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  }

  let learned = {};
  try { learned = JSON.parse(localStorage.getItem(LEARNED_KEY)) || {}; } catch { learned = {}; }
  const patchRules = {};

  for (const patch of PATCHES) {
    const rule = {
      label:patch.label,
      category:patch.category,
      icon:patch.icon,
      price:patch.price,
      unit:patch.unit,
      pricesByUnit:patch.pricesByUnit || null,
      forceUnit:!!patch.forceUnit,
      kind:'learned',
      builtinCatalog:true,
      catalogPatch:true,
      builtinVersion:PATCH_VERSION
    };

    for (const alias of patch.aliases) {
      const key = normalize(alias);
      if (!key) continue;
      patchRules[key] = rule;
      const previous = learned[key];
      if (!previous || previous.builtinCatalog) learned[key] = {...rule};
    }
  }

  try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}

  // A régebben, még hibás felismeréssel felvett becsült tételeket is javítjuk.
  try {
    const items = JSON.parse(localStorage.getItem(STATE_KEY)) || [];
    let changed = false;
    for (const item of items) {
      if (!item || (item.source !== 'estimate' && item.source !== 'estimate-unit')) continue;
      const rule = patchRules[normalize(item.name)];
      if (!rule) continue;
      const oldCategory = item.category;
      if (item.name !== rule.label) { item.name = rule.label; changed = true; }
      if (item.category !== rule.category) { item.category = rule.category; changed = true; }
      if (item.icon !== rule.icon) { item.icon = rule.icon; changed = true; }
      if (rule.forceUnit && item.unit !== rule.unit) { item.unit = rule.unit; changed = true; }
      else if ((oldCategory === 'Egyéb' || !item.unit) && item.unit !== rule.unit) { item.unit = rule.unit; changed = true; }
      const targetPrice = rule.pricesByUnit?.[item.unit] ?? rule.price;
      if (item.price !== targetPrice) { item.price = targetPrice; changed = true; }
    }
    if (changed) localStorage.setItem(STATE_KEY, JSON.stringify(items));
  } catch {}
})();