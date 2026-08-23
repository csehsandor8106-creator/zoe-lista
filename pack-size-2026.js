(() => {
  'use strict';

  // Zoé Lista – kiszerelésfelismerés és normalizált egységár.
  // A vásárlási mennyiség külön adat a csomag méretétől:
  // 2 Milka 100 g 599 Ft => 2 db csomag, 100 g/csomag, 599 Ft/csomag.
  const STATE_KEY='zoe-lista-state-v1';
  const LEARNED_KEY='zoe-lista-learned-v1';
  const INTERNAL_RE=/\s*⟦\s*(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|db)\s*⟧\s*$/i;
  const FRESH=new Set(['Zöldség-gyümölcs','Hús és felvágott','Hal és tenger gyümölcsei']);
  const DISCRETE=new Set(['db','csomag','doboz','üveg','flakon','pár']);

  const form=document.getElementById('addForm');
  const input=document.getElementById('itemInput');
  const listRoot=document.getElementById('listRoot');
  const editForm=document.getElementById('editForm');
  const editId=document.getElementById('editId');
  const editName=document.getElementById('editName');
  const editUnit=document.getElementById('editUnit');
  const editPrice=document.getElementById('editPrice');
  if(!form||!input||!listRoot||!editForm||!editId||!editName||!editUnit||!editPrice)return;

  function load(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
  function save(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
  function normalize(value){return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
  function num(value){return new Intl.NumberFormat('hu-HU',{maximumFractionDigits:2}).format(Number(value)||0)}
  function money(value){return new Intl.NumberFormat('hu-HU',{maximumFractionDigits:0}).format(Math.round(Number(value)||0))+' Ft'}
  function canonicalUnit(unit){const u=normalize(unit);if(u==='uveg')return'üveg';if(u==='par')return'pár';if(u==='cs'||u==='zacsko')return'csomag';return u}
  function standardUnit(unit){const u=canonicalUnit(unit);if(u==='g'||u==='kg')return'kg';if(u==='ml'||u==='l')return'l';return u}
  function standardAmount(value,unit){const n=Number(value),u=canonicalUnit(unit);if(!(n>0))return null;if(u==='g'||u==='ml')return n/1000;return n}
  function makePack(value,unit){const v=Number(value),u=canonicalUnit(unit);if(!(v>0)||!['g','kg','ml','l','db'].includes(u))return null;return{value:v,unit:u,standardUnit:standardUnit(u),standardAmount:standardAmount(v,u)}}
  function packLabel(pack){return pack?`${num(pack.value)} ${canonicalUnit(pack.unit)}`:''}
  function internalName(base,pack){const compact=`${String(Number(pack.value)).replace('.',',')}${canonicalUnit(pack.unit)}`;return`${String(base||'').trim()} ⟦${compact}⟧`.trim()}
  function packFromInternal(value){const m=String(value||'').match(INTERNAL_RE);return m?makePack(Number(m[1].replace(',','.')),m[2]):null}
  function baseFromInternal(value){return String(value||'').replace(INTERNAL_RE,'').trim()}
  function cleanInternal(value){return String(value||'').replace(INTERNAL_RE,(_,v,u)=>` ${num(v.replace(',','.'))} ${canonicalUnit(u)}`).trim()}

  function safeRule(name){
    const learned=load(LEARNED_KEY,{}),key=normalize(name);
    if(learned[key])return learned[key];
    const padded=` ${key} `;let best=null,bestAlias='';
    for(const[alias,rule]of Object.entries(learned)){
      if(!rule||alias.length<5)continue;
      if(padded.includes(` ${alias} `)&&alias.length>bestAlias.length){best=rule;bestAlias=alias}
    }
    return best;
  }

  function splitPrice(raw){
    const text=String(raw||'').trim();
    const m=text.match(/(?:^|\s)(\d[\d\s.,]*)\s*(?:ft|forint)\s*$/i);
    if(!m)return{body:text,price:null,priceText:''};
    const price=Number(m[1].replace(/\s/g,'').replace(',','.'));
    return{body:text.slice(0,m.index).trim(),price:Number.isFinite(price)?price:null,priceText:`${m[1].trim()} Ft`};
  }

  function splitPurchasePrefix(body){
    const text=String(body||'').trim();
    const m=text.match(/^(\d+(?:[.,]\d+)?)\s*(db|csomag|doboz|üveg|uveg|flakon|pár|par)?\s+(.+)$/i);
    if(!m)return{rest:text,qty:null,unit:null};
    if(!m[2]&&/^(g|kg|ml|l)\b/i.test(m[3]))return{rest:text,qty:null,unit:null};
    return{rest:m[3].trim(),qty:Number(m[1].replace(',','.')),unit:m[2]?canonicalUnit(m[2]):null};
  }

  function likelyPackaging(base,pack,rule,hasPurchasePrefix,explicitPrice){
    if(!pack||!base)return false;
    if(hasPurchasePrefix)return true;
    const defUnit=canonicalUnit(rule?.unit||''),defStd=standardUnit(defUnit),packStd=pack.standardUnit,category=rule?.category||'';

    if(pack.unit==='db'){
      if(defUnit&&defUnit!=='db')return true;
      return/\b(toj[aá]s|kapszula|tabletta|tasak|filter)\b/i.test(base);
    }
    if(defUnit&&defStd!==packStd)return true;
    if(defUnit&&DISCRETE.has(defUnit))return true;
    if(FRESH.has(category)&&defStd===packStd)return false;

    // Italoknál a név mögötti liter szinte mindig palack/doboz kiszerelés.
    if((category==='Italok'||category==='Szeszes italok'||category==='Tejtermék és tojás')&&packStd==='l'&&pack.standardAmount<=5)return true;
    if(category==='Snack és édesség'&&packStd==='kg'&&pack.standardAmount<=2)return true;

    // Azonos kg/l alapegységű, kétértelmű terméknél a konkrét csomagár erős jel.
    if(explicitPrice!=null&&defStd===packStd)return true;
    if(!rule&&explicitPrice!=null)return true;
    if(!rule&&['g','ml'].includes(pack.unit))return true;
    if(!rule&&pack.unit==='l'&&pack.value<=5)return true;
    return false;
  }

  function parse(raw){
    const priced=splitPrice(raw),body=priced.body;
    const existingPack=packFromInternal(body);
    if(existingPack){
      const prefix=splitPurchasePrefix(body);
      const base=baseFromInternal(prefix.rest||body);
      const rule=safeRule(base),ruleUnit=canonicalUnit(rule?.unit||'');
      return{isPack:true,baseName:base,pack:existingPack,rule,purchaseQty:prefix.qty??1,purchaseUnit:prefix.unit||(DISCRETE.has(ruleUnit)?ruleUnit:'db'),explicitPrice:priced.price,internalName:internalName(base,existingPack),rewritten:String(raw||'').trim()};
    }

    const prefix=splitPurchasePrefix(body),candidate=prefix.rest;
    const m=candidate.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|db)\s*$/i);
    if(!m)return{isPack:false};
    const base=m[1].trim(),pack=makePack(Number(m[2].replace(',','.')),m[3]),rule=safeRule(base);
    if(!likelyPackaging(base,pack,rule,prefix.qty!=null,priced.price))return{isPack:false};

    const ruleUnit=canonicalUnit(rule?.unit||'');
    const purchaseUnit=prefix.unit||(DISCRETE.has(ruleUnit)?ruleUnit:'db');
    const purchaseQty=prefix.qty??1,hidden=internalName(base,pack);
    const rewritten=`${num(purchaseQty)} ${purchaseUnit} ${hidden}${priced.priceText?` ${priced.priceText}`:''}`.trim();
    return{isPack:true,baseName:base,pack,rule,purchaseQty,purchaseUnit,explicitPrice:priced.price,internalName:hidden,rewritten};
  }

  function unitPrice(price,pack){const p=Number(price);if(!(p>=0)||!(pack?.standardAmount>0))return null;return{price:p/pack.standardAmount,unit:pack.standardUnit}}

  function attachMetadata(parsed){
    if(!parsed?.isPack)return null;
    const items=load(STATE_KEY,[]),key=normalize(parsed.internalName);
    const item=items.filter(i=>normalize(i?.name)===key).sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0))[0];
    if(!item)return null;
    item.displayName=parsed.baseName;item.pack={...parsed.pack,label:packLabel(parsed.pack)};item.packVersion=1;
    save(STATE_KEY,items);return item;
  }

  form.addEventListener('submit',()=>{
    const parsed=parse(input.value);if(!parsed.isPack)return;
    input.value=parsed.rewritten;
    setTimeout(()=>{attachMetadata(parsed);decorateAll()},18);
  },true);

  // Szerkesztőben a kiszerelés külön mező, a normál „Egység” továbbra is a megvett csomagok egysége.
  const packLabelEl=document.createElement('label');packLabelEl.className='pack-edit-label';packLabelEl.textContent='Kiszerelés';
  const packInput=document.createElement('input');packInput.id='editPackSize';packInput.inputMode='decimal';packInput.placeholder='pl. 100 g • 1,75 l • 10 db';packLabelEl.appendChild(packInput);
  editUnit.closest('label')?.insertAdjacentElement('afterend',packLabelEl);

  listRoot.addEventListener('click',event=>{
    if(!event.target.closest('button[data-act="edit"]'))return;
    setTimeout(()=>{const item=load(STATE_KEY,[]).find(i=>String(i?.id)===String(editId.value));if(!item)return;const pack=item.pack||packFromInternal(item.name);editName.value=item.displayName||baseFromInternal(item.name)||item.name;packInput.value=pack?packLabel(pack):''},0);
  });

  editForm.addEventListener('submit',()=>{
    const id=editId.value,base=String(editName.value||'').trim();
    const m=String(packInput.value||'').trim().match(/^(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|db)$/i),pack=m?makePack(Number(m[1].replace(',','.')),m[2]):null;
    if(pack)editName.value=internalName(base,pack);
    setTimeout(()=>{
      const items=load(STATE_KEY,[]),item=items.find(i=>String(i?.id)===String(id));if(!item)return;
      if(pack){item.name=internalName(base,pack);item.displayName=base;item.pack={...pack,label:packLabel(pack)};item.packVersion=1}
      else{item.name=base||baseFromInternal(item.name)||item.name;delete item.displayName;delete item.pack;delete item.packVersion}
      save(STATE_KEY,items);decorateAll();
    },18);
  },true);

  function repairStateFromMarkers(){
    const items=load(STATE_KEY,[]);let changed=false;
    for(const item of items){
      if(!item?.name)continue;const pack=item.pack||packFromInternal(item.name);if(!pack)continue;
      const base=item.displayName||baseFromInternal(item.name);
      if(!item.pack||!item.displayName){item.displayName=base;item.pack={...pack,label:packLabel(pack)};item.packVersion=1;changed=true}
    }
    if(changed)save(STATE_KEY,items);return items;
  }

  function decorateItem(row,item){
    const pack=item?.pack||packFromInternal(item?.name);if(!pack)return;
    const base=item.displayName||baseFromInternal(item.name),name=row.querySelector('.item-name');if(name&&name.textContent!==base)name.textContent=base;
    const chips=row.querySelector('.chips');
    if(chips){let badge=chips.querySelector('.pack-size-pill');if(!badge){badge=document.createElement('span');badge.className='pill pack-size-pill';chips.appendChild(badge)}const text=`📦 ${packLabel(pack)}`;if(badge.textContent!==text)badge.textContent=text}
    const line=row.querySelector('.price-line'),up=unitPrice(item.price,pack);
    if(line){let el=line.querySelector('.pack-unit-price');if(up&&Number.isFinite(up.price)){if(!el){el=document.createElement('span');el.className='pack-unit-price';line.appendChild(el)}const text=` · ${money(up.price)}/${up.unit}`;if(el.textContent!==text)el.textContent=text}else el?.remove()}
  }

  function cleanHelperTexts(root=document){
    const selectors=['.habit-pick strong','.missing-item-copy strong','.frequent-item-name','.frequent-pick strong'];
    for(const el of root.querySelectorAll(selectors.join(',')))if(el.textContent?.includes('⟦'))el.textContent=cleanInternal(el.textContent);
  }

  function previewPrice(parsed){
    const memory=window.ZoeStorePriceMemory2026?.preferredPrice?.(parsed.internalName,parsed.purchaseUnit)||null;
    const fallback=Number(parsed.rule?.price);
    return{price:parsed.explicitPrice??memory?.price??(Number.isFinite(fallback)&&fallback>0?fallback:699),memory};
  }

  function decoratePreview(){
    const parsed=parse(input.value);if(!parsed.isPack)return;
    const preview=document.getElementById('inputPreview');if(!preview||preview.hidden)return;
    const meta=preview.querySelector('.preview-meta');if(!meta)return;
    const first=meta.querySelector('span');if(first)first.textContent=`${num(parsed.purchaseQty)} ${parsed.purchaseUnit}`;
    const{price,memory}=previewPrice(parsed),priceEl=meta.querySelector('.preview-price');
    if(priceEl){const label=parsed.explicitPrice!=null?'saját ár':memory?`${memory.storeLabel||'bolti'} memória`:'≈ becsült';priceEl.textContent=`${label}: ${money(price)}/${parsed.purchaseUnit}`}
    let packEl=meta.querySelector('.pack-preview-unit');if(!packEl){packEl=document.createElement('span');packEl.className='pack-preview-unit';meta.appendChild(packEl)}
    const up=unitPrice(price,parsed.pack);packEl.textContent=`📦 ${packLabel(parsed.pack)}${up?` · ${money(up.price)}/${up.unit}`:''}`;
    let total=meta.querySelector('.preview-total');
    if(parsed.purchaseQty!==1){if(!total){total=document.createElement('span');total.className='preview-total';meta.appendChild(total)}total.textContent=`össz. ${money(price*parsed.purchaseQty)}`}else total?.remove();
  }

  // A korábbi árfigyelő a csomagárat a csomag-specifikus előzménnyel hasonlítsa össze.
  function decoratePackPriceWatch(){
    const parsed=parse(input.value);if(!parsed.isPack||parsed.explicitPrice==null)return;
    const panel=document.querySelector('.price-watch-live');if(!panel||!window.ZoePriceWatch2026?.analyze)return;
    const a=window.ZoePriceWatch2026.analyze(parsed.internalName,parsed.purchaseUnit,parsed.explicitPrice);
    if(!a){panel.hidden=true;panel.innerHTML='';return}
    const range=Math.round(a.low)===Math.round(a.high)?`korábban jellemzően ${money(a.typical)}`:`a megszokott sávod ${money(a.low)}–${money(a.high)}`;
    const source=a.scope==='store'?`${a.sourceLabel} saját adatai alapján`:'a saját ártörténeted alapján';
    panel.innerHTML=`<span class="price-watch-icon" aria-hidden="true">📉</span><span class="price-watch-copy"><strong>Ez most a megszokottnál drágább.</strong><small>${range}; a mostani ${money(a.current)} kb. ${Math.max(1,a.percent)}%-kal van a jellemző árad fölött · ${source}.</small></span>`;panel.hidden=false;
  }

  let observer=null,decorating=false;
  function decorateAll(){
    if(decorating)return;decorating=true;observer?.disconnect();
    const items=repairStateFromMarkers(),byId=new Map(items.map(i=>[String(i.id),i]));
    for(const row of listRoot.querySelectorAll('.item[data-id]'))decorateItem(row,byId.get(String(row.dataset.id)));
    cleanHelperTexts();decoratePreview();
    observer?.observe(listRoot,{childList:true,subtree:true});decorating=false;
  }
  function lateDecorate(){requestAnimationFrame(()=>requestAnimationFrame(()=>{decorateAll();decoratePackPriceWatch()}))}

  input.addEventListener('input',lateDecorate);input.addEventListener('focus',lateDecorate);
  window.addEventListener('zoe-store-route-change',lateDecorate);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)lateDecorate()});
  observer=new MutationObserver(lateDecorate);observer.observe(listRoot,{childList:true,subtree:true});

  window.ZoePackSize2026={parse,unitPrice,packLabel,internalName,cleanInternal,packFromInternal,baseFromInternal};
  decorateAll();
})();