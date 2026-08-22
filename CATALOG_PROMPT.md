# Zoé Lista – nagy magyar szupermarket-katalógus prompt

Feladat: készíts és tarts karban egy magyarországi szupermarketekhez optimalizált, széles körű termékfelismerési katalógust egy okos bevásárlólista számára.

## Cél
A katalógus fedje le a legtöbb olyan hétköznapi terméket, amely tipikusan megtalálható magyar szupermarketekben, diszkontokban és hipermarketekben. Minden termékhez adj:
- kanonikus magyar terméknevet,
- több gyakori szinonimát és írásváltozatot,
- ékezet nélküli alakot, ha az eltér a normalizált magyar alaktól,
- gyakori fonetikus vagy idegen nyelvű változatot, ha releváns,
- kategóriát,
- termékspecifikus emoji ikont,
- jellemző alapegységet (`db`, `kg`, `l`, `csomag`, `doboz`, `üveg`),
- hozzávetőleges magyar kiskereskedelmi egységárat forintban.

Az árak nem valós idejű bolti árak, hanem reális, középkategóriás magyar becslések. Kerüld a kirívó akciós vagy prémium árakat. Ha egy termék tipikusan csomagban kapható, a teljes csomag tipikus árát add meg. Ha jellemzően tömeg alapján vásároljuk, Ft/kg árat használj. Italnál a tipikus palack/doboz árát használd, kivéve ahol literár értelmesebb. Pálinkánál például egy átlagos 0,5 literes üveg legyen az alap.

## Felismerési prioritás
1. mennyiség és mértékegység kinyerése,
2. konkrét terméktípus,
3. pontos márka,
4. termékcsalád,
5. óvatos fuzzy matching,
6. általános kategória.

A konkrét terméknév mindig írja felül a márka általános besorolását. Például `Milka keksz` legyen keksz, `Chio popcorn` popcorn. Rövid szavaknál ne használj laza substring matchinget. A `Fa` márka ne találjon bele a `faszén` szóba, a `lé` ne tegye a `ceruzaelem` szót ital kategóriába.

## Kötelező fő termékcsoportok

### Zöldség és gyümölcs
Alma, körte, banán, narancs, mandarin, klementin, citrom, lime, grapefruit, szőlő, eper, málna, áfonya, szeder, cseresznye, meggy, őszibarack, nektarin, sárgabarack, szilva, görögdinnye, sárgadinnye, ananász, mangó, avokádó / avocado, kiwi, kókusz, burgonya, édesburgonya, sárgarépa, fehérrépa, zeller, vöröshagyma, lilahagyma, fokhagyma, újhagyma, póréhagyma, paradicsom, koktélparadicsom, paprika, kaliforniai paprika, erős paprika, uborka, jégsaláta, fejes saláta, rukkola, spenót, káposzta, lilakáposzta, kelkáposzta, karfiol, brokkoli, cukkini, padlizsán, sütőtök, csiperke, laskagomba, kukorica, retek.

### Tejtermék és tojás
Tej, UHT tej, friss tej, laktózmentes tej, kakaóital, vaj, margarin, tejföl, natúr joghurt, gyümölcsjoghurt, görög joghurt, kefir, túró, cottage cheese, mascarpone, főzőtejszín, habtejszín, trappista, gouda, edami, ementáli, cheddar, parmezán, mozzarella, feta, camembert, brie, krémsajt, ömlesztett sajt, tojás, fürjtojás.

### Pékáru
Fehér kenyér, félbarna kenyér, teljes kiőrlésű kenyér, rozskenyér, toast kenyér, zsemle, kifli, vajas kifli, bagett, ciabatta, croissant, kakaós csiga, fahéjas csiga, túrós táska, pogácsa, hamburgerzsemle, hot dog kifli, tortilla, pita.

### Hús és felvágott
Egész csirke, csirkemell, csirkecomb, csirkeszárny, csirkemáj, pulykamell, pulykacomb, sertéshús / disznóhús, sertéskaraj, tarja, sertéscomb, oldalas, lapocka, darált sertéshús, darált marhahús, marhahús, marhacomb, marhalábszár, steak, kacsamell, kacsacomb, libamáj, sonka, gépsonka, párizsi, szalámi, téliszalámi, kolbász, virsli, bacon, tepertő.

### Hal és tenger gyümölcsei
Lazac, tonhal, hekk, ponty, harcsa, tőkehal, pisztráng, halfilé, garnéla, surimi.

### Alapélelmiszer, sütés, reggeli, fűszer és szósz
Rizs, jázminrizs, basmati rizs, barna rizs, tészta, spagetti, penne, tarhonya, lebbencs, finomliszt, rétesliszt, teljes kiőrlésű liszt, kristálycukor, porcukor, barnacukor, só, tengeri só, napraforgóolaj, olívaolaj, ecet, balzsamecet, zabpehely, müzli, granola, kukoricapehely, gabonapehely, búzadara, zsemlemorzsa, kakaópor, sütőpor, vaníliás cukor, élesztő, pudingpor, keményítő, méz, lekvár, mogyorókrém, mák, dió, mandula, földimogyoró, ketchup, majonéz, mustár, BBQ szósz, szójaszósz, chiliszósz, pesto, paradicsomszósz, passata, sűrített paradicsom, bolognai szósz, torma, pirospaprika, fekete bors, kömény, oregánó, bazsalikom, majoránna, fahéj, babérlevél, ételízesítő, leveskocka.

### Konzerv és tartós termék
Kukoricakonzerv, zöldborsó konzerv, babkonzerv, csicseriborsó, paradicsomkonzerv, ananászkonzerv, őszibarackkonzerv, májkrém, löncshús, csemegeuborka, savanyú káposzta.

### Snack és édesség
Tejcsokoládé, étcsokoládé, fehér csokoládé, keksz, háztartási keksz, ostya, nápolyi, burgonyachips, tortilla chips, popcorn, ropi, sós perec, sajtos kréker, kukoricasnack, gumicukor, cukorka, nyalóka, rágógumi, fehérjeszelet, müzliszelet. Ismerje a gyakori márkákat és márkacsaládokat is, például Milka, Boci, Kinder, Oreo, Haribo, Chio, Lay's, Pom-Bär, Cheetos, Doritos, TUC, de a konkrét terméktípus legyen erősebb a márkánál.

### Alkoholmentes italok és kávé/tea
Ásványvíz, szénsavas víz, kóla, narancsos üdítő, citromos üdítő, gyömbér, tonic, jegestea, narancslé, almalé, vegyes gyümölcslé, multivitamin ital, energiaital, sportital, szörp, őrölt kávé, szemes kávé, instant kávé, fekete tea, zöld tea, gyümölcstea.

### Szeszes italok
Sör, búzasör, IPA, vörösbor, fehérbor, rozé, pezsgő, pálinka, vodka, whisky, rum, gin, likőr, vermut. Az alkoholmentes sör kerüljön az alkoholmentes italokhoz.

### Fagyasztott
Hasábburgonya / sült krumpli, fagyasztott pizza, zöldségmix, zöldborsó, kukorica, spenót, gyümölcs, málna, halrudacska, panírozott csirke, nuggets, hamburgerhús, jégkrém, fagylalt, jégkocka.

### Háztartás
Mosogatószer, mosogatógép-tabletta, mosószer, mosókapszula, öblítő, folttisztító, általános tisztító, ablaktisztító, fürdőszobai tisztító, WC-tisztító, vízkőoldó, fertőtlenítő, szivacs, dörzsi, mikroszálas kendő, gumikesztyű, szemeteszsák, alufólia, folpack, sütőpapír, uzsonnás zacskó, simítózáras tasak, papírtörlő, toalettpapír, papírzsebkendő, szalvéta, gyufa, öngyújtó, gyertya, teamécses, faszén, brikett, grillgyújtós, AA elem, AAA elem, gombelem, LED izzó, ragasztószalag, pillanatragasztó.

### Higiénia és testápolás
Sampon, hajbalzsam, tusfürdő, szappan, folyékony szappan, kézfertőtlenítő, testápoló, kézkrém, arckrém, naptej, dezodor, izzadásgátló, fogkrém, fogkefe, szájvíz, fogselyem, borotva, borotvahab, borotvagél, borotvapenge, vattakorong, fültisztító pálcika, nedves törlőkendő, intim betét, egészségügyi betét, tampon, óvszer.

### Állateledel
Macskaeledel, macskakonzerv, alutasakos macskaeledel, macska száraztáp, macskaalom, kutyatáp, kutyakonzerv, jutalomfalat, rágócsont.

### Baba és gyermek
Pelenka, pelenkázó alátét, babatörlő, bébiétel, bébidesszert, tápszer, babavíz, babafürdető, babakrém.

### Általános aprócikk
Füzet, toll, ceruza, radír, filctoll, színes ceruza, ragasztóstift, boríték, csomagolópapír, születésnapi gyertya, lufi.

## Árlogika
Minden tételhez adj egyetlen induló becsült árat. Az árak legyenek egymással konzisztensen megválasztva: egy teljes csirke legyen olcsóbb kilogrammonként, mint a csirkemell; marhahús drágább legyen a sertéshúsnál; olívaolaj drágább a napraforgóolajnál; prémium sajtok drágábbak a trappistánál. A lista saját árbeviteli funkciója mindig írja felül a beépített becslést, és a saját árat később is őrizze meg.

## Kimeneti forma
Minden rekord tartalmazza ezt a hét mezőt ebben a sorrendben:
`aliasok | megjelenő név | kategória | emoji | becsült ár Ft | egység | típus`

Az aliasokat pontosvesszővel válaszd el. Ne használj veszélyes laza substring-egyezést. A katalógust úgy készítsd, hogy később új rekordokkal egyszerűen bővíthető legyen.
