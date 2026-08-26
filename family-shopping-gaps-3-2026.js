(() => {
  'use strict';

  // Zoé Lista – harmadik valós bevásárlási hiánycsomag.
  // Exact/alias alapú felismerés; saját tanítás és saját ár elsőbbséget élvez.
  const LEARNED_KEY='zoe-lista-learned-v1';
  const STATE_KEY='zoe-lista-state-v1';
  const FAMILY_VERSION=20260826;

  const RULES=[
    // ILLATGYERTYÁK / MÉCSESEK
    {family:'home-fragrance-candles',aliases:['aromagyertya','aroma gyertya','illatgyertya','illatos gyertya','scented candle'],label:'Aromagyertya',category:'Háztartás',icon:'🕯️',price:1499,unit:'db'},
    {family:'home-fragrance-candles',aliases:['illatos teamécses','illatos teamécsesek','illatos teamécses csomag','illatos teamécsesek csomag'],label:'Illatos teamécses',category:'Háztartás',icon:'🕯️',price:999,unit:'csomag',legacyDbToDefault:true},
    {family:'home-fragrance-candles',aliases:['teamécses','teamécsesek','tea mécses','tea mécsesek'],label:'Teamécses',category:'Háztartás',icon:'🕯️',price:799,unit:'csomag',legacyDbToDefault:true},
    {family:'home-fragrance-candles',aliases:['szúnyogriasztó gyertya','szunyogriaszto gyertya','citronella gyertya','citronellás gyertya','citronellas gyertya'],label:'Szúnyogriasztó gyertya',category:'Háztartás',icon:'🕯️',price:1499,unit:'db'},
    {family:'home-fragrance-candles',aliases:['gyertya'],label:'Gyertya',category:'Háztartás',icon:'🕯️',price:999,unit:'db'},

    // FÜSTÖLŐK
    {family:'incense',aliases:['füstölő','fustolo','füstölő pálca','fustolo palca','füstölőpálca','fustolopalca','incense','incense stick'],label:'Füstölő',category:'Háztartás',icon:'🪔',price:899,unit:'csomag',legacyDbToDefault:true},
    {family:'incense',aliases:['füstölőkúp','fustolokup','füstölő kúp','fustolo kup','incense cone'],label:'Füstölőkúp',category:'Háztartás',icon:'🪔',price:999,unit:'csomag',legacyDbToDefault:true},
    {family:'incense',aliases:['palo santo','palo santo füstölő','palo santo fustolo','szent fa füstölő','szent fa fustolo'],label:'Palo Santo',category:'Háztartás',icon:'🪵',price:1799,unit:'csomag',legacyDbToDefault:true},
    {family:'incense',aliases:['zsálya füstölő','zsalya fustolo','fehér zsálya','feher zsalya','fehér zsálya füstölő','feher zsalya fustolo'],label:'Zsálya füstölő',category:'Háztartás',icon:'🌿',price:1999,unit:'csomag',legacyDbToDefault:true},

    // ILLÓOLAJOK / AROMAOLAJOK
    {family:'essential-oils',aliases:['illóolaj','illoolaj','illó olaj','illo olaj','essential oil'],label:'Illóolaj',category:'Háztartás',icon:'🌿',price:1499,unit:'üveg',legacyDbToDefault:true},
    {family:'essential-oils',aliases:['levendula illóolaj','levendula illoolaj','levendula illó olaj','levendula illo olaj'],label:'Levendula illóolaj',category:'Háztartás',icon:'🪻',price:1599,unit:'üveg',legacyDbToDefault:true},
    {family:'essential-oils',aliases:['teafa illóolaj','teafa illoolaj','teafaolaj','teafa olaj'],label:'Teafa illóolaj',category:'Háztartás',icon:'🌿',price:1599,unit:'üveg',legacyDbToDefault:true},
    {family:'essential-oils',aliases:['eukaliptusz illóolaj','eukaliptusz illoolaj','eukaliptusz olaj'],label:'Eukaliptusz illóolaj',category:'Háztartás',icon:'🌿',price:1599,unit:'üveg',legacyDbToDefault:true},
    {family:'essential-oils',aliases:['borsmenta illóolaj','borsmenta illoolaj','borsmenta olaj'],label:'Borsmenta illóolaj',category:'Háztartás',icon:'🌿',price:1599,unit:'üveg',legacyDbToDefault:true},
    {family:'essential-oils',aliases:['narancs illóolaj','narancs illoolaj','narancs olaj'],label:'Narancs illóolaj',category:'Háztartás',icon:'🍊',price:1499,unit:'üveg',legacyDbToDefault:true},
    {family:'essential-oils',aliases:['citrom illóolaj','citrom illoolaj','citrom olaj'],label:'Citrom illóolaj',category:'Háztartás',icon:'🍋',price:1499,unit:'üveg',legacyDbToDefault:true},
    {family:'essential-oils',aliases:['aromaolaj','aroma olaj','illatosító olaj','illatosito olaj','illatolaj','illat olaj'],label:'Aromaolaj',category:'Háztartás',icon:'💧',price:1299,unit:'üveg',legacyDbToDefault:true},

    // ZÖLDBORSÓ ÉS KISZERELÉSEI
    {family:'green-peas',aliases:['zöldborsó','zoldborso','zöld borsó','zold borso'],label:'Zöldborsó',category:'Zöldség-gyümölcs',icon:'🫛',price:999,unit:'csomag',legacyDbToDefault:true},
    {family:'green-peas',aliases:['fagyasztott zöldborsó','fagyasztott zoldborso','mirelit zöldborsó','mirelit zoldborso'],label:'Fagyasztott zöldborsó',category:'Fagyasztott',icon:'🫛',price:999,unit:'csomag',legacyDbToDefault:true},
    {family:'green-peas',aliases:['friss zöldborsó','friss zoldborso','fejtett zöldborsó','fejtett zoldborso'],label:'Friss zöldborsó',category:'Zöldség-gyümölcs',icon:'🫛',price:1799,unit:'kg',legacyDbToDefault:true},
    {family:'green-peas',aliases:['konzerv zöldborsó','konzerv zoldborso','zöldborsó konzerv','zoldborso konzerv'],label:'Konzerv zöldborsó',category:'Alapélelmiszer',icon:'🥫',price:699,unit:'db'},
    {family:'green-peas',aliases:['üveges zöldborsó','uveges zoldborso','zöldborsó üvegben','zoldborso uvegben'],label:'Üveges zöldborsó',category:'Alapélelmiszer',icon:'🫙',price:799,unit:'üveg',legacyDbToDefault:true},
    {family:'green-peas',aliases:['zöldborsó bébirépa','zoldborso bebirepa','zöldborsó bébirépa mix','zoldborso bebirepa mix','borsó répa mix','borso repa mix'],label:'Zöldborsó-bébirépa mix',category:'Fagyasztott',icon:'🥕',price:1099,unit:'csomag',legacyDbToDefault:true}
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
    if(!item)continue;
    const rule=exactRules[normalize(item.name)];if(!rule)continue;
    if(item.source!=='estimate')continue;
    const oldUnit=item.unit||'db';
    if(item.name!==rule.label){item.name=rule.label;changed=true}
    if(item.category!==rule.category){item.category=rule.category;changed=true}
    if(item.icon!==rule.icon){item.icon=rule.icon;changed=true}
    if(rule.legacyDbToDefault&&oldUnit==='db'&&rule.unit!=='db'){item.unit=rule.unit;changed=true}
    if((item.unit||oldUnit)===rule.unit&&Number(item.price)!==Number(rule.price)){item.price=rule.price;changed=true}
  }
  if(changed){try{localStorage.setItem(STATE_KEY,JSON.stringify(state))}catch{}}
})();
