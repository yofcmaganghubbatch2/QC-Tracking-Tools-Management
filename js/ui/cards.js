import {$} from "../dom.js";
import {state} from "../state.js";
import {esc,cap,fmt,diff} from "../logic/format.js";
import {pick} from "./filters.js";

const KEEP=4; // riwayat yang langsung tampil; sisanya dilipat

function stop(r,prev,last,i){
  const gap=prev?`<small>+${diff(prev.d,r.d)} hari</small>`:"";
  return `<li class="${r.role}${last?" last":""}" style="--i:${i}"><span class="dot"></span><div class="tx"><b>${esc(cap(r.name))}</b><span>${r.role=="s"?"kirim":"terima"}, ${esc(cap(r.loc))}</span></div><time>${fmt(r.d)}${gap}</time></li>`;
}

function timeline(l){
  const off=Math.max(0,l.length-KEEP);
  const all=l.map((r,i)=>stop(r,l[i-1],i==l.length-1,Math.max(0,i-off)));
  const older=off?`<details class="older"><summary>${off} riwayat sebelumnya</summary><ol class="tl">${all.slice(0,off).join("")}</ol></details>`:"";
  return older+`<ol class="tl">${all.slice(off).join("")}</ol>`;
}

export function renderCards(g){
  const ref=$("#ref").value;
  $("#cards").innerHTML=g.map(([sn,l])=>{
    const c=l[l.length-1],ship=c.role=="s",bad=c.cond=="broken";
    const days=diff(c.d,ref);
    const cls=bad?"bad":ship?"go":"";
    const pill=bad?"Rusak":ship?"Dalam pengiriman":"Di tangan PIC";
    const line=ship?`Dikirim dari ${esc(c.loc)}${c.ship?" via "+esc(c.ship):""}${c.trk?", resi "+esc(c.trk):""}`:`${esc(c.loc)}, sejak ${fmt(c.d)}`;
    return `<article class="card ${cls}" data-sn="${esc(sn)}" tabindex="0"><div class="top"><div class="serial">${esc(sn)}</div><span class="pill ${cls}">${pill}</span></div>
<div class="holder"><div><b>${esc(cap(c.name))}</b><small>${line}</small></div><div class="days"><div class="big">${days}</div><small>${ship?"hari di jalan":"hari di PIC"}</small></div></div>
${bad?`<p class="note">Kondisi rusak: ${esc(c.rem||"tanpa keterangan")}</p>`:""}
${timeline(l)}</article>`;
  }).join("")||`<div class="empty">Belum ada data alat.</div>`;
}

export function initCards(){
  $("#cards").onclick=e=>{
    if(e.target.closest("details"))return; // buka/tutup riwayat tidak ikut memfilter
    const c=e.target.closest(".card");
    if(c){pick(c.dataset.sn);if(state.sel)$("#map").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"center"})}
  };
  $("#cards").onkeydown=e=>{
    if(e.key=="Enter"&&!e.target.closest("summary")){const c=e.target.closest(".card");if(c)pick(c.dataset.sn)}
  };
}
