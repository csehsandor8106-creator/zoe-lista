(() => {
  'use strict';

  // Zoé Lista – blokkbeolvasás. A fotó OCR-ja a böngészőben fut,
  // a parser pedig jóváhagyás előtt minden sort szerkeszthetővé tesz.
  const STATE_KEY='zoe-lista-state-v1';
  const LEARNED_KEY='zoe-lista-learned-v1';
  const GLOBAL_HISTORY_KEY='zoe-lista-price-history-v1';
  const RECEIPT_ALIASES_KEY='zoe-lista-receipt-aliases-v1';
  const ACTIVE_STORE_KEY='zoe-lista-active-store-v1';
  const TESSERACT_URL='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
  const MAX_HISTORY=40;

  const toolbar=document.querySelector('.toolbar');
  const listRoot=document.getElementById('listRoot');
  if(!toolbar||!listRoot)return;

  const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
  const normalize=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const money=value=>new Intl.NumberFormat('hu-HU',{maximumFractionDigits:0}).format(Math.round(Number(value)||0))+' Ft';
  const num=value=>new Intl.NumberFormat('hu-HU',{maximumFractionDigits:3}).format(Number(value)||0);
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  function canonicalUnit(unit){
    const u=normalize(unit);
    if(u==='g')return'g';if(u==='kg')return'kg';if(u==='ml')return'ml';if(u==='l')return'l';if(u==='db')return'db';
    return u||'db';
  }
  function historyUnit(unit){const u=canonicalUnit(unit);if(u==='g')return'kg';if(u==='ml')return'l';return u||'db'}
  function standardAmount(value,unit){const n=Number(value),u=canonicalUnit(unit);if(!(n>0))return null;if(u==='g'||u==='ml')return n/1000;return n}
  function packLabel(pack){return pack?`${num(pack.value)} ${pack.unit}`:''}
  function parsePackInput(text){
    const m=String(text||'').trim().match(/^(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|db)$/i);
    if(!m)return null;
    const value=Number(m[1].replace(',','.')),unit=canonicalUnit(m[2]);
    if(!(value>0))return null;
    return{value,unit,standardUnit:historyUnit(unit),standardAmount:standardAmount(value,unit)};
  }

  function amountNumber(text){
    const cleaned=String(text||'').replace(/[^\d,.-]/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.');
    const n=Number(cleaned);return Number.isFinite(n)?n:null;
  }

  function detectStore(text){
    const n=normalize(text);
    if(/\btesco\b|tesco global/.test(n))return{id:'tesco',name:'Tesco',icon:'🔴'};
    if(/\blidl\b/.test(n))return{id:'lidl',name:'Lidl',icon:'🔵'};
    if(/\baldi\b/.test(n))return{id:'aldi',name:'Aldi',icon:'🔷'};
    if(/\bspar\b|interspar/.test(n))return{id:'spar',name:'SPAR',icon:'🟢'};
    return{id:'general',name:'Általános bolt',icon:'🛒'};
  }

  function detectDate(text){
    const candidates=[
      /\b(20\d{2})[./-](\d{1,2})[./-](\d{1,2})\s+(\d{1,2}):(\d{2})\b/,
      /\b(\d{2})[./-](\d{2})[./-](\d{2})\s+(\d{1,2}):(\d{2})\b/,
      /\b(20\d{2})[./-](\d{1,2})[./-](\d{1,2})\b/
    ];
    for(let i=0;i<candidates.length;i++){
      const m=String(text||'').match(candidates[i]);if(!m)continue;
      let year=Number(m[1]);if(i===1)year=2000+year;
      const month=Number(m[2]),day=Number(m[3]),hour=Number(m[4]||12),minute=Number(m[5]||0);
      const d=new Date(year,month-1,day,hour,minute,0,0);
      if(!Number.isNaN(d.getTime()))return d;
    }
    return null;
  }

  function toLocalInput(date){
    const d=date instanceof Date?date:new Date(date);if(Number.isNaN(d.getTime()))return'';
    const pad=n=>String(n).padStart(2,'0');
    return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function parseQuantityLine(line){
    const m=String(line||'').match(/(\d+(?:[.,]\d+)?)\s*(db|kg|g|l|ml)\s*[x×*]\s*(\d[\d\s.,]*)\s*(?:ft|forint)\s*\/\s*(db|kg|g|l|ml)/i);
    if(!m)return null;
    const qty=Number(m[1].replace(',','.')),unit=canonicalUnit(m[2]),unitPrice=amountNumber(m[3]),priceUnit=canonicalUnit(m[4]);
    if(!(qty>0)||!(unitPrice>0))return null;
    return{qty,unit,unitPrice,priceUnit};
  }

  function parseTrailingAmount(line){
    const text=String(line||'').trim();
    let m=text.match(/^(.+?)\s+(-?\d{1,3}(?:[ .]\d{3})*|-?\d+)(?:[,.]00)?\s+([A-Za-z][A-Za-z0-9]{2,5})\s*$/);
    if(m)return{name:m[1].trim(),amount:amountNumber(m[2]),code:m[3]};
    m=text.match(/^(.+?)\s{2,}(-?\d{1,3}(?:[ .]\d{3})*|-?\d+)\s*$/);
    if(m)return{name:m[1].trim(),amount:amountNumber(m[2]),code:''};
    return null;
  }

  function isPackagingName(name){
    const n=normalize(name);
    return /\b(pet|alu|glass|uveg)\b.*\bcsomag\b|\bcsomag\b.*\b(eladas|vissza|visszavalt)/.test(n);
  }
  function isDiscountName(name){const n=normalize(name);return /^cc\b/.test(n)||/^clubcard\b/.test(n)||/clubcard.*kedvezmeny/.test(n)}
  function isNoise(line){
    const n=normalize(line);
    if(!n)return true;
    return /^(nyugta|adoszam|bankkartya|kartya card|terminal id|auth code|valasz resp|koszonjuk|clubcard informaciok|kapott pontok|egyenleg|kezelo|kassza|ir szam|alias sale|hivatkozas)/.test(n);
  }

  function extractPack(rawName){
    const raw=String(rawName||'');
    const matches=[...raw.matchAll(/(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|db)\b/ig)];
    if(matches.length){
      const m=matches[matches.length-1],value=Number(m[1].replace(',','.')),unit=canonicalUnit(m[2]);
      if(value>0)return{pack:{value,unit,standardUnit:historyUnit(unit),standardAmount:standardAmount(value,unit)},token:m[0]};
    }
    const box=raw.match(/(\d+[.,]\d+)\s*(?:doboz|palack)\b/i);
    if(box){const value=Number(box[1].replace(',','.'));if(value>0&&value<=5)return{pack:{value,unit:'l',standardUnit:'l',standardAmount:value},token:box[0]}}
    return{pack:null,token:''};
  }

  function cleanedReceiptName(raw,packToken=''){
    let s=String(raw||'').replace(/[|_]+/g,' ').replace(/\s+/g,' ').trim();
    if(packToken)s=s.replace(packToken,' ').replace(/\s+/g,' ').trim();
    s=s.replace(/^(?:ts|tesco|fr|fm)\s+/i,'').trim();
    return s;
  }

  function learnedGuess(raw){
    const aliases=load(RECEIPT_ALIASES_KEY,{}),key=normalize(raw);
    if(aliases[key]?.name)return{name:aliases[key].name,pack:aliases[key].pack||null,confidence:'known',source:'receipt-alias'};

    const specials=[
      [/banan.*ledig|\bbanan\b/i,'Banán'],[/\bheineken\b/i,'Heineken'],[/\bgosser\b/i,'Gösser Premium'],
      [/jim\s*beam.*honey/i,'Jim Beam Honey'],[/\bpring/i,'Pringles'],[/\bcappy\b/i,'Cappy']
    ];
    for(const[re,name]of specials)if(re.test(raw))return{name,pack:null,confidence:'known',source:'receipt-pattern'};

    const learned=load(LEARNED_KEY,{}),padded=` ${normalize(raw)} `;let best=null,bestAlias='';
    for(const[alias,rule]of Object.entries(learned)){
      if(!rule?.label||alias.length<4)continue;
      if(padded.includes(` ${alias} `)&&alias.length>bestAlias.length){best=rule;bestAlias=alias}
    }
    if(best)return{name:best.label,pack:null,confidence:'known',source:'learned'};
    return null;
  }

  function humanize(raw){
    const s=String(raw||'').replace(/[._]+/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
    if(!s)return'';
    return s.charAt(0).toUpperCase()+s.slice(1);
  }

  function matchTokens(a,b){
    const stop=new Set(['cc','ts','tesco','ft','db','kg','g','ml','l','doboz','csomag']);
    const ta=normalize(a).split(' ').filter(t=>t.length>1&&!stop.has(t)&&!/^\d+$/.test(t));
    const tb=normalize(b).split(' ').filter(t=>t.length>1&&!stop.has(t)&&!/^\d+$/.test(t));
    if(!ta.length||!tb.length)return 0;
    let hit=0;for(const x of ta)if(tb.some(y=>y===x||y.startsWith(x)||x.startsWith(y)))hit++;
    return hit/Math.max(ta.length,tb.length);
  }

  function applyDiscounts(items,discounts){
    for(const d of discounts){
      let best=null,bestScore=0;
      for(const item of items){
        const score=matchTokens(d.name,item.rawName);
        if(score>bestScore){best=item;bestScore=score}
      }
      if(best&&bestScore>=.34){
        best.discount=(best.discount||0)+Number(d.amount||0);
        best.discountLines=(best.discountLines||[]).concat(d.name);
      }
    }
    for(const item of items){
      item.effectiveLineTotal=Math.max(0,Number(item.lineTotal||0)+Number(item.discount||0));
      const qty=Number(item.qty)||1;
      item.effectiveUnitPrice=item.quantitySource?item.effectiveLineTotal/qty:item.effectiveLineTotal;
      if(!(item.effectiveUnitPrice>0))item.effectiveUnitPrice=item.unitPrice||item.lineTotal;
    }
  }

  function parseText(text){
    const rawText=String(text||'').replace(/\r/g,'');
    const lines=rawText.split('\n').map(s=>s.replace(/[\t]+/g,' ').replace(/\s+$/,'')).filter(s=>s.trim());
    const store=detectStore(rawText),date=detectDate(rawText);
    let start=lines.findIndex(l=>/nyugta/i.test(l));if(start<0)start=0;else start++;
    let end=lines.findIndex((l,i)=>i>=start&&/(összesen|osszesen)/i.test(l));if(end<0)end=lines.length;
    const productLines=lines.slice(start,end);
    const items=[],discounts=[];let packaging=0,pending=null,pendingAge=0;

    for(const line of productLines){
      const qtyLine=parseQuantityLine(line);
      if(qtyLine){pending=qtyLine;pendingAge=0;continue}
      if(pending&&++pendingAge>3)pending=null;
      if(isNoise(line))continue;
      const parsed=parseTrailingAmount(line);if(!parsed||parsed.amount==null)continue;
      if(isDiscountName(parsed.name)){discounts.push({name:parsed.name,amount:Number(parsed.amount)||0});continue}
      if(isPackagingName(parsed.name)){packaging++;continue}
      if(parsed.amount<0)continue;

      const packData=extractPack(parsed.name);
      const baseRaw=cleanedReceiptName(parsed.name,packData.token);
      const guess=learnedGuess(parsed.name)||learnedGuess(baseRaw);
      const pack=guess?.pack||packData.pack;
      const qty=pending?.qty||1;
      const purchaseUnit=historyUnit(pending?.unit||'db');
      const lineTotal=Number(parsed.amount)||0;
      const unitPrice=pending?.unitPrice||lineTotal;
      items.push({
        id:`r-${items.length}-${Date.now()}`,rawName:parsed.name,baseRaw,name:guess?.name||humanize(baseRaw),confidence:guess?.confidence||'check',
        pack,qty,purchaseUnit,lineTotal,unitPrice,quantitySource:Boolean(pending),discount:0,discountLines:[],code:parsed.code||''
      });
      pending=null;pendingAge=0;
    }
    applyDiscounts(items,discounts);

    let total=null;
    const totalLine=lines.find(l=>/(összesen|osszesen)/i.test(l));
    if(totalLine){const nums=[...totalLine.matchAll(/\d{1,3}(?:[ .]\d{3})+|\d+/g)].map(m=>amountNumber(m[0])).filter(v=>v>0);if(nums.length)total=nums[nums.length-1]}
    return{store,date,total,items,discountCount:discounts.length,packagingCount:packaging,lines};
  }

  function mergeTextBlocks(blocks){
    let merged=[];
    for(const block of blocks){
      const next=String(block||'').replace(/\r/g,'').split('\n').map(s=>s.trimEnd()).filter(s=>s.trim());
      if(!merged.length){merged=next;continue}
      let overlap=0,max=Math.min(18,merged.length,next.length);
      for(let n=max;n>=1;n--){
        let ok=true;for(let i=0;i<n;i++)if(normalize(merged[merged.length-n+i])!==normalize(next[i])){ok=false;break}
        if(ok){overlap=n;break}
      }
      merged.push(...next.slice(overlap));
    }
    return merged.join('\n');
  }

  async function loadTesseract(){
    if(window.Tesseract)return window.Tesseract;
    await new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-zoe-tesseract]');
      if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return}
      const script=document.createElement('script');script.src=TESSERACT_URL;script.async=true;script.dataset.zoeTesseract='1';script.onload=resolve;script.onerror=()=>reject(new Error('OCR motor nem tölthető be'));document.head.appendChild(script);
    });
    if(!window.Tesseract)throw new Error('OCR motor nem érhető el');
    return window.Tesseract;
  }

  async function imageBitmap(file){
    if('createImageBitmap'in window)return createImageBitmap(file);
    const url=URL.createObjectURL(file);try{
      const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url});return img;
    }finally{setTimeout(()=>URL.revokeObjectURL(url),1000)}
  }

  async function preprocess(file){
    const image=await imageBitmap(file),iw=image.width||image.naturalWidth,ih=image.height||image.naturalHeight;
    const maxW=1800,scale=Math.min(1,maxW/iw),w=Math.max(1,Math.round(iw*scale)),h=Math.max(1,Math.round(ih*scale));
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(image,0,0,w,h);if(image.close)image.close();
    const data=ctx.getImageData(0,0,w,h),px=data.data;
    for(let i=0;i<px.length;i+=4){
      const y=.299*px[i]+.587*px[i+1]+.114*px[i+2];
      const g=Math.max(0,Math.min(255,(y-128)*1.55+142));px[i]=px[i+1]=px[i+2]=g;
    }
    ctx.putImageData(data,0,0);
    return new Promise(resolve=>canvas.toBlob(blob=>resolve(blob||file),'image/jpeg',.92));
  }

  function recordGlobal(name,unit,price,at){
    const p=Number(price);if(!name||!(p>0))return false;
    const key=`${normalize(name)}|${normalize(unit||'db')}`;const history=load(GLOBAL_HISTORY_KEY,{}),bucket=history[key]||{name,unit:unit||'db',entries:[]};
    bucket.name=name;bucket.unit=unit||bucket.unit||'db';bucket.entries=Array.isArray(bucket.entries)?bucket.entries:[];
    const last=bucket.entries[bucket.entries.length-1];if(last&&Number(last.price)===p&&Math.abs(Number(at)-Number(last.at||0))<60000)return false;
    bucket.entries.push({price:p,at:Number(at)||Date.now(),source:'receipt'});bucket.entries=bucket.entries.slice(-MAX_HISTORY);history[key]=bucket;save(GLOBAL_HISTORY_KEY,history);return true;
  }

  function storeOptionsHtml(){
    const select=document.getElementById('storeProfileSelect');
    if(select)return[...select.options].map(o=>`<option value="${esc(o.value)}">${esc(o.textContent)}</option>`).join('');
    return'<option value="general">🛒 Általános bolt</option><option value="tesco">🔴 Tesco</option><option value="lidl">🔵 Lidl</option><option value="aldi">🔷 Aldi</option><option value="spar">🟢 SPAR</option>';
  }

  const openBtn=document.createElement('button');openBtn.type='button';openBtn.className='soft-btn receipt-open-btn';openBtn.innerHTML='<span aria-hidden="true">🧾</span> Blokk';toolbar.appendChild(openBtn);
  const dialog=document.createElement('dialog');dialog.className='receipt-dialog';dialog.innerHTML=`
    <div class="receipt-shell">
      <div class="receipt-head"><div><h2>🧾 Blokk beolvasása</h2><p>Fotó → helyi OCR → ellenőrzés → ármemória. Semmi nem mentődik automatikusan.</p></div><button type="button" class="icon-btn receipt-close" aria-label="Bezárás">✕</button></div>
      <section class="receipt-upload-box">
        <label class="receipt-photo-label">📷 Blokk fotózása / képek kiválasztása<input class="receipt-files" type="file" accept="image/*" capture="environment" multiple></label>
        <div class="receipt-photo-note">Hosszú blokk jöhet több, egymást átfedő fotóban. Az első OCR-használat internetet kérhet az OCR-motor letöltéséhez; a kép feldolgozása utána a böngészőben történik.</div>
        <div class="receipt-photo-names"></div>
        <div class="receipt-progress" hidden><div class="receipt-progress-line"><span>OCR</span><b>0%</b></div><div class="receipt-progress-track"><div class="receipt-progress-fill"></div></div></div>
      </section>
      <details class="receipt-manual"><summary>OCR-szöveg megtekintése / kézi beillesztés</summary><div class="receipt-manual-body"><textarea class="receipt-raw-text" placeholder="Ide kerül az OCR eredménye, de kézzel is beilleszthetsz blokk-szöveget."></textarea><button type="button" class="soft-btn receipt-parse-btn">Újraértelmezés</button></div></details>
      <section class="receipt-meta" hidden>
        <div class="receipt-meta-card"><span>Felismert bolt</span><strong class="receipt-store-label">—</strong></div>
        <div class="receipt-meta-card"><span>Blokk összege</span><strong class="receipt-total-label">—</strong></div>
        <div class="receipt-meta-controls"><label>Ármemória boltja<select class="receipt-store-select">${storeOptionsHtml()}</select></label><label>Vásárlás ideje<input class="receipt-date" type="datetime-local"></label></div>
      </section>
      <div class="receipt-summary" hidden></div>
      <div class="receipt-review"></div>
      <div class="receipt-bottom">
        <label class="receipt-purchased-check"><input class="receipt-mark-purchased" type="checkbox"> Ha a jóváhagyott termék most is rajta van a listán, jelölje meg megvettként.</label>
        <div class="receipt-status" aria-live="polite"></div>
        <div class="receipt-actions"><button type="button" class="soft-btn receipt-cancel">Mégse</button><button type="button" class="add-btn receipt-import-btn" disabled>✓ Jóváhagyott árak mentése</button></div>
      </div>
    </div>`;document.body.appendChild(dialog);

  const shell=dialog.querySelector('.receipt-shell'),closeBtn=dialog.querySelector('.receipt-close'),cancelBtn=dialog.querySelector('.receipt-cancel'),filesInput=dialog.querySelector('.receipt-files'),namesEl=dialog.querySelector('.receipt-photo-names');
  const progress=dialog.querySelector('.receipt-progress'),progressFill=dialog.querySelector('.receipt-progress-fill'),progressText=dialog.querySelector('.receipt-progress-line b');
  const rawText=dialog.querySelector('.receipt-raw-text'),parseBtn=dialog.querySelector('.receipt-parse-btn'),meta=dialog.querySelector('.receipt-meta'),storeLabel=dialog.querySelector('.receipt-store-label'),totalLabel=dialog.querySelector('.receipt-total-label'),storeSelect=dialog.querySelector('.receipt-store-select'),dateInput=dialog.querySelector('.receipt-date');
  const summary=dialog.querySelector('.receipt-summary'),review=dialog.querySelector('.receipt-review'),status=dialog.querySelector('.receipt-status'),importBtn=dialog.querySelector('.receipt-import-btn'),markPurchased=dialog.querySelector('.receipt-mark-purchased');
  let parsedReceipt=null,busy=false;

  function setStatus(text,tone=''){status.textContent=text||'';status.dataset.tone=tone}
  function setBusy(value){busy=Boolean(value);shell.classList.toggle('is-busy',busy)}
  function setProgress(value,label){const p=Math.max(0,Math.min(100,Math.round(Number(value)||0)));progress.hidden=false;progressFill.style.width=`${p}%`;progressText.textContent=label||`${p}%`}
  function clearProgress(){progress.hidden=true;progressFill.style.width='0';progressText.textContent='0%'}

  function renderParsed(data){
    parsedReceipt=data;meta.hidden=false;summary.hidden=false;storeLabel.textContent=`${data.store.icon} ${data.store.name}`;totalLabel.textContent=data.total?money(data.total):'nem biztos';
    if([...storeSelect.options].some(o=>o.value===data.store.id))storeSelect.value=data.store.id;
    dateInput.value=toLocalInput(data.date||new Date());
    summary.innerHTML=`<span class="receipt-chip"><b>${data.items.length}</b> terméksor</span><span class="receipt-chip">${data.discountCount} kedvezmény-sor</span><span class="receipt-chip">${data.packagingCount} csomagolási sor kihagyva</span>`;
    review.innerHTML=data.items.map(item=>{
      const discount=Number(item.discount)||0,pack=packLabel(item.pack);const price=Math.round(item.effectiveUnitPrice||item.unitPrice||item.lineTotal||0);
      const detail=[`${num(item.qty)} ${item.purchaseUnit}`,item.quantitySource?`blokk egységár: ${money(item.unitPrice)}/${item.purchaseUnit}`:`sorár: ${money(item.lineTotal)}`];
      if(discount)detail.push(`<span class="receipt-discount-badge">Clubcard ${discount<0?'−':'+'}${money(Math.abs(discount))}</span>`);
      return`<article class="receipt-row ${item.confidence==='known'?'is-known':'is-uncertain'}" data-id="${esc(item.id)}"><label class="receipt-row-check"><input class="receipt-use" type="checkbox" checked></label><div class="receipt-row-main"><div class="receipt-row-raw"><code>${esc(item.rawName)}</code><span class="receipt-confidence">${item.confidence==='known'?'felismerve':'ellenőrizd'}</span></div><div class="receipt-row-fields"><label>Termék neve<input class="receipt-name" value="${esc(item.name)}"></label><label>Egységár<input class="receipt-price" type="number" min="1" step="1" value="${price}"></label></div><div class="receipt-row-fields"><label>Kiszerelés<input class="receipt-pack receipt-pack-input" placeholder="pl. 165 g" value="${esc(pack)}"></label><label>Egység<input value="${esc(item.purchaseUnit)}" disabled></label></div><div class="receipt-row-details">${detail.map(x=>x.startsWith('<')?x:`<span>${esc(x)}</span>`).join('')}</div></div></article>`
    }).join('');
    importBtn.disabled=!data.items.length;setStatus(data.items.length?'Ellenőrizd a bizonytalan sorokat, majd mentsd a kijelölteket.':'Nem találtam biztos terméksorokat. Az OCR-szöveget kézzel is javíthatod.',data.items.length?'':'warn');
  }

  async function runOCR(files){
    if(!files?.length)return;setBusy(true);setStatus('OCR-motor betöltése…');setProgress(2,'indítás');
    try{
      const T=await loadTesseract();const texts=[];let imageIndex=0;
      const worker=await T.createWorker(['hun','eng'],1,{logger:m=>{
        const local=Math.round((Number(m.progress)||0)*100),overall=Math.round(((imageIndex+local/100)/files.length)*100);setProgress(overall,`${overall}%`);if(m.status)setStatus(`OCR: ${m.status}`)
      }});
      try{
        for(imageIndex=0;imageIndex<files.length;imageIndex++){
          setStatus(`Kép előkészítése ${imageIndex+1}/${files.length}…`);const blob=await preprocess(files[imageIndex]);
          const result=await worker.recognize(blob,{rotateAuto:true});texts.push(result?.data?.text||'');
        }
      }finally{await worker.terminate()}
      const merged=mergeTextBlocks(texts);rawText.value=merged;setProgress(100,'100%');renderParsed(parseText(merged));setStatus('OCR kész. Ellenőrizd a sorokat.','ok');setTimeout(clearProgress,700);
    }catch(err){console.warn('Zoé receipt OCR',err);setStatus('Az OCR most nem indult el. Nyisd le az OCR-szöveg mezőt, és kézzel is beillesztheted a blokk szövegét.','error');dialog.querySelector('.receipt-manual').open=true;clearProgress()}
    finally{setBusy(false)}
  }

  function selectedRows(){
    if(!parsedReceipt)return[];const byId=new Map(parsedReceipt.items.map(i=>[i.id,i]));const out=[];
    for(const row of review.querySelectorAll('.receipt-row')){
      if(!row.querySelector('.receipt-use')?.checked)continue;const original=byId.get(row.dataset.id);if(!original)continue;
      const name=row.querySelector('.receipt-name')?.value.trim(),price=Number(row.querySelector('.receipt-price')?.value),pack=parsePackInput(row.querySelector('.receipt-pack')?.value);
      if(!name||!(price>0))continue;out.push({...original,name,price,pack});
    }
    return out;
  }

  function itemHistoryName(item){
    if(item.pack&&window.ZoePackSize2026?.internalName)return window.ZoePackSize2026.internalName(item.name,item.pack);
    return item.name;
  }

  function learnReceiptAlias(item){
    const key=normalize(item.rawName);if(!key||!item.name)return;const aliases=load(RECEIPT_ALIASES_KEY,{});aliases[key]={name:item.name,pack:item.pack?{value:item.pack.value,unit:item.pack.unit}:null,updatedAt:Date.now()};save(RECEIPT_ALIASES_KEY,aliases)
  }

  function currentActiveStore(){return localStorage.getItem(ACTIVE_STORE_KEY)||document.getElementById('storeProfileSelect')?.value||'general'}

  function matchCurrentState(imported){
    const targetName=normalize(itemHistoryName(imported)),base=normalize(imported.name),items=load(STATE_KEY,[]);let best=null;
    for(const item of items){
      const itemName=normalize(item.name),display=normalize(item.displayName||'');
      if(itemName===targetName){best=item;break}
      if(!imported.pack&&(display===base||itemName===base)){best=item;break}
    }
    return best;
  }

  function markCurrentItems(importedItems){
    let count=0;
    for(const imported of importedItems){
      const item=matchCurrentState(imported);if(!item||item.done)continue;const check=listRoot.querySelector(`.item[data-id="${CSS.escape(String(item.id))}"] .check`);if(!check)continue;check.checked=true;check.dispatchEvent(new Event('change',{bubbles:true}));count++;
    }
    return count;
  }

  async function importApproved(){
    const rows=selectedRows();if(!rows.length){setStatus('Nincs kijelölt, érvényes terméksor.','warn');return}
    const storeId=storeSelect.value||parsedReceipt?.store?.id||'general';const at=dateInput.value?new Date(dateInput.value).getTime():Date.now();setBusy(true);
    try{
      let savedCount=0;
      for(const item of rows){
        const historyName=itemHistoryName(item),unit=item.purchaseUnit||'db';recordGlobal(historyName,unit,item.price,at);
        window.ZoeStorePriceMemory2026?.record?.(historyName,unit,item.price,'receipt',at,storeId);learnReceiptAlias(item);savedCount++;
      }
      if(storeId===currentActiveStore())window.ZoeStorePriceMemory2026?.applyActiveStorePrices?.();
      const checked=markPurchased.checked?markCurrentItems(rows):0;
      window.ZoeShoppingHabits2026?.render?.();window.ZoeMissingItems2026?.render?.();
      window.dispatchEvent(new CustomEvent('zoe-receipt-imported',{detail:{storeId,count:savedCount,at}}));
      setStatus(`Kész · ${savedCount} ár elmentve${checked?` · ${checked} listatétel kipipálva`:''}.`,'ok');await sleep(650);dialog.close();
    }finally{setBusy(false)}
  }

  filesInput.addEventListener('change',()=>{
    const files=[...filesInput.files||[]];namesEl.textContent=files.map(f=>f.name).join(' · ');namesEl.classList.toggle('has-files',Boolean(files.length));if(files.length)runOCR(files)
  });
  parseBtn.addEventListener('click',()=>{const text=rawText.value.trim();if(!text){setStatus('Nincs értelmezhető szöveg.','warn');return}renderParsed(parseText(text))});
  importBtn.addEventListener('click',importApproved);
  openBtn.addEventListener('click',()=>{setStatus('');dialog.showModal()});
  closeBtn.addEventListener('click',()=>{if(!busy)dialog.close()});cancelBtn.addEventListener('click',()=>{if(!busy)dialog.close()});
  dialog.addEventListener('click',event=>{if(event.target===dialog&&!busy)dialog.close()});dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault()});

  window.ZoeReceiptImport2026={parseText,mergeTextBlocks,detectStore,detectDate,extractPack};
})();
