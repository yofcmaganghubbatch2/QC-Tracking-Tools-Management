import {$} from "../dom.js";
import {esc,cap,fmt} from "../logic/format.js";
import {cityKey,ll,xy} from "../logic/geo.js";
import {LAND} from "../config/land.js";
import {CITY,LEFT} from "../config/cities.js";
import {ITEM} from "../config/schema.js";

let TIPS=[];
export const getTip=i=>TIPS[i];

const FULL=[-10,-10,940,360];   // seluruh Indonesia
const CENTER=[470,150];          // alat yang sedang dikirim "menunjuk" ke arah sini (tujuan belum diketahui)
const ARC_LEN=95;

function tipHtml(gr){
  const c=gr.c,ship=c.role=="s";
  const status=ship
    ?`<p class="go">Sent ${fmt(c.d)}${c.ship?" via "+esc(c.ship):""}${c.trk?", tracking "+esc(c.trk):""}. Waiting for the recipient to confirm.</p>`
    :`<p>Holding since ${fmt(c.d)}</p>`;
  const items=gr.items.map(i=>`<li>${ITEM}<br><strong>${esc(i.sn)}</strong>${i.c.eq&&i.c.eq.length?`<br><small>+ ${i.c.eq.map(esc).join(", ")}</small>`:""}${i.c.cond=="broken"?` <span class="bad">broken: ${esc(i.c.rem||"no remark")}</span>`:""}</li>`).join("");
  return `<b>${esc(cap(c.name))}</b><small>ID ${esc(c.id)}, ${esc(cap(c.loc))}</small>${status}<ul>${items}</ul>`;
}

function arcEnd(p){
  const dx=CENTER[0]-p[0],dy=CENTER[1]-p[1],L=Math.hypot(dx,dy)||1;
  return {e:[p[0]+dx/L*ARC_LEN,p[1]+dy/L*ARC_LEN],nx:-dy/L,ny:dx/L};
}

// Rute hanya untuk alat yang masih dalam pengiriman: garis dari kota pengirim, berujung "awaiting recipient".
function arcHtml(sn,p,ai){
  const {e,nx,ny}=arcEnd(p),mx=(p[0]+e[0])/2+nx*28,my=(p[1]+e[1])/2+ny*28,b=(2.6+ai*.45).toFixed(2);
  return `<path id="a${ai}" class="arc" data-sns="${sn}" pathLength="1" style="--i:${ai}" d="M${p} Q${mx} ${my} ${e}"/>`
   +`<g data-sns="${sn}"><circle class="trav" r="3.6" style="fill:var(--amber);opacity:0"><set attributeName="opacity" to="1" begin="${b}s"/><animateMotion dur="2.8s" begin="${b}s" repeatCount="indefinite"><mpath href="#a${ai}"/></animateMotion></circle></g>`
   +`<g data-sns="${sn}"><g class="endn" style="--i:${ai}"><circle cx="${e[0]}" cy="${e[1]}" r="6" style="fill:var(--panel);stroke:var(--amber);stroke-width:2;stroke-dasharray:3 3"/><text class="cy" x="${e[0]}" y="${e[1]+20}" text-anchor="middle">awaiting recipient</text></g></g>`;
}

function markerHtml(gr,p,t){
  const c=gr.c,m=gr.items.length,sns=gr.items.map(i=>esc(i.sn)).join(" ");
  const bad=gr.items.some(i=>i.c.cond=="broken");
  const col=bad?"var(--red)":c.role=="s"?"var(--amber)":"var(--teal)";
  return `<g class="mk" tabindex="0" data-t="${t}" data-sns="${sns}" transform="translate(${p[0]} ${p[1]})"><circle r="15" style="fill:transparent"/><circle class="ring" r="7" style="fill:${col}"/><circle r="${m>1?8:5.5}" style="fill:${col};stroke:var(--panel);stroke-width:2"/>${m>1?`<text class="cnt" y="3.5">${m}</text>`:""}</g>`;
}

// Di layar sempit, peta di-zoom ke area yang ada alatnya supaya tulisan tetap terbaca.
function viewBox(pts){
  if(!pts.length||!matchMedia("(max-width:700px)").matches)return FULL;
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  let x0=Math.min(...xs)-70,x1=Math.max(...xs)+90,y0=Math.min(...ys)-60,y1=Math.max(...ys)+60;
  if(x1-x0<420){const c=(x0+x1)/2;x0=c-210;x1=c+210}
  if(y1-y0<300){const c=(y0+y1)/2;y0=c-150;y1=c+150}
  x0=Math.max(x0,-10);y0=Math.max(y0,-10);x1=Math.min(x1,930);y1=Math.min(y1,350);
  return [x0,y0,x1-x0,y1-y0];
}

export function renderMap(g){
  const groups={},cities=new Map(),seen={},arcs=[],mk=[],missing=new Set(),pts=[];
  TIPS=[];

  g.forEach(([sn,l])=>{
    l.forEach(r=>{const k=cityKey(r.loc);if(k)cities.set(k,xy(CITY[k][0],CITY[k][1]))});
    const c=l[l.length-1],p=ll(c.loc);
    if(!p){missing.add(c.loc||"(kosong)");return}
    // Alat dikirim: satu penanda per alat. Alat sudah sampai: satu penanda per PIC per kota.
    const k=c.role=="s"?"t|"+sn:"h|"+c.id+"|"+cityKey(c.loc);
    (groups[k]=groups[k]||{c,p,items:[]}).items.push({sn,c});
  });

  Object.values(groups).forEach(gr=>{
    const key=cityKey(gr.c.loc),n=seen[key]=(seen[key]||0)+1;
    const p=[gr.p[0],gr.p[1]+(n-1)*16]; // dua PIC di kota yang sama: geser sedikit
    pts.push(p);
    if(gr.c.role=="s"){arcs.push(arcHtml(esc(gr.items[0].sn),p,arcs.length));pts.push(arcEnd(p).e)}
    TIPS.push(tipHtml(gr));
    mk.push(markerHtml(gr,p,TIPS.length-1));
  });

  const vb=viewBox(pts);
  const land=LAND.map(poly=>`<polygon class="land" points="${poly.map(q=>xy(q[0],q[1]).join(",")).join(" ")}"/>`).join("");
  const labels=[...cities.entries()].map(([k,p])=>{const L=LEFT.includes(k);
    return `<circle cx="${p[0]}" cy="${p[1]}" r="3" style="fill:var(--panel);stroke:var(--mute);stroke-width:1.5"/><text class="cy" x="${p[0]+(L?-8:8)}" y="${p[1]+14}" text-anchor="${L?"end":"start"}">${esc(cap(k))}</text>`}).join("");
  const note=missing.size?`<p class="mn">${missing.size} ${missing.size>1?"cities are":"city is"} not on the map yet: ${[...missing].map(x=>esc(cap(x))).join(", ")}. Add ${missing.size>1?"them":"it"} in js/config/cities.js.</p>`:"";

  $("#map").innerHTML=`<svg viewBox="${vb.join(" ")}" class="${vb[2]<700?"narrow":""}" role="group" aria-label="Map of measurement tool positions in Indonesia"><defs><pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" style="fill:var(--teal);fill-opacity:.07"/><circle cx="4.5" cy="4.5" r="1.7" style="fill:var(--mute);fill-opacity:.4"/></pattern></defs>`
   +`<line class="eq" x1="-10" x2="930" y1="120" y2="120"/><text class="eqt" x="922" y="114" text-anchor="end">equator</text>`
   +`${land}${arcs.join("")}${labels}${mk.join("")}${g.length?"":'<text class="nr" x="470" y="175" text-anchor="middle">No record</text>'}</svg>${note}`;
}
