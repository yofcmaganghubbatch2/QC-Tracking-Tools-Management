import {$} from "../dom.js";
import {esc,cap,fmt} from "../logic/format.js";
import {ll,xy} from "../logic/geo.js";
import {LAND} from "../config/land.js";
import {LEFT} from "../config/cities.js";
import {ITEM} from "../config/schema.js";

let TIPS=[];
export const getTip=i=>TIPS[i];

export function renderMap(g){const groups={},cities=new Map(),seen={},arcs=[],mk=[];let miss=0;TIPS=[];
g.forEach(([sn,l])=>{l.forEach(r=>{const p=ll(r.loc);if(p)cities.set(r.loc.toLowerCase().trim(),[p,r.loc])});
const c=l[l.length-1],p=ll(c.loc);if(!p){miss++;return}
const k=c.role=="s"?"t|"+sn:"h|"+c.id+"|"+c.loc.toLowerCase().trim();
(groups[k]=groups[k]||{c,p,items:[]}).items.push({sn,c})});
Object.values(groups).forEach(gr=>{const c=gr.c,k=c.loc.toLowerCase().trim(),n=seen[k]=(seen[k]||0)+1,p=[gr.p[0],gr.p[1]+(n-1)*16];
const ship=c.role=="s",bad=gr.items.some(i=>i.c.cond=="broken"),col=bad?"var(--red)":ship?"var(--amber)":"var(--teal)",sns=gr.items.map(i=>esc(i.sn)).join(" ");
if(ship){const sn=sns,ai=arcs.length,dx=470-p[0],dy=150-p[1],L=Math.hypot(dx,dy)||1,e=[p[0]+dx/L*130,p[1]+dy/L*130],mx=(p[0]+e[0])/2-dy/L*35,my=(p[1]+e[1])/2+dx/L*35,b=(2.6+ai*.45).toFixed(2);
arcs.push(`<path id="a${ai}" class="arc" data-sns="${sn}" pathLength="1" style="--i:${ai}" d="M${p} Q${mx} ${my} ${e}"/><g data-sns="${sn}"><circle class="trav" r="3.6" style="fill:var(--amber);opacity:0"><set attributeName="opacity" to="1" begin="${b}s"/><animateMotion dur="2.8s" begin="${b}s" repeatCount="indefinite"><mpath href="#a${ai}"/></animateMotion></circle></g><g data-sns="${sn}"><g class="endn" style="--i:${ai}"><circle cx="${e[0]}" cy="${e[1]}" r="6" style="fill:var(--panel);stroke:var(--amber);stroke-width:2;stroke-dasharray:3 3"/><text class="cy" x="${e[0]}" y="${e[1]+20}" text-anchor="middle">menunggu penerima</text></g></g>`)}
TIPS.push(`<b>${esc(cap(c.name))}</b><small>ID ${esc(c.id)}, ${esc(cap(c.loc))}</small>`+
(ship?`<p class="go">Dikirim ${fmt(c.d)}${c.ship?" via "+esc(c.ship):""}${c.trk?", resi "+esc(c.trk):""}. Menunggu konfirmasi penerima.</p>`:`<p>Memegang sejak ${fmt(c.d)}</p>`)+
`<ul>${gr.items.map(i=>`<li>${ITEM}<br><strong>${esc(i.sn)}</strong>${i.c.cond=="broken"?` <span class="bad">rusak: ${esc(i.c.rem||"tanpa keterangan")}</span>`:""}</li>`).join("")}</ul>`);
const m=gr.items.length;
mk.push(`<g class="mk" tabindex="0" data-t="${TIPS.length-1}" data-sns="${sns}" transform="translate(${p[0]} ${p[1]})"><circle r="15" style="fill:transparent"/><circle class="ring" r="7" style="fill:${col}"/><circle r="${m>1?8:5.5}" style="fill:${col};stroke:var(--panel);stroke-width:2"/>${m>1?`<text class="cnt" y="3.5">${m}</text>`:""}</g>`)});
const land=LAND.map(poly=>`<polygon class="land" points="${poly.map(q=>xy(q[0],q[1]).join(",")).join(" ")}"/>`).join("");
const cy=[...cities.entries()].map(([k,[p,name]])=>{const L=LEFT.includes(k);return `<circle cx="${p[0]}" cy="${p[1]}" r="3" style="fill:var(--panel);stroke:var(--mute);stroke-width:1.5"/><text class="cy" x="${p[0]+(L?-8:8)}" y="${p[1]+14}" text-anchor="${L?"end":"start"}">${esc(cap(name))}</text>`}).join("");
$("#map").innerHTML=`<svg viewBox="-10 -10 940 360" role="img" aria-label="Peta posisi alat ukur di Indonesia"><defs><pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="1.7" style="fill:var(--mute);fill-opacity:.4"/></pattern></defs>${land}${arcs.join("")}${cy}${mk.join("")}</svg>${miss?`<p class="mn">${miss} alat berada di kota yang belum ada di peta.</p>`:""}`}
