import {$,$$} from "../dom.js";
import {state} from "../state.js";
import {esc} from "../logic/format.js";
import {renderLog} from "./log.js";

export function fillSel(g){const s=$("#snsel");s.innerHTML=`<option value="">All tools</option>`+g.map(([sn])=>`<option>${esc(sn)}</option>`).join("");if(!g.some(([sn])=>sn==state.sel))state.sel=null;s.value=state.sel||""}

export function applySel(){const sel=state.sel;
  $$(".mapbox [data-sns]").forEach(e=>e.classList.toggle("dim",!!sel&&!e.dataset.sns.split(" ").includes(sel)));
  $$(".card").forEach(c=>{c.classList.toggle("off",!!sel&&c.dataset.sn!=sel);c.classList.toggle("sel",!!sel&&c.dataset.sn==sel)});
  $("#snsel").value=sel||"";$("#tip").hidden=true;renderLog()}

export function pick(sn){state.sel=state.sel==sn?null:sn;applySel()}

export function moveSeg(){const b=document.querySelector('#seg [aria-pressed=true]'),i=$("#seg i");i.style.left=b.offsetLeft+"px";i.style.width=b.offsetWidth+"px"}

export function initFilters(){
  $("#snsel").onchange=e=>{state.sel=e.target.value||null;applySel()};
  $$("#seg button").forEach(b=>b.onclick=()=>{$$("#seg button").forEach(x=>x.setAttribute("aria-pressed",x==b));state.role=b.dataset.r;moveSeg();renderLog()});
  $("#q").oninput=e=>{state.query=e.target.value;renderLog()};
}
