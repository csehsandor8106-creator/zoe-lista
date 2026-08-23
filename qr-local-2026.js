(() => {
  'use strict';

  // Zoé Lista – helyi QR-kód generátor (byte mode, ECC-L, QR v1–v40).
  // Nincs hálózati hívás: a QR teljesen a böngészőben készül.
  const RS_L = [[1,26,19],[1,44,34],[1,70,55],[1,100,80],[1,134,108],[2,86,68],[2,98,78],[2,121,97],[2,146,116],[2,86,68,2,87,69],[4,101,81],[2,116,92,2,117,93],[4,133,107],[3,145,115,1,146,116],[5,109,87,1,110,88],[5,122,98,1,123,99],[1,135,107,5,136,108],[5,150,120,1,151,121],[3,141,113,4,142,114],[3,135,107,5,136,108],[4,144,116,4,145,117],[2,139,111,7,140,112],[4,151,121,5,152,122],[6,147,117,4,148,118],[8,132,106,4,133,107],[10,142,114,2,143,115],[8,152,122,4,153,123],[3,147,117,10,148,118],[7,146,116,7,147,117],[5,145,115,10,146,116],[13,145,115,3,146,116],[17,145,115],[17,145,115,1,146,116],[13,145,115,6,146,116],[12,151,121,7,152,122],[6,151,121,14,152,122],[17,152,122,4,153,123],[4,152,122,18,153,123],[20,147,117,4,148,118],[19,148,118,6,149,119]];
  const PAT = [[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]];
  const G15 = 1335, G18 = 7973, G15_MASK = 21522;
  const EXP = new Array(256), LOG = new Array(256);
  for (let i=0;i<8;i++) EXP[i]=1<<i;
  for (let i=8;i<256;i++) EXP[i]=EXP[i-4]^EXP[i-5]^EXP[i-6]^EXP[i-8];
  for (let i=0;i<255;i++) LOG[EXP[i]]=i;
  const gexp = n => { n%=255; if(n<0)n+=255; return EXP[n]; };
  const glog = n => { if(n<1) throw new Error('glog'); return LOG[n]; };

  class Bits {
    constructor(){ this.buffer=[]; this.length=0; }
    put(num,len){ for(let i=0;i<len;i++) this.putBit(((num>>(len-i-1))&1)===1); }
    putBit(bit){ const bi=Math.floor(this.length/8); if(this.buffer.length<=bi)this.buffer.push(0); if(bit)this.buffer[bi]|=0x80>>(this.length%8); this.length++; }
  }

  function poly(num, shift=0){
    let off=0; while(off<num.length && num[off]===0) off++;
    return num.slice(off).concat(new Array(shift).fill(0));
  }
  function polyMultiply(a,b){
    const out=new Array(a.length+b.length-1).fill(0);
    for(let i=0;i<a.length;i++) for(let j=0;j<b.length;j++) {
      if(a[i] && b[j]) out[i+j]^=gexp(glog(a[i])+glog(b[j]));
    }
    return poly(out);
  }
  function polyMod(a,b){
    let cur=poly(a);
    while(cur.length>=b.length){
      const ratio=glog(cur[0])-glog(b[0]);
      const next=cur.slice();
      for(let i=0;i<b.length;i++) if(b[i]) next[i]^=gexp(glog(b[i])+ratio);
      cur=poly(next);
      if(!cur.length) return [0];
    }
    return cur;
  }
  const rsCache=new Map();
  function errorPoly(n){
    if(rsCache.has(n)) return rsCache.get(n);
    let p=[1];
    for(let i=0;i<n;i++) p=polyMultiply(p,[1,gexp(i)]);
    rsCache.set(n,p); return p;
  }
  function rsBlocks(version){
    const row=RS_L[version-1], out=[];
    for(let i=0;i<row.length;i+=3){
      const [count,total,data]=row.slice(i,i+3);
      for(let j=0;j<count;j++) out.push({total,data});
    }
    return out;
  }
  function capacityBits(version){ return rsBlocks(version).reduce((s,b)=>s+b.data*8,0); }
  function byteLenBits(version){ return version<10 ? 8 : 16; }
  function chooseVersion(bytes){
    for(let v=1;v<=40;v++) {
      const needed=4+byteLenBits(v)+bytes.length*8;
      if(needed<=capacityBits(v)) return v;
    }
    throw new Error('A lista túl nagy egyetlen QR-kódhoz.');
  }
  function createCodewords(version, bytes){
    const blocks=rsBlocks(version), limit=blocks.reduce((s,b)=>s+b.data*8,0), bits=new Bits();
    bits.put(4,4);
    bits.put(bytes.length, byteLenBits(version));
    for(const b of bytes) bits.put(b,8);
    for(let i=0;i<Math.min(4,limit-bits.length);i++) bits.putBit(false);
    while(bits.length%8) bits.putBit(false);
    let pad=0;
    while(bits.length<limit){ bits.put(pad++%2===0?0xEC:0x11,8); }

    let offset=0, maxD=0, maxE=0; const dc=[], ec=[];
    for(const block of blocks){
      const d=bits.buffer.slice(offset,offset+block.data); offset+=block.data;
      const ecount=block.total-block.data; maxD=Math.max(maxD,d.length); maxE=Math.max(maxE,ecount);
      const p=errorPoly(ecount), raw=poly(d,p.length-1), mod=polyMod(raw,p), e=new Array(ecount).fill(0);
      const mo=mod.length-ecount;
      for(let i=0;i<ecount;i++){ const idx=i+mo; e[i]=idx>=0?mod[idx]:0; }
      dc.push(d); ec.push(e);
    }
    const out=[];
    for(let i=0;i<maxD;i++) for(const d of dc) if(i<d.length) out.push(d[i]);
    for(let i=0;i<maxE;i++) for(const e of ec) if(i<e.length) out.push(e[i]);
    return out;
  }
  function bchDigit(n){ let d=0; while(n){d++;n>>>=1;} return d; }
  function bchTypeInfo(data){ let d=data<<10; while(bchDigit(d)-bchDigit(G15)>=0) d^=G15<<(bchDigit(d)-bchDigit(G15)); return ((data<<10)|d)^G15_MASK; }
  function bchTypeNumber(data){ let d=data<<12; while(bchDigit(d)-bchDigit(G18)>=0) d^=G18<<(bchDigit(d)-bchDigit(G18)); return (data<<12)|d; }
  function setupProbe(m,row,col){
    const n=m.length;
    for(let r=-1;r<=7;r++){
      if(row+r<0||row+r>=n) continue;
      for(let c=-1;c<=7;c++){
        if(col+c<0||col+c>=n) continue;
        m[row+r][col+c]=((r>=0&&r<=6&&(c===0||c===6))||(c>=0&&c<=6&&(r===0||r===6))||(r>=2&&r<=4&&c>=2&&c<=4));
      }
    }
  }
  function setupAdjust(m,version){
    const pos=PAT[version-1];
    for(const row of pos) for(const col of pos){
      if(m[row][col]!==null) continue;
      for(let r=-2;r<=2;r++) for(let c=-2;c<=2;c++) m[row+r][col+c]=(r===-2||r===2||c===-2||c===2||(r===0&&c===0));
    }
  }
  function setupTiming(m){
    const n=m.length;
    for(let r=8;r<n-8;r++) if(m[r][6]===null) m[r][6]=r%2===0;
    for(let c=8;c<n-8;c++) if(m[6][c]===null) m[6][c]=c%2===0;
  }
  function setupTypeNumber(m,version){
    const bits=bchTypeNumber(version), n=m.length;
    for(let i=0;i<18;i++){
      const mod=((bits>>i)&1)===1;
      m[Math.floor(i/3)][i%3+n-11]=mod;
      m[i%3+n-11][Math.floor(i/3)]=mod;
    }
  }
  function setupTypeInfo(m){
    const data=(1<<3)|0, bits=bchTypeInfo(data), n=m.length;
    for(let i=0;i<15;i++){
      const mod=((bits>>i)&1)===1;
      if(i<6)m[i][8]=mod; else if(i<8)m[i+1][8]=mod; else m[n-15+i][8]=mod;
    }
    for(let i=0;i<15;i++){
      const mod=((bits>>i)&1)===1;
      if(i<8)m[8][n-i-1]=mod; else if(i<9)m[8][15-i]=mod; else m[8][15-i-1]=mod;
    }
    m[n-8][8]=true;
  }
  function mapData(m,data){
    const n=m.length; let inc=-1,row=n-1,bit=7,byte=0;
    for(let col=n-1;col>0;col-=2){
      if(col===6) col--;
      while(true){
        for(let c=0;c<2;c++) if(m[row][col-c]===null){
          let dark=false; if(byte<data.length) dark=((data[byte]>>>bit)&1)===1;
          if((row+(col-c))%2===0) dark=!dark;
          m[row][col-c]=dark;
          if(--bit<0){byte++;bit=7;}
        }
        row+=inc;
        if(row<0||row>=n){row-=inc;inc=-inc;break;}
      }
    }
  }
  function makeMatrix(text){
    const bytes=[...new TextEncoder().encode(String(text))], version=chooseVersion(bytes), n=version*4+17;
    const m=Array.from({length:n},()=>Array(n).fill(null));
    setupProbe(m,0,0); setupProbe(m,n-7,0); setupProbe(m,0,n-7);
    setupAdjust(m,version); setupTiming(m); setupTypeInfo(m); if(version>=7) setupTypeNumber(m,version);
    mapData(m,createCodewords(version,bytes));
    return {version,matrix:m};
  }
  function escapeXml(s){ return String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function createSvg(text, options={}){
    const {matrix,version}=makeMatrix(text), border=Math.max(4,Number(options.border)||4), n=matrix.length, size=n+border*2;
    let path='';
    for(let r=0;r<n;r++) for(let c=0;c<n;c++) if(matrix[r][c]) path+=`M${c+border} ${r+border}h1v1h-1z`;
    const px=Math.max(160,Number(options.size)||280), label=escapeXml(options.label||'Zoé Lista QR-kód');
    return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}" viewBox="0 0 ${size} ${size}" width="${px}" height="${px}" shape-rendering="crispEdges" data-qr-version="${version}"><rect width="100%" height="100%" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
  }

  window.ZoeQR = { makeMatrix, createSvg };
})();