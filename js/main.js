import {$} from "./dom.js";
import {state} from "./state.js";
import {iso} from "./logic/format.js";
import {group} from "./logic/gauges.js";
import {loadData,AuthError,getCode,setCode,clearCode} from "./data/source.js";
import {renderStats} from "./ui/stats.js";
import {renderCards,initCards} from "./ui/cards.js";
import {renderMap} from "./ui/map.js";
import {initTooltip} from "./ui/tooltip.js";
import {fillSel,applySel,initFilters,moveSeg} from "./ui/filters.js";
import {showNotice,clearNotice} from "./ui/notice.js";
import {initGate,askCode} from "./ui/gate.js";

const today=()=>iso(new Date());
// Data demo bertanggal Desember 2026, jadi hitung sampai tanggal terakhir di data. Data asli: hitung sampai hari ini.
const setRef=()=>{$("#ref").value=state.source==="demo data"?(state.data.map(r=>r.d).sort().pop()||today()):today()};

function render(){
  const g=group(state.data);
  renderStats(g);fillSel(g);renderCards(g);renderMap(g);applySel();
  const time=new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
  $("#foot").textContent=state.source==="demo data"
    ?"Showing demo data. Remove ?demo from the address to see the spreadsheet."
    :state.source?`${state.data.length} records from ${state.source}. Last updated ${time}.`:"";
}

async function load(){
  const btn=$("#reload");btn.disabled=true;btn.textContent="Loading...";clearNotice();
  if(!state.data.length)$("#cards").innerHTML='<div class="empty">Loading...</div>';
  try{
    const {rows,label,skipped}=await loadData();
    state.data=rows;state.source=label;setRef();render();
    if(skipped)showNotice(`${skipped} row${skipped>1?"s were":" was"} skipped (missing serial number or unreadable date).`);
  }catch(err){
    if(!state.data.length){state.source="";setRef();render()} // tampilan tetap ada, isinya "No record"
    if(err instanceof AuthError){
      const wasWrong=!!getCode();clearCode();
      showNotice("Access code required to view this data.");
      askCode(wasWrong);
    }else showNotice((err&&err.message)||"Failed to load data.","error");
  }finally{btn.disabled=false;btn.textContent="Reload data"}
}

function bind(){
  initFilters();initCards();initTooltip();
  initGate(code=>{setCode(code);load()});
  $("#ref").onchange=()=>renderCards(group(state.data));
  $("#today").onclick=()=>{$("#ref").value=today();renderCards(group(state.data))};
  $("#reload").onclick=load;
  requestAnimationFrame(moveSeg);
  addEventListener("resize",moveSeg);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(moveSeg);
}

bind();
load();
