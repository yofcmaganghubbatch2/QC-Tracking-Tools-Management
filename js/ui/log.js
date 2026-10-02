import {$} from "../dom.js";
import {state} from "../state.js";
import {esc,cap,fmt} from "../logic/format.js";

export function renderLog(){
  const q=state.query.toLowerCase();
  const rows=[...state.data].sort((a,b)=>b.d.localeCompare(a.d))
    .filter(r=>(state.role=="all"||r.role==state.role)&&(!state.sel||r.sn==state.sel)&&(!q||[r.name,r.loc,r.sn,r.id].join(" ").toLowerCase().includes(q)));
  const empty=state.data.length?"No matching records. Change the filter or search.":"No record";
  $("#log").innerHTML=`<div class="row head"><div>Date</div><div>PIC</div><div>Location</div><div>Role</div><div>Tool</div></div>`+
   (rows.map(r=>`<div class="row"><div>${fmt(r.d)}</div><div><b>${esc(cap(r.name))}</b><small>ID ${esc(r.id)}</small></div><div>${esc(cap(r.loc))}</div><div><span class="chip ${r.role}">${r.role=="s"?"Sender":"Recipient"}</span></div><div>${esc(r.sn)}<small>${r.cond=="broken"?"Broken: "+esc(r.rem||"no remark"):r.role=="s"&&r.ship?esc(r.ship)+(r.trk?" · "+esc(r.trk):""):"Good condition"}</small></div></div>`).join("")||`<div class="empty">${empty}</div>`);
}
