import {$} from "../dom.js";

// Efek visual yang butuh JS: kartu miring mengikuti kursor + cahaya sorot, dan garis progres scroll di atas halaman.
// Tilt hanya untuk perangkat dengan mouse dan tidak dipakai kalau pengguna memilih "reduce motion".
export function initFx(){
  const fine=matchMedia("(hover:hover) and (pointer:fine)").matches,calm=matchMedia("(prefers-reduced-motion:reduce)").matches;
  const cards=$("#cards"),reset=c=>["--rx","--ry"].forEach(k=>c.style.removeProperty(k));
  if(fine&&!calm){
    cards.addEventListener("pointermove",e=>{
      const c=e.target.closest&&e.target.closest(".card");if(!c)return;
      const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      c.style.setProperty("--mx",(x*100).toFixed(1)+"%");c.style.setProperty("--my",(y*100).toFixed(1)+"%");
      c.style.setProperty("--rx",((.5-y)*5).toFixed(2)+"deg");c.style.setProperty("--ry",((x-.5)*6).toFixed(2)+"deg");
    });
    cards.addEventListener("pointerout",e=>{const c=e.target.closest&&e.target.closest(".card");if(c&&!c.contains(e.relatedTarget))reset(c)});
  }
  const bar=$("#progress");let busy=false;
  const upd=()=>{busy=false;const h=document.documentElement.scrollHeight-innerHeight;bar.style.setProperty("--p",h>0?Math.min(1,scrollY/h):0)};
  addEventListener("scroll",()=>{if(!busy){busy=true;requestAnimationFrame(upd)}},{passive:true});
}
