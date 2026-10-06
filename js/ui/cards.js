import {$,$$,smooth} from "../dom.js";
import {state} from "../state.js";
import {esc,cap,fmt,diff} from "../logic/format.js";
import {handoverChecks} from "../logic/equipment.js";
import {paginate} from "../logic/paging.js";
import {renderPager,onPager} from "./pager.js";
import {pick,visibleSerials} from "./filters.js";
import {countUp} from "./stats.js";

const KEEP=3; // riwayat terbaru yang langsung tampil di kartu; sisanya muncul (bisa di-scroll) saat kartu dibuka
let per=0;    // jumlah kartu per halaman saat ini

// Jumlah kartu per halaman = jumlah kolom x 2 baris. Kolom mengikuti lebar layar (kartu minimal 340px).
export function cardsPerPage(){
  const w=Number($("#cards").clientWidth)||globalThis.innerWidth||1000;
  return Math.max(1,Math.min(3,Math.floor(w/340)))*2;
}

const chips=eq=>(eq||[]).map(e=>`<i class="eqchip">${esc(e)}</i>`).join("");
const checkText=c=>[c.missing.length?"Not received: "+c.missing.map(esc).join(", "):"",c.extra.length?"Extra: "+c.extra.map(esc).join(", "):""].filter(Boolean).join(". ");

function stop(r,prev,last,i,check){
  const gap=prev?`<small>+${diff(prev.d,r.d)} day${diff(prev.d,r.d)===1?"":"s"}</small>`:"";
  const eq=r.eq&&r.eq.length?`<div class="eqrow">${chips(r.eq)}</div>`:"";
  const warn=check&&!check.ok?`<div class="eqwarn">${checkText(check)}</div>`:"";
  return `<li class="${r.role}${last?" last":""}" style="--i:${i}"><span class="dot"></span><div class="tx"><b>${esc(cap(r.name))}</b><span>${r.role=="s"?"sent":"received"}, ${esc(cap(r.loc))}</span>${eq}${warn}</div><time>${fmt(r.d)}${gap}</time></li>`;
}

// Baris garis waktu dari indeks `from` sampai akhir. `max` membatasi nomor animasi supaya daftar panjang tidak menunggu lama.
const items=(l,checks,from,max)=>l.slice(from).map((r,j)=>{const i=from+j;return stop(r,l[i-1],i==l.length-1,Math.min(j,max),checks[i])}).join("");

function cardHtml([sn,l],ref,n){
  const c=l[l.length-1],ship=c.role=="s",bad=c.cond=="broken";
  const days=diff(c.d,ref),cls=bad?"bad":ship?"go":"";
  const checks=handoverChecks(l),last=checks[l.length-1];
  const more=l.length>KEEP,open=more&&state.open.has(sn);
  const pill=bad?"Broken":ship?"In transit":"With PIC";
  const line=ship?`Sent from ${esc(cap(c.loc))}${c.ship?" via "+esc(c.ship):""}${c.trk?", tracking "+esc(c.trk):""}`:`${esc(cap(c.loc))}, since ${fmt(c.d)}`;
  const recent=`<ol class="tl recent">${items(l,checks,Math.max(0,l.length-KEEP),KEEP)}</ol>`;
  const full=more?`<div class="tlscroll" tabindex="0" role="region" aria-label="Full history of ${esc(sn)}"><ol class="tl">${items(l,checks,0,8)}</ol></div>`:"";
  const foot=`<div class="foot"><button class="mini" type="button" data-loc aria-pressed="${state.focus===sn}">${state.focus===sn?"Clear map focus":"Show on map"}</button>${more?`<button class="mini ghost" type="button" data-more data-n="${l.length}" aria-expanded="${open}">${open?"Hide history":`All ${l.length} records`}</button>`:""}</div>`;
  return `<article class="card ${cls}${state.focus===sn?" sel":""}${open?" open":""}${more?" xp":""}" data-sn="${esc(sn)}" style="--n:${n}" tabindex="0"><div class="top"><div class="serial">${esc(sn)}</div><span class="pill ${cls}">${pill}</span></div>
<div class="holder"><div><b>${esc(cap(c.name))}</b><small>${line}</small></div><div class="days"><div class="big">${days}</div><small>${days==1?"day":"days"} ${ship?"in transit":"with PIC"}</small></div></div>
${bad?`<p class="note">Broken: ${esc(c.rem||"no remark")}</p>`:""}
${c.eq&&c.eq.length?`<p class="eqline"><span>${ship?"Sent with":"Arrived with"}</span>${chips(c.eq)}</p>`:""}
${last&&!last.ok?`<p class="note">Equipment mismatch. ${checkText(last)}</p>`:""}
${recent}${full}${foot}</article>`;
}

// dir = "next" / "prev" untuk animasi geser saat pindah halaman.
export function renderCards(dir){
  const ref=$("#ref").value,allowed=visibleSerials();
  const list=state.g.filter(([sn])=>allowed.has(sn));
  per=cardsPerPage();
  const p=paginate(list,state.page,per);state.page=p.page;
  const el=$("#cards");el.className="cards"+(dir?" slide-"+dir:"");
  const empty=state.data.length?"No tools match the filters.":"No record";
  el.innerHTML=p.items.map((c,i)=>cardHtml(c,ref,i)).join("")||`<div class="empty">${empty}</div>`;
  $$("#cards .days .big").forEach(e=>countUp(e,Number(e.textContent)||0));
  $$("#cards .card.open .tlscroll").forEach(s=>{s.scrollTop=s.scrollHeight});
  renderPager("#cards-pager",p,"tools");
}

// Dipanggil saat ukuran layar berubah: kalau jumlah kolom berubah, susun ulang halaman.
export function relayoutCards(){
  const old=per,now=cardsPerPage();
  if(old&&now!==old&&state.g.length){state.page=Math.floor(state.page*old/now);renderCards()}
}

// Buka/tutup riwayat lengkap sebuah kartu (tanpa menggambar ulang kartu lain).
function toggle(c){
  const b=c.querySelector("[data-more]");if(!b)return;
  const sn=c.dataset.sn,open=!state.open.has(sn);
  if(open)state.open.add(sn);else state.open.delete(sn);
  c.classList.toggle("open",open);b.setAttribute("aria-expanded",open);
  b.textContent=open?"Hide history":`All ${b.dataset.n} records`;
  const s=c.querySelector(".tlscroll");if(open&&s)s.scrollTop=s.scrollHeight; // riwayat terbaru ada di bawah
}

export function initCards(){
  const go=d=>{state.page+=d;renderCards(d>0?"next":"prev")};
  onPager("#cards-pager",go);
  const el=$("#cards");
  el.onclick=e=>{
    const c=e.target.closest(".card");if(!c)return;
    if(e.target.closest("[data-loc]")){pick(c.dataset.sn);if(state.focus)$("#map").scrollIntoView({behavior:smooth(),block:"center"});return}
    if(e.target.closest(".tlscroll"))return; // scroll di dalam riwayat tidak menutup kartu
    toggle(c);
  };
  el.onkeydown=e=>{
    if((e.key=="Enter"||e.key==" ")&&e.target.classList&&e.target.classList.contains("card")){e.preventDefault();toggle(e.target)}
  };
  // geser jari: kiri = halaman berikutnya, kanan = sebelumnya
  let sx=0,sy=0;
  el.addEventListener("touchstart",e=>{const t=e.changedTouches[0];sx=t.clientX;sy=t.clientY},{passive:true});
  el.addEventListener("touchend",e=>{const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5&&!e.target.closest(".tlscroll"))go(dx<0?1:-1)},{passive:true});
}
