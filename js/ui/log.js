import {$,smooth} from "../dom.js";
import {state} from "../state.js";
import {esc,cap,fmt} from "../logic/format.js";
import {paginate} from "../logic/paging.js";
import {recordMatches,picKey} from "../logic/gauges.js";
import {handoverChecks} from "../logic/equipment.js";
import {renderPager,onPager} from "./pager.js";

const SIZE=10; // baris per halaman

const detail=r=>r.cond=="broken"?`<small class="d bad">Broken: ${esc(r.rem||"no remark")}</small>`
  :r.role=="s"&&r.ship?`<small class="d">${esc(r.ship)}${r.trk?" · "+esc(r.trk):""}</small>`
  :`<small class="d ok">Good condition</small>`;

// Keterangan kelengkapan, sama seperti di kartu: hanya ada di catatan penerima yang didahului catatan pengirim alat yang sama.
// Kurang = dikirim tapi tidak dicentang penerima (Not received). Lebih = dicentang penerima tapi tidak dikirim (Extra).
const eqNote=c=>!c?"":c.ok?`<div class="eqok">&#10003; Complete, matches what was sent</div>`
  :`<div class="eqwarn">${c.missing.length?`<span>Not received: ${c.missing.map(esc).join(", ")}</span>`:""}${c.extra.length?`<span>Extra: ${c.extra.map(esc).join(", ")}</span>`:""}</div>`;

const eqCell=(r,c)=>{
  const e=r.eq||[],note=eqNote(c),chips=e.map(x=>`<i class="eqchip">${esc(x)}</i>`).join("");
  return `<div class="c-eq${e.length||note?"":" none"}">${chips||"–"}${note}</div>`;
};

const rowHtml=(r,c)=>`<div class="row"><div class="c-date">${fmt(r.d)}</div><div class="c-pic"><b>${esc(cap(r.name))}</b><small>ID ${esc(r.id)}</small></div><div class="c-loc">${esc(cap(r.loc))}${r.role=="s"?`<small class="dest${r.dest?"":" none"}">&rarr; ${r.dest?esc(cap(r.dest)):"not set"}</small>`:""}</div><div class="c-role"><span class="chip ${r.role}">${r.role=="s"?"Sender":"Recipient"}</span></div><div class="c-tool"><span class="sn">${esc(r.sn)}</span>${detail(r)}</div>${eqCell(r,c)}</div>`;

// Keterangan filter yang sedang berlaku untuk log, misal "Tool OH3368068, City Denpasar".
function filterText(){
  const parts=[];
  if(state.sel)parts.push("Tool "+state.sel);
  if(state.city)parts.push("City "+cap(state.city));
  if(state.pic){const r=state.data.find(x=>picKey(x)===state.pic);parts.push("PIC "+cap(r?r.name:state.pic))}
  return parts.join(", ");
}

export function renderLog(){
  // Log = riwayat: semua catatan yang cocok dengan filter gabungan di atas halaman (Tool, City, PIC) dan tombol peran All/Senders/Recipients.
  const rows=[...state.data].sort((a,b)=>b.d.localeCompare(a.d))
    .filter(r=>recordMatches(r,state)&&(state.role=="all"||r.role==state.role));
  // Hasil pengecekan serah terima dihitung dari riwayat lengkap tiap alat (bukan dari baris yang sedang tampil), jadi tidak terpengaruh filter.
  const chk=new Map();state.g.forEach(([,l])=>{const cs=handoverChecks(l);l.forEach((r,i)=>{if(cs[i])chk.set(r,cs[i])})});
  const p=paginate(rows,state.logPage,SIZE);state.logPage=p.page;
  const empty=state.data.length?"No matching records. Change the filters.":"No record";
  const txt=filterText();
  $("#logsum").hidden=!txt;$("#logsum").textContent=txt?"History for: "+txt+".":"";
  $("#log").innerHTML=`<div class="row head"><div class="c-date">Date</div><div class="c-pic">PIC</div><div class="c-loc">Location</div><div class="c-role">Role</div><div class="c-tool">Tool</div><div class="c-eq">Equipment</div></div>`+(p.items.map(r=>rowHtml(r,chk.get(r))).join("")||`<div class="empty">${empty}</div>`);
  renderPager("#log-pager",p,"records");
}

export function initLog(){
  onPager("#log-pager",d=>{state.logPage+=d;renderLog();$("#log").scrollIntoView({behavior:smooth(),block:"start"})});
}
