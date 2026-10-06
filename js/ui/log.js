import {$,smooth} from "../dom.js";
import {state} from "../state.js";
import {esc,cap,fmt} from "../logic/format.js";
import {paginate} from "../logic/paging.js";
import {allowedSerials} from "../logic/gauges.js";
import {renderPager,onPager} from "./pager.js";

const SIZE=10; // baris per halaman

const detail=r=>r.cond=="broken"?`<small class="d bad">Broken: ${esc(r.rem||"no remark")}</small>`
  :r.role=="s"&&r.ship?`<small class="d">${esc(r.ship)}${r.trk?" · "+esc(r.trk):""}</small>`
  :`<small class="d ok">Good condition</small>`;

const eqCell=r=>{const e=r.eq||[];return `<div class="c-eq${e.length?"":" none"}">${e.length?e.map(x=>`<i class="eqchip">${esc(x)}</i>`).join(""):"–"}</div>`};

const rowHtml=r=>`<div class="row"><div class="c-date">${fmt(r.d)}</div><div class="c-pic"><b>${esc(cap(r.name))}</b><small>ID ${esc(r.id)}</small></div><div class="c-loc">${esc(cap(r.loc))}</div><div class="c-role"><span class="chip ${r.role}">${r.role=="s"?"Sender":"Recipient"}</span></div><div class="c-tool"><span class="sn">${esc(r.sn)}</span>${detail(r)}</div>${eqCell(r)}</div>`;

export function renderLog(){
  const q=state.query.toLowerCase();
  // Filter gabungan di atas halaman (Tool, City, PIC) juga menyaring log: hanya catatan alat yang lolos filter.
  const act=state.sel||state.city||state.pic,allowed=act?allowedSerials(state.g,state):null;
  const rows=[...state.data].sort((a,b)=>b.d.localeCompare(a.d))
    .filter(r=>(!allowed||allowed.has(r.sn))&&(state.role=="all"||r.role==state.role)
      &&(!state.eq||(state.eq==="__none"?!(r.eq||[]).length:(r.eq||[]).includes(state.eq)))
      &&(!q||[r.name,r.loc,r.sn,r.id,(r.eq||[]).join(" ")].join(" ").toLowerCase().includes(q)));
  const p=paginate(rows,state.logPage,SIZE);state.logPage=p.page;
  const empty=state.data.length?"No matching records. Change the filter or search.":"No record";
  $("#log").innerHTML=`<div class="row head"><div class="c-date">Date</div><div class="c-pic">PIC</div><div class="c-loc">Location</div><div class="c-role">Role</div><div class="c-tool">Tool</div><div class="c-eq">Equipment</div></div>`+(p.items.map(rowHtml).join("")||`<div class="empty">${empty}</div>`);
  renderPager("#log-pager",p,"records");
}

export function initLog(){
  onPager("#log-pager",d=>{state.logPage+=d;renderLog();$("#log").scrollIntoView({behavior:smooth(),block:"start"})});
}
