import {$} from "./dom.js";
import {state} from "./state.js";
import {iso} from "./logic/format.js";
import {group} from "./logic/gauges.js";
import {loadData,AuthError,getCode,setCode,clearCode} from "./data/source.js";
import {renderStats} from "./ui/stats.js";
import {renderCards,initCards,relayoutCards} from "./ui/cards.js";
import {renderMap,initMapZoom} from "./ui/map.js";
import {initFx} from "./ui/fx.js";
import {renderLog,initLog} from "./ui/log.js";
import {initTooltip} from "./ui/tooltip.js";
import {fillFilters,applyMapFilter,initFilters,moveSeg,updateSummary} from "./ui/filters.js";
import {showNotice,clearNotice} from "./ui/notice.js";
import {initGate,askCode} from "./ui/gate.js";

const today=()=>iso(new Date());
// Data demo berhenti di tanggal tertentu (terakhir 1 Oktober 2026), jadi hitung sampai tanggal terakhir di data. Data asli: hitung sampai hari ini.
const setRef=()=>{$("#ref").value=state.source==="demo data"?(state.data.map(r=>r.d).sort().pop()||today()):today()};

// Setelah filter gabungan (Tool, City, PIC) berubah: kartu, peta, log, dan ringkasan ikut berubah.
function refresh(){renderCards();applyMapFilter();renderLog();updateSummary()}
const redrawMap=()=>{renderMap(state.g);applyMapFilter()};

// Bagian halaman muncul pelan-pelan saat discroll ke layar. Kelas "reveal" dipasang lewat JS, jadi tanpa JS semuanya tetap tampil.
function initReveal(){
  if(typeof IntersectionObserver==="undefined")return;
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.08});
  document.querySelectorAll(".bar,.mapwrap,.log,.pager,footer").forEach(el=>{el.classList.add("reveal");io.observe(el)});
}

function render(){
  const g=group(state.data);state.g=g;
  renderStats(g);fillFilters(g);renderCards();renderMap(g);applyMapFilter();renderLog();updateSummary();
  const time=new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
  $("#foot").textContent=state.source==="demo data"
    ?"Showing demo data. Remove ?demo from the address to see the spreadsheet."
    :state.source?`${state.data.length} records from ${state.source}. Last updated ${time}.`:"";
}

async function load(){
  const btn=$("#reload");btn.disabled=true;btn.textContent="Loading...";clearNotice();
  if(!state.data.length)$("#cards").innerHTML='<div class="skel" role="status" aria-label="Loading"></div>'.repeat(3);
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
  initFilters(refresh);initCards();initLog();initTooltip();initMapZoom(redrawMap);initReveal();initFx();
  initGate(code=>{setCode(code);load()});
  $("#ref").onchange=()=>renderCards();
  $("#reload").onclick=load;
  requestAnimationFrame(moveSeg);
  let t;addEventListener("resize",()=>{moveSeg();clearTimeout(t);t=setTimeout(relayoutCards,150)});
  const narrow=matchMedia("(max-width:700px)");
  if(narrow.addEventListener)narrow.addEventListener("change",redrawMap);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(moveSeg);
}

bind();
load();
