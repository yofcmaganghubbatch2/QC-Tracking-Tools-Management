import {$} from "../dom.js";
import {state} from "../state.js";
import {esc,cap,fmt,diff} from "../logic/format.js";
import {pick} from "./filters.js";

export function renderCards(g){const ref=$("#ref").value;
$("#cards").innerHTML=g.map(([sn,l])=>{const c=l[l.length-1],ship=c.role=="s",bad=c.cond=="broken";
const days=diff(c.d,ref);
const cls=bad?"bad":ship?"go":"";
const pill=bad?"Rusak":ship?"Dalam pengiriman":"Di tangan PIC";
const line=ship?`Dikirim dari ${esc(c.loc)}${c.ship?" via "+esc(c.ship):""}${c.trk?", resi "+esc(c.trk):""}`:`${esc(c.loc)}, sejak ${fmt(c.d)}`;
const nodes=l.map((r,i)=>{const link=i?`<div class="link" style="--i:${i}"><em>${diff(l[i-1].d,r.d)} hari</em></div>`:"";
return link+`<div class="node ${r.role} ${i==l.length-1?"last":""}" style="--i:${i}"><div class="dot"></div><b>${esc(cap(r.name))}</b><span>${r.role=="s"?"kirim":"terima"}, ${esc(cap(r.loc))}<br>${fmt(r.d)}</span></div>`}).join("");
return `<article class="card ${cls}" data-sn="${esc(sn)}" tabindex="0"><div class="top"><div class="serial">${esc(sn)}</div><span class="pill ${cls}">${pill}</span></div>
<div class="holder"><div><b>${esc(cap(c.name))}</b><small>${line}</small></div><div class="days"><div class="big">${days}</div><small>${ship?"hari di jalan":"hari di PIC"}</small></div></div>
${bad?`<p class="note">Kondisi rusak: ${esc(c.rem||"tanpa keterangan")}</p>`:""}
<div class="relay">${nodes}</div></article>`}).join("")||`<div class="empty">Belum ada data alat.</div>`}

export function initCards(){
  $("#cards").onclick=e=>{const c=e.target.closest(".card");if(c){pick(c.dataset.sn);if(state.sel)$("#map").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"center"})}};
  $("#cards").onkeydown=e=>{if(e.key=="Enter"){const c=e.target.closest(".card");if(c)pick(c.dataset.sn)}};
}
