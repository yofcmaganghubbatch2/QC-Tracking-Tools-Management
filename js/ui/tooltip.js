import {$} from "../dom.js";
import {getTip} from "./map.js";

export function showTip(m){const t=$("#tip"),w=$(".mapwrap").getBoundingClientRect(),r=m.getBoundingClientRect();
t.innerHTML=getTip(m.dataset.t);t.hidden=false;t.classList.remove("below");
const half=(t.offsetWidth/2)||115,x=r.left-w.left+r.width/2;t.style.left=Math.min(Math.max(x,half+4),Math.max(half+4,w.width-half-4))+"px";
const below=r.top-w.top<t.offsetHeight+24;t.classList.toggle("below",below);t.style.top=(below?r.bottom-w.top:r.top-w.top)+"px"}

export function initTooltip(){
  const mp=$("#map");
  mp.addEventListener("pointerover",e=>{const m=e.target.closest(".mk");if(m)showTip(m)});
  mp.addEventListener("pointerout",e=>{if(e.target.closest(".mk"))$("#tip").hidden=true});
  mp.addEventListener("focusin",e=>{const m=e.target.closest(".mk");if(m)showTip(m)});
  mp.addEventListener("focusout",()=>{$("#tip").hidden=true});
  mp.addEventListener("click",e=>{const m=e.target.closest(".mk");m?showTip(m):$("#tip").hidden=true});
}
