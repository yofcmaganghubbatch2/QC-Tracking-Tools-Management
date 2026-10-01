import {$} from "./dom.js";
import {state} from "./state.js";
import {iso} from "./logic/format.js";
import {group} from "./logic/gauges.js";
import {loadData} from "./data/source.js";
import {readSpreadsheet} from "./data/parser.js";
import {renderStats} from "./ui/stats.js";
import {renderCards,initCards} from "./ui/cards.js";
import {renderMap} from "./ui/map.js";
import {initTooltip} from "./ui/tooltip.js";
import {fillSel,applySel,initFilters,moveSeg} from "./ui/filters.js";
import {showNotice,clearNotice} from "./ui/notice.js";

const setRef=()=>{$("#ref").value=state.data.map(r=>r.d).sort().pop()||""};

function render(){
  const g=group(state.data);
  renderStats(g);fillSel(g);renderCards(g);renderMap(g);applySel();
  $("#foot").textContent=`${state.data.length} catatan dari ${state.source}.`+(state.source==="data contoh"?" Muat file xlsx untuk mengganti dengan data Anda.":"");
}

async function load(){
  const btn=$("#reload");btn.disabled=true;btn.textContent="Memuat...";clearNotice();
  try{
    const {rows,label}=await loadData();
    if(!Array.isArray(rows))throw new Error("Format data dari sumber tidak dikenali (harus berupa daftar catatan).");
    state.data=rows;state.source=label;setRef();render();
  }catch(err){showNotice((err&&err.message)||"Gagal memuat data.","error")}
  finally{btn.disabled=false;btn.textContent="Muat ulang data"}
}

function bind(){
  initFilters();initCards();initTooltip();
  $("#ref").onchange=()=>renderCards(group(state.data));
  $("#today").onclick=()=>{$("#ref").value=iso(new Date());renderCards(group(state.data))};
  $("#reload").onclick=load;
  $("#file").onchange=async e=>{const f=e.target.files[0];if(!f)return;
    try{state.data=await readSpreadsheet(f);state.source="file "+f.name;clearNotice();setRef();render()}
    catch(err){showNotice((err&&err.message)||"File tidak terbaca.","error")}
    e.target.value=""};
  requestAnimationFrame(moveSeg);
  addEventListener("resize",moveSeg);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(moveSeg);
}

bind();
load();
