(() => {
  'use strict';

  // Zoé Lista – rövid ideig visszavonható kézi műveletek.
  // A törlést késleltetve véglegesítjük, a kipipálás viszont azonnali,
  // és Undo esetén a hozzá kapcsolódó tanulási eseményt is visszagörgetjük.
  const STATE_KEY='zoe-lista-state-v1';
  const FREQUENT_KEY='zoe-lista-frequent-v1';
  const HABITS_KEY='zoe-lista-habits-v1';
  const DURATION=6000;

  const listRoot=document.getElementById('listRoot');
  const clearDoneBtn=document.getElementById('clearDoneBtn');
  const hideDoneBtn=document.getElementById('hideDoneBtn');
  if(!listRoot||!clearDoneBtn||!hideDoneBtn)return;

  const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
  const normalize=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const keyOf=item=>`${normalize(item?.name)}|${normalize(item?.unit||'db')}`;
  const state=()=>load(STATE_KEY,[]);
  const itemById=id=>state().find(item=>String(item?.id)===String(id));
  const hideDoneActive=()=>String(hideDoneBtn.textContent||'').includes('Minden tétel mutatása');

  const toast=document.createElement('div');
  toast.className='undo-toast';
  toast.hidden=true;
  toast.setAttribute('role','status');
  toast.setAttribute('aria-live','polite');
  toast.innerHTML=`
    <div class="undo-toast-main">
      <span class="undo-toast-icon" aria-hidden="true">↩️</span>
      <span class="undo-toast-text"></span>
      <button type="button" class="undo-toast-btn">Visszavonás</button>
    </div>
    <div class="undo-toast-track"><span class="undo-toast-progress"></span></div>`;
  document.body.appendChild(toast);

  const toastText=toast.querySelector('.undo-toast-text');
  const undoBtn=toast.querySelector('.undo-toast-btn');
  const progress=toast.querySelector('.undo-toast-progress');
  let active=null;

  function emitStorage(key){
    try{window.dispatchEvent(new StorageEvent('storage',{key,newValue:localStorage.getItem(key),storageArea:localStorage,url:location.href}))}catch{}
  }

  function clearPendingVisuals(){
    for(const row of document.querySelectorAll('.item.undo-pending-remove'))row.classList.remove('undo-pending-remove');
    for(const sec of document.querySelectorAll('.category-block.undo-pending-empty'))sec.classList.remove('undo-pending-empty');
  }

  function refreshPendingSections(){
    for(const sec of listRoot.querySelectorAll('.category-block')){
      const rows=[...sec.querySelectorAll('.item')];
      sec.classList.toggle('undo-pending-empty',Boolean(rows.length)&&rows.every(row=>row.classList.contains('undo-pending-remove')));
    }
  }

  function markPending(ids){
    const wanted=new Set(ids.map(String));
    for(const row of listRoot.querySelectorAll('.item[data-id]')){
      if(wanted.has(String(row.dataset.id)))row.classList.add('undo-pending-remove');
    }
    refreshPendingSections();
  }

  function dismiss(commit=true){
    const action=active;
    if(!action)return;
    active=null;
    clearTimeout(action.timer);
    toast.hidden=true;
    toast.classList.remove('is-visible');
    clearPendingVisuals();
    if(commit&&typeof action.commit==='function')action.commit();
  }

  function showAction(action){
    if(active)dismiss(true);
    active=action;
    toastText.textContent=action.text;
    toast.hidden=false;
    toast.classList.remove('is-visible');
    progress.style.animation='none';
    void toast.offsetWidth;
    progress.style.animation='';
    requestAnimationFrame(()=>toast.classList.add('is-visible'));
    action.timer=setTimeout(()=>dismiss(true),DURATION);
  }

  undoBtn.addEventListener('click',()=>{
    const action=active;
    if(!action)return;
    active=null;
    clearTimeout(action.timer);
    toast.hidden=true;
    toast.classList.remove('is-visible');
    clearPendingVisuals();
    action.undo?.();
  });

  function withAllItemsVisible(fn){
    const wasHidden=hideDoneActive();
    if(wasHidden)hideDoneBtn.click();
    try{return fn();}
    finally{if(wasHidden)hideDoneBtn.click()}
  }

  function removeIds(ids){
    const wanted=[...new Set(ids.map(String))];
    withAllItemsVisible(()=>{
      for(const id of wanted){
        const row=listRoot.querySelector(`.item[data-id="${CSS.escape(id)}"]`);
        const button=row?.querySelector('button[data-act="remove"]');
        button?.click(); // programozott click: az Undo-réteg szándékosan nem fogja el.
      }
    });
  }

  function rollbackLearning(item){
    if(!item?.id||!item?.name)return;
    const id=String(item.id),key=keyOf(item);

    const frequent=load(FREQUENT_KEY,{}),f=frequent[key];
    if(f&&Array.isArray(f.doneIds)){
      const idx=f.doneIds.indexOf(id);
      if(idx>=0){
        f.doneIds.splice(idx,1);
        f.doneCount=Math.max(0,(Number(f.doneCount)||0)-1);
        frequent[key]=f;
        save(FREQUENT_KEY,frequent);
        emitStorage(FREQUENT_KEY);
      }
    }

    const habits=load(HABITS_KEY,{}),h=habits[key];
    if(h&&Array.isArray(h.purchaseIds)){
      const ids=h.purchaseIds.slice(),idx=ids.indexOf(id);
      if(idx>=0){
        const purchases=Array.isArray(h.purchases)?h.purchases.slice():[];
        const events=Array.isArray(h.purchaseEvents)?h.purchaseEvents.slice():[];
        const fromEnd=ids.length-1-idx;
        const purchaseIndex=purchases.length-1-fromEnd;
        ids.splice(idx,1);
        if(purchaseIndex>=0&&purchaseIndex<purchases.length)purchases.splice(purchaseIndex,1);
        else if(purchases.length)purchases.pop();
        h.purchaseIds=ids;
        h.purchases=purchases;
        h.purchaseEvents=events.filter(event=>String(event?.itemId||'')!==id);
        h.lastPurchase=purchases.length?Number(purchases[purchases.length-1])||0:0;
        habits[key]=h;
        save(HABITS_KEY,habits);
        emitStorage(HABITS_KEY);
      }
    }
  }

  function undoCheckbox(id,previousDone,checkedAction,snapshot){
    let restored=false;
    const wasHidden=hideDoneActive();
    if(wasHidden&&!previousDone)hideDoneBtn.click();

    let row=listRoot.querySelector(`.item[data-id="${CSS.escape(String(id))}"]`);
    const checkbox=row?.querySelector('.check');
    if(checkbox){
      checkbox.checked=Boolean(previousDone);
      checkbox.dispatchEvent(new Event('change',{bubbles:true}));
      restored=true;
    }

    if(wasHidden&&!previousDone)hideDoneBtn.click();

    if(!restored){
      const items=state(),item=items.find(x=>String(x?.id)===String(id));
      if(item){item.done=Boolean(previousDone);save(STATE_KEY,items);restored=true}
    }

    if(checkedAction&&!previousDone)rollbackLearning(snapshot||itemById(id));
    window.dispatchEvent(new CustomEvent('zoe-action-undone',{detail:{type:'check',id:String(id)}}));
    if(restored&&!listRoot.querySelector(`.item[data-id="${CSS.escape(String(id))}"]`))location.reload();
  }

  // Egyedi törlés: a felület azonnal eltűnőnek mutatja, de a tényleges adat-törlés
  // csak a snackbar lejártakor történik meg. Így Undo esetén semmit sem kell visszaírni.
  listRoot.addEventListener('click',event=>{
    if(!event.isTrusted)return;
    const button=event.target.closest?.('button[data-act="remove"]');
    if(!button)return;
    const row=button.closest('.item'),id=row?.dataset?.id,item=itemById(id);
    if(!row||!id||!item)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const label=item.displayName||window.ZoePackSize2026?.baseFromInternal?.(item.name)||item.name||'Tétel';
    markPending([id]);
    showAction({
      text:`${label} törlése`,
      commit:()=>removeIds([id]),
      undo:()=>window.dispatchEvent(new CustomEvent('zoe-action-undone',{detail:{type:'delete',id:String(id)}}))
    });
  },true);

  // Tömeges törlésnél is csak azokat a tételeket véglegesítjük, amelyek a gomb
  // megnyomásakor már kipipáltak voltak. Közben kipipált új tételt nem söprünk bele.
  clearDoneBtn.addEventListener('click',event=>{
    if(!event.isTrusted)return;
    const done=state().filter(item=>item?.done);
    if(!done.length)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const ids=done.map(item=>String(item.id));
    markPending(ids);
    showAction({
      text:`${done.length} kipipált tétel törlése`,
      commit:()=>removeIds(ids),
      undo:()=>window.dispatchEvent(new CustomEvent('zoe-action-undone',{detail:{type:'clear-done',ids}}))
    });
  },true);

  // A checkbox maga azonnal működik. Capture fázisban eltesszük az előző állapotot,
  // majd a core render után jelenítjük meg a visszavonási lehetőséget.
  listRoot.addEventListener('change',event=>{
    if(!event.isTrusted)return;
    const checkbox=event.target.closest?.('.check');
    if(!checkbox)return;
    const row=checkbox.closest('.item'),id=row?.dataset?.id,item=itemById(id);
    if(!id||!item)return;
    const previousDone=Boolean(item.done),checkedAction=Boolean(checkbox.checked);
    if(previousDone===checkedAction)return;
    const snapshot={...item};
    setTimeout(()=>{
      showAction({
        text:checkedAction?`${item.displayName||window.ZoePackSize2026?.baseFromInternal?.(item.name)||item.name} kipipálva`:`${item.displayName||window.ZoePackSize2026?.baseFromInternal?.(item.name)||item.name} visszatéve`,
        commit:null,
        undo:()=>undoCheckbox(id,previousDone,checkedAction,snapshot)
      });
    },0);
  },true);

  document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)dismiss(true)});
  window.addEventListener('beforeunload',()=>{if(active)dismiss(true)});

  window.ZoeUndo2026={dismiss};
})();