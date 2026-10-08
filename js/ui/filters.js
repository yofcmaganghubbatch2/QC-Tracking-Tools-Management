import {$,$$} from "../dom.js";
import {state} from "../state.js";
import {esc,cap} from "../logic/format.js";
import {allowedSerials,locKey,picKey} from "../logic/gauges.js";
import {renderLog} from "./log.js";

const opts=(all,items)=>`<option value="">${all}</option>`+items.map(([v,t])=>`<option value="${esc(v)}">${esc(t)}</option>`).join("");

// Daftar kota atau PIC untuk dropdown: semua yang pernah tercatat di log (supaya riwayat bisa difilter),
// dengan jumlah alat yang SEKARANG ada di situ (berdasarkan catatan terakhir tiap alat). "(0)" = pernah ada, sekarang tidak ada alat.
function tally(g,keyOf,nameOf){
  const m=new Map();
  [...state.data].sort((a,b)=>a.d.localeCompare(b.d)).forEach(r=>m.set(keyOf(r),{name:nameOf(r),n:0}));
  g.forEach(([,l])=>{const e=m.get(keyOf(l[l.length-1]));if(e)e.n++});
  return [...m.entries()].sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([k,e])=>[k,`${e.name} (${e.n})`]);
}

// Isi dropdown Tool, City dan PIC (filter gabungan di atas halaman). Pilihan lama dipertahankan kalau masih ada.
export function fillFilters(g){
  const tools=g.map(([sn])=>[sn,sn]),cities=tally(g,r=>locKey(r.loc),r=>cap(locKey(r.loc))),pics=tally(g,picKey,r=>cap(r.name));
  const keep=(v,list)=>list.some(([k])=>k===v)?v:null;
  state.sel=keep(state.sel,tools);state.city=keep(state.city,cities);state.pic=keep(state.pic,pics);state.focus=keep(state.focus,tools);
  $("#snsel").innerHTML=opts("All tools",tools);$("#citysel").innerHTML=opts("All cities",cities);$("#picsel").innerHTML=opts("All PICs",pics);
  $("#snsel").value=state.sel||"";$("#citysel").value=state.city||"";$("#picsel").value=state.pic||"";
}

export const visibleSerials=()=>allowedSerials(state.g,state);

// Alat yang sedang ditampilkan di peta: yang lolos filter gabungan; kalau ada alat yang difokuskan ("Show on map"), hanya alat itu.
export function shownSerials(){
  const allowed=visibleSerials(),f=state.focus&&allowed.has(state.focus)?state.focus:null;
  return f?new Set([f]):allowed;
}

// Sorot di peta: penanda yang tidak punya alat yang ditampilkan diredupkan. Penanda berisi banyak alat menyesuaikan angka dan
// warnanya dengan alat yang ditampilkan (misal "5" jadi tanpa angka saat satu alat difokuskan). Kartu yang difokuskan diberi cincin.
export function applyMapFilter(){
  const shown=shownSerials(),f=state.focus&&visibleSerials().has(state.focus)?state.focus:null;
  const has=sns=>sns.split(" ").some(s=>shown.has(s));
  $$(".mapbox [data-sns]").forEach(e=>e.classList.toggle("dim",!has(e.dataset.sns)));
  $$(".mapbox .mk").forEach(m=>{
    const all=m.dataset.sns.split(" "),on=all.filter(s=>shown.has(s)),n=on.length||all.length,use=on.length?on:all;
    const bad=(m.dataset.bad||"").split(" ").filter(Boolean).some(s=>use.includes(s)),col=bad?"var(--red)":m.dataset.base;
    const cnt=m.querySelector(".cnt"),dot=m.querySelector(".dot"),ring=m.querySelector(".ring");
    if(cnt)cnt.textContent=n>1?n:"";
    if(dot){dot.setAttribute("r",n>1?8:5.5);dot.style.fill=col}
    if(ring)ring.style.fill=col;
  });
  $$(".card").forEach(c=>{
    const on=!!f&&c.dataset.sn==f;c.classList.toggle("sel",on);
    const b=c.querySelector("[data-loc]");if(b){b.textContent=on?"Clear map focus":"Show on map";b.setAttribute("aria-pressed",on)}
  });
  $("#snsel").value=state.sel||"";$("#citysel").value=state.city||"";$("#picsel").value=state.pic||"";$("#tip").hidden=true;
}

export function pick(sn){state.focus=state.focus==sn?null:sn;applyMapFilter()}

// Ringkasan di panel filter: "Showing 2 of 6 tools" dan tombol Reset (hanya muncul kalau ada filter aktif).
export function updateSummary(){
  const n=state.g.length,act=!!(state.sel||state.city||state.pic);
  const el=$("#fsum"),txt=n?(act?`Showing ${visibleSerials().size} of ${n} tools`:`${n} tools`):"";
  if(el.textContent!==txt){el.textContent=txt;el.classList.remove("bump");void el.offsetWidth;el.classList.add("bump")} // animasi kecil saat angka berubah
  $("#freset").hidden=!act;
}

export function moveSeg(){const b=document.querySelector('#seg [aria-pressed=true]'),i=$("#seg i");i.style.left=b.offsetLeft+"px";i.style.width=b.offsetWidth+"px"}

// onChange dipanggil setelah filter gabungan berubah (main.js menyegarkan kartu, peta, log, dan ringkasan).
export function initFilters(onChange){
  const on=(sel,key)=>{$(sel).onchange=e=>{state[key]=e.target.value||null;state.page=0;state.logPage=0;onChange()}};
  on("#snsel","sel");on("#citysel","city");on("#picsel","pic");
  $("#freset").onclick=()=>{state.sel=state.city=state.pic=state.focus=null;state.page=0;state.logPage=0;onChange()};
  $$("#seg button").forEach(b=>b.onclick=()=>{$$("#seg button").forEach(x=>x.setAttribute("aria-pressed",x==b));state.role=b.dataset.r;state.logPage=0;moveSeg();renderLog()});
}
