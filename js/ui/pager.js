import {$} from "../dom.js";

// Tombol Prev/Next + info halaman. `unit` = kata benda jamak, misal "tools" atau "records".
export function renderPager(sel,p,unit){
  const el=$(sel);
  if(!p.total){el.innerHTML="";return}
  const word=p.total===1?unit.replace(/s$/,""):unit;
  const info=`<span class="pg-info">Page ${p.page+1} of ${p.pages} · ${p.total} ${word}</span>`;
  el.innerHTML=p.pages>1
    ?`<button class="btn" data-go="-1" aria-label="Previous page"${p.page<=0?" disabled":""}>&lsaquo; Prev</button>${info}<button class="btn" data-go="1" aria-label="Next page"${p.page>=p.pages-1?" disabled":""}>Next &rsaquo;</button>`
    :info;
}

export function onPager(sel,fn){
  $(sel).onclick=e=>{const b=e.target.closest("button[data-go]");if(b&&!b.disabled)fn(Number(b.dataset.go))};
}
