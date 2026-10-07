import {$} from "../dom.js";
import {esc,cap,fmt} from "../logic/format.js";
import {cityKey,ll,xy} from "../logic/geo.js";
import {LAND} from "../config/land.js";
import {CITY,LEFT} from "../config/cities.js";
import {ITEM} from "../config/schema.js";

let TIPS=[];
export const getTip=i=>TIPS[i];

const FULL=[-10,-10,940,360];   // seluruh Indonesia
const CENTER=[470,150];          // alat yang sedang dikirim "menunjuk" ke arah sini kalau tujuannya kosong atau kotanya belum ada di peta
const ARC_LEN=95;
const PX=1.15;                  // di HP: piksel layar per satuan peta (tulisan peta jadi terbaca; peta digeser dengan jari)
let ZOOM=PX;                    // tombol + / - mengubah ini (0.8 sampai 2.4)
const isNarrow=()=>matchMedia("(max-width:700px)").matches;

// Tombol zoom di HP. redraw = fungsi yang menggambar ulang peta.
export function initMapZoom(redraw){
  $("#mapzoom").onclick=e=>{
    const b=e.target.closest("button[data-z]");if(!b)return;
    ZOOM=Math.min(2.4,Math.max(.8,Math.round((ZOOM+Number(b.dataset.z)*.35)*100)/100));redraw();
  };
}

const CLOSE='<button class="tipx" type="button" aria-label="Close">&times;</button>';
const equip=c=>c.eq&&c.eq.length?`<small>+ ${c.eq.map(esc).join(", ")}</small>`:"";
const broken=c=>c.cond=="broken"?` <span class="bad">broken: ${esc(c.rem||"no remark")}</span>`:"";

// Kartu info sebuah penanda. Daftar alat ada di area yang bisa di-scroll (penting kalau alatnya banyak).
// Penanda alat yang dikirim = semua alat yang dikirim dari kota yang sama (beda tujuan tetap satu penanda).
function tipHtml(gr){
  const c=gr.c,m=gr.items.length,count=`${m} ${ITEM}${m>1?"s":""}`;
  if(c.role=="s"){
    const items=gr.items.map(({sn,c:r})=>`<li><strong>${esc(sn)}</strong> ${r.dest?`<span class="to">&rarr; ${esc(cap(r.dest))}</span>`:`<span class="nodest">destination not set</span>`}${broken(r)}<small>${esc(cap(r.name))}, sent ${fmt(r.d)}</small>${r.ship||r.trk?`<small>${[r.ship?esc(r.ship):"",r.trk?"tracking "+esc(r.trk):""].filter(Boolean).join(", ")}</small>`:""}${equip(r)}</li>`).join("");
    return `<div class="tiphead"><b>In transit from ${esc(cap(c.loc))}</b><small>${count}</small></div><p class="go">Waiting for the recipient${m>1?"s":""} to confirm.</p><div class="tipscroll"><ul>${items}</ul></div>${CLOSE}`;
  }
  const items=gr.items.map(i=>`<li><strong>${esc(i.sn)}</strong>${broken(i.c)}${equip(i.c)}</li>`).join("");
  return `<div class="tiphead"><b>${esc(cap(c.name))}</b><small>ID ${esc(c.id)}, ${esc(cap(c.loc))}</small><small>${count}</small></div><p>Holding since ${fmt(c.d)}</p><div class="tipscroll"><ul>${items}</ul></div>${CLOSE}`;
}

function arcEnd(p){
  const dx=CENTER[0]-p[0],dy=CENTER[1]-p[1],L=Math.hypot(dx,dy)||1;
  return {e:[p[0]+dx/L*ARC_LEN,p[1]+dy/L*ARC_LEN],nx:-dy/L,ny:dx/L};
}

// Rute hanya untuk alat yang masih dalam pengiriman.
// Tujuan dikenali: busur dari kota pengirim ke kota tujuan (cincin putus-putus di kota tujuan).
// Tujuan kosong atau kotanya belum ada di peta: busur pendek ke arah tengah peta dengan keterangan di ujungnya.
function arcHtml(sn,p,ai,to){
  const known=!!to.q,e=known?to.q:arcEnd(p).e,dx=e[0]-p[0],dy=e[1]-p[1],L=Math.hypot(dx,dy)||1;
  let nx=-dy/L,ny=dx/L;if(known&&ny>0){nx=-nx;ny=-ny} // busur melengkung ke atas (utara)
  const off=known?Math.min(60,L*.22)+ai*5:28,mx=(p[0]+e[0])/2+nx*off,my=(p[1]+e[1])/2+ny*off,b=(2.6+ai*.45).toFixed(2);
  const lab=known?"":`<text class="cy" x="${e[0]}" y="${e[1]+20}" text-anchor="middle">${esc(to.label)}</text>`;
  return `<path id="a${ai}" class="arc" data-sns="${sn}" pathLength="1" style="--i:${ai}" d="M${p} Q${mx} ${my} ${e}"/>`
   +`<g data-sns="${sn}"><circle class="trav" r="3.6" style="fill:var(--amber);opacity:0"><set attributeName="opacity" to="1" begin="${b}s"/><animateMotion dur="2.8s" begin="${b}s" repeatCount="indefinite"><mpath href="#a${ai}"/></animateMotion></circle></g>`
   +`<g data-sns="${sn}"><g class="endn" style="--i:${ai}"><circle cx="${e[0]}" cy="${e[1]}" r="${known?8:6}" style="fill:${known?"none":"var(--panel)"};stroke:var(--amber);stroke-width:2;stroke-dasharray:3 3"/>${lab}</g></g>`;
}

// Tujuan sebuah catatan pengirim: titik di peta kalau kotanya dikenal, kalau tidak keterangan teks.
function destOf(c,p){
  if(!c.dest)return {q:null,label:"destination not set"};
  const k=cityKey(c.dest);
  if(!k)return {q:null,label:"to "+cap(c.dest),unknown:c.dest};
  const q=xy(CITY[k][0],CITY[k][1]);
  return Math.hypot(q[0]-p[0],q[1]-p[1])>14?{q,k,label:cap(k)}:{q:null,label:"to "+cap(k)}; // kota tujuan = kota pengirim
}

function markerHtml(gr,p,t){
  const c=gr.c,m=gr.items.length,sns=gr.items.map(i=>esc(i.sn)).join(" ");
  const bad=gr.items.some(i=>i.c.cond=="broken");
  const col=bad?"var(--red)":c.role=="s"?"var(--amber)":"var(--teal)";
  return `<g class="mk" tabindex="0" data-t="${t}" data-sns="${sns}" transform="translate(${p[0]} ${p[1]})"><circle r="15" style="fill:transparent"/><g class="mkin" style="--n:${t}"><circle class="ring" r="7" style="fill:${col}"/><circle r="${m>1?8:5.5}" style="fill:${col};stroke:var(--panel);stroke-width:2"/>${m>1?`<text class="cnt" y="3.5">${m}</text>`:""}</g></g>`;
}

// Di layar sempit, peta di-zoom ke area yang ada alatnya supaya tulisan tetap terbaca.
function viewBox(pts){
  if(!pts.length||!isNarrow())return FULL;
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
    // Alat dikirim: satu penanda per kota pengirim (diberi angka). Alat sudah sampai: satu penanda per PIC per kota.
    const k=c.role=="s"?"t|"+cityKey(c.loc):"h|"+c.id+"|"+cityKey(c.loc);
    (groups[k]=groups[k]||{c,p,items:[]}).items.push({sn,c});
  });

  Object.values(groups).forEach(gr=>{
    const key=cityKey(gr.c.loc),n=seen[key]=(seen[key]||0)+1;
    const p=[gr.p[0],gr.p[1]+(n-1)*16]; // dua penanda di kota yang sama (misal alat dikirim dan alat dipegang PIC): geser sedikit
    pts.push(p);
    if(gr.c.role=="s"){
      // Satu busur per tujuan yang berbeda (alat dengan tujuan sama berbagi satu busur; tujuan kosong berbagi satu busur pendek).
      const byDest=new Map();
      gr.items.forEach(({sn,c})=>{
        const to=destOf(c,p),key=to.k?"k|"+to.k:"x|"+to.label.toLowerCase(),e=byDest.get(key)||{to,sns:[]};
        e.sns.push(sn);byDest.set(key,e);
      });
      byDest.forEach(({to,sns})=>{
        if(to.k)cities.set(to.k,to.q);              // kota tujuan ikut digambar dan diberi nama
        if(to.unknown)missing.add(to.unknown);       // tujuan yang belum ada di js/config/cities.js
        arcs.push(arcHtml(sns.map(esc).join(" "),p,arcs.length,to));pts.push(to.q||arcEnd(p).e);
      });
    }
    TIPS.push(tipHtml(gr));
    mk.push(markerHtml(gr,p,TIPS.length-1));
  });

  const vb=viewBox(pts),nar=isNarrow(),box=$("#map"),cw=Number(box.clientWidth)||360,ch=Number(box.clientHeight)||320;
  // Di HP: peta dibuat lebih lebar dari layar dan bisa digeser (scroll) supaya tulisan dan penanda tidak mengecil.
  const W=nar?Math.max(cw-12,Math.round(vb[2]*ZOOM)):0;
  const land=LAND.map(poly=>`<polygon class="land" points="${poly.map(q=>xy(q[0],q[1]).join(",")).join(" ")}"/>`).join("");
  const labels=[...cities.entries()].map(([k,p])=>{const L=LEFT.includes(k);
    return `<circle cx="${p[0]}" cy="${p[1]}" r="3" style="fill:var(--panel);stroke:var(--mute);stroke-width:1.5"/><text class="cy" x="${p[0]+(L?-8:8)}" y="${p[1]+14}" text-anchor="${L?"end":"start"}">${esc(cap(k))}</text>`}).join("");
  const note=missing.size?`<p class="mn">${missing.size} ${missing.size>1?"cities are":"city is"} not on the map yet: ${[...missing].map(x=>esc(cap(x))).join(", ")}. Add ${missing.size>1?"them":"it"} in js/config/cities.js.</p>`:"";

  $("#map").innerHTML=`<svg viewBox="${vb.join(" ")}" class="${nar?"narrow":""}"${nar?` style="width:${W}px;max-width:none"`:""} role="group" aria-label="Map of measurement tool positions in Indonesia"><defs><pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" style="fill:var(--teal);fill-opacity:.07"/><circle cx="4.5" cy="4.5" r="1.7" style="fill:var(--mute);fill-opacity:.4"/></pattern></defs>`
   +`<line class="eq" x1="-10" x2="930" y1="120" y2="120"/><text class="eqt" x="922" y="114" text-anchor="end">equator</text>`
   +`${land}${arcs.join("")}${labels}${mk.join("")}${g.length?"":'<text class="nr" x="470" y="175" text-anchor="middle">No record</text>'}</svg>${note}`;
  if(nar){ // mulai dari tengah area yang ada alatnya
    const mean=i=>pts.length?pts.reduce((t,p)=>t+p[i],0)/pts.length:null;
    const cx=mean(0)??vb[0]+vb[2]/2,cy=mean(1)??vb[1]+vb[3]/2,H=W*vb[3]/vb[2];
    box.scrollLeft=Math.max(0,(cx-vb[0])/vb[2]*W-cw/2);box.scrollTop=Math.max(0,(cy-vb[1])/vb[3]*H-ch/2);
  }
}
