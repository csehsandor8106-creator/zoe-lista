(() => {
  'use strict';

  // Zoé Lista beépített magyar szupermarket-katalógus.
  // Az árak tájékoztató, kerekített magyar kiskereskedelmi becslések.
  // A felhasználó saját tanított szabályait soha nem írjuk felül.
  const LEARNED_KEY = 'zoe-lista-learned-v1';
  const CATALOG_VERSION = 1;

  const DATA = `
# ZÖLDSÉG-GYÜMÖLCS
alma|Alma|Zöldség-gyümölcs|🍎|699|kg
körte|Körte|Zöldség-gyümölcs|🍐|999|kg
banán;banan|Banán|Zöldség-gyümölcs|🍌|699|kg
narancs|Narancs|Zöldség-gyümölcs|🍊|899|kg
mandarin;klementin|Mandarin / klementin|Zöldség-gyümölcs|🍊|999|kg
citrom|Citrom|Zöldség-gyümölcs|🍋|1099|kg
lime;zöldcitrom|Lime|Zöldség-gyümölcs|🍋|1499|kg
szőlő;szolo|Szőlő|Zöldség-gyümölcs|🍇|1399|kg
eper;szamóca|Eper|Zöldség-gyümölcs|🍓|2999|kg
málna;malna|Málna|Zöldség-gyümölcs|🫐|3999|kg
áfonya;afonya|Áfonya|Zöldség-gyümölcs|🫐|1199|db
szeder|Szeder|Zöldség-gyümölcs|🫐|2999|kg
cseresznye|Cseresznye|Zöldség-gyümölcs|🍒|2499|kg
meggy|Meggy|Zöldség-gyümölcs|🍒|1799|kg
őszibarack;oszibarack;barack|Őszibarack|Zöldség-gyümölcs|🍑|999|kg
nektarin|Nektarin|Zöldség-gyümölcs|🍑|1199|kg
sárgabarack;sargabarack|Sárgabarack|Zöldség-gyümölcs|🍑|1499|kg
szilva|Szilva|Zöldség-gyümölcs|🍑|899|kg
görögdinnye;gorogdinnye;dinnye|Görögdinnye|Zöldség-gyümölcs|🍉|249|kg
sárgadinnye;sargadinnye|Sárgadinnye|Zöldség-gyümölcs|🍈|599|kg
ananász;ananasz|Ananász|Zöldség-gyümölcs|🍍|999|db
mangó;mango|Mangó|Zöldség-gyümölcs|🥭|799|db
avokádó;avokado;avocado|Avokádó|Zöldség-gyümölcs|🥑|399|db
kiwi;kivi|Kiwi|Zöldség-gyümölcs|🥝|1399|kg
grapefruit;grépfrút|Grapefruit|Zöldség-gyümölcs|🍊|1099|kg
kókusz;kokusz|Kókuszdió|Zöldség-gyümölcs|🥥|699|db
burgonya;krumpli|Burgonya|Zöldség-gyümölcs|🥔|499|kg
édesburgonya;edesburgonya;batáta;batata|Édesburgonya|Zöldség-gyümölcs|🍠|1099|kg
sárgarépa;sargarepa;répa|Sárgarépa|Zöldség-gyümölcs|🥕|499|kg
fehérrépa;feherrepa;petrezselyemgyökér|Fehérrépa|Zöldség-gyümölcs|🥕|999|kg
zeller;zellergumó|Zeller|Zöldség-gyümölcs|🥬|899|kg
vöröshagyma;voroshagyma;hagyma|Vöröshagyma|Zöldség-gyümölcs|🧅|399|kg
lilahagyma|Lilahagyma|Zöldség-gyümölcs|🧅|699|kg
fokhagyma|Fokhagyma|Zöldség-gyümölcs|🧄|1999|kg
újhagyma;ujhagyma|Újhagyma|Zöldség-gyümölcs|🧅|399|db
póréhagyma;porehagyma|Póréhagyma|Zöldség-gyümölcs|🧅|899|kg
paradicsom|Paradicsom|Zöldség-gyümölcs|🍅|899|kg
koktélparadicsom;koktelparadicsom|Koktélparadicsom|Zöldség-gyümölcs|🍅|899|db
paprika;tv paprika|Paprika|Zöldség-gyümölcs|🫑|999|kg
kaliforniai paprika|Kaliforniai paprika|Zöldség-gyümölcs|🫑|1499|kg
erős paprika;eros paprika;hegyes erős|Erős paprika|Zöldség-gyümölcs|🌶️|899|kg
uborka;kígyóuborka;kigyouborka|Kígyóuborka|Zöldség-gyümölcs|🥒|399|db
csemegeuborka friss|Csemegeuborka|Zöldség-gyümölcs|🥒|899|kg
saláta;fejes saláta|Fejes saláta|Zöldség-gyümölcs|🥬|499|db
jégsaláta;jegsalata|Jégsaláta|Zöldség-gyümölcs|🥬|599|db
rukkola|Rukkola|Zöldség-gyümölcs|🥬|599|db
spenót;spenot|Spenót|Zöldség-gyümölcs|🥬|899|db
káposzta;kaposzta|Fejes káposzta|Zöldség-gyümölcs|🥬|499|kg
lilakáposzta;lilakaposzta|Lila káposzta|Zöldség-gyümölcs|🥬|599|kg
kelkáposzta;kelkaposzta|Kelkáposzta|Zöldség-gyümölcs|🥬|699|kg
karfiol|Karfiol|Zöldség-gyümölcs|🥦|899|kg
brokkoli|Brokkoli|Zöldség-gyümölcs|🥦|999|kg
cukkini|Cukkini|Zöldség-gyümölcs|🥒|799|kg
padlizsán;padlizsan|Padlizsán|Zöldség-gyümölcs|🍆|999|kg
sütőtök;sutotok|Sütőtök|Zöldség-gyümölcs|🎃|599|kg
gomba;csiperke|Csiperkegomba|Zöldség-gyümölcs|🍄|1399|kg
laskagomba|Laskagomba|Zöldség-gyümölcs|🍄|1799|kg
kukorica cső;csöves kukorica|Csemegekukorica|Zöldség-gyümölcs|🌽|299|db
retek;hónapos retek|Retek|Zöldség-gyümölcs|🥕|399|db

# TEJTERMÉK ÉS TOJÁS
tej;friss tej;uht tej|Tej|Tejtermék és tojás|🥛|399|db
laktózmentes tej;laktozmentes tej|Laktózmentes tej|Tejtermék és tojás|🥛|499|db
kakaó;kakao;kakaós tej|Kakaóital|Tejtermék és tojás|🥛|399|db
vaj|Vaj|Tejtermék és tojás|🧈|899|db
margarin|Margarin|Tejtermék és tojás|🧈|699|db
tejföl;tejfol|Tejföl|Tejtermék és tojás|🥣|499|db
joghurt|Joghurt|Tejtermék és tojás|🥣|249|db
görög joghurt;gorog joghurt|Görög joghurt|Tejtermék és tojás|🥣|499|db
gyümölcsjoghurt;gyümölcsös joghurt|Gyümölcsjoghurt|Tejtermék és tojás|🥣|299|db
kefir|Kefir|Tejtermék és tojás|🥛|299|db
túró;turo|Túró|Tejtermék és tojás|🥛|799|db
cottage cheese;szemcsés túró|Cottage cheese|Tejtermék és tojás|🥣|699|db
mascarpone|Mascarpone|Tejtermék és tojás|🧀|1199|db
tejszín;tejszin;főzőtejszín|Főzőtejszín|Tejtermék és tojás|🥛|699|db
habtejszín;habtejszin|Habtejszín|Tejtermék és tojás|🥛|799|db
sajt;trappista|Trappista sajt|Tejtermék és tojás|🧀|2899|kg
gouda|Gouda sajt|Tejtermék és tojás|🧀|3499|kg
edami|Edami sajt|Tejtermék és tojás|🧀|3299|kg
ementáli;ementali|Ementáli sajt|Tejtermék és tojás|🧀|4499|kg
cheddar|Cheddar sajt|Tejtermék és tojás|🧀|3999|kg
parmezán;parmezan;grana padano|Parmezán jellegű sajt|Tejtermék és tojás|🧀|6999|kg
mozzarella|Mozzarella|Tejtermék és tojás|🧀|599|db
feta;fehér sajt|Feta / fehér sajt|Tejtermék és tojás|🧀|999|db
camembert|Camembert|Tejtermék és tojás|🧀|899|db
brie|Brie sajt|Tejtermék és tojás|🧀|999|db
krémsajt;kremsajt|Krémsajt|Tejtermék és tojás|🧀|699|db
ömlesztett sajt;omlesztett sajt|Ömlesztett sajt|Tejtermék és tojás|🧀|799|db
tojás;tojas;10 tojás;10 db tojás|Tojás|Tejtermék és tojás|🥚|999|csomag
fürjtojás;furjtojas|Fürjtojás|Tejtermék és tojás|🥚|799|csomag

# PÉKÁRU
fehér kenyér;feher kenyer;kenyér|Fehér kenyér|Pékáru|🍞|699|db
félbarna kenyér;felbarna kenyer|Félbarna kenyér|Pékáru|🍞|749|db
teljes kiőrlésű kenyér;teljes kiorlesu kenyer|Teljes kiőrlésű kenyér|Pékáru|🍞|999|db
rozskenyér;rozskenyer|Rozskenyér|Pékáru|🍞|999|db
tósztkenyér;tosztkenyer;toast kenyér|Toast kenyér|Pékáru|🍞|799|db
zsemle|Zsemle|Pékáru|🥯|99|db
kifli|Kifli|Pékáru|🥐|99|db
vajas kifli|Vajas kifli|Pékáru|🥐|149|db
bagett;baguette|Bagett|Pékáru|🥖|599|db
ciabatta|Ciabatta|Pékáru|🥖|499|db
croissant;kroasszan|Croissant|Pékáru|🥐|299|db
kakaós csiga;kakaos csiga|Kakaós csiga|Pékáru|🥐|349|db
fahéjas csiga;fahejas csiga|Fahéjas csiga|Pékáru|🥐|399|db
túrós táska;turos taska|Túrós táska|Pékáru|🥐|399|db
pogácsa;pogacsa|Pogácsa|Pékáru|🥨|299|db
hamburger zsemle;hamburger buci|Hamburgerzsemle|Pékáru|🍔|799|csomag
hot dog kifli;hotdog kifli|Hot dog kifli|Pékáru|🌭|699|csomag
tortilla lap;tortilla|Tortillalap|Pékáru|🫓|899|csomag
pita|Pita|Pékáru|🫓|699|csomag

# HÚS ÉS FELVÁGOTT
csirke;egész csirke|Egész csirke|Hús és felvágott|🍗|1399|kg
csirkemell;csirkemellfilé;csirke mell|Csirkemellfilé|Hús és felvágott|🍗|1999|kg
csirkecomb;csirke comb|Csirkecomb|Hús és felvágott|🍗|1199|kg
csirkeszárny;csirke szárny|Csirkeszárny|Hús és felvágott|🍗|999|kg
csirkemáj;csirke máj|Csirkemáj|Hús és felvágott|🍗|899|kg
pulykamell;pulyka mell|Pulykamell|Hús és felvágott|🍗|2599|kg
pulykacomb;pulyka comb|Pulykacomb|Hús és felvágott|🍗|1799|kg
sertéshús;sertés hús;disznóhús;disznó hús|Sertéshús|Hús és felvágott|🥩|2499|kg
sertéskaraj;karaj|Sertéskaraj|Hús és felvágott|🥩|2299|kg
tarja;sertéstarja|Sertéstarja|Hús és felvágott|🥩|2499|kg
sertéscomb;disznócomb|Sertéscomb|Hús és felvágott|🥩|2199|kg
oldalas;sertésoldalas|Sertésoldalas|Hús és felvágott|🥩|2299|kg
sertéslapocka;lapocka|Sertéslapocka|Hús és felvágott|🥩|2099|kg
darált hús;daralt hus|Darált hús|Hús és felvágott|🥩|2499|kg
darált marha;darált marhahús|Darált marhahús|Hús és felvágott|🥩|4499|kg
marhahús;marha hús|Marhahús|Hús és felvágott|🥩|4999|kg
marhacomb|Marhacomb|Hús és felvágott|🥩|5499|kg
marhalábszár;marha lábszár|Marhalábszár|Hús és felvágott|🥩|4999|kg
steak;marha steak|Marhasteak|Hús és felvágott|🥩|7999|kg
kacsamell;kacsa mell|Kacsamell|Hús és felvágott|🦆|4999|kg
kacsacomb;kacsa comb|Kacsacomb|Hús és felvágott|🦆|3499|kg
libamáj;liba máj|Libamáj|Hús és felvágott|🦆|9999|kg
sonka|Sonka|Hús és felvágott|🥓|899|db
gépsonka;gepsonka|Gépsonka|Hús és felvágott|🥓|899|db
párizsi;parizsi|Párizsi|Hús és felvágott|🥓|699|db
szalámi;szalami|Szalámi|Hús és felvágott|🥓|999|db
téliszalámi;teliszalami|Téliszalámi|Hús és felvágott|🥓|1999|db
kolbász;kolbasz|Kolbász|Hús és felvágott|🌭|1999|db
virsli|Virsli|Hús és felvágott|🌭|1099|csomag
bacon|Bacon|Hús és felvágott|🥓|1099|db
tepertő;teperto|Tepertő|Hús és felvágott|🥓|2499|kg

# HAL ÉS TENGER GYÜMÖLCSEI
lazac;lazacfilé|Lazac|Hal és tenger gyümölcsei|🐟|6499|kg
tonhal;tonhal konzerv|Tonhal|Hal és tenger gyümölcsei|🐟|999|db
hekk|Hekk|Hal és tenger gyümölcsei|🐟|2999|kg
ponty;pontyszelet|Ponty|Hal és tenger gyümölcsei|🐟|3499|kg
harcsa;harcsafilé|Harcsa|Hal és tenger gyümölcsei|🐟|4999|kg
tőkehal;tokehal;tőkehalfilé|Tőkehal|Hal és tenger gyümölcsei|🐟|4499|kg
pisztráng;pisztrang|Pisztráng|Hal és tenger gyümölcsei|🐟|3999|kg
halfilé;halfile;hal|Halfilé|Hal és tenger gyümölcsei|🐟|2999|kg
garnéla;garnela;garnélarák|Garnéla|Hal és tenger gyümölcsei|🦐|4999|kg
surimi;rákrúd;rakrud|Surimi|Hal és tenger gyümölcsei|🦀|999|db

# ALAPÉLELMISZER, REGGELI, FŰSZER ÉS SZÓSZ
rizs|Rizs|Alapélelmiszer|🍚|699|kg
jázmin rizs;jazmin rizs|Jázmin rizs|Alapélelmiszer|🍚|999|kg
basmati rizs|Basmati rizs|Alapélelmiszer|🍚|1199|kg
barna rizs|Barna rizs|Alapélelmiszer|🍚|999|kg
tészta;száraztészta;szarazteszta|Száraztészta|Alapélelmiszer|🍝|599|db
spagetti|Spagetti|Alapélelmiszer|🍝|599|db
penne|Penne|Alapélelmiszer|🍝|599|db
tarhonya|Tarhonya|Alapélelmiszer|🍝|599|db
lebbencs|Lebbencstészta|Alapélelmiszer|🍝|599|db
liszt;finomliszt|Finomliszt|Alapélelmiszer|🌾|299|kg
rétesliszt;retesliszt|Rétesliszt|Alapélelmiszer|🌾|349|kg
teljes kiőrlésű liszt;teljes kiorlesu liszt|Teljes kiőrlésű liszt|Alapélelmiszer|🌾|499|kg
cukor;kristálycukor;kristalycukor|Kristálycukor|Alapélelmiszer|🧂|399|kg
porcukor|Porcukor|Alapélelmiszer|🧂|499|kg
barnacukor;barna cukor|Barna cukor|Alapélelmiszer|🧂|799|kg
só;so;asztali só|Só|Alapélelmiszer|🧂|249|kg
tengeri só;tengeri so|Tengeri só|Alapélelmiszer|🧂|499|kg
étolaj;etolaj;napraforgóolaj|Napraforgó étolaj|Alapélelmiszer|🫗|899|l
olívaolaj;olivaolaj|Olívaolaj|Alapélelmiszer|🫒|2999|l
ecet;ételecet|Ételecet|Alapélelmiszer|🫗|399|l
balzsamecet|Balzsamecet|Alapélelmiszer|🫗|999|db
zabpehely;zab|Zabpehely|Alapélelmiszer|🥣|599|db
müzli;muzli|Müzli|Alapélelmiszer|🥣|999|db
granola|Granola|Alapélelmiszer|🥣|1299|db
kukoricapehely;corn flakes;cornflakes|Kukoricapehely|Alapélelmiszer|🥣|999|db
csokis gabonapehely;gabonapehely|Gabonapehely|Alapélelmiszer|🥣|1199|db
búzadara;buzadara;gríz;griz|Búzadara|Alapélelmiszer|🌾|499|kg
zsemlemorzsa|Zsemlemorzsa|Alapélelmiszer|🥖|499|db
kakaópor;kakaopor|Kakaópor|Alapélelmiszer|🍫|999|db
sütőpor;sutopor|Sütőpor|Alapélelmiszer|🧁|299|csomag
vaníliás cukor;vanilias cukor|Vaníliás cukor|Alapélelmiszer|🧁|299|csomag
élesztő;eleszto|Élesztő|Alapélelmiszer|🍞|199|csomag
pudingpor|Pudingpor|Alapélelmiszer|🍮|299|csomag
étkezési keményítő;etkezesi kemenyito|Étkezési keményítő|Alapélelmiszer|🌾|499|db
méz;mez|Méz|Alapélelmiszer|🍯|1999|db
lekvár;lekvar|Lekvár|Alapélelmiszer|🍓|999|db
mogyorókrém;mogyorokrem|Mogyorókrém|Snack és édesség|🍫|1699|db
mák;mak|Mák|Alapélelmiszer|🌱|1299|db
dió;dio|Dióbél|Alapélelmiszer|🌰|2999|kg
mandula|Mandula|Alapélelmiszer|🌰|3999|kg
mogyoró;foldimogyoro;földimogyoró|Földimogyoró|Snack és édesség|🥜|899|db
ketchup;kecsap|Ketchup|Alapélelmiszer|🍅|799|db
majonéz;majonez|Majonéz|Alapélelmiszer|🥚|899|db
mustár;mustar|Mustár|Alapélelmiszer|🌭|599|db
barbecue szósz;bbq szósz;bbq|BBQ szósz|Alapélelmiszer|🍖|999|db
szójaszósz;szója szósz|Szójaszósz|Alapélelmiszer|🥢|999|db
chiliszósz;chili szósz|Chiliszósz|Alapélelmiszer|🌶️|999|db
pesto|Pesto|Alapélelmiszer|🌿|1199|db
paradicsomszósz;paradicsom szósz|Paradicsomszósz|Alapélelmiszer|🍅|699|db
passata|Passata|Alapélelmiszer|🍅|599|db
sűrített paradicsom;suritett paradicsom|Sűrített paradicsom|Alapélelmiszer|🍅|399|db
bolognai szósz;bolognai martás|Bolognai szósz|Alapélelmiszer|🍝|999|db
majonézes torma;torma|Torma|Alapélelmiszer|🌱|599|db
pirospaprika;fűszerpaprika;fuszerpaprika|Fűszerpaprika|Alapélelmiszer|🌶️|899|db
bors;fekete bors|Fekete bors|Alapélelmiszer|🧂|699|db
őrölt kömény;orolt komeny;kömény|Kömény|Alapélelmiszer|🧂|599|db
oregánó;oregano|Oregánó|Alapélelmiszer|🌿|499|db
bazsalikom|Bazsalikom|Alapélelmiszer|🌿|499|db
majoránna;majoranna|Majoránna|Alapélelmiszer|🌿|499|db
fahéj;fahej|Fahéj|Alapélelmiszer|🧂|499|db
babérlevél;babér level|Babérlevél|Alapélelmiszer|🌿|399|db
ételízesítő;etelizesito|Ételízesítő|Alapélelmiszer|🧂|699|db
leveskocka|Leveskocka|Alapélelmiszer|🥣|599|doboz

# KONZERV ÉS TARTÓS
kukoricakonzerv;csemegekukorica konzerv|Csemegekukorica konzerv|Alapélelmiszer|🥫|499|db
zöldborsó konzerv;zoldborso konzerv|Zöldborsó konzerv|Alapélelmiszer|🥫|499|db
babkonzerv;vörösbab konzerv|Babkonzerv|Alapélelmiszer|🥫|599|db
csicseriborsó konzerv;csicseriborso|Csicseriborsó konzerv|Alapélelmiszer|🥫|599|db
paradicsom konzerv;darabolt paradicsom|Darabolt paradicsom konzerv|Alapélelmiszer|🥫|599|db
ananász konzerv;ananasz konzerv|Ananászkonzerv|Alapélelmiszer|🥫|799|db
őszibarack konzerv;oszibarack konzerv|Őszibarackkonzerv|Alapélelmiszer|🥫|899|db
májkrém;majkrem|Májkrém|Hús és felvágott|🥫|399|db
löncshús;loncshus|Löncshús|Hús és felvágott|🥫|699|db
savanyú uborka;savanyu uborka;csemegeuborka|Csemegeuborka|Alapélelmiszer|🥒|899|db
savanyú káposzta;savanyu kaposzta|Savanyú káposzta|Alapélelmiszer|🥬|699|db

# SNACK ÉS ÉDESSÉG
tejcsoki;tejcsokoládé;csoki;csokoládé|Tejcsokoládé|Snack és édesség|🍫|599|db
étcsoki;étcsokoládé;etcsoki|Étcsokoládé|Snack és édesség|🍫|699|db
fehér csoki;fehércsoki|Fehér csokoládé|Snack és édesség|🍫|699|db
keksz|Keksz|Snack és édesség|🍪|699|db
háztartási keksz;haztartasi keksz|Háztartási keksz|Snack és édesség|🍪|599|db
ostya|Ostya|Snack és édesség|🍪|699|db
nápolyi;napolyi|Nápolyi|Snack és édesség|🍪|699|db
chips;burgonyachips|Burgonyachips|Snack és édesség|🍟|799|db
tortilla chips|Tortilla chips|Snack és édesség|🌽|899|db
popcorn|Popcorn|Snack és édesség|🍿|599|db
ropi;sós pálcika;sos palcika|Ropi|Snack és édesség|🥨|499|db
perec;sós perec|Sós perec|Snack és édesség|🥨|599|db
sajtkréker;sajtos kréker|Sajtos kréker|Snack és édesség|🧀|699|db
kukoricasnack;kukorica snack|Kukoricasnack|Snack és édesség|🌽|699|db
gumicukor|Gumicukor|Snack és édesség|🍬|699|db
cukorka|Cukorka|Snack és édesség|🍬|599|db
nyalóka;nyaloka|Nyalóka|Snack és édesség|🍭|299|db
rágó;rágógumi;ragogumi|Rágógumi|Snack és édesség|🍬|399|db
protein szelet;fehérjeszelet|Fehérjeszelet|Snack és édesség|🍫|699|db
müzliszelet;muzliszelet|Müzliszelet|Snack és édesség|🍫|399|db

# ALKOHOLMENTES ITALOK
ásványvíz;asvanyviz;víz;palackos víz|Ásványvíz|Italok|💧|199|db
szénsavas víz;szensavas viz|Szénsavas ásványvíz|Italok|💧|199|db
kóla;kola;cola|Kóla|Italok|🥤|799|db
narancs üdítő;narancs udito|Narancsos üdítő|Italok|🥤|699|db
citromos üdítő;citromos udito|Citromos üdítő|Italok|🥤|699|db
gyömbér;gyomber;ginger ale|Gyömbér üdítő|Italok|🥤|799|db
tonic;tonik|Tonic|Italok|🥤|799|db
jegestea;jeges tea|Jegestea|Italok|🧋|699|db
narancslé;narancsle|Narancslé|Italok|🧃|799|db
almalé;almale|Almalé|Italok|🧃|699|db
gyümölcslé;gyumolcsle|Gyümölcslé|Italok|🧃|799|db
multivitamin ital;multivitamin lé|Multivitamin ital|Italok|🧃|799|db
energiaital|Energiaital|Italok|⚡|499|db
sportital;izotóniás ital|Sportital|Italok|🥤|699|db
szörp;szorp|Szörp|Italok|🧃|999|db
kávé;kave|Kávé|Alapélelmiszer|☕|1999|db
szemes kávé;szemes kave|Szemes kávé|Alapélelmiszer|☕|3999|kg
őrölt kávé;orolt kave|Őrölt kávé|Alapélelmiszer|☕|2199|db
instant kávé;instant kave|Instant kávé|Alapélelmiszer|☕|2199|db
tea;fekete tea|Tea|Alapélelmiszer|🍵|799|doboz
zöld tea;zold tea|Zöld tea|Alapélelmiszer|🍵|899|doboz
gyümölcstea;gyumolcstea|Gyümölcstea|Alapélelmiszer|🍵|899|doboz

# SZESZES ITALOK
sör;sor|Sör|Szeszes italok|🍺|399|db
alkoholmentes sör;alkoholmentes sor|Alkoholmentes sör|Italok|🍺|399|db
búzasör;buzasor|Búzasör|Szeszes italok|🍺|699|db
ipa sör;ipa|IPA sör|Szeszes italok|🍺|799|db
bor;vörösbor;vorosbor|Vörösbor|Szeszes italok|🍷|1799|üveg
fehérbor;feherbor|Fehérbor|Szeszes italok|🍷|1799|üveg
rozé;roze;rosé|Rozébor|Szeszes italok|🍷|1799|üveg
pezsgő;pezsgo|Pezsgő|Szeszes italok|🍾|2499|üveg
pálinka;palinka|Pálinka 0,5 l|Szeszes italok|🥃|4999|üveg
vodka|Vodka|Szeszes italok|🍸|4499|üveg
whisky;whiskey|Whisky|Szeszes italok|🥃|5999|üveg
rum|Rum|Szeszes italok|🥃|4999|üveg
gin|Gin|Szeszes italok|🍸|4999|üveg
likőr;likor|Likőr|Szeszes italok|🥃|3999|üveg
vermut|Vermut|Szeszes italok|🍸|2999|üveg

# FAGYASZTOTT
hasábburgonya;hasabburgonya;hasáb burgonya;hasab burgonya;sült krumpli;sult krumpli;sültkrumpli|Fagyasztott hasábburgonya|Fagyasztott|🍟|1199|csomag
fagyasztott pizza;mirelit pizza|Fagyasztott pizza|Fagyasztott|🍕|1499|db
fagyasztott zöldség;fagyasztott zoldseg|Fagyasztott zöldségmix|Fagyasztott|🥦|999|csomag
fagyasztott borsó;fagyasztott borso|Fagyasztott zöldborsó|Fagyasztott|🫛|899|csomag
fagyasztott kukorica|Fagyasztott kukorica|Fagyasztott|🌽|899|csomag
fagyasztott spenót;fagyasztott spenot|Fagyasztott spenót|Fagyasztott|🥬|899|csomag
fagyasztott gyümölcs;fagyasztott gyumolcs|Fagyasztott gyümölcs|Fagyasztott|🫐|1499|csomag
fagyasztott málna;fagyasztott malna|Fagyasztott málna|Fagyasztott|🫐|1999|csomag
halrudacska;halrúd|Halrudacska|Fagyasztott|🐟|1299|csomag
panírozott csirkemell;panírozott csirke|Panírozott csirke|Fagyasztott|🍗|1999|csomag
nuggets;csirkenuggets;csirke nuggets|Csirkenuggets|Fagyasztott|🍗|1699|csomag
fagyasztott hamburger;hamburgerhús|Hamburgerhús|Fagyasztott|🍔|1999|csomag
jégkrém;jegkrem;fagyi;fagylalt|Jégkrém / fagylalt|Fagyasztott|🍦|899|db
jégkocka;jegkocka|Jégkocka|Fagyasztott|🧊|699|csomag

# HÁZTARTÁS ÉS TISZTÍTÁS
mosogatószer;mosogatoszer|Mosogatószer|Háztartás|🧽|899|db
mosogatógép tabletta;mosogatogep tabletta|Mosogatógép-tabletta|Háztartás|🍽️|2999|doboz
mosószer;mososzer|Mosószer|Háztartás|🧺|3999|db
mosókapszula;mosokapszula|Mosókapszula|Háztartás|🧺|4499|doboz
öblítő;oblito|Öblítő|Háztartás|🧺|1899|db
folttisztító;folttisztito|Folttisztító|Háztartás|🧺|1999|db
általános tisztító;altalanos tisztito|Általános tisztítószer|Háztartás|🧽|999|db
ablaktisztító;ablaktisztito|Ablaktisztító|Háztartás|🪟|999|db
fürdőszoba tisztító;furdoszoba tisztito|Fürdőszobai tisztító|Háztartás|🧽|1299|db
wc tisztító;wc-tisztító;wc tisztito|WC-tisztító|Háztartás|🚽|999|db
vízkőoldó;vizkooldo|Vízkőoldó|Háztartás|🧽|1299|db
fertőtlenítő;fertotlenito|Fertőtlenítő tisztítószer|Háztartás|🧽|1299|db
szivacs;mosogatószivacs|Mosogatószivacs|Háztartás|🧽|599|csomag
dörzsi;dorzi|Dörzsszivacs|Háztartás|🧽|599|csomag
mikroszálas kendő;mikroszalas kendo|Mikroszálas kendő|Háztartás|🧽|999|csomag
gumikesztyű;gumikesztyu|Gumikesztyű|Háztartás|🧤|799|csomag
szemeteszsák;szemetes zsak|Szemeteszsák|Háztartás|🗑️|999|csomag
alufólia;alufolia|Alufólia|Háztartás|📦|899|db
folpack;frissentartó fólia;frissentarto folia|Frissentartó fólia|Háztartás|📦|799|db
sütőpapír;sutopapir|Sütőpapír|Háztartás|📜|799|db
uzsonnás zacskó;uzsonnas zacsko|Uzsonnás zacskó|Háztartás|🛍️|599|csomag
zipzáras zacskó;zipzaras zacsko|Simítózáras tasak|Háztartás|🛍️|899|csomag
papírtörlő;papirtorlo|Papírtörlő|Háztartás|🧻|799|csomag
toalettpapír;toalettpapir;wc papír;wc papir|Toalettpapír|Háztartás|🧻|1599|csomag
papírzsebkendő;papirzsebkendo;zsepi|Papírzsebkendő|Háztartás|🤧|699|csomag
szalvéta;szalveta|Szalvéta|Háztartás|🧻|599|csomag
gyufa|Gyufa|Háztartás|🔥|299|doboz
öngyújtó;ongyujto|Öngyújtó|Háztartás|🔥|499|db
gyertya|Gyertya|Háztartás|🕯️|799|db
teamécses;teamecses|Teamécses|Háztartás|🕯️|999|csomag
faszén;faszen;grillfaszén;grillfaszen|Grillfaszén|Háztartás|🔥|2499|csomag
brikett;grillbrikett|Grillbrikett|Háztartás|🔥|2499|csomag
gyújtóskocka;gyujtoskocka|Grillgyújtós|Háztartás|🔥|999|csomag
ceruzaelem;aa elem;aa;alkáli aa elem|AA elem|Háztartás|🔋|1499|csomag
mikroelem;aaa elem;aaa;alkáli aaa elem|AAA elem|Háztartás|🔋|1499|csomag
gombelem;gomb elem|Gombelem|Háztartás|🔋|999|csomag
izzó;izzo;led izzó;led izzo|LED izzó|Háztartás|💡|1499|db
ragasztószalag;ragasztoszalag|Ragasztószalag|Háztartás|📦|699|db
pillanatragasztó;pillanatragaszto|Pillanatragasztó|Háztartás|🧴|899|db

# HIGIÉNIA ÉS TESTÁPOLÁS
sampon|Sampon|Higiénia|🧴|1499|db
balzsam;hajbalzsam|Hajbalzsam|Higiénia|🧴|1499|db
tusfürdő;tusfurdo|Tusfürdő|Higiénia|🚿|999|db
szappan|Szappan|Higiénia|🧼|399|db
folyékony szappan;folyekony szappan|Folyékony szappan|Higiénia|🧼|799|db
kézfertőtlenítő;kezfertotlenito|Kézfertőtlenítő|Higiénia|🧴|799|db
testápoló;testapolo|Testápoló|Higiénia|🧴|1499|db
kézkrém;kezkrem|Kézkrém|Higiénia|🧴|999|db
arckrém;arckrem|Arckrém|Higiénia|🧴|1999|db
naptej;fényvédő;fenyvedo|Naptej|Higiénia|☀️|2999|db
dezodor|Dezodor|Higiénia|🧴|1299|db
izzadásgátló;izzadasgatlo|Izzadásgátló|Higiénia|🧴|1299|db
fogkrém;fogkrem|Fogkrém|Higiénia|🪥|999|db
fogkefe|Fogkefe|Higiénia|🪥|999|db
szájvíz;szajviz|Szájvíz|Higiénia|🪥|1499|db
fogselyem|Fogselyem|Higiénia|🪥|999|db
borotva|Borotva|Higiénia|🪒|1599|db
borotvahab|Borotvahab|Higiénia|🪒|1299|db
borotvagél;borotvagel|Borotvagél|Higiénia|🪒|1499|db
borotvapenge|Borotvapenge|Higiénia|🪒|3999|csomag
vattakorong|Vattakorong|Higiénia|⚪|699|csomag
fültisztító;fultisztito|Fültisztító pálcika|Higiénia|👂|599|csomag
nedves törlőkendő;nedves torlokendo|Nedves törlőkendő|Higiénia|🧻|799|csomag
intim betét;intim betet|Intim betét|Higiénia|🩹|999|csomag
egészségügyi betét;egeszsegugyi betet|Egészségügyi betét|Higiénia|🩹|1299|csomag
tampon|Tampon|Higiénia|🩹|1499|csomag
óvszer;ovszer|Óvszer|Higiénia|🛡️|1799|csomag

# ÁLLATELEDEL
macskaeledel;macskakaja|Macskaeledel|Állateledel|🐱|1299|db
macska konzerv;macskakonzerv|Macskakonzerv|Állateledel|🐱|499|db
macska alutasakos;alutasakos macskaeledel|Alutasakos macskaeledel|Állateledel|🐱|1299|csomag
macska száraz táp;macska száraztáp|Macska száraztáp|Állateledel|🐱|2499|csomag
macskaalom;macska alom|Macskaalom|Állateledel|🐱|2499|csomag
kutyatáp;kutya táp;kutyakaja|Kutyatáp|Állateledel|🐶|2999|csomag
kutya konzerv;kutyakonzerv|Kutyakonzerv|Állateledel|🐶|799|db
jutalomfalat;kutya jutalomfalat|Jutalomfalat|Állateledel|🐾|999|db
rágócsont;ragocsont|Rágócsont|Állateledel|🦴|899|db

# BABA ÉS GYERMEK
pelenka|Pelenka|Baba és gyermek|👶|4499|csomag
pelenkázó alátét;pelenkazo alatet|Pelenkázó alátét|Baba és gyermek|👶|1499|csomag
babatörlő;baba törlőkendő;baba torlokendo|Babatörlő|Baba és gyermek|🧻|999|csomag
bébiétel;bebietel|Bébiétel|Baba és gyermek|🍼|899|db
bébidesszert;bebidesszert|Bébidesszert|Baba és gyermek|🍼|599|db
tápszer;tapszer|Tápszer|Baba és gyermek|🍼|4499|db
babavíz;babaviz|Babavíz|Baba és gyermek|💧|399|db
babafürdető;babafurdeto|Babafürdető|Baba és gyermek|🛁|1499|db
babakrém;babakrem|Babakrém|Baba és gyermek|🧴|1299|db

# ÁLTALÁNOS APRÓCIKKEK
füzet;fuzet|Füzet|Egyéb|📓|499|db
golyóstoll;golyostoll;toll|Golyóstoll|Egyéb|🖊️|399|db
ceruza|Ceruza|Egyéb|✏️|299|db
radír;radir|Radír|Egyéb|✏️|299|db
filctoll|Filctoll|Egyéb|🖍️|999|csomag
színes ceruza;szines ceruza|Színes ceruza|Egyéb|🖍️|1299|csomag
ragasztó stift;ragasztostift|Ragasztóstift|Egyéb|🧴|599|db
boríték;boritek|Boríték|Egyéb|✉️|699|csomag
csomagolópapír;csomagolopapir|Csomagolópapír|Egyéb|🎁|699|db
születésnapi gyertya;szuletesnapi gyertya|Születésnapi gyertya|Egyéb|🎂|499|csomag
lufi;léggömb;leggomb|Lufi|Egyéb|🎈|799|csomag
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
      builtinVersion:CATALOG_VERSION
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
