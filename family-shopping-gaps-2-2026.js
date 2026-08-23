(() => {
  'use strict';

  // Zoé Lista – második valós bevásárlási hiánycsomag.
  // Exact/alias alapú felismerés; saját tanítás és saját ár elsőbbséget élvez.
  const LEARNED_KEY='zoe-lista-learned-v1';
  const STATE_KEY='zoe-lista-state-v1';
  const FAMILY_VERSION=20260823;

  const RULES=[
    // ALOE / FUNKCIONÁLIS ÜDÍTŐITALOK
    {family:'aloe-functional-drinks',aliases:['aloe vera ital','aloe ital','aloe vera drink','aloe drink','aloevera ital'],label:'Aloe vera ital',category:'Italok',icon:'🧃',price:699,unit:'db'},
    {family:'aloe-functional-drinks',aliases:['aloe vera mangó','aloe vera mango','mangós aloe vera ital','mangos aloe vera ital'],label:'Mangós aloe vera ital',category:'Italok',icon:'🥭',price:749,unit:'db'},
    {family:'aloe-functional-drinks',aliases:['aloe vera gránátalma','aloe vera granatalma','gránátalmás aloe ital','granatalmas aloe ital'],label:'Gránátalmás aloe vera ital',category:'Italok',icon:'🧃',price:749,unit:'db'},
    {family:'aloe-functional-drinks',aliases:['kókuszvíz','kokuszviz','coconut water'],label:'Kókuszvíz',category:'Italok',icon:'🥥',price:899,unit:'db'},
    {family:'aloe-functional-drinks',aliases:['vitaminvíz','vitaminviz','vitamin water'],label:'Vitaminvíz',category:'Italok',icon:'💧',price:699,unit:'db'},
    {family:'aloe-functional-drinks',aliases:['kombucha','kombucsa'],label:'Kombucha',category:'Italok',icon:'🫖',price:899,unit:'db'},

    // BÉBILEVELEK / CSOMAGOLT SALÁTALEVELEK
    {family:'baby-leafy-greens',aliases:['bébi spenót','bebi spenot','baby spenót','baby spenot','baby spinach'],label:'Bébi spenót',category:'Zöldség-gyümölcs',icon:'🥬',price:899,unit:'csomag',legacyDbToDefault:true},
    {family:'baby-leafy-greens',aliases:['rukkola','rukola','rocket salad'],label:'Rukkola',category:'Zöldség-gyümölcs',icon:'🥬',price:699,unit:'csomag',legacyDbToDefault:true},
    {family:'baby-leafy-greens',aliases:['madársaláta','madarsalata','galambbegysaláta','galambbegysalata'],label:'Madársaláta',category:'Zöldség-gyümölcs',icon:'🥬',price:799,unit:'csomag',legacyDbToDefault:true},
    {family:'baby-leafy-greens',aliases:['bébilevél mix','bebilevel mix','baby leaf mix','salátamix','salata mix'],label:'Bébilevél mix',category:'Zöldség-gyümölcs',icon:'🥗',price:899,unit:'csomag',legacyDbToDefault:true},
    {family:'baby-leafy-greens',aliases:['spenót','spenot'],label:'Spenót',category:'Zöldség-gyümölcs',icon:'🥬',price:899,unit:'csomag',legacyDbToDefault:true},
    {family:'baby-leafy-greens',aliases:['mángold','mangold'],label:'Mángold',category:'Zöldség-gyümölcs',icon:'🥬',price:899,unit:'csomag',legacyDbToDefault:true},

    // TEPERTŐK
    {family:'cracklings',aliases:['libatepertő','libateperto','liba tepertő','liba teperto'],label:'Libatepertő',category:'Hús és felvágott',icon:'🪿',price:1999,unit:'csomag',legacyDbToDefault:true},
    {family:'cracklings',aliases:['kacsatepertő','kacsateperto','kacsa tepertő','kacsa teperto'],label:'Kacsatepertő',category:'Hús és felvágott',icon:'🦆',price:1799,unit:'csomag',legacyDbToDefault:true},
    {family:'cracklings',aliases:['sertéstepertő','sertesteperto','sertés tepertő','sertes teperto','disznótepertő','disznotepeto'],label:'Sertéstepertő',category:'Hús és felvágott',icon:'🥓',price:1199,unit:'csomag',legacyDbToDefault:true},
    {family:'cracklings',aliases:['tepertő','teperto','töpörtyű','toportyu'],label:'Tepertő',category:'Hús és felvágott',icon:'🥓',price:1299,unit:'csomag',legacyDbToDefault:true},
    {family:'cracklings',aliases:['tepertőkrém','tepertokrem','töpörtyűkrém','toportyukrem'],label:'Tepertőkrém',category:'Hús és felvágott',icon:'🥫',price:1099,unit:'db'},

    // ÁLLATI ZSÍROK
    {family:'animal-fats',aliases:['libazsír','libazsir','liba zsír','liba zsir'],label:'Libazsír',category:'Alapélelmiszer',icon:'🫙',price:2299,unit:'db'},
    {family:'animal-fats',aliases:['kacsazsír','kacsazsir','kacsa zsír','kacsa zsir'],label:'Kacsazsír',category:'Alapélelmiszer',icon:'🫙',price:1999,unit:'db'},
    {family:'animal-fats',aliases:['sertészsír','serteszsir','sertés zsír','sertes zsir','disznózsír','disznozsir'],label:'Sertészsír',category:'Alapélelmiszer',icon:'🫙',price:999,unit:'db'},
    {family:'animal-fats',aliases:['mangalicazsír','mangalicazsir','mangalica zsír','mangalica zsir'],label:'Mangalicazsír',category:'Alapélelmiszer',icon:'🫙',price:1599,unit:'db'},
    {family:'animal-fats',aliases:['zsír','zsir','étkezési zsír','etkezesi zsir'],label:'Étkezési zsír',category:'Alapélelmiszer',icon:'🫙',price:999,unit:'db'},

    // VODKÁK
    {family:'vodka',aliases:['smirnoff','smirnoff vodka','smirnoff red','smirnoff red label'],label:'Smirnoff',category:'Szeszes italok',icon:'🍸',price:5999,unit:'üveg',legacyDbToDefault:true},
    {family:'vodka',aliases:['absolut','absolut vodka'],label:'Absolut Vodka',category:'Szeszes italok',icon:'🍸',price:6999,unit:'üveg',legacyDbToDefault:true},
    {family:'vodka',aliases:['finlandia','finlandia vodka'],label:'Finlandia Vodka',category:'Szeszes italok',icon:'🍸',price:6499,unit:'üveg',legacyDbToDefault:true},
    {family:'vodka',aliases:['russian standard','russian standard vodka'],label:'Russian Standard Vodka',category:'Szeszes italok',icon:'🍸',price:6499,unit:'üveg',legacyDbToDefault:true},
    {family:'vodka',aliases:['stolichnaya','stoli','stolichnaya vodka'],label:'Stolichnaya Vodka',category:'Szeszes italok',icon:'🍸',price:6499,unit:'üveg',legacyDbToDefault:true},
    {family:'vodka',aliases:['grey goose','grey goose vodka'],label:'Grey Goose Vodka',category:'Szeszes italok',icon:'🍸',price:14999,unit:'üveg',legacyDbToDefault:true},
    {family:'vodka',aliases:['belvedere','belvedere vodka'],label:'Belvedere Vodka',category:'Szeszes italok',icon:'🍸',price:13999,unit:'üveg',legacyDbToDefault:true},
    {family:'vodka',aliases:['vodka','vódka','wodka'],label:'Vodka',category:'Szeszes italok',icon:'🍸',price:5499,unit:'üveg',legacyDbToDefault:true}
  ];

  const normalize=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  let learned={};
  try{learned=JSON.parse(localStorage.getItem(LEARNED_KEY))||{}}catch{learned={}}
  const exactRules={};

  for(const entry of RULES){
    const rule={label:entry.label,category:entry.category,icon:entry.icon,price:entry.price,unit:entry.unit,kind:'learned',builtinCatalog:true,familyCatalog:true,family:entry.family,builtinVersion:FAMILY_VERSION};
    for(const alias of [...entry.aliases,entry.label]){
      const key=normalize(alias);if(!key)continue;
      exactRules[key]={...rule,legacyDbToDefault:!!entry.legacyDbToDefault};
      const previous=learned[key];
      if(!previous||previous.builtinCatalog)learned[key]={...rule};
    }
  }
  try{localStorage.setItem(LEARNED_KEY,JSON.stringify(learned))}catch{}

  let state=[];
  try{state=JSON.parse(localStorage.getItem(STATE_KEY))||[]}catch{state=[]}
  let changed=false;
  for(const item of state){
    if(!item||item.source!=='estimate')continue;
    const rule=exactRules[normalize(item.name)];if(!rule)continue;
    const oldUnit=item.unit||'db';
    if(item.name!==rule.label){item.name=rule.label;changed=true}
    if(item.category!==rule.category){item.category=rule.category;changed=true}
    if(item.icon!==rule.icon){item.icon=rule.icon;changed=true}
    if(rule.legacyDbToDefault&&oldUnit==='db'&&rule.unit!=='db'){item.unit=rule.unit;changed=true}
    if((item.unit||oldUnit)===rule.unit&&Number(item.price)!==Number(rule.price)){item.price=rule.price;changed=true}
  }
  if(changed){try{localStorage.setItem(STATE_KEY,JSON.stringify(state))}catch{}}
})();
