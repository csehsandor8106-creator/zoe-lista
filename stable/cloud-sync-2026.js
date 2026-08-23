(() => {
  'use strict';

  // Zoé Lista – opcionális, offline-first felhőszinkron.
  // A lista tételenként merge-elődik, a többi adatcsoport LWW órával.
  const API='https://eddoggrpjrdcxgmtijrc.supabase.co/functions/v1/zoe-sync';
  const CONFIG_KEY='zoe-lista-sync-config-v1';
  const META_KEY='zoe-lista-sync-meta-v1';
  const STATE_KEY='zoe-lista-state-v1';
  const DEVICE_KEY='zoe-lista-device-id-v1';
  const SYNC_KEYS=[
    'zoe-lista-price-memory-v1','zoe-lista-learned-v1','zoe-lista-price-history-v1',
    'zoe-lista-store-price-memory-v1','zoe-lista-templates-v1','zoe-lista-store-profiles-v1',
    'zoe-lista-receipt-aliases-v1','zoe-lista-frequent-v1','zoe-lista-habits-v1'
  ];
  const POLL_MS=15000;
  const SCAN_MS=2200;

  const toolbar=document.querySelector('.toolbar');
  if(!toolbar)return;

  const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
  const raw=key=>localStorage.getItem(key);
  const uuid=()=>crypto.randomUUID?.()||`${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
  const now=()=>Date.now();
  const enc=new TextEncoder();
  let applying=false,busy=false,syncTimer=0,pendingReload=false;

  function deviceId(){let id=localStorage.getItem(DEVICE_KEY);if(!id){id=uuid();localStorage.setItem(DEVICE_KEY,id)}return id}
  function config(){return load(CONFIG_KEY,{enabled:false,groupId:'',secret:'',revision:0,lastSync:0})}
  function setConfig(next){save(CONFIG_KEY,{...config(),...next})}
  function meta(){
    const m=load(META_KEY,{});
    return {deviceId:deviceId(),seq:Number(m.seq)||0,keys:m.keys||{},list:m.list||{items:{},tombstones:{},shadow:{}}};
  }
  function setMeta(m){save(META_KEY,m)}
  function tick(m){m.seq=(Number(m.seq)||0)+1;return{at:now(),seq:m.seq,device:m.deviceId}}
  function cmp(a,b){
    if(!a&&!b)return 0;if(!a)return-1;if(!b)return 1;
    if(Number(a.at)!==Number(b.at))return Number(a.at)-Number(b.at);
    if(Number(a.seq)!==Number(b.seq))return Number(a.seq)-Number(b.seq);
    return String(a.device||'').localeCompare(String(b.device||''));
  }
  function stable(v){
    if(v==null||typeof v!=='object')return JSON.stringify(v);
    if(Array.isArray(v))return'['+v.map(stable).join(',')+']';
    return'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
  }
  async function digest(text){
    const d=await crypto.subtle.digest('SHA-256',enc.encode(String(text)));
    return[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  function itemHash(item){return stable(item)}

  function scanList(m){
    const items=load(STATE_KEY,[]),seen=new Set();let changed=false;
    m.list.items=m.list.items||{};m.list.tombstones=m.list.tombstones||{};m.list.shadow=m.list.shadow||{};
    for(const item of Array.isArray(items)?items:[]){
      const id=String(item?.id||'');if(!id)continue;seen.add(id);
      const h=itemHash(item),prev=m.list.shadow[id];
      if(prev!==h&&!applying){m.list.items[id]={hash:h,clock:tick(m)};delete m.list.tombstones[id];changed=true}
      else if(!m.list.items[id])m.list.items[id]={hash:h,clock:{at:Number(item.createdAt)||now(),seq:0,device:m.deviceId}};
      m.list.shadow[id]=h;
    }
    for(const id of Object.keys(m.list.shadow)){
      if(seen.has(id))continue;
      if(!applying){m.list.tombstones[id]=tick(m);changed=true}
      delete m.list.shadow[id];delete m.list.items[id];
    }
    return changed;
  }

  async function scanGeneric(m){
    let changed=false;
    for(const key of SYNC_KEYS){
      const value=raw(key),h=await digest(value??'∅'),prev=m.keys[key];
      if(!prev){m.keys[key]={hash:h,clock:{at:value==null?0:now(),seq:0,device:m.deviceId}};continue}
      if(prev.hash!==h&&!applying){m.keys[key]={hash:h,clock:tick(m)};changed=true}
      else prev.hash=h;
    }
    return changed;
  }

  async function scanLocal(){
    const m=meta();const a=scanList(m),b=await scanGeneric(m);setMeta(m);return a||b;
  }

  function listDataset(m){
    const items=load(STATE_KEY,[]),byId=new Map((Array.isArray(items)?items:[]).map(i=>[String(i.id),i]));
    const out={kind:'list-v1',items:{},tombstones:{...m.list.tombstones}};
    for(const[id,info]of Object.entries(m.list.items||{}))if(byId.has(id))out.items[id]={value:byId.get(id),clock:info.clock};
    return out;
  }
  function buildPayload(){
    const m=meta(),datasets={};
    datasets[STATE_KEY]=listDataset(m);
    for(const key of SYNC_KEYS){const k=m.keys[key]||{clock:{at:0,seq:0,device:m.deviceId}};datasets[key]={kind:'raw-v1',value:raw(key),clock:k.clock}}
    return{schema:1,updatedAt:now(),datasets};
  }

  function mergeList(remote,m){
    if(!remote||remote.kind!=='list-v1')return false;
    const local=load(STATE_KEY,[]),localById=new Map((Array.isArray(local)?local:[]).map(i=>[String(i.id),i]));
    const ids=new Set([...localById.keys(),...Object.keys(remote.items||{}),...Object.keys(remote.tombstones||{}),...Object.keys(m.list.tombstones||{})]);
    let changed=false;
    const merged=new Map(localById);

    for(const id of ids){
      const localInfo=m.list.items?.[id],remoteInfo=remote.items?.[id];
      const localT=m.list.tombstones?.[id],remoteT=remote.tombstones?.[id];
      let winnerType='localItem',winnerClock=localInfo?.clock||null,winnerValue=localById.get(id);
      if(localT&&cmp(localT,winnerClock)>0){winnerType='delete';winnerClock=localT;winnerValue=null}
      if(remoteInfo&&cmp(remoteInfo.clock,winnerClock)>0){winnerType='remoteItem';winnerClock=remoteInfo.clock;winnerValue=remoteInfo.value}
      if(remoteT&&cmp(remoteT,winnerClock)>0){winnerType='delete';winnerClock=remoteT;winnerValue=null}

      if(winnerType==='delete'){
        if(merged.has(id)){merged.delete(id);changed=true}
        m.list.tombstones[id]=winnerClock;delete m.list.items[id];delete m.list.shadow[id];
      }else{
        const before=merged.get(id),after=winnerValue;
        if(stable(before)!==stable(after)){merged.set(id,after);changed=true}
        const h=itemHash(after);m.list.items[id]={hash:h,clock:winnerClock||{at:now(),seq:0,device:m.deviceId}};m.list.shadow[id]=h;
        delete m.list.tombstones[id];
      }
    }

    if(changed){
      const originalOrder=(Array.isArray(local)?local:[]).map(i=>String(i.id));
      const order=[...originalOrder,...[...merged.keys()].filter(id=>!originalOrder.includes(id))];
      applying=true;save(STATE_KEY,order.filter(id=>merged.has(id)).map(id=>merged.get(id)));applying=false;
    }
    return changed;
  }

  async function mergeGeneric(remote,m){
    let changed=false;
    for(const key of SYNC_KEYS){
      const r=remote?.datasets?.[key];if(!r||r.kind!=='raw-v1')continue;
      const l=m.keys[key];if(cmp(r.clock,l?.clock)<=0)continue;
      applying=true;
      if(r.value==null)localStorage.removeItem(key);else localStorage.setItem(key,String(r.value));
      applying=false;
      m.keys[key]={clock:r.clock,hash:await digest(r.value??'∅')};changed=true;
      try{window.dispatchEvent(new StorageEvent('storage',{key,newValue:r.value,storageArea:localStorage,url:location.href}))}catch{}
    }
    return changed;
  }

  async function mergeRemote(payload){
    if(!payload?.datasets)return false;
    const m=meta();const listChanged=mergeList(payload.datasets[STATE_KEY],m);const genericChanged=await mergeGeneric(payload,m);setMeta(m);return listChanged||genericChanged;
  }

  async function api(body){
    const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    let data={};try{data=await response.json()}catch{}
    if(!response.ok){const err=new Error(data.error||`HTTP ${response.status}`);err.status=response.status;err.data=data;throw err}
    return data;
  }

  function statusText(){
    const c=config();if(!c.groupId)return'Csak ezen a telefonon';if(!c.enabled)return'Párosítva · szinkron kikapcsolva';if(!navigator.onLine)return'Offline · változások várakoznak';if(busy)return'Szinkronizálás…';if(c.lastSync)return`Szinkronban · ${new Intl.DateTimeFormat('hu-HU',{hour:'2-digit',minute:'2-digit'}).format(new Date(c.lastSync))}`;return'Felhő bekapcsolva';
  }

  const openBtn=document.createElement('button');openBtn.type='button';openBtn.className='soft-btn sync-open-btn';openBtn.innerHTML='<span aria-hidden="true">☁️</span> Sync';toolbar.appendChild(openBtn);
  const dot=document.createElement('span');dot.className='sync-dot';openBtn.appendChild(dot);

  const dialog=document.createElement('dialog');dialog.className='sync-dialog';dialog.innerHTML=`
    <div class="sync-shell">
      <div class="sync-head"><div><h2>☁️ Zoé Sync</h2><p>Opcionális többtelefonos szinkron. Az app internet nélkül is teljesen használható.</p></div><button type="button" class="icon-btn sync-close" aria-label="Bezárás">✕</button></div>
      <div class="sync-status-card"><span class="sync-status-icon">☁️</span><div><strong class="sync-status-text"></strong><small class="sync-status-sub">A helyi adatok maradnak az elsődlegesek.</small></div></div>
      <section class="sync-unpaired">
        <div class="sync-choice"><h3>Első telefon</h3><p>Hozz létre egy privát szinkroncsoportot, majd párosítsd a másik telefont QR-kóddal.</p><button type="button" class="add-btn sync-create">＋ Új szinkroncsoport</button></div>
        <div class="sync-choice"><h3>Második telefon</h3><p>Olvasd be az első telefon QR-kódját, vagy illeszd be a párosítási kódot.</p><textarea class="sync-code-input" rows="3" placeholder="zoe-sync:v1:…"></textarea><div class="sync-join-actions"><button type="button" class="soft-btn sync-scan">▦ QR beolvasása</button><button type="button" class="add-btn sync-join">Csatlakozás</button></div></div>
      </section>
      <section class="sync-paired" hidden>
        <div class="sync-paired-line"><div><span>Szinkroncsoport</span><strong class="sync-group-short"></strong></div><label class="sync-toggle"><input type="checkbox" class="sync-enabled"> <span>Automatikus szinkron</span></label></div>
        <div class="sync-actions"><button type="button" class="add-btn sync-now">↻ Szinkronizálás most</button><button type="button" class="soft-btn sync-pair-show">＋ Új eszköz párosítása</button></div>
        <div class="sync-pair-box" hidden><div class="sync-qr"></div><textarea class="sync-code-output" readonly rows="3"></textarea><button type="button" class="soft-btn sync-copy">Kód másolása</button><small>Aki ezt a QR-t/kódot megkapja, hozzáférhet ehhez a közös Zoé-listához.</small></div>
        <button type="button" class="sync-disconnect">Leválasztás erről a felhőről</button>
      </section>
      <section class="sync-camera" hidden><video playsinline muted></video><div class="sync-camera-note">Tartsd a másik telefon QR-kódját a kamera elé.</div><button type="button" class="soft-btn sync-camera-close">Kamera bezárása</button></section>
      <div class="sync-message" aria-live="polite"></div>
    </div>`;document.body.appendChild(dialog);

  const q=s=>dialog.querySelector(s),unpaired=q('.sync-unpaired'),paired=q('.sync-paired'),statusEl=q('.sync-status-text'),msg=q('.sync-message'),enabled=q('.sync-enabled'),pairBox=q('.sync-pair-box'),qr=q('.sync-qr'),codeOut=q('.sync-code-output'),codeIn=q('.sync-code-input'),camera=q('.sync-camera'),video=q('.sync-camera video');
  let cameraStream=null,cameraTimer=0;

  function message(text,tone=''){msg.textContent=text||'';msg.dataset.tone=tone}
  function pairCode(c=config()){if(!c.groupId||!c.secret)return'';const obj={v:1,g:c.groupId,s:c.secret};const bin=btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');return`zoe-sync:v1:${bin}`}
  function parsePairCode(text){
    const s=String(text||'').trim();if(!s.startsWith('zoe-sync:v1:'))throw new Error('Nem Zoé Sync párosítási kód.');
    const b64=s.slice(12).replace(/-/g,'+').replace(/_/g,'/');const padded=b64+'='.repeat((4-b64.length%4)%4);const obj=JSON.parse(decodeURIComponent(escape(atob(padded))));
    if(obj?.v!==1||!obj.g||!obj.s)throw new Error('Hiányos párosítási kód.');return{groupId:obj.g,secret:obj.s};
  }
  function renderPair(){const code=pairCode();codeOut.value=code;qr.innerHTML=code&&window.ZoeQR?.createSvg?window.ZoeQR.createSvg(code,{size:245,label:'Zoé Sync párosítás'}):''}
  function render(){
    const c=config(),isPaired=Boolean(c.groupId&&c.secret);unpaired.hidden=isPaired;paired.hidden=!isPaired;enabled.checked=Boolean(c.enabled);statusEl.textContent=statusText();dot.dataset.state=!isPaired?'local':!c.enabled?'off':!navigator.onLine?'offline':'on';
    if(isPaired){q('.sync-group-short').textContent=`${c.groupId.slice(0,8)}…`;renderPair()}
  }

  function randomSecret(){const a=new Uint8Array(32);crypto.getRandomValues(a);return btoa(String.fromCharCode(...a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}

  async function createGroup(){
    if(busy)return;busy=true;render();message('Szinkroncsoport létrehozása…');
    try{
      await scanLocal();const groupId=crypto.randomUUID(),secret=randomSecret(),payload=buildPayload();const r=await api({action:'create',groupId,secret,payload});setConfig({groupId,secret,revision:r.revision||1,enabled:true,lastSync:now()});message('Kész. A másik telefont párosíthatod a QR-kóddal.','ok');render();pairBox.hidden=false;
    }catch(e){message(`Nem sikerült létrehozni: ${e.message}`,'error')}
    finally{busy=false;render()}
  }

  async function joinGroup(){
    if(busy)return;let p;try{p=parsePairCode(codeIn.value)}catch(e){message(e.message,'error');return}
    busy=true;render();message('Kapcsolódás és adatok összefésülése…');
    try{
      await scanLocal();const r=await api({action:'pull',groupId:p.groupId,secret:p.secret});setConfig({groupId:p.groupId,secret:p.secret,revision:r.revision||0,enabled:true,lastSync:now()});const changed=await mergeRemote(r.payload);await scanLocal();await pushMerged(r.revision||0);message('Sikeres párosítás.','ok');render();if(changed)scheduleUiRefresh();
    }catch(e){message('A párosítás nem sikerült. Ellenőrizd a kódot és az internetet.','error')}
    finally{busy=false;render()}
  }

  async function pushMerged(expected){
    const c=config(),payload=buildPayload();const r=await api({action:'push',groupId:c.groupId,secret:c.secret,expectedRevision:Number(expected),payload});setConfig({revision:r.revision,lastSync:now()});return r;
  }

  async function syncOnce(){
    const c=config();if(busy||!c.enabled||!c.groupId||!navigator.onLine)return false;busy=true;render();
    try{
      await scanLocal();const pull=await api({action:'pull',groupId:c.groupId,secret:c.secret});let changed=await mergeRemote(pull.payload);await scanLocal();
      const localPayload=buildPayload();const remoteHash=await digest(stable(pull.payload||{})),localHash=await digest(stable(localPayload));
      if(remoteHash!==localHash){
        try{await pushMerged(pull.revision||0)}catch(e){
          if(e.status===409&&e.data?.payload){changed=(await mergeRemote(e.data.payload))||changed;await scanLocal();await pushMerged(e.data.revision||0)}else throw e;
        }
      }else setConfig({revision:pull.revision||0,lastSync:now()});
      message('Szinkron kész.','ok');if(changed)scheduleUiRefresh();return true;
    }catch(e){message(navigator.onLine?`Szinkronhiba: ${e.message}`:'Offline · később újrapróbálom','error');return false}
    finally{busy=false;render()}
  }

  function scheduleSync(delay=700){clearTimeout(syncTimer);syncTimer=setTimeout(()=>syncOnce(),delay)}
  function needsSafeRefresh(){const tag=document.activeElement?.tagName;return['INPUT','TEXTAREA','SELECT'].includes(tag)||Boolean(document.querySelector('dialog[open]'))||document.body.classList.contains('shopping-mode')}
  function scheduleUiRefresh(){
    if(needsSafeRefresh()){pendingReload=true;showRefreshToast();return}
    setTimeout(()=>location.reload(),450);
  }
  function showRefreshToast(){
    let toast=document.querySelector('.sync-refresh-toast');if(!toast){toast=document.createElement('button');toast.type='button';toast.className='sync-refresh-toast';toast.innerHTML='☁️ Másik eszköz változtatott · <b>Frissítés</b>';toast.addEventListener('click',()=>location.reload());document.body.appendChild(toast)}toast.hidden=false;
  }

  async function scanAndMaybeSync(){const changed=await scanLocal();if(changed&&config().enabled)scheduleSync()}

  async function openCamera(){
    if(!('BarcodeDetector'in window)){message('Ezen a böngészőn nincs QR-kamera felismerés. Másold be a párosítási kódot.','warn');return}
    try{
      const formats=await BarcodeDetector.getSupportedFormats();if(!formats.includes('qr_code'))throw new Error('QR nem támogatott');
      cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}});video.srcObject=cameraStream;await video.play();camera.hidden=false;const detector=new BarcodeDetector({formats:['qr_code']});
      const loop=async()=>{if(!cameraStream)return;try{const hits=await detector.detect(video);const value=hits?.[0]?.rawValue;if(value?.startsWith('zoe-sync:v1:')){codeIn.value=value;closeCamera();message('QR beolvasva. Nyomd meg a Csatlakozás gombot.','ok');return}}catch{}cameraTimer=setTimeout(loop,300)};loop();
    }catch{message('A kamera nem indítható. A párosítási kódot kézzel is beillesztheted.','error');closeCamera()}
  }
  function closeCamera(){clearTimeout(cameraTimer);cameraTimer=0;if(cameraStream){for(const t of cameraStream.getTracks())t.stop()}cameraStream=null;video.srcObject=null;camera.hidden=true}

  openBtn.addEventListener('click',()=>{message('');render();dialog.showModal()});
  q('.sync-close').addEventListener('click',()=>{closeCamera();dialog.close()});dialog.addEventListener('cancel',()=>closeCamera());
  q('.sync-create').addEventListener('click',createGroup);q('.sync-join').addEventListener('click',joinGroup);q('.sync-scan').addEventListener('click',openCamera);q('.sync-camera-close').addEventListener('click',closeCamera);
  q('.sync-now').addEventListener('click',syncOnce);q('.sync-pair-show').addEventListener('click',()=>{pairBox.hidden=!pairBox.hidden;renderPair()});
  q('.sync-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(codeOut.value);message('Párosítási kód másolva.','ok')}catch{codeOut.select();message('Jelöld ki és másold a kódot.','warn')}});
  enabled.addEventListener('change',()=>{setConfig({enabled:enabled.checked});render();if(enabled.checked)scheduleSync(100)});
  q('.sync-disconnect').addEventListener('click',()=>{if(!confirm('Leválasztod ezt a telefont a Zoé Sync csoportról? A helyi adatok megmaradnak.'))return;localStorage.removeItem(CONFIG_KEY);localStorage.removeItem(META_KEY);pairBox.hidden=true;render();message('Leválasztva. A helyi lista megmaradt.','ok')});

  window.addEventListener('online',()=>{render();scheduleSync(250)});window.addEventListener('offline',render);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){render();if(pendingReload&&!needsSafeRefresh())location.reload();else scheduleSync(300)}});
  setInterval(()=>{if(config().enabled&&!document.hidden)syncOnce()},POLL_MS);
  setInterval(scanAndMaybeSync,SCAN_MS);

  window.ZoeCloudSync2026={syncNow:syncOnce,buildPayload,mergeRemote,pairCode};
  scanLocal().finally(()=>{render();if(config().enabled)scheduleSync(900)});
})();