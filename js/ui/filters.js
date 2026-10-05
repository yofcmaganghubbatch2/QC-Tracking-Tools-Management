import {$,$$} from "../dom.js";
import {state} from "../state.js";
import {esc,cap} from "../logic/format.js";
import {allowedSerials,locKey,picKey} from "../logic/gauges.js";
import {EQUIPMENT} from "../config/master.js";
import {renderLog} from "./log.js";

const opts=(all,items)=>`<option value="">${all}</option>`+items.map(([v,t])=>`<option value="${esc(v)}">${esc(t)}</option>`).join("");

// Hitung berapa alat per kota atau per PIC (berdasarkan catatan terakhir tiap alat).
function tally(g,keyOf,nameOf){
  const m=new Map();
  g.forEach(([,l])=>{const r=l[l.length-1],k=keyOf(r),e=m.get(k)||{name:nameOf(r),n:0};e.n++;m.set(k,e)});
  return [...m.entries()].sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([k,e])=>[k,`${e.name} (${e.n})`]);
}

// Isi dropdown Tool, City (filter peta) dan PIC (filter kartu). Pilihan lama dipertahankan kalau masih ada.
export function fillFilters(g){
  const tools=g.map(([sn])=>[sn,sn]),cities=tally(g,r=>locKey(r.loc),r=>cap(locKey(r.loc))),pics=tally(g,picKey,r=>cap(r.name));
  const keep=(v,list)=>list.some(([k])=>k===v)?v:null;
  const eqs=[...new Set([...EQUIPMENT,...state.data.flatMap(r=>r.eq||[])])],eqOpts=[["__none","No supporting equipment"],...eqs.map(e=>[e,e])];
  state.eq=keep(state.eq,eqOpts);
  state.sel=keep(state.sel,tools);state.city=keep(state.city,cities);state.pic=keep(state.pic,pics);
  $("#snsel").innerHTML=opts("All tools",tools);$("#citysel").innerHTML=opts("All cities",cities);$("#picsel").innerHTML=opts("All PICs",pics);$("#eqsel").innerHTML=opts("All equipment",eqOpts);
  $("#snsel").value=state.sel||"";$("#citysel").value=state.city||"";$("#picsel").value=state.pic||"";$("#eqsel").value=state.eq||"";
}

export function applyMapFilter(){
  const {sel,city}=state,allowed=allowedSerials(state.g,{sel,city});
  $$(".mapbox [data-sns]").forEach(e=>e.classList.toggle("dim",!e.dataset.sns.split(" ").some(s=>allowed.has(s))));
  $$(".card").forEach(c=>c.classList.toggle("sel",!!sel&&c.dataset.sn==sel));
  $("#snsel").value=sel||"";$("#citysel").value=city||"";$("#tip").hidden=true;
}

export function pick(sn){state.sel=state.sel==sn?null:sn;applyMapFilter()}

export function moveSeg(){const b=document.querySelector('#seg [aria-pressed=true]'),i=$("#seg i");i.style.left=b.offsetLeft+"px";i.style.width=b.offsetWidth+"px"}

export function initFilters(){
  $("#snsel").onchange=e=>{state.sel=e.target.value||null;applyMapFilter()};
  $("#citysel").onchange=e=>{state.city=e.target.value||null;applyMapFilter()};
  $$("#seg button").forEach(b=>b.onclick=()=>{$$("#seg button").forEach(x=>x.setAttribute("aria-pressed",x==b));state.role=b.dataset.r;state.logPage=0;moveSeg();renderLog()});
  $("#eqsel").onchange=e=>{state.eq=e.target.value||null;state.logPage=0;renderLog()};
  $("#q").oninput=e=>{state.query=e.target.value;state.logPage=0;renderLog()};
}
