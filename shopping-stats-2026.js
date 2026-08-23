(() => {
  'use strict';

  // Zoé Lista – mini vásárlási statisztika.
  // A költési napló v73-tól gyűlik; korábbi összegeket nem találunk ki.
  const STATE_KEY='zoe-lista-state-v1';
  const LEDGER_KEY='zoe-lista-purchase-ledger-v1';
  const FREQUENT_KEY='zoe-lista-frequent-v1';
  const ACTIVE_STORE_KEY='zoe-lista-active-store-v1';
  const MAX_EVENTS=2500;

  const toolbar=document.querySelector('.toolbar');
  const listRoot=document.getElementById('listRoot');
  if(!toolbar||!listRoot)return;

  const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
  const normalize=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const money=value=>new Intl.NumberFormat('hu-HU',{maximumFractionDigits:0}).format(Math.round(Number(value)||0))+' Ft';
  const num=value=>new Intl.NumberFormat('hu-HU',{maximumFractionDigits:2}).format(Number(value)||0);
  const monthKey=ts=>{const d=new Date(Number(ts)||Date.now());return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`};
  const monthLabel=key=>{const [y,m]=String(key).split('-').map(Number);return new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'long'}).format(new Date(y,m-1,1))};
  const cleanName=item=>String(item?.displayName||window.ZoePackSize2026?.baseFromInternal?.(item?.name)||item?.name||'').trim();
  const eventId=item=>String(item?.id||'');

  function ledger(){const data=load(LEDGER_KEY,[]);return Array.isArray(data)?data:[]}
  function writeLedger(data){save(LEDGER_KEY,data.slice(-MAX_EVENTS));try{window.dispatchEvent(new StorageEvent('storage',{key:LEDGER_KEY,newValue:localStorage.getItem(LEDGER_KEY),storageArea:localStorage,url:location.href}))}catch{}}

  function recordItem(item,at=Date.now(),source='check'){
    if(!item?.id||!item?.name)return false;
    const id=eventId(item),data=ledger();
    if(data.some(e=>String(e.itemId)===id&&e.source==='check'))return false;
    const qty=Math.max(.01,Number(item.qty)||1),unitPrice=Math.max(0,Number(item.price)||0),total=qty*unitPrice;
    data.push({
      id:`${source}:${id}:${Number(at)||Date.now()}`,
      itemId:id,
      name:cleanName(item)||item.name,
      rawName:item.name,
      icon:item.icon||'🛒',
      category:item.category||'Egyéb',
      qty,
      unit:item.unit||'db',
      unitPrice,
      total,
      estimated:item.source!=='user',
      priceSource:item.source||'estimate',
      storeId:localStorage.getItem(ACTIVE_STORE_KEY)||'general',
      at:Number(at)||Date.now(),
      source
    });
    writeLedger(data);
    return true;
  }

  function removeItemEvent(itemId){
    const id=String(itemId||'');if(!id)return false;
    const data=ledger(),next=data.filter(e=>!(String(e.itemId)===id&&e.source==='check'));
    if(next.length===data.length)return false;
    writeLedger(next);return true;
  }

  const openBtn=document.createElement('button');
  openBtn.type='button';openBtn.className='soft-btn stats-open-btn';openBtn.innerHTML='<span aria-hidden="true">📊</span> Statisztika';toolbar.appendChild(openBtn);

  const dialog=document.createElement('dialog');
  dialog.className='stats-dialog';
  dialog.innerHTML=`
    <div class="stats-shell">
      <div class="stats-head">
        <div><h2>📊 Mini statisztika</h2><p>Valódi kipipálásokból épülő vásárlási kép.</p></div>
        <button type="button" class="icon-btn stats-close" aria-label="Bezárás">✕</button>
      </div>
      <div class="stats-period-row">
        <label>Időszak<select class="stats-month"></select></label>
        <span class="stats-ledger-note">A költési napló a v73-tól gyűlik.</span>
      </div>
      <section class="stats-cards">
        <article><span>E havi költés</span><strong class="stats-spend">0 Ft</strong><small class="stats-spend-note"></small></article>
        <article><span>Vásárlások</span><strong class="stats-count">0</strong><small>rögzített tétel</small></article>
        <article><span>Legnagyobb kategória</span><strong class="stats-top-cat">—</strong><small class="stats-top-cat-value"></small></article>
      </section>
      <section class="stats-section">
        <div class="stats-title"><h3>🏆 Legtöbbet vásárolt</h3><small class="stats-top-products-caption"></small></div>
        <div class="stats-products"></div>
      </section>
      <section class="stats-section">
        <div class="stats-title"><h3>💸 Költés kategóriánként</h3><small>kiválasztott hónap</small></div>
        <div class="stats-categories"></div>
      </section>
      <div class="stats-empty" hidden><span>📈</span><strong>A költési statisztika most kezdi gyűjteni az adatokat.</strong><small>Pipálj ki megvett tételeket, és itt hamarosan megjelennek a havi összegek.</small></div>
    </div>`;
  document.body.appendChild(dialog);

  const closeBtn=dialog.querySelector('.stats-close'),monthSelect=dialog.querySelector('.stats-month');
  const spendEl=dialog.querySelector('.stats-spend'),spendNote=dialog.querySelector('.stats-spend-note'),countEl=dialog.querySelector('.stats-count');
  const topCatEl=dialog.querySelector('.stats-top-cat'),topCatValue=dialog.querySelector('.stats-top-cat-value');
  const productsEl=dialog.querySelector('.stats-products'),productCaption=dialog.querySelector('.stats-top-products-caption'),categoriesEl=dialog.querySelector('.stats-categories'),emptyEl=dialog.querySelector('.stats-empty');

  function monthsAvailable(){
    const set=new Set([monthKey(Date.now())]);
    for(const e of ledger())if(e?.at)set.add(monthKey(e.at));
    return [...set].sort().reverse();
  }

  function refreshMonthOptions(){
    const current=monthSelect.value||monthKey(Date.now()),months=monthsAvailable();
    monthSelect.innerHTML=months.map(key=>`<option value="${key}">${monthLabel(key)}</option>`).join('');
    monthSelect.value=months.includes(current)?current:months[0];
  }

  function monthlyEntries(){const key=monthSelect.value||monthKey(Date.now());return ledger().filter(e=>monthKey(e.at)===key&&Number(e.total)>=0)}

  function topProductsFor(entries){
    if(entries.length){
      const map=new Map();
      for(const e of entries){
        const key=normalize(e.name);if(!key)continue;
        const prev=map.get(key)||{name:e.name,icon:e.icon||'🛒',count:0,total:0};prev.count+=1;prev.total+=Number(e.total)||0;map.set(key,prev);
      }
      return{label:'kiválasztott hónap',items:[...map.values()].sort((a,b)=>b.count-a.count||b.total-a.total).slice(0,5)};
    }
    const frequent=load(FREQUENT_KEY,{});
    const items=Object.values(frequent).filter(x=>x?.name&&(Number(x.doneCount)||0)>0)
      .map(x=>({name:x.name,icon:x.icon||'🛒',count:Number(x.doneCount)||0,total:0}))
      .sort((a,b)=>b.count-a.count||String(a.name).localeCompare(String(b.name),'hu',{sensitivity:'base'})).slice(0,5);
    return{label:items.length?'eddigi kipipálások':'még nincs adat',items};
  }

  function categoryStats(entries){
    const map=new Map();
    for(const e of entries){const key=e.category||'Egyéb';map.set(key,(map.get(key)||0)+(Number(e.total)||0))}
    return[...map.entries()].map(([name,total])=>({name,total})).sort((a,b)=>b.total-a.total);
  }

  function render(){
    refreshMonthOptions();
    const entries=monthlyEntries(),total=entries.reduce((sum,e)=>sum+(Number(e.total)||0),0),estimated=entries.filter(e=>e.estimated),cats=categoryStats(entries),top=cats[0];
    spendEl.textContent=(estimated.length?'≈ ':'')+money(total);
    spendNote.textContent=entries.length?(estimated.length?`${estimated.length} tételnél becsült ár is szerepel`:'csak saját/tényleges árakból'):'még nincs rögzített költés';
    countEl.textContent=String(entries.length);
    topCatEl.textContent=top?.name||'—';topCatValue.textContent=top?money(top.total):'';

    const products=topProductsFor(entries);productCaption.textContent=products.label;
    productsEl.innerHTML='';
    for(const [index,item] of products.items.entries()){
      const row=document.createElement('div');row.className='stats-product-row';
      row.innerHTML=`<span class="stats-rank">${index+1}</span><span class="stats-product-icon">${item.icon||'🛒'}</span><strong></strong><b>${item.count}×</b>`;
      row.querySelector('strong').textContent=item.name;productsEl.appendChild(row);
    }
    if(!products.items.length)productsEl.innerHTML='<div class="stats-no-data">Még nincs elég vásárlási adat.</div>';

    categoriesEl.innerHTML='';
    const max=top?.total||1;
    for(const item of cats.slice(0,8)){
      const row=document.createElement('div');row.className='stats-category-row';const pct=Math.max(2,Math.min(100,(item.total/max)*100));
      row.innerHTML=`<div class="stats-category-line"><strong></strong><b>${money(item.total)}</b></div><div class="stats-bar"><span style="width:${pct}%"></span></div>`;
      row.querySelector('strong').textContent=item.name;categoriesEl.appendChild(row);
    }
    if(!cats.length)categoriesEl.innerHTML='<div class="stats-no-data">Ebben a hónapban még nincs kategóriánkénti költési adat.</div>';
    emptyEl.hidden=Boolean(entries.length);
  }

  // A core change-kezelő után olvassuk vissza az állapotot, így az akkori ár/mennyiség kerül a naplóba.
  listRoot.addEventListener('change',event=>{
    const checkbox=event.target.closest?.('.check');if(!checkbox)return;
    const id=checkbox.closest('.item')?.dataset?.id;if(!id)return;
    setTimeout(()=>{
      if(checkbox.checked){
        const item=load(STATE_KEY,[]).find(x=>String(x?.id)===String(id));if(item)recordItem(item);
      }else removeItemEvent(id);
      if(dialog.open)render();
    },25);
  });

  window.addEventListener('zoe-action-undone',event=>{
    if(event.detail?.type==='check'&&event.detail?.id){removeItemEvent(event.detail.id);if(dialog.open)render()}
  });
  window.addEventListener('storage',event=>{if([LEDGER_KEY,FREQUENT_KEY].includes(event.key)&&dialog.open)render()});

  openBtn.addEventListener('click',()=>{render();dialog.showModal()});
  closeBtn.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
  monthSelect.addEventListener('change',render);

  window.ZoeShoppingStats2026={render,recordItem,removeItemEvent,ledger};
})();