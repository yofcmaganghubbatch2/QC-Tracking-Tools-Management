import {$} from "../dom.js";
import {countMismatches} from "../logic/equipment.js";

function count(el,to){if(matchMedia("(prefers-reduced-motion:reduce)").matches){el.textContent=to;return}
const t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/900);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)})(t0)}

export function renderStats(g){const last=g.map(([,l])=>l[l.length-1]);
const v=[["Tools tracked",g.length,""],["In transit",last.filter(r=>r.role=="s").length,"go"],["With PIC",last.filter(r=>r.role=="r"&&r.cond!="broken").length,"ok"],["Needs repair",last.filter(r=>r.cond=="broken").length,"warn"],["Equipment mismatches",countMismatches(g),"go"]];
$("#stats").innerHTML=v.map(x=>`<div class="stat ${x[2]}"><div class="big">0</div><span>${x[0]}</span></div>`).join("");
document.querySelectorAll(".stat .big").forEach((e,i)=>count(e,v[i][1]))}
