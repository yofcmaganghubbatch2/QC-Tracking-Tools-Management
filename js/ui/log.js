import {$,smooth} from "../dom.js";
import {state} from "../state.js";
import {esc,cap,fmt} from "../logic/format.js";
import {paginate} from "../logic/paging.js";
import {renderPager,onPager} from "./pager.js";

const SIZE=10; // baris per halaman

const rowHtml=r=>`<div class="row"><div class="c-date">${fmt(r.d)}</div><div class="c-pic"><b>${esc(cap(r.name))}</b><small>ID ${esc(r.id)}</small></div><div class="c-loc">${esc(cap(r.loc))}</div><div class="c-role"><span class="chip ${r.role}">${r.role=="s"?"Sender":"Recipient"}</span></div><div class="c-tool">${esc(r.sn)}<small>${r.cond=="broken"?"Broken: "+esc(r.rem||"no remark"):r.role=="s"&&r.ship?esc(r.ship)+(r.trk?" · "+esc(r.trk):""):"Good condition"}</small></div></div>`;

export function renderLog(){
  const q=state.query.toLowerCase();
  const rows=[...state.data].sort((a,b)=>b.d.localeCompare(a.d))
    .filter(r=>(state.role=="all"||r.role==state.role)&&(!q||[r.name,r.loc,r.sn,r.id].join(" ").toLowerCase().includes(q)));
  const p=paginate(rows,state.logPage,SIZE);state.logPage=p.page;
  const empty=state.data.length?"No matching records. Change the filter or search.":"No record";
  $("#log").innerHTML=`<div class="row head"><div class="c-date">Date</div><div class="c-pic">PIC</div><div class="c-loc">Location</div><div class="c-role">Role</div><div class="c-tool">Tool</div></div>`+(p.items.map(rowHtml).join("")||`<div class="empty">${empty}</div>`);
  renderPager("#log-pager",p,"records");
}

export function initLog(){
  onPager("#log-pager",d=>{state.logPage+=d;renderLog();$("#log").scrollIntoView({behavior:smooth(),block:"start"})});
}
