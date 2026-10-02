import {$,smooth} from "../dom.js";
import {state} from "../state.js";
import {esc,cap,fmt,diff} from "../logic/format.js";
import {picKey} from "../logic/gauges.js";
import {paginate} from "../logic/paging.js";
import {renderPager,onPager} from "./pager.js";
import {pick} from "./filters.js";

const KEEP=4; // riwayat per kartu yang langsung tampil; sisanya dilipat
let per=0;    // jumlah kartu per halaman saat ini

// Jumlah kartu per halaman = jumlah kolom x 2 baris. Kolom mengikuti lebar layar (kartu minimal 340px).
export function cardsPerPage(){
  const w=Number($("#cards").clientWidth)||globalThis.innerWidth||1000;
  return Math.max(1,Math.min(3,Math.floor(w/340)))*2;
}

function stop(r,prev,last,i){
  const gap=prev?`<small>+${diff(prev.d,r.d)} day${diff(prev.d,r.d)===1?"":"s"}</small>`:"";
  return `<li class="${r.role}${last?" last":""}" style="--i:${i}"><span class="dot"></span><div class="tx"><b>${esc(cap(r.name))}</b><span>${r.role=="s"?"sent":"received"}, ${esc(cap(r.loc))}</span></div><time>${fmt(r.d)}${gap}</time></li>`;
}

function timeline(l){
  const off=Math.max(0,l.length-KEEP);
  const all=l.map((r,i)=>stop(r,l[i-1],i==l.length-1,Math.max(0,i-off)));
  const older=off?`<details class="older"><summary>${off} earlier record${off>1?"s":""}</summary><ol class="tl">${all.slice(0,off).join("")}</ol></details>`:"";
  return older+`<ol class="tl">${all.slice(off).join("")}</ol>`;
}

function cardHtml([sn,l],ref){
  const c=l[l.length-1],ship=c.role=="s",bad=c.cond=="broken";
  const days=diff(c.d,ref),cls=bad?"bad":ship?"go":"";
  const pill=bad?"Broken":ship?"In transit":"With PIC";
  const line=ship?`Sent from ${esc(cap(c.loc))}${c.ship?" via "+esc(c.ship):""}${c.trk?", tracking "+esc(c.trk):""}`:`${esc(cap(c.loc))}, since ${fmt(c.d)}`;
  return `<article class="card ${cls}${state.sel===sn?" sel":""}" data-sn="${esc(sn)}" tabindex="0"><div class="top"><div class="serial">${esc(sn)}</div><span class="pill ${cls}">${pill}</span></div>
<div class="holder"><div><b>${esc(cap(c.name))}</b><small>${line}</small></div><div class="days"><div class="big">${days}</div><small>${days==1?"day":"days"} ${ship?"in transit":"with PIC"}</small></div></div>
${bad?`<p class="note">Broken: ${esc(c.rem||"no remark")}</p>`:""}
${timeline(l)}</article>`;
}

// dir = "next" / "prev" untuk animasi geser saat pindah halaman.
export function renderCards(dir){
  const ref=$("#ref").value;
  const list=state.g.filter(([,l])=>!state.pic||picKey(l[l.length-1])===state.pic);
  per=cardsPerPage();
  const p=paginate(list,state.page,per);state.page=p.page;
  const el=$("#cards");el.className="cards"+(dir?" slide-"+dir:"");
  const empty=state.data.length?"No tools match this filter.":"No record";
  el.innerHTML=p.items.map(c=>cardHtml(c,ref)).join("")||`<div class="empty">${empty}</div>`;
  renderPager("#cards-pager",p,"tools");
}

// Dipanggil saat ukuran layar berubah: kalau jumlah kolom berubah, susun ulang halaman.
export function relayoutCards(){
  const old=per,now=cardsPerPage();
  if(old&&now!==old&&state.g.length){state.page=Math.floor(state.page*old/now);renderCards()}
}

export function initCards(){
  const go=d=>{state.page+=d;renderCards(d>0?"next":"prev")};
  onPager("#cards-pager",go);
  $("#picsel").onchange=e=>{state.pic=e.target.value||null;state.page=0;renderCards()};
  const el=$("#cards");
  el.onclick=e=>{
    if(e.target.closest("details"))return; // buka/tutup riwayat tidak ikut memilih alat
    const c=e.target.closest(".card");
    if(c){pick(c.dataset.sn);if(state.sel)$("#map").scrollIntoView({behavior:smooth(),block:"center"})}
  };
  el.onkeydown=e=>{
    if(e.key=="Enter"&&!e.target.closest("summary")){const c=e.target.closest(".card");if(c)pick(c.dataset.sn)}
  };
  // geser jari: kiri = halaman berikutnya, kanan = sebelumnya
  let sx=0,sy=0;
  el.addEventListener("touchstart",e=>{const t=e.changedTouches[0];sx=t.clientX;sy=t.clientY},{passive:true});
  el.addEventListener("touchend",e=>{const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)go(dx<0?1:-1)},{passive:true});
}
