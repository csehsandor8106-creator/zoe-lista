(() => {
  'use strict';

  // Zoé Lista – mini statisztika.
  // Vásárlási esemény: a szokásmemória valódi kipipálási időpontjai.
  // Költés: az eseményhez időben legközelebbi ismert ár, ezért mindig becslésként jelenik meg.
  const HABITS_KEY='zoe-lista-habits-v1';
  const HISTORY_KEY='zoe-lista-price-history-v1';
  const PRICE_MEMORY_KEY='zoe-lista-price-memory-v1';
  const LEARNED_KEY='zoe-lista-learned-v1';
  const STATE_KEY='zoe-lista-state-v1';

  const toolbar=document.querySelector('.toolbar');
  const listRoot=document.getElementById('listRoot');
  if(!toolbar||!listRoot)return;

  const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const normalize=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  const money=value=>new Intl.NumberFormat('hu-HU',{maximumFractionDigits:0}).format(Math.round(Number(value)||0))+' Ft';
  const num=value=>new Intl.NumberFormat('hu-HU',{maximumFractionDigits:2}).format(Number(value)||0);
  const hKey=(name,unit)=>`${normalize(name)}|${normalize(unit||'db')}`;
  const monthKey=ts=>{const d=new Date(Number(ts)||Date.now());return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`};
  const monthLabel=key=>{const[y,m]=String(key).split('-').map(Number);return new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'long'}).format(new Date(y,m-1,1))};

  function cleanName(name){
    const base=window.ZoePackSize2026?.baseFromInternal?.(name);
    if(base)return base;
    return String(name||'').replace(/\s*⟦\s*\d+(?:[.,]\d+)?\s*(?:g|kg|ml|l|db)\s*⟧\s*$/i,'').trim();
  }
  function packLabel(name){
    const pack=window.ZoePackSize2026?.packFromInternal?.(name);
    return pack?.value&&pack?.unit?`${num(pack.value)} ${pack.unit}`:'';
  }

  function nearestHistoryPrice(name,unit,at,history){
    const bucket=history[hKey(name,unit)];
    const entries=(bucket?.entries||[]).filter(e=>Number(e?.price)>0&&Number.isFinite(Number(e?.at)))
      .map(e=>({price:Number(e.price),at:Number(e.at),source:e.source||'history'})).sort((a,b)=>a.at-b.at);
    if(!entries.length)return null;
    let before=null,after=null;
    for(const entry of entries){if(entry.at<=at)before=entry;else{after=entry;break}}
    const chosen=before||after;
    return chosen?{...chosen,kind:'history'}:null;
  }

  function priceFor(habit,at,data){
    const name=String(habit.name||''),unit=habit.unit||'db';
    const history=nearestHistoryPrice(name,unit,at,data.history);
    if(history)return history;

    // Kiszerelésnél csak a pontos kiszereléshez tartozó árat fogadjuk el.
    const hasPack=Boolean(window.ZoePackSize2026?.packFromInternal?.(name));
    const stateItem=data.state.find(item=>normalize(item?.name)===normalize(name)&&normalize(item?.unit||'db')===normalize(unit)&&Number(item?.price)>0);
    if(stateItem)return{price:Number(stateItem.price),kind:stateItem.source==='user'?'current-user':'current-estimate',at:Number(stateItem.createdAt)||Date.now()};

    const mem=data.priceMemory[normalize(name)];
    if(Number(mem?.price)>0&&(!mem.unit||normalize(mem.unit)===normalize(unit)))return{price:Number(mem.price),kind:'memory',at:Date.now()};

    const learned=data.learned[normalize(name)];
    if(Number(learned?.price)>0&&(!learned.unit||normalize(learned.unit)===normalize(unit)))return{price:Number(learned.price),kind:'learned',at:Date.now()};

    // Csupasz névre csak nem-kiszereléses terméknél próbálunk visszaesni.
    if(!hasPack){
      const plain=cleanName(name);
      if(plain&&normalize(plain)!==normalize(name)){
        const p=nearestHistoryPrice(plain,unit,at,data.history);if(p)return p;
      }
    }
    return null;
  }

  function allEvents(){
    const habits=load(HABITS_KEY,{}),data={
      history:load(HISTORY_KEY,{}),priceMemory:load(PRICE_MEMORY_KEY,{}),learned:load(LEARNED_KEY,{}),state:load(STATE_KEY,[])
    };
    if(!Array.isArray(data.state))data.state=[];
    const events=[];
    for(const habit of Object.values(habits||{})){
      if(!habit?.name)continue;
      const purchases=(Array.isArray(habit.purchases)?habit.purchases:[]).map(Number).filter(Number.isFinite);
      const qty=Math.max(.01,Number(habit.qty)||1),unit=habit.unit||'db',rawName=String(habit.name),name=cleanName(rawName)||rawName;
      for(const at of purchases){
        const price=priceFor(habit,at,data),total=price?.price>0?qty*Number(price.price):null;
        events.push({
          at,name,rawName,pack:packLabel(rawName),icon:habit.icon||'🛒',category:habit.category||'Egyéb',qty,unit,
          price:price?.price||null,total,priceKind:price?.kind||'missing'
        });
      }
    }
    return events.sort((a,b)=>a.at-b.at);
  }

  const openBtn=document.createElement('button');openBtn.type='button';openBtn.className='soft-btn stats-open-btn';openBtn.innerHTML='<span aria-hidden="true">📊</span> Statisztika';toolbar.appendChild(openBtn);

  const dialog=document.createElement('dialog');dialog.className='stats-dialog';dialog.innerHTML=`
    <div class="stats-shell">
      <div class="stats-head"><div><h2>📊 Mini statisztika</h2><p>A kipipált vásárlásokból és az ismert árakból számolva.</p></div><button type="button" class="icon-btn stats-close" aria-label="Bezárás">✕</button></div>
      <div class="stats-period-row"><label>Hónap<select class="stats-month"></select></label><span class="stats-ledger-note">A költés becslés: az időben legközelebbi ismert árat használja.</span></div>
      <section class="stats-cards">
        <article><span>≈ Havi költés</span><strong class="stats-spend">—</strong><small class="stats-spend-note"></small></article>
        <article><span>Vásárlási tételek</span><strong class="stats-count">0</strong><small>kipipált vásárlások</small></article>
        <article><span>Top kategória</span><strong class="stats-top-cat">—</strong><small class="stats-top-cat-value"></small></article>
      </section>
      <section class="stats-section"><div class="stats-title"><h3>🏆 Legtöbbet vásárolt</h3><small class="stats-top-products-caption">kiválasztott hónap</small></div><div class="stats-products"></div></section>
      <section class="stats-section"><div class="stats-title"><h3>🧺 Költés kategóriánként</h3><small>becsült havi arány</small></div><div class="stats-categories"></div></section>
      <div class="stats-empty" hidden><span>📈</span><strong>Erre a hónapra még nincs vásárlási adat.</strong><small>Zoé a kipipált tételekből építi a statisztikát.</small></div>
    </div>`;document.body.appendChild(dialog);

  const closeBtn=dialog.querySelector('.stats-close'),monthSelect=dialog.querySelector('.stats-month');
  const spendEl=dialog.querySelector('.stats-spend'),spendNote=dialog.querySelector('.stats-spend-note'),countEl=dialog.querySelector('.stats-count');
  const topCatEl=dialog.querySelector('.stats-top-cat'),topCatValue=dialog.querySelector('.stats-top-cat-value');
  const productsEl=dialog.querySelector('.stats-products'),productCaption=dialog.querySelector('.stats-top-products-caption'),categoriesEl=dialog.querySelector('.stats-categories'),emptyEl=dialog.querySelector('.stats-empty');

  function monthsAvailable(events){
    const set=new Set([monthKey(Date.now())]);for(const e of events)if(e?.at)set.add(monthKey(e.at));return[...set].sort().reverse();
  }
  function refreshMonthOptions(events){
    const current=monthSelect.value||monthKey(Date.now()),months=monthsAvailable(events);
    monthSelect.innerHTML=months.map(key=>`<option value="${key}">${monthLabel(key)}</option>`).join('');monthSelect.value=months.includes(current)?current:months[0];
  }
  function monthlyEvents(events){const key=monthSelect.value||monthKey(Date.now());return events.filter(e=>monthKey(e.at)===key)}

  function productStats(entries){
    const map=new Map();
    for(const e of entries){
      const key=`${normalize(e.rawName)}|${normalize(e.unit)}`;const prev=map.get(key)||{name:e.name,pack:e.pack,icon:e.icon,count:0,total:0,priced:0};
      prev.count+=1;if(Number(e.total)>0){prev.total+=Number(e.total);prev.priced+=1}map.set(key,prev);
    }
    return[...map.values()].sort((a,b)=>b.count-a.count||b.total-a.total||a.name.localeCompare(b.name,'hu',{sensitivity:'base'})).slice(0,5);
  }
  function categoryStats(entries){
    const map=new Map();
    for(const e of entries){const key=e.category||'Egyéb',prev=map.get(key)||{name:key,total:0,count:0,priced:0};prev.count+=1;if(Number(e.total)>0){prev.total+=Number(e.total);prev.priced+=1}map.set(key,prev)}
    return[...map.values()].sort((a,b)=>b.total-a.total||b.count-a.count||a.name.localeCompare(b.name,'hu',{sensitivity:'base'}));
  }

  function render(){
    const events=allEvents();refreshMonthOptions(events);const entries=monthlyEvents(events),priced=entries.filter(e=>Number(e.total)>0),total=priced.reduce((sum,e)=>sum+Number(e.total),0),cats=categoryStats(entries),top=cats.find(x=>x.total>0)||cats[0];
    spendEl.textContent=priced.length?`≈ ${money(total)}`:'—';countEl.textContent=String(entries.length);
    spendNote.textContent=entries.length?`${priced.length}/${entries.length} vásárláshoz van használható ár · ${entries.length?Math.round(priced.length/entries.length*100):0}% lefedettség`:'még nincs havi adat';
    topCatEl.textContent=top?.name||'—';topCatValue.textContent=top?(top.total>0?`≈ ${money(top.total)}`:`${top.count} vásárlás`):'';

    const products=productStats(entries);productCaption.textContent=products.length?'kiválasztott hónap':'még nincs adat';productsEl.innerHTML='';
    for(const[index,item]of products.entries()){
      const row=document.createElement('div');row.className='stats-product-row';row.innerHTML=`<span class="stats-rank">${index+1}</span><span class="stats-product-icon">${item.icon||'🛒'}</span><strong></strong><b>${item.count}×</b>`;
      row.querySelector('strong').textContent=`${item.name}${item.pack?` · ${item.pack}`:''}`;row.title=item.priced?`Becsült költés: ${money(item.total)}`:'Nincs hozzá használható áradat';productsEl.appendChild(row);
    }
    if(!products.length)productsEl.innerHTML='<div class="stats-no-data">Ebben a hónapban még nincs vásárlási adat.</div>';

    categoriesEl.innerHTML='';const max=Math.max(1,...cats.map(x=>x.total));
    for(const item of cats.slice(0,8)){
      const pct=item.total>0?Math.max(3,Math.min(100,item.total/max*100)):2,row=document.createElement('div');row.className='stats-category-row';
      row.innerHTML=`<div class="stats-category-line"><strong></strong><b>${item.total>0?`≈ ${money(item.total)}`:`${item.count}× · áradat nélkül`}</b></div><div class="stats-bar"><span style="width:${pct}%"></span></div>`;
      row.querySelector('strong').textContent=item.name;categoriesEl.appendChild(row);
    }
    if(!cats.length)categoriesEl.innerHTML='<div class="stats-no-data">Ebben a hónapban még nincs kategóriánkénti adat.</div>';
    emptyEl.hidden=Boolean(entries.length);
  }

  openBtn.addEventListener('click',()=>{render();dialog.showModal()});closeBtn.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});monthSelect.addEventListener('change',render);
  listRoot.addEventListener('change',()=>{if(dialog.open)setTimeout(render,45)});
  window.addEventListener('zoe-action-undone',()=>{if(dialog.open)setTimeout(render,30)});
  window.addEventListener('zoe-receipt-imported',()=>{if(dialog.open)setTimeout(render,80)});
  window.addEventListener('storage',event=>{if(dialog.open&&[HABITS_KEY,HISTORY_KEY,PRICE_MEMORY_KEY,LEARNED_KEY,STATE_KEY].includes(event.key))render()});

  window.ZoeShoppingStats2026={render,events:allEvents};
})();