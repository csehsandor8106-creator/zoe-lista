(() => {
  'use strict';

  const STORAGE = 'zoe-lista-state-v1';
  const PRICE_MEMORY = 'zoe-lista-price-memory-v1';
  const LEARNED = 'zoe-lista-learned-v1';
  const THEME = 'zoe-lista-theme-v1';

  const $ = (id) => document.getElementById(id);
  const addForm = $('addForm'), input = $('itemInput'), listRoot = $('listRoot');
  const hideDoneBtn = $('hideDoneBtn'), clearDoneBtn = $('clearDoneBtn');
  const countText = $('countText'), totalText = $('totalText'), themeBtn = $('themeBtn');
  const editDialog = $('editDialog'), editForm = $('editForm');

  const categories = {
    'Zöldség-gyümölcs':'🥕',
    'Tejtermék és tojás':'🥛',
    'Pékáru':'🥖',
    'Hús és felvágott':'🥩',
    'Hal és tenger gyümölcsei':'🐟',
    'Alapélelmiszer':'🍚',
    'Snack és édesség':'🍿',
    'Italok':'🥤',
    'Szeszes italok':'🥃',
    'Fagyasztott':'❄️',
    'Háztartás':'🧽',
    'Higiénia':'🧴',
    'Állateledel':'🐾',
    'Baba és gyermek':'🍼',
    'Egyéb':'🛒'
  };
  const categoryOrder = Object.keys(categories);

  const product = (aliases, label, category, icon, price, unit='db', kind='product') => ({
    aliases, label, category, icon, price, unit, kind
  });

  const catalog = [
    product(['marhahús','marha hús','marha'],'Marhahús','Hús és felvágott','🥩',4999,'kg'),
    product(['marhacomb'],'Marhacomb','Hús és felvágott','🥩',5499,'kg'),
    product(['marha steak','steak','beef steak'],'Marhasteak','Hús és felvágott','🥩',7999,'kg'),
    product(['darált marha','darált marhahús'],'Darált marhahús','Hús és felvágott','🥩',4499,'kg'),
    product(['sertéshús','sertés hús','disznóhús','disznó hús'],'Sertéshús','Hús és felvágott','🥩',2499,'kg'),
    product(['sertéskaraj','karaj'],'Sertéskaraj','Hús és felvágott','🥩',2299,'kg'),
    product(['tarja'],'Sertéstarja','Hús és felvágott','🥩',2499,'kg'),
    product(['darált hús','darált hús sertés'],'Darált hús','Hús és felvágott','🥩',2999,'kg'),
    product(['csirke','egész csirke','egesz csirke'],'Egész csirke','Hús és felvágott','🍗',1399,'kg'),
    product(['csirkemell','csirkemellfilé'],'Csirkemellfilé','Hús és felvágott','🍗',1999,'kg'),
    product(['csirkecomb'],'Csirkecomb','Hús és felvágott','🍗',999,'kg'),
    product(['pulykamell'],'Pulykamell','Hús és felvágott','🍗',2599,'kg'),
    product(['sonka'],'Sonka','Hús és felvágott','🥓',699),
    product(['bacon'],'Bacon','Hús és felvágott','🥓',1099),
    product(['szalámi'],'Szalámi','Hús és felvágott','🥓',799),
    product(['virsli'],'Virsli','Hús és felvágott','🌭',1099,'csomag'),
    product(['kolbász'],'Kolbász','Hús és felvágott','🌭',1999),
    product(['pick'],'Pick húskészítmény','Hús és felvágott','🥓',1199,'db','brand'),
    product(['kométa'],'Kométa húskészítmény','Hús és felvágott','🥓',1099,'db','brand'),
    product(['sága'],'Sága baromfikészítmény','Hús és felvágott','🍗',1099,'db','brand'),

    product(['lazac'],'Lazac','Hal és tenger gyümölcsei','🐟',6499,'kg'),
    product(['tonhal'],'Tonhal','Hal és tenger gyümölcsei','🐟',999),
    product(['hal','halfilé'],'Hal','Hal és tenger gyümölcsei','🐟',2999,'kg'),
    product(['garnéla','rák'],'Garnéla / rák','Hal és tenger gyümölcsei','🦐',4999,'kg'),

    product(['sárgarépa','répa'],'Sárgarépa','Zöldség-gyümölcs','🥕',499,'kg'),
    product(['burgonya','krumpli'],'Burgonya','Zöldség-gyümölcs','🥔',499,'kg'),
    product(['paradicsom'],'Paradicsom','Zöldség-gyümölcs','🍅',699,'kg'),
    product(['paprika'],'Paprika','Zöldség-gyümölcs','🫑',799,'kg'),
    product(['hagyma','vöröshagyma'],'Vöröshagyma','Zöldség-gyümölcs','🧅',349,'kg'),
    product(['fokhagyma'],'Fokhagyma','Zöldség-gyümölcs','🧄',1999,'kg'),
    product(['uborka','kígyóuborka'],'Uborka','Zöldség-gyümölcs','🥒',399),
    product(['saláta','jégsaláta'],'Saláta','Zöldség-gyümölcs','🥬',599),
    product(['brokkoli'],'Brokkoli','Zöldség-gyümölcs','🥦',999,'kg'),
    product(['karfiol'],'Karfiol','Zöldség-gyümölcs','🥦',899,'kg'),
    product(['gomba','csiperke'],'Gomba','Zöldség-gyümölcs','🍄',1399,'kg'),
    product(['alma'],'Alma','Zöldség-gyümölcs','🍎',699,'kg'),
    product(['körte'],'Körte','Zöldség-gyümölcs','🍐',999,'kg'),
    product(['banán'],'Banán','Zöldség-gyümölcs','🍌',699,'kg'),
    product(['narancs','mandarin'],'Narancs / mandarin','Zöldség-gyümölcs','🍊',899,'kg'),
    product(['citrom'],'Citrom','Zöldség-gyümölcs','🍋',1099,'kg'),
    product(['szőlő'],'Szőlő','Zöldség-gyümölcs','🍇',1399,'kg'),
    product(['eper','szamóca'],'Eper','Zöldség-gyümölcs','🍓',2999,'kg'),
    product(['áfonya'],'Áfonya','Zöldség-gyümölcs','🫐',1199),
    product(['görögdinnye','dinnye'],'Görögdinnye','Zöldség-gyümölcs','🍉',199,'kg'),
    product(['sárgadinnye'],'Sárgadinnye','Zöldség-gyümölcs','🍈',499,'kg'),
    product(['őszibarack','nektarin','barack'],'Őszibarack / nektarin','Zöldség-gyümölcs','🍑',999,'kg'),
    product(['kiwi'],'Kiwi','Zöldség-gyümölcs','🥝',1399,'kg'),
    product(['ananász'],'Ananász','Zöldség-gyümölcs','🍍',999),
    product(['mangó'],'Mangó','Zöldség-gyümölcs','🥭',799),
    product(['avokádó','avocado','avokado'],'Avokádó','Zöldség-gyümölcs','🥑',399),

    product(['tej'],'Tej','Tejtermék és tojás','🥛',329),
    product(['sajt','trappista'],'Sajt','Tejtermék és tojás','🧀',2899,'kg'),
    product(['mozzarella'],'Mozzarella','Tejtermék és tojás','🧀',599),
    product(['vaj'],'Vaj','Tejtermék és tojás','🧈',899),
    product(['margarin'],'Margarin','Tejtermék és tojás','🧈',699),
    product(['joghurt'],'Joghurt','Tejtermék és tojás','🥣',249),
    product(['tejföl'],'Tejföl','Tejtermék és tojás','🥣',499),
    product(['kefir'],'Kefir','Tejtermék és tojás','🥛',299),
    product(['túró'],'Túró','Tejtermék és tojás','🥛',799),
    product(['tojás'],'Tojás','Tejtermék és tojás','🥚',999,'csomag'),
    product(['mizo'],'Mizo tejtermék','Tejtermék és tojás','🥛',499,'db','brand'),
    product(['milli'],'Milli tejtermék','Tejtermék és tojás','🥛',499,'db','brand'),
    product(['danone','activia'],'Joghurt','Tejtermék és tojás','🥣',299,'db','brand'),
    product(['pöttyös'],'Pöttyös Túró Rudi','Tejtermék és tojás','🍫',249,'db','brand'),
    product(['tolle','hajdú'],'Sajt / tejtermék','Tejtermék és tojás','🧀',899,'db','brand'),

    product(['kenyér'],'Kenyér','Pékáru','🍞',699),
    product(['zsemle'],'Zsemle','Pékáru','🥯',99),
    product(['kifli'],'Kifli','Pékáru','🥐',99),
    product(['bagett','baguette'],'Bagett','Pékáru','🥖',599),
    product(['croissant'],'Croissant','Pékáru','🥐',299),
    product(['tortilla'],'Tortilla','Pékáru','🫓',899,'csomag'),
    product(['ceres'],'Ceres pékáru','Pékáru','🍞',899,'db','brand'),
    product(['lipóti'],'Lipóti pékáru','Pékáru','🥖',699,'db','brand'),

    product(['rizs'],'Rizs','Alapélelmiszer','🍚',699,'kg'),
    product(['tészta','száraztészta','spagetti'],'Tészta','Alapélelmiszer','🍝',599),
    product(['liszt'],'Liszt','Alapélelmiszer','🌾',299,'kg'),
    product(['cukor','kristálycukor'],'Cukor','Alapélelmiszer','🧂',349,'kg'),
    product(['só'],'Só','Alapélelmiszer','🧂',249,'kg'),
    product(['étolaj','olaj'],'Étolaj','Alapélelmiszer','🫗',799,'l'),
    product(['konzerv'],'Konzerv','Alapélelmiszer','🥫',599),
    product(['zabpehely'],'Zabpehely','Alapélelmiszer','🥣',599),
    product(['kávé'],'Kávé','Alapélelmiszer','☕',1999),
    product(['tea'],'Tea','Alapélelmiszer','🍵',799,'doboz'),
    product(['gyermelyi'],'Gyermelyi tészta','Alapélelmiszer','🍝',599,'db','brand'),
    product(['barilla'],'Barilla tészta','Alapélelmiszer','🍝',899,'db','brand'),
    product(['vénusz','floriol'],'Étolaj','Alapélelmiszer','🫗',899,'l','brand'),
    product(['omnia','jacobs','tchibo','nescafé','douwe egberts'],'Kávé','Alapélelmiszer','☕',2199,'db','brand'),
    product(['pickwick','lipton'],'Tea','Alapélelmiszer','🍵',899,'doboz','brand'),
    product(['knorr','maggi'],'Leves / ételalap','Alapélelmiszer','🥣',499,'db','brand'),

    product(['chio chips'],'Chio chips','Snack és édesség','🍟',799),
    product(['chio stickletti'],'Chio Stickletti','Snack és édesség','🥨',599),
    product(['chio popcorn'],'Chio popcorn','Snack és édesség','🍿',599),
    product(['chips','burgonyachips'],'Chips','Snack és édesség','🍟',799),
    product(['snack','nasi'],'Snack','Snack és édesség','🥨',699),
    product(['popcorn'],'Popcorn','Snack és édesség','🍿',599),
    product(['ropi'],'Ropi','Snack és édesség','🥨',499),
    product(['keksz','cookie','cookies'],'Keksz','Snack és édesség','🍪',699),
    product(['csoki','csokoládé'],'Csokoládé','Snack és édesség','🍫',599),
    product(['cukorka','gumicukor'],'Cukorka','Snack és édesség','🍬',699),
    product(['chio','csio'],'Chio snack','Snack és édesség','🍟',699,'db','brand'),
    product(["lay's",'lays','léjsz'],'Lay’s chips','Snack és édesség','🍟',799,'db','brand'),
    product(['pom-bär','pombär','pombair','pombar','pom bar','pombear','pom bear'],'Pom-Bär burgonyasnack','Snack és édesség','🥔',450,'db','brand'),
    product(['pringles'],'Pringles chips','Snack és édesség','🍟',1299,'db','brand'),
    product(['cheetos'],'Cheetos kukoricasnack','Snack és édesség','🌽',799,'db','brand'),
    product(['doritos'],'Doritos tortilla chips','Snack és édesség','🌽',899,'db','brand'),
    product(['tuc'],'TUC sós keksz','Snack és édesség','🥨',599,'db','brand'),
    product(['milka'],'Milka csokoládé','Snack és édesség','🍫',517,'db','brand'),
    product(['boci'],'Boci csokoládé','Snack és édesség','🍫',499,'db','brand'),
    product(['kinder'],'Kinder édesség','Snack és édesség','🍫',499,'db','brand'),
    product(['haribo','maoam'],'Gumicukor / cukorka','Snack és édesség','🍬',699,'db','brand'),
    product(['oreo','pilóta','győri édes','detki','manner'],'Keksz','Snack és édesség','🍪',699,'db','brand'),
    product(['nutella'],'Nutella','Snack és édesség','🍫',1699,'db','brand'),

    product(['ásványvíz'],'Ásványvíz','Italok','💧',199),
    product(['üdítő','cola','kóla'],'Üdítő','Italok','🥤',699),
    product(['gyümölcslé','narancslé','almalé'],'Gyümölcslé','Italok','🧃',799),
    product(['energiaital'],'Energiaital','Italok','⚡',499),
    product(['coca-cola','coca cola','coke','pepsi','fanta','sprite','schweppes'],'Szénsavas üdítő','Italok','🥤',799,'db','brand'),
    product(['sió','rauch','hohes c','cappy'],'Gyümölcslé','Italok','🧃',799,'db','brand'),
    product(['szentkirályi','theodora','naturaqua','mizse'],'Ásványvíz','Italok','💧',199,'db','brand'),
    product(['hell','red bull','monster','burn'],'Energiaital','Italok','⚡',499,'db','brand'),

    product(['sör'],'Sör','Szeszes italok','🍺',399),
    product(['bor'],'Bor','Szeszes italok','🍷',1799,'üveg'),
    product(['pálinka','palinka'],'Pálinka','Szeszes italok','🥃',4999,'üveg'),
    product(['vodka'],'Vodka','Szeszes italok','🍸',4499,'üveg'),
    product(['whisky','whiskey'],'Whisky','Szeszes italok','🥃',5999,'üveg'),
    product(['rum'],'Rum','Szeszes italok','🥃',4999,'üveg'),
    product(['gin'],'Gin','Szeszes italok','🍸',4999,'üveg'),
    product(['likőr','likor'],'Likőr','Szeszes italok','🥃',3999,'üveg'),

    product(['hasábburgonya','hasabburgonya','hasáb burgonya','hasab burgonya','sült krumpli','sult krumpli','sültkrumpli','sultkrumpli','fagyasztott hasábburgonya'],'Hasábburgonya','Fagyasztott','🍟',1199,'csomag'),
    product(['fagyasztott pizza'],'Fagyasztott pizza','Fagyasztott','🍕',1499),
    product(['jégkrém','fagyi','fagylalt'],'Jégkrém / fagylalt','Fagyasztott','🍦',799),
    product(['mirelite','iglo','frosta'],'Fagyasztott étel','Fagyasztott','❄️',1299,'db','brand'),
    product(['magnum','cornetto','algida','carte d’or','carte dor'],'Jégkrém / fagylalt','Fagyasztott','🍦',899,'db','brand'),

    product(['ceruzaelem','ceruza elem','aa','aaa','aa elem','aaa elem','alkáli elem','alkali elem','elem'],'Elem','Háztartás','🔋',1499,'csomag'),
    product(['faszén','faszen','grillfaszén','grill faszén','brikett','grillbrikett','grill brikett'],'Faszén / grillbrikett','Háztartás','🔥',2499,'csomag'),
    product(['gyufa'],'Gyufa','Háztartás','🔥',299,'doboz'),
    product(['öngyújtó'],'Öngyújtó','Háztartás','🔥',499),
    product(['mosogatószer'],'Mosogatószer','Háztartás','🧽',899),
    product(['mosószer'],'Mosószer','Háztartás','🧺',3999),
    product(['öblítő'],'Öblítő','Háztartás','🧺',1899),
    product(['wc-papír','wc papír','toalettpapír'],'WC-papír','Háztartás','🧻',1599,'csomag'),
    product(['papírtörlő'],'Papírtörlő','Háztartás','🧻',799,'csomag'),
    product(['szemeteszsák'],'Szemeteszsák','Háztartás','🗑️',999,'csomag'),
    product(['jar','pur'],'Mosogatószer','Háztartás','🧽',899,'db','brand'),
    product(['finish','somat'],'Mosogatógépes szer','Háztartás','🍽️',2999,'db','brand'),
    product(['ariel','persil','tomi'],'Mosószer','Háztartás','🧺',3999,'db','brand'),
    product(['lenor','coccolino'],'Öblítő','Háztartás','🧺',1899,'db','brand'),
    product(['domestos','bref'],'WC-tisztító','Háztartás','🚽',999,'db','brand'),
    product(['cif'],'Tisztítószer','Háztartás','🧽',999,'db','brand'),
    product(['zewa','regina','szilvia'],'Papírtermék','Háztartás','🧻',1599,'csomag','brand'),

    product(['sampon'],'Sampon','Higiénia','🧴',1499),
    product(['tusfürdő'],'Tusfürdő','Higiénia','🚿',999),
    product(['fogkrém'],'Fogkrém','Higiénia','🪥',999),
    product(['fogkefe'],'Fogkefe','Higiénia','🪥',999),
    product(['dezodor'],'Dezodor','Higiénia','🧴',1299),
    product(['szappan'],'Szappan','Higiénia','🧼',399),
    product(['borotva'],'Borotva','Higiénia','🪒',1599),
    product(['fa'],'Fa testápolási termék','Higiénia','🧴',999,'db','shortBrand'),
    product(['dove','nivea','old spice','rexona','axe'],'Testápolás / dezodor','Higiénia','🧴',1299,'db','brand'),
    product(['head & shoulders','head and shoulders','head shoulders','schauma','pantene','elseve','syoss'],'Sampon','Higiénia','🧴',1499,'db','brand'),
    product(['colgate','elmex','sensodyne','blend-a-med','blend a med'],'Fogkrém','Higiénia','🪥',999,'db','brand'),
    product(['oral-b','oral b'],'Fogápolás','Higiénia','🪥',999,'db','brand'),
    product(['gillette','wilkinson'],'Borotválkozás','Higiénia','🪒',1599,'db','brand'),

    product(['macskaeledel','macskakaja'],'Macskaeledel','Állateledel','🐱',1299),
    product(['kutyaeledel','kutyakaja'],'Kutyaeledel','Állateledel','🐶',1699),
    product(['macskaalom'],'Macskaalom','Állateledel','🐱',1999),
    product(['whiskas','felix','gourmet','sheba'],'Macskaeledel','Állateledel','🐱',1299,'db','brand'),
    product(['pedigree','cesar'],'Kutyaeledel','Állateledel','🐶',1699,'db','brand'),
    product(['purina','friskies'],'Állateledel','Állateledel','🐾',1499,'db','brand'),

    product(['pelenka'],'Pelenka','Baba és gyermek','👶',3999,'csomag'),
    product(['bébiétel'],'Bébiétel','Baba és gyermek','🍼',899),
    product(['tápszer'],'Tápszer','Baba és gyermek','🍼',3999),
    product(['pampers','libero','huggies'],'Pelenka','Baba és gyermek','👶',3999,'csomag','brand'),
    product(['hipp','kecskeméti','milupa'],'Babaétel / tápszer','Baba és gyermek','🍼',899,'db','brand')
  ];

  const loadJson = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };

  let items = loadJson(STORAGE, []);
  let priceMemory = loadJson(PRICE_MEMORY, {});
  let learned = loadJson(LEARNED, {});
  let hideDone = false;

  function normalize(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  }

  function compact(s) { return normalize(s).replace(/\s+/g,''); }
  function tokens(s) { return normalize(s).split(/\s+/).filter(Boolean); }

  function phraseMatch(input, alias) {
    const iw = tokens(input), aw = tokens(alias);
    if (!aw.length || aw.length > iw.length) return false;
    for (let i=0; i<=iw.length-aw.length; i++) {
      let ok = true;
      for (let j=0; j<aw.length; j++) {
        if (iw[i+j] !== aw[j]) { ok = false; break; }
      }
      if (ok) return true;
    }
    return false;
  }

  function distance(a,b) {
    a = compact(a); b = compact(b);
    const m = a.length, n = b.length;
    const prev = Array(n+1), cur = Array(n+1);
    for (let j=0; j<=n; j++) prev[j]=j;
    for (let i=1; i<=m; i++) {
      cur[0]=i;
      for (let j=1; j<=n; j++) cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
      for (let j=0; j<=n; j++) prev[j]=cur[j];
    }
    return prev[n];
  }

  function similarity(a,b) {
    const x=compact(a), y=compact(b), max=Math.max(x.length,y.length);
    return max ? 1-distance(x,y)/max : 1;
  }

  function fuzzyAliasScore(input, alias) {
    const aw = tokens(alias), iw = tokens(input), aliasCompact = compact(alias);
    if (aliasCompact.length < 5) return 0;
    const threshold = aliasCompact.length >= 8 ? 0.86 : aliasCompact.length >= 6 ? 0.89 : 0.93;
    let best = 0;

    if (aw.length === 1) {
      for (const word of iw) {
        const wc = compact(word);
        if (wc.length < 5 || Math.abs(wc.length-aliasCompact.length) > 2 || wc[0] !== aliasCompact[0]) continue;
        const s = similarity(word, alias);
        if (s >= threshold) best = Math.max(best, s);
      }
      return best;
    }

    for (let i=0; i<=iw.length-aw.length; i++) {
      const window = iw.slice(i,i+aw.length).join(' '), wc = compact(window);
      if (Math.abs(wc.length-aliasCompact.length) > 2 || wc[0] !== aliasCompact[0]) continue;
      const s = similarity(window,alias);
      if (s >= threshold) best = Math.max(best,s);
    }
    return best;
  }

  function matchRank(kind, exact, fuzzy=false) {
    if (kind === 'product') return fuzzy ? 300 : exact ? 600 : 560;
    if (kind === 'brand') return fuzzy ? 260 : exact ? 500 : 470;
    if (kind === 'family') return fuzzy ? 240 : exact ? 420 : 400;
    if (kind === 'shortBrand') return exact ? 490 : 450;
    return fuzzy ? 220 : exact ? 380 : 360;
  }

  function recognize(name) {
    const key = normalize(name);
    if (learned[key]) return {...learned[key], learned:true};

    const inputTokens = tokens(name), candidates = [];
    for (const r of catalog) {
      for (const alias of r.aliases) {
        const a = normalize(alias), len = compact(alias).length, exact = key === a;
        let score = 0;

        if (exact) score = matchRank(r.kind,true) + Math.min(len,30);
        else if (r.kind === 'shortBrand') {
          if (inputTokens.includes(a)) score = matchRank(r.kind,false) + len;
        } else if (phraseMatch(name,alias)) score = matchRank(r.kind,false) + Math.min(len,30);
        else {
          const fuzzy = fuzzyAliasScore(name,alias);
          if (fuzzy) score = matchRank(r.kind,false,true) + Math.round(fuzzy*20) + Math.min(len,20);
        }
        if (score) candidates.push({r,score,len});
      }
    }

    candidates.sort((a,b) => b.score-a.score || b.len-a.len);
    return candidates[0]?.r || null;
  }

  function hasAny(name, aliases) {
    const n = normalize(name), ws = new Set(tokens(name));
    return aliases.some(alias => {
      const a = normalize(alias), aw = tokens(alias);
      if (!a) return false;
      if (n === a) return true;
      if (aw.length > 1) return phraseMatch(name,alias);
      return ws.has(a);
    });
  }

  function fallback(name) {
    if (hasAny(name,['ceruzaelem','ceruza elem','aa','aaa','aa elem','aaa elem','alkáli elem','alkali elem'])) return {category:'Háztartás',icon:'🔋',price:1499,unit:'csomag'};
    if (hasAny(name,['faszén','faszen','grillfaszén','grill faszén','brikett','grillbrikett','grill brikett'])) return {category:'Háztartás',icon:'🔥',price:2499,unit:'csomag'};
    if (hasAny(name,['csirke','egész csirke','egesz csirke'])) return {category:'Hús és felvágott',icon:'🍗',price:1399,unit:'kg'};
    if (hasAny(name,['marha','marhahús','sertés','sertéshús','disznó','disznóhús','pulyka','hús','sonka','szalámi','virsli','kolbász','bacon','karaj','tarja'])) return {category:'Hús és felvágott',icon:'🥩',price:2999,unit:'kg'};
    if (hasAny(name,['hal','halfilé','lazac','tonhal','garnéla','rák'])) return {category:'Hal és tenger gyümölcsei',icon:'🐟',price:3499,unit:'kg'};
    if (hasAny(name,['avokádó','avocado','avokado'])) return {category:'Zöldség-gyümölcs',icon:'🥑',price:399,unit:'db'};
    if (hasAny(name,['alma','banán','répa','paradicsom','paprika','hagyma','uborka','burgonya','krumpli','dinnye','saláta','gomba','brokkoli','gyümölcs','zöldség'])) return {category:'Zöldség-gyümölcs',icon:'🥕',price:799,unit:'kg'};
    if (hasAny(name,['tej','sajt','vaj','joghurt','tejföl','túró','tojás','kefir'])) return {category:'Tejtermék és tojás',icon:'🥛',price:699,unit:'db'};
    if (hasAny(name,['kenyér','zsemle','kifli','bagett','croissant'])) return {category:'Pékáru',icon:'🥖',price:599,unit:'db'};
    if (hasAny(name,['chips','snack','nasi','csoki','csokoládé','keksz','cookie','popcorn','ropi','cukorka','gumicukor'])) return {category:'Snack és édesség',icon:hasAny(name,['keksz','cookie'])?'🍪':hasAny(name,['csoki','csokoládé'])?'🍫':hasAny(name,['popcorn'])?'🍿':'🥨',price:699,unit:'db'};
    if (hasAny(name,['pálinka','palinka'])) return {category:'Szeszes italok',icon:'🥃',price:4999,unit:'üveg'};
    if (hasAny(name,['whisky','whiskey','rum','likőr','likor'])) return {category:'Szeszes italok',icon:'🥃',price:4999,unit:'üveg'};
    if (hasAny(name,['vodka','gin'])) return {category:'Szeszes italok',icon:'🍸',price:4999,unit:'üveg'};
    if (hasAny(name,['sör'])) return {category:'Szeszes italok',icon:'🍺',price:399,unit:'db'};
    if (hasAny(name,['bor'])) return {category:'Szeszes italok',icon:'🍷',price:1799,unit:'üveg'};
    if (hasAny(name,['gyümölcslé','narancslé','almalé','üdítő','cola','kóla','energiaital','ásványvíz'])) return {category:'Italok',icon:'🥤',price:699,unit:'db'};
    if (hasAny(name,['hasábburgonya','hasabburgonya','hasáb burgonya','hasab burgonya','sült krumpli','sult krumpli','sültkrumpli','sultkrumpli'])) return {category:'Fagyasztott',icon:'🍟',price:1199,unit:'csomag'};
    if (hasAny(name,['mosogatószer','mosószer','öblítő','papírtörlő','toalettpapír','wc papír','szemeteszsák','gyufa','öngyújtó'])) return {category:'Háztartás',icon:'🧽',price:1299,unit:'db'};
    if (hasAny(name,['sampon','tusfürdő','fogkrém','fogkefe','dezodor','szappan','borotva'])) return {category:'Higiénia',icon:'🧴',price:1099,unit:'db'};
    if (hasAny(name,['macska','kutya','eledel','alom','macskaeledel','kutyaeledel'])) return {category:'Állateledel',icon:'🐾',price:1499,unit:'db'};
    if (hasAny(name,['rizs','tészta','liszt','cukor','só','olaj','kávé','tea','konzerv','zab'])) return {category:'Alapélelmiszer',icon:'🍚',price:699,unit:'db'};
    if (hasAny(name,['pelenka','bébiétel','tápszer'])) return {category:'Baba és gyermek',icon:'🍼',price:1999,unit:'db'};
    return {category:'Egyéb',icon:'🛒',price:699,unit:'db'};
  }

  function refreshEstimatedRecognition() {
    let changed = false;
    for (const item of items) {
      if (item.source !== 'estimate') continue;
      const oldCategory = item.category;
      const rec = recognize(item.name), fb = fallback(item.name), next = rec || fb;
      if (!next) continue;

      if (item.category !== next.category) { item.category = next.category; changed = true; }
      if (item.icon !== next.icon) { item.icon = next.icon; changed = true; }
      if (item.price !== next.price) { item.price = next.price; changed = true; }
      if (oldCategory === 'Egyéb' && item.unit === 'db' && next.unit && next.unit !== 'db') {
        item.unit = next.unit;
        changed = true;
      }
    }
    return changed;
  }

  function extractPrice(text) {
    const m = text.match(/(?:^|\s)(\d[\d\s.,]*)\s*(?:ft|forint)\s*$/i);
    if (!m) return {text,price:null};
    return {text:text.slice(0,m.index).trim(),price:Number(m[1].replace(/\s/g,'').replace(',','.'))};
  }

  function extractQuantity(text) {
    let s=text.trim(), qty=null, unit=null;
    const U='kg|g|l|ml|db|csomag|doboz|üveg|uveg|flakon|zacskó|zacsko';
    let m;

    m=s.match(new RegExp('^(\\d+(?:[.,]\\d+)?)\\s*('+U+')\\s+(.+)$','i'));
    if (m) { qty=Number(m[1].replace(',','.')); unit=normalize(m[2]); s=m[3].trim(); }
    else {
      m=s.match(new RegExp('^(.+?)\\s+(\\d+(?:[.,]\\d+)?)\\s*('+U+')$','i'));
      if (m) { s=m[1].trim(); qty=Number(m[2].replace(',','.')); unit=normalize(m[3]); }
      else {
        m=s.match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/);
        if (m) { qty=Number(m[1].replace(',','.')); s=m[2].trim(); }
        else {
          m=s.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)$/);
          if (m) { s=m[1].trim(); qty=Number(m[2].replace(',','.')); }
        }
      }
    }

    if (unit==='g') { qty/=1000; unit='kg'; }
    if (unit==='ml') { qty/=1000; unit='l'; }
    if (unit==='uveg'||unit==='üveg') unit='üveg';
    if (unit==='zacsko'||unit==='zacskó') unit='csomag';
    return {text:s,qty,unit};
  }

  function parseInput(raw) {
    const p=extractPrice(raw.trim()), q=extractQuantity(p.text), name=q.text.trim();
    if (!name) return null;

    const key=normalize(name), rec=recognize(name), fb=fallback(name), mem=priceMemory[key];
    const category=rec?.category||fb.category, icon=rec?.icon||fb.icon;
    const defPrice=rec?.price||fb.price, defUnit=rec?.unit||fb.unit;
    const unit=q.unit||mem?.unit||defUnit, qty=q.qty??1;
    const price=p.price??mem?.price??defPrice, source=(p.price!=null||mem)?'user':'estimate';

    if (p.price!=null) priceMemory[key]={price:p.price,unit};
    return {id:crypto.randomUUID?.()||String(Date.now()+Math.random()),name,category,icon,qty:Math.max(.01,qty),unit,price:Math.max(0,price),source,done:false,createdAt:Date.now()};
  }

  function save() {
    localStorage.setItem(STORAGE,JSON.stringify(items));
    localStorage.setItem(PRICE_MEMORY,JSON.stringify(priceMemory));
    localStorage.setItem(LEARNED,JSON.stringify(learned));
  }

  function money(n) { return new Intl.NumberFormat('hu-HU',{maximumFractionDigits:0}).format(Math.round(n))+' Ft'; }
  function num(n) { return new Intl.NumberFormat('hu-HU',{maximumFractionDigits:2}).format(n); }
  function step(unit) { return (unit==='kg'||unit==='l') ? 0.1 : 1; }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function render() {
    const visible=hideDone?items.filter(i=>!i.done):items;
    listRoot.innerHTML='';
    if (!visible.length) listRoot.innerHTML='<div class="empty">A lista üres. Írj be egy terméket fent. 🛒</div>';

    for (const cat of categoryOrder) {
      const arr=visible.filter(i=>i.category===cat);
      if (!arr.length) continue;
      const sec=document.createElement('section');
      sec.className='category-block';
      sec.innerHTML=`<div class="category-head"><span class="category-title"><span>${categories[cat]}</span>${escapeHtml(cat)}</span><span>${arr.length}</span></div><div class="items"></div>`;
      const box=sec.querySelector('.items');

      for (const i of arr) {
        const row=document.createElement('article');
        row.className='item'+(i.done?' done':'');
        row.dataset.id=i.id;
        const line=i.price*i.qty;
        row.innerHTML=`<input class="check" type="checkbox" ${i.done?'checked':''} aria-label="${escapeHtml(i.name)} kipipálása"><div class="product-icon">${i.icon}</div><div class="item-main"><div class="item-name">${escapeHtml(i.name)}</div><div class="chips"><span class="pill">${escapeHtml(i.category)}</span><div class="qty"><button type="button" data-act="minus" aria-label="Mennyiség csökkentése">−</button><span>${num(i.qty)}</span><button type="button" data-act="plus" aria-label="Mennyiség növelése">+</button></div><span class="unit">${escapeHtml(i.unit)}</span><span class="pill ${i.source==='user'?'user':'estimate'}">${i.source==='user'?'saját ár':'≈ becsült'}</span></div><div class="price-line">${money(line)} <span class="unit">(${money(i.price)}/${escapeHtml(i.unit)})</span></div></div><div class="actions"><button class="mini-btn" type="button" data-act="edit" aria-label="Szerkesztés">✎</button><button class="mini-btn delete" type="button" data-act="remove" aria-label="Törlés">🗑️</button></div>`;
        box.appendChild(row);
      }
      listRoot.appendChild(sec);
    }

    const sum=items.reduce((a,i)=>a+i.price*i.qty,0), done=items.filter(i=>i.done).length, estimated=items.filter(i=>i.source==='estimate').length;
    countText.textContent=`${items.length} tétel • ${done} kipipálva`;
    totalText.textContent=(estimated?'≈ ':'')+money(sum);
    hideDoneBtn.textContent=hideDone?'Minden tétel mutatása':'✓ Kipipáltak elrejtése';
  }

  function openEdit(item) {
    $('editId').value=item.id; $('editName').value=item.name; $('editIcon').value=item.icon;
    $('editUnit').value=item.unit; $('editPrice').value=Math.round(item.price); $('learnRule').checked=true;
    const select=$('editCategory');
    select.innerHTML=categoryOrder.map(c=>`<option ${c===item.category?'selected':''}>${c}</option>`).join('');
    editDialog.showModal();
  }

  addForm.addEventListener('submit',e=>{
    e.preventDefault();
    const parsed=parseInput(input.value);
    if (!parsed) return;
    const existing=items.find(i=>normalize(i.name)===normalize(parsed.name)&&i.unit===parsed.unit&&!i.done);
    if (existing) {
      existing.qty+=parsed.qty;
      if (parsed.source==='user') { existing.price=parsed.price; existing.source='user'; }
    } else items.unshift(parsed);
    input.value=''; save(); render(); input.focus();
  });

  hideDoneBtn.addEventListener('click',()=>{hideDone=!hideDone;render();});
  clearDoneBtn.addEventListener('click',()=>{items=items.filter(i=>!i.done);save();render();});

  listRoot.addEventListener('change',e=>{
    const row=e.target.closest('.item'); if(!row)return;
    const item=items.find(i=>i.id===row.dataset.id); if(!item)return;
    if(e.target.classList.contains('check')){item.done=e.target.checked;save();render();}
  });

  listRoot.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b)return;
    const row=b.closest('.item'); if(!row)return;
    const item=items.find(i=>i.id===row.dataset.id); if(!item)return;
    const act=b.dataset.act;
    if(act==='remove')items=items.filter(i=>i.id!==item.id);
    if(act==='minus')item.qty=Math.max(step(item.unit),+(item.qty-step(item.unit)).toFixed(2));
    if(act==='plus')item.qty=+(item.qty+step(item.unit)).toFixed(2);
    if(act==='edit'){openEdit(item);return;}
    save();render();
  });

  editForm.addEventListener('submit',e=>{
    e.preventDefault();
    const id=$('editId').value,item=items.find(i=>i.id===id); if(!item)return;
    const oldKey=normalize(item.name);
    item.name=$('editName').value.trim()||item.name;
    item.category=$('editCategory').value;
    item.icon=$('editIcon').value.trim()||categories[item.category]||'🛒';
    item.unit=$('editUnit').value;
    item.price=Math.max(0,Number($('editPrice').value)||0);
    item.source='user';
    priceMemory[normalize(item.name)]={price:item.price,unit:item.unit};
    if($('learnRule').checked){
      learned[normalize(item.name)]={label:item.name,category:item.category,icon:item.icon,price:item.price,unit:item.unit,kind:'learned'};
      if(oldKey!==normalize(item.name))delete learned[oldKey];
    }
    save();render();editDialog.close();
  });

  $('closeEditBtn').addEventListener('click',()=>editDialog.close());
  $('cancelEditBtn').addEventListener('click',()=>editDialog.close());

  function applyTheme(t){document.documentElement.dataset.theme=t;localStorage.setItem(THEME,t);}
  const savedTheme=localStorage.getItem(THEME);
  if(savedTheme)applyTheme(savedTheme);
  else if(matchMedia('(prefers-color-scheme: dark)').matches)applyTheme('dark');
  else applyTheme('light');
  themeBtn.addEventListener('click',()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));

  if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{});}
  if (refreshEstimatedRecognition()) save();
  render();
})();
