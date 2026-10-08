import {$} from "../dom.js";
import {getTip} from "./map.js";

let pinned=false,timer=null;
const isPinned=()=>pinned&&!$("#tip").hidden; // kartu bisa ditutup dari luar (filter berubah), jadi status pin ikut dicek

export function showTip(m,pin=false){
  const t=$("#tip"),w=$(".mapwrap").getBoundingClientRect(),r=m.getBoundingClientRect();
  t.innerHTML=getTip(m.dataset.t);t.hidden=false;t.classList.remove("below");t.classList.toggle("pinned",pin);
  const half=(t.offsetWidth/2)||125,x=r.left-w.left+r.width/2;t.style.left=Math.min(Math.max(x,half+4),Math.max(half+4,w.width-half-4))+"px";
  const below=r.top-w.top<t.offsetHeight+24;t.classList.toggle("below",below);t.style.top=(below?r.bottom-w.top:r.top-w.top)+"px";
}

const cancel=()=>{clearTimeout(timer);timer=null};
export function hideTip(){cancel();pinned=false;const t=$("#tip");t.classList.remove("pinned");t.hidden=true}
// Menutup agak tertunda supaya kursor sempat berpindah dari penanda ke kartu (untuk men-scroll daftar alat).
const later=()=>{if(isPinned())return;cancel();timer=setTimeout(()=>{if(!isPinned())hideTip()},220)};

// Hover atau fokus = kartu muncul sementara. Klik (atau Enter) = kartu "di-pin": tetap terbuka dan bisa di-scroll,
// tutup dengan tombol x, klik di luar, atau Esc.
export function initTooltip(){
  const mp=$("#map"),tip=$("#tip");
  const pin=m=>{cancel();pinned=true;showTip(m,true)};
  mp.addEventListener("pointerover",e=>{const m=e.target.closest(".mk");if(m){cancel();if(!isPinned())showTip(m)}});
  mp.addEventListener("pointerout",e=>{if(e.target.closest(".mk"))later()});
  mp.addEventListener("focusin",e=>{const m=e.target.closest(".mk");if(m){cancel();if(!isPinned())showTip(m)}});
  mp.addEventListener("focusout",later);
  mp.addEventListener("click",e=>{const m=e.target.closest(".mk");m?pin(m):hideTip()});
  mp.addEventListener("keydown",e=>{const m=e.target.closest&&e.target.closest(".mk");if(m&&(e.key=="Enter"||e.key==" ")){e.preventDefault();pin(m)}});
  mp.addEventListener("scroll",hideTip,{passive:true}); // peta digeser (HP): kartu tidak ikut, jadi ditutup
  tip.addEventListener("pointerenter",cancel);
  tip.addEventListener("pointerleave",later);
  tip.addEventListener("click",e=>{if(e.target.closest(".tipx"))hideTip()});
  addEventListener("click",e=>{if(!e.target.closest("#map")&&!e.target.closest("#tip"))hideTip()});
  addEventListener("keydown",e=>{if(e.key=="Escape")hideTip()});
}
