(() => {
  'use strict';

  // Zoé Lista – kibővített magyar piaci katalógus, 2026-08.
  // Tesco / Lidl / ALDI / SPAR friss és közelmúltbeli magyar kínálata alapján
  // kerekített, tájékoztató becsült árak. Nem akciós árgarancia.
  // A felhasználó saját tanítása és saját ára mindig elsőbbséget élvez.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const MARKET_VERSION = 20260822;

  const DATA = `
# HAL ÉS TENGER GYÜMÖLCSEI
halmix;hal mix|Halválogatás|Hal és tenger gyümölcsei|🐟|2999|csomag
tenger gyümölcsei;tengergyümölcsei;tengeri herkentyű;tengeri herkentyűk;seafood mix;seafood|Tenger gyümölcsei|Hal és tenger gyümölcsei|🦐|3299|csomag
garnéla;garnela;shrimp;rákfarok;rakfarok|Garnéla|Hal és tenger gyümölcsei|🦐|2999|csomag
argentin garnéla;argentin garnela;vörös garnéla;voros garnela|Argentin vörös garnéla|Hal és tenger gyümölcsei|🦐|5699|csomag
garnéla nyárs;garnela nyars;ráknyárs;raknyars|Garnéla nyárs|Hal és tenger gyümölcsei|🍤|1999|csomag
kagyló;kagylo;kagylóhús;kagylohus;mussel|Kagyló|Hal és tenger gyümölcsei|🦪|1999|csomag
scampi;languszta;langusztin|Scampi / langusztin|Hal és tenger gyümölcsei|🦐|3999|csomag
tintahal;calamari;kalamar|Tintahal|Hal és tenger gyümölcsei|🦑|2499|csomag
polip;octopus|Polip|Hal és tenger gyümölcsei|🐙|3499|csomag
tonhal steak;tonhalsteak;tuna steak|Tonhalsteak|Hal és tenger gyümölcsei|🐟|3299|csomag
lazacfilé;lazacfile;bőrös lazacfilé;boros lazacfile|Lazacfilé|Hal és tenger gyümölcsei|🐟|7999|kg
füstölt lazac;fustolt lazac|Füstölt lazac|Hal és tenger gyümölcsei|🐟|1999|csomag
afrikai harcsa;harcsafilé;harcsafile|Afrikai harcsafilé|Hal és tenger gyümölcsei|🐟|3999|kg
hekk;hekkfilé;hekkfile|Hekk|Hal és tenger gyümölcsei|🐟|3499|kg
pisztráng;pisztrang|Pisztráng|Hal és tenger gyümölcsei|🐟|3999|kg
aranydurbincs;durbincs|Aranydurbincs|Hal és tenger gyümölcsei|🐟|2999|db
hering;heringtekercs;bismarck hering|Hering|Hal és tenger gyümölcsei|🐟|999|üveg
halikra;capelin ikra|Halikra|Hal és tenger gyümölcsei|🫙|1299|üveg
sushi;susi|Sushi|Hal és tenger gyümölcsei|🍣|1899|csomag
surimi;rákrúd;rakrud|Surimi / rákrúd|Hal és tenger gyümölcsei|🦀|899|csomag

# SZESZES ITALOK – WHISKY, LIKŐR, VODKA, GIN, RUM
jägermeister;jagermeister;jaegermeister;jager;jäger|Jägermeister 0,7 l|Szeszes italok|🥃|8490|üveg
jägermeister orange;jagermeister orange|Jägermeister Orange 0,7 l|Szeszes italok|🥃|8490|üveg
jim beam;jimbeam;jim bim|Jim Beam Bourbon 0,7 l|Szeszes italok|🥃|8990|üveg
jim beam honey;jim beam apple;jim beam peach;jim beam cherry|Jim Beam ízesített 0,7 l|Szeszes italok|🥃|8990|üveg
jack daniels;jack daniel's;jack daniel;dzsek denielsz|Jack Daniel's 0,7 l|Szeszes italok|🥃|9590|üveg
jameson;dzsémszon;dzsemzon|Jameson 0,7 l|Szeszes italok|🥃|9590|üveg
johnnie walker;jonny walker;johnny walker|Johnnie Walker Red Label|Szeszes italok|🥃|8490|üveg
black velvet|Black Velvet whisky|Szeszes italok|🥃|6390|üveg
chivas;chivas regal|Chivas Regal 12YO 0,7 l|Szeszes italok|🥃|11990|üveg
ballantines;ballantine's;ballantine|Ballantine's whisky|Szeszes italok|🥃|6990|üveg
grants;grant's|Grant's whisky|Szeszes italok|🥃|6990|üveg
famous grouse;the famous grouse|Famous Grouse whisky|Szeszes italok|🥃|7290|üveg
absolut;absolut vodka|Absolut vodka|Szeszes italok|🍸|6990|üveg
finlandia;finlandia vodka|Finlandia vodka|Szeszes italok|🍸|6990|üveg
royal vodka;royal|Royal vodka|Szeszes italok|🍸|4290|üveg
kalinka;kalinka vodka|Kalinka vodka|Szeszes italok|🍸|3990|üveg
gordons;gordon's;gordon gin|Gordon's gin|Szeszes italok|🍸|6990|üveg
beefeater;beefeater gin|Beefeater gin|Szeszes italok|🍸|7490|üveg
bombay sapphire;bombay gin|Bombay Sapphire gin|Szeszes italok|🍸|8990|üveg
tanqueray;tanqueray gin|Tanqueray gin|Szeszes italok|🍸|8990|üveg
captain morgan;kapitány morgan|Captain Morgan rum|Szeszes italok|🥃|6990|üveg
bacardi;bacardi rum|Bacardi rum|Szeszes italok|🥃|6990|üveg
havana club;havanna club|Havana Club rum|Szeszes italok|🥃|6990|üveg
unicum;zwack unicum|Unicum|Szeszes italok|🥃|6990|üveg
baileys;bailey's|Baileys krémlikőr|Szeszes italok|🥃|6990|üveg
fütyülős;futyulos|Fütyülős szeszesital|Szeszes italok|🥃|4699|üveg
hubertus;hubi|Hubertus likőr|Szeszes italok|🥃|3990|üveg
martini;martini bianco;martini rosso|Martini vermut|Szeszes italok|🍸|4490|üveg
aperol|Aperol|Szeszes italok|🍹|6490|üveg
campari|Campari|Szeszes italok|🍹|6990|üveg
metaxa|Metaxa|Szeszes italok|🥃|6990|üveg

# SÖRÖK ÉS BOROK – TOVÁBBI CSALÁD
pécsi sör;pecsi sor;pécsi|Pécsi sör|Szeszes italok|🍺|399|db
miller;miller sör;miller sor|Miller sör|Szeszes italok|🍺|499|db
hoegaarden;hoegaarden sör|Hoegaarden búzasör|Szeszes italok|🍺|599|db
budweiser;budvar;budweiser budvar|Budweiser Budvar sör|Szeszes italok|🍺|499|db
leffe;leffe sör|Leffe sör|Szeszes italok|🍺|699|db
csíki sör;csiki sor;tiltott csíki|Csíki sör|Szeszes italok|🍺|599|db
alkoholmentes sör;alkoholmentes sor;0% sör;0 sör|Alkoholmentes sör|Italok|🍺|399|db
édes vörösbor;edes vorosbor|Édes vörösbor|Szeszes italok|🍷|1999|üveg
száraz vörösbor;szaraz vorosbor|Száraz vörösbor|Szeszes italok|🍷|1999|üveg
fehérbor;feherbor;fehér bor|Fehérbor|Szeszes italok|🥂|1799|üveg
rozé;rose;rosé;rozébor|Rozébor|Szeszes italok|🍷|1799|üveg
irsai olivér;irsai oliver|Irsai Olivér bor|Szeszes italok|🥂|1999|üveg
olaszrizling|Olaszrizling|Szeszes italok|🥂|1799|üveg
egri bikavér;egri bikaver|Egri Bikavér|Szeszes italok|🍷|2299|üveg
tokaji furmint;furmint|Tokaji Furmint|Szeszes italok|🥂|2299|üveg
pezsgő;pezsgo;champagne|Pezsgő|Szeszes italok|🍾|2499|üveg
prosecco|Prosecco|Szeszes italok|🍾|2999|üveg

# REGGELI, GABONAPEHELY, KRÉMEK
corn flakes;kukoricapehely|Kukoricapehely|Alapélelmiszer|🥣|999|doboz
kelloggs corn flakes;kellogg's corn flakes|Kellogg's Corn Flakes|Alapélelmiszer|🥣|1699|doboz
cini minis;cini-minis;cinnamon minis|Cini Minis gabonapehely|Alapélelmiszer|🥣|1699|doboz
cheerios|Cheerios gabonapehely|Alapélelmiszer|🥣|1699|doboz
lion gabonapehely;lion cereal|Lion gabonapehely|Alapélelmiszer|🥣|1699|doboz
fitness gabonapehely;nestlé fitness;nestle fitness|Fitness gabonapehely|Alapélelmiszer|🥣|1699|doboz
müzli;muzli|Müzli|Alapélelmiszer|🥣|999|csomag
granola|Granola|Alapélelmiszer|🥣|1299|csomag
zabkása;zabkasa;instant zabkása|Zabkása|Alapélelmiszer|🥣|699|doboz
mogyoróvaj;mogyorovaj;peanut butter|Mogyoróvaj|Alapélelmiszer|🥜|1499|üveg
lekvár;lekvar;dzsem|Lekvár / dzsem|Alapélelmiszer|🍓|999|üveg
méz;mez|Méz|Alapélelmiszer|🍯|1999|üveg

# HÚS, FELVÁGOTT, KÉSZ HÚSÁRU
bécsi virsli;becsi virsli|Bécsi virsli|Hús és felvágott|🌭|1399|csomag
füstli;fustli;master good füstli|Füstli virsli|Hús és felvágott|🌭|999|csomag
sonkaválogatás;sonkavalogatas|Sonkaválogatás|Hús és felvágott|🥓|1299|csomag
csirkemell sonka;csirkemellsonka|Csirkemellsonka|Hús és felvágott|🥓|899|csomag
párizsi;parizsi|Párizsi|Hús és felvágott|🥓|799|csomag
zala felvágott;zala felvagott|Zala felvágott|Hús és felvágott|🥓|699|csomag
olasz felvágott;olasz felvagott|Olasz felvágott|Hús és felvágott|🥓|699|csomag
grillkolbász;grill kolbász|Grillkolbász|Hús és felvágott|🌭|999|csomag
szárazkolbász;szarazkolbasz|Szárazkolbász|Hús és felvágott|🌭|899|csomag
csirkeszárny;csirke szárny|Csirkeszárny|Hús és felvágott|🍗|1099|kg
csirkemáj;csirke maj|Csirkemáj|Hús és felvágott|🍗|899|kg
sertésoldalas;sertesoldalas;oldalas|Sertésoldalas|Hús és felvágott|🥩|1799|kg
darált sertéshús;daralt serteshus;darált disznóhús|Darált sertéshús|Hús és felvágott|🥩|2799|kg
rump steak;rumpsteak|Rump steak|Hús és felvágott|🥩|7490|kg

# TEJTERMÉK – KONKRÉT CSOMAGOLT TÍPUSOK
szeletelt trappista;szeletelt sajt|Szeletelt trappista sajt|Tejtermék és tojás|🧀|799|csomag
laktózmentes sajt;laktozmentes sajt|Laktózmentes szeletelt sajt|Tejtermék és tojás|🧀|799|csomag
gouda szeletelt;szeletelt gouda|Szeletelt Gouda|Tejtermék és tojás|🧀|899|csomag
sajtrúd;sajtrud|Sajtrúd|Tejtermék és tojás|🧀|699|csomag
puding;csokipuding;vaníliapuding|Puding|Tejtermék és tojás|🍮|299|db
tejberizs|Tejberizs|Tejtermék és tojás|🥣|399|db
ivójoghurt;ivojoghurt|Ivójoghurt|Tejtermék és tojás|🥛|349|db
proteinjoghurt;protein joghurt|Proteinjoghurt|Tejtermék és tojás|🥣|499|db
proteindesszert;protein puding|Protein desszert|Tejtermék és tojás|🍮|499|db

# PÉKÁRU – FRISSEN SÜTÖTT CSALÁD
sajtos stangli;sajtostangli|Sajtos stangli|Pékáru|🥖|199|db
sajtos pogácsa;sajtos pogacsa|Sajtos pogácsa|Pékáru|🥨|249|db
tepertős pogácsa;tepertos pogacsa|Tepertős pogácsa|Pékáru|🥨|299|db
fahéjas csiga;fahejas csiga|Fahéjas csiga|Pékáru|🥐|299|db
mákos párna;makos parna|Mákos párna|Pékáru|🥐|299|db
bolognai péksüti;bolognai hatszög|Bolognai péksütemény|Pékáru|🥐|399|db
sajtos sonkás croissant;sajtos-sonkás croissant|Sajtos-sonkás croissant|Pékáru|🥐|449|db
kuglóf;kuglof|Kuglóf|Pékáru|🍰|699|db
muffin|Muffin|Pékáru|🧁|399|db

# FAGYASZTOTT ÉS KÉSZÉTEL
fagyasztott zöldség;fagyasztott zoldseg;mirelit zöldség;mirelit zoldseg|Fagyasztott zöldség|Fagyasztott|🥦|899|csomag
serpenyős zöldség;serpenyos zoldseg|Serpenyős zöldségkeverék|Fagyasztott|🥦|899|csomag
fagyasztott borsó;zöldborsó mirelit|Fagyasztott zöldborsó|Fagyasztott|🫛|699|csomag
fagyasztott spenót;fagyasztott spenot|Fagyasztott spenót|Fagyasztott|🥬|699|csomag
fagyasztott gyümölcs;erdei gyümölcs fagyasztott|Fagyasztott gyümölcs|Fagyasztott|🫐|1499|csomag
csirkemell nuggets;nuggets;csirkenuggets|Csirke nuggets|Fagyasztott|🍗|1699|csomag
rántott sajt;rantott sajt|Rántott sajt|Fagyasztott|🧀|1799|csomag
bécsi szelet;becsi szelet|Bécsi szelet|Fagyasztott|🥩|1699|csomag
lasagne;fagyasztott lasagne|Lasagne készétel|Fagyasztott|🍝|1499|csomag
hamburger húspogácsa;hamburger huspogacsa|Hamburger húspogácsa|Fagyasztott|🍔|1999|csomag
jégkocka;jegkocka|Jégkocka|Fagyasztott|🧊|699|csomag

# KONZERV, SZÓSZ, SAVANYÚSÁG, KAMRA
babgulyás konzerv;babgulyas konzerv|Babgulyás konzerv|Alapélelmiszer|🥫|699|doboz
húsgombóc konzerv;husgomboc konzerv|Húsgombóc paradicsomszószban|Alapélelmiszer|🥫|699|doboz
kukorica konzerv;csemegekukorica konzerv|Csemegekukorica konzerv|Alapélelmiszer|🥫|499|doboz
zöldborsó konzerv;zoldborso konzerv|Zöldborsó konzerv|Alapélelmiszer|🥫|499|doboz
vörösbab konzerv;vorosbab konzerv|Vörösbab konzerv|Alapélelmiszer|🥫|499|doboz
csicseriborsó konzerv;csicseriborso konzerv|Csicseriborsó konzerv|Alapélelmiszer|🥫|499|doboz
paradicsompüré;paradicsompure|Paradicsompüré|Alapélelmiszer|🍅|499|doboz
passata;passzírozott paradicsom|Passata|Alapélelmiszer|🍅|599|üveg
pesto;zöld pesto;rosso pesto|Pesto|Alapélelmiszer|🌿|899|üveg
szójaszósz;szojaszosz|Szójaszósz|Alapélelmiszer|🥢|899|üveg
chiliszósz;chili szósz;chiliszosz|Chiliszósz|Alapélelmiszer|🌶️|899|üveg
barbecue szósz;bbq szósz;bbq szosz|BBQ szósz|Alapélelmiszer|🍖|899|üveg
torma;reszelt torma|Torma|Alapélelmiszer|🌱|599|üveg

# SNACK, ÉDESSÉG, MAGVAK
knoppers|Knoppers|Snack és édesség|🍫|999|csomag
bob snail;gyümölcstekercs|Gyümölcstekercs|Snack és édesség|🍓|549|csomag
kesudió;kesudio|Kesudió|Snack és édesség|🥜|1299|csomag
pisztácia;pisztacia|Pisztácia|Snack és édesség|🥜|1999|csomag
földimogyoró;foldimogyoro;mogyoró sós|Földimogyoró|Snack és édesség|🥜|699|csomag
dió;dio|Dióbél|Snack és édesség|🌰|1499|csomag
mandula|Mandula|Snack és édesség|🌰|1299|csomag
aszalt áfonya;aszalt afonya|Aszalt áfonya|Snack és édesség|🫐|999|csomag
aszalt gyümölcs;aszalt gyumolcs|Aszalt gyümölcs|Snack és édesség|🍇|899|csomag

# HÁZTARTÁS ÉS TAKARÍTÁS
általános tisztítószer;altalanos tisztitoszer|Általános tisztítószer|Háztartás|🧽|599|flakon
fürdőszobai tisztító;furdoszobai tisztito|Fürdőszobai tisztítószer|Háztartás|🧽|729|flakon
vízkőoldó;vizkooldo;vízkőoldó spray|Vízkőoldó|Háztartás|🧽|699|flakon
ablaktisztító;ablaktisztito|Ablaktisztító|Háztartás|🪟|699|flakon
fertőtlenítő;fertotlenito|Fertőtlenítő|Háztartás|🧴|899|flakon
mosogatógép tabletta;mosogatogep tabletta;mosogatógép kapszula;mosogatogep kapszula|Mosogatógép-tabletta|Háztartás|🍽️|2499|doboz
finish tabletta;finish kapszula|Finish mosogatógép-tabletta|Háztartás|🍽️|4999|doboz
mosókapszula;mosokapszula|Mosókapszula|Háztartás|🧺|4999|csomag
mosógél;mosogel;folyékony mosószer;folyekony mososzer|Folyékony mosószer|Háztartás|🧺|3999|flakon
mosogató szivacs;mosogatószivacs;mosogatoszivacs|Mosogatószivacs|Háztartás|🧽|299|csomag
nedves törlőkendő háztartási;haztartasi nedves torlokendo|Háztartási nedves törlőkendő|Háztartás|🧻|599|csomag
uzsonnástasak;uzsonnastasak|Uzsonnástasak|Háztartás|🛍️|399|csomag
alufólia;alufolia;alumínium fólia|Alufólia|Háztartás|🧻|899|db
folpack;frissentartó fólia;frissentarto folia|Frissentartó fólia|Háztartás|🧻|699|db
sütőpapír;sutopapir|Sütőpapír|Háztartás|📜|699|csomag
légfrissítő;legfrissito|Légfrissítő|Háztartás|🌸|699|flakon
illatosító pálca;illatosito palca|Illatosító pálcák|Háztartás|🌸|1399|csomag

# HIGIÉNIA ÉS SZÉPSÉGÁPOLÁS
tampon;tamponok|Tampon|Higiénia|🩸|1499|csomag
tisztasági betét;tisztasagi betet|Tisztasági betét|Higiénia|🩸|999|csomag
nedves wc papír;nedves wc papir;nedves toalettpapír|Nedves toalettpapír|Higiénia|🧻|699|csomag
vattakorong;vatta korong|Vattakorong|Higiénia|⚪|699|csomag
fültisztító pálcika;fultisztito palcika;fülpálcika|Fültisztító pálcika|Higiénia|🧴|499|csomag
folyékony szappan;folyekony szappan|Folyékony szappan|Higiénia|🧼|499|flakon
kézkrém;kezkrém;kezkrem|Kézkrém|Higiénia|🧴|799|db
testápoló;testapolo|Testápoló|Higiénia|🧴|1299|flakon
ajakápoló;ajakapolo|Ajakápoló|Higiénia|💄|899|db
hajlakk|Hajlakk|Higiénia|💇|1499|flakon
hajzselé;hajzsele|Hajzselé|Higiénia|💇|1299|db
szájvíz;szajviz|Szájvíz|Higiénia|🪥|1499|flakon
fogselyem|Fogselyem|Higiénia|🦷|999|db

# BABA, ÁLLAT
babatörlő;baba törlőkendő;baba torlokendo|Baba törlőkendő|Baba és gyermek|👶|999|csomag
bugyipelenka|Bugyipelenka|Baba és gyermek|👶|3999|csomag
macska konzerv;macskakonzerv|Macskaeledel konzerv|Állateledel|🐱|499|db
macska alutasak;macska tasak|Macskaeledel alutasak|Állateledel|🐱|249|db
kutya konzerv;kutyakonzerv|Kutyaeledel konzerv|Állateledel|🐶|699|db
jutalomfalat kutya;kutyajutalom|Kutya jutalomfalat|Állateledel|🐶|899|csomag
jutalomfalat macska;macskajutalom|Macska jutalomfalat|Állateledel|🐱|699|csomag

# IRODASZER, HÉTKÖZNAPI APRÓCIKK
írószer;iroszer|Írószer|Egyéb|🖊️|699|csomag
golyóstoll;golyostoll;toll|Golyóstoll|Egyéb|🖊️|499|db
ceruza;grafitceruza|Ceruza|Egyéb|✏️|299|db
radír;radir|Radír|Egyéb|🧽|299|db
hegyező;hegyezo|Hegyező|Egyéb|✏️|399|db
szövegkiemelő;szovegkiemelo|Szövegkiemelő|Egyéb|🖍️|499|db
füzet;fuzet|Füzet|Egyéb|📓|399|db
jegyzetfüzet;jegyzetfuzet|Jegyzetfüzet|Egyéb|📔|699|db
ragasztóstift;ragasztostift|Ragasztóstift|Egyéb|🧴|499|db
vonalzó;vonalzo|Vonalzó|Egyéb|📏|399|db
olló;ollo|Olló|Egyéb|✂️|699|db
`.trim();

  function normalize(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  }

  let learned = {};
  try { learned = JSON.parse(localStorage.getItem(LEARNED_KEY)) || {}; } catch { learned = {}; }

  for (const raw of DATA.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const [aliasText,label,category,icon,priceText,unit='db'] = line.split('|');
    if (!aliasText || !label || !category || !icon || !priceText) continue;
    const rule = {
      label,
      category,
      icon,
      price:Number(priceText),
      unit,
      kind:'learned',
      builtinCatalog:true,
      marketCatalog:true,
      builtinVersion:MARKET_VERSION
    };
    for (const alias of aliasText.split(';')) {
      const key = normalize(alias);
      if (!key) continue;
      const previous = learned[key];
      if (!previous || previous.builtinCatalog) learned[key] = {...rule};
    }
  }

  try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); } catch {}
})();
