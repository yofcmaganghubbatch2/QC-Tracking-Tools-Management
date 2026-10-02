// DOM tiruan minimal supaya modul UI bisa dijalankan di Node tanpa browser.
export function install({search="",fetch,props={}}={}){
  const els=new Map();
  const sink=()=>new Proxy(function(){},{get(t,k){return k===Symbol.toPrimitive?()=>"":sink()},set(){return true},apply(){return sink()}});
  const mk=sel=>{const st={__st:null,...(props[sel]||{})};st.__st=st;return new Proxy(function(){},{get(t,k){if(k in st)return st[k];return k===Symbol.toPrimitive?()=>"":sink()},set(t,k,v){st[k]=v;return true},apply(){return sink()}})};
  const get=sel=>{if(!els.has(sel))els.set(sel,mk(sel));return els.get(sel)};
  const mem=new Map();
  Object.assign(globalThis,{
    document:{querySelector:get,querySelectorAll:()=>[]},
    location:{search},
    sessionStorage:{getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)},
    matchMedia:()=>({matches:true}),requestAnimationFrame:()=>0,addEventListener:()=>{},fetch
  });
  return {el:sel=>get(sel).__st,session:mem};
}
export const wait=ms=>new Promise(r=>setTimeout(r,ms));
export const count=(s,re)=>(String(s||"").match(re)||[]).length;
