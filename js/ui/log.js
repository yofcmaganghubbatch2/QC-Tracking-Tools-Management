import {$} from "../dom.js";
import {state} from "../state.js";
import {esc,cap,fmt} from "../logic/format.js";

export function renderLog(){const q=state.query.toLowerCase();
const rows=[...state.data].sort((a,b)=>b.d.localeCompare(a.d)).filter(r=>(state.role=="all"||r.role==state.role)&&(!state.sel||r.sn==state.sel)&&(!q||[r.name,r.loc,r.sn,r.email,r.id].join(" ").toLowerCase().includes(q)));
$("#log").innerHTML=`<div class="row head"><div>Tanggal</div><div>PIC</div><div>Lokasi</div><div>Peran</div><div>Alat</div></div>`+
(rows.map(r=>`<div class="row"><div>${fmt(r.d)}</div><div><b>${esc(cap(r.name))}</b><small>ID ${esc(r.id)}</small></div><div>${esc(cap(r.loc))}</div><div><span class="chip ${r.role}">${r.role=="s"?"Pengirim":"Penerima"}</span></div><div>${esc(r.sn)}<small>${r.cond=="broken"?"Rusak: "+esc(r.rem):r.role=="s"&&r.ship?esc(r.ship)+" · "+esc(r.trk):"Kondisi baik"}</small></div></div>`).join("")||`<div class="empty">Tidak ada catatan yang cocok. Ubah filter atau kata pencarian.</div>`)}
