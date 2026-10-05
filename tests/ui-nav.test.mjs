import test from "node:test";import assert from "node:assert/strict";
import {install,wait,count} from "./helpers/fake-dom.mjs";
import {sample,g,lastOf,fmtDate} from "./helpers/expect.mjs";
import {picKey,locKey} from "../js/logic/gauges.js";
import {countMismatches} from "../js/logic/equipment.js";
const d=install({search:"?demo=1",fetch:async()=>({ok:true,status:200,json:async()=>sample})});
await import("../js/main.js");await wait(150);

const click=(sel,go)=>d.el(sel).onclick({target:{closest:()=>({dataset:{go:String(go)},disabled:false})}});
const serials=()=>[...d.el("#cards").innerHTML.matchAll(/class="serial">([^<]+)</g)].map(m=>m[1]);
const rows=()=>count(d.el("#log").innerHTML,/<div class="row">/g);

test("kartu: Next/Prev pindah halaman dengan animasi geser",()=>{
  assert.equal(serials().length,4);
  click("#cards-pager",1);
  assert.match(d.el("#cards-pager").innerHTML,/Page 2 of 2/);assert.equal(d.el("#cards").className,"cards slide-next");assert.equal(serials().length,2);
  assert.match(d.el("#cards-pager").innerHTML,/data-go="1"[^>]*disabled/,"Next mati di halaman terakhir");
  click("#cards-pager",1);assert.match(d.el("#cards-pager").innerHTML,/Page 2 of 2/);
  click("#cards-pager",-1);assert.equal(d.el("#cards").className,"cards slide-prev");assert.match(d.el("#cards-pager").innerHTML,/Page 1 of 2/);
});
test("tanda tidak cocok alat pendukung muncul di kartu (semua halaman)",()=>{
  assert.ok(countMismatches(g)>0);
  let html=d.el("#cards").innerHTML;click("#cards-pager",1);html+=d.el("#cards").innerHTML;click("#cards-pager",-1);
  assert.match(html,/class="eqwarn">(Not received|Extra)/);
});
test("kartu: filter PIC kembali ke halaman 1 dan hanya menampilkan alat PIC itu",()=>{
  const c=lastOf(g[0]),key=picKey(c),expected=g.filter(x=>picKey(lastOf(x))===key).map(x=>x[0]);
  assert.match(d.el("#picsel").innerHTML,new RegExp(`value="${key}">`));
  d.el("#picsel").onchange({target:{value:key}});
  assert.deepEqual(serials(),expected);
  d.el("#picsel").onchange({target:{value:""}});assert.equal(serials().length,4);
});
test("dropdown kota berisi kota posisi alat sekarang beserta jumlahnya",()=>{
  const k=locKey(lastOf(g[0]).loc),n=g.filter(x=>locKey(lastOf(x).loc)===k).length;
  assert.match(d.el("#citysel").innerHTML,new RegExp(`value="${k}">[^<]+\\(${n}\\)`));assert.match(d.el("#citysel").innerHTML,/All cities/);
});
test("log: halaman terakhir berisi catatan terlama",()=>{
  const pages=Math.ceil(sample.length/10);for(let i=1;i<pages;i++)click("#log-pager",1);
  assert.equal(rows(),sample.length-(pages-1)*10);assert.match(d.el("#log").innerHTML,new RegExp(fmtDate(sample[0].d)));assert.match(d.el("#log-pager").innerHTML,new RegExp(`Page ${pages} of ${pages}`));
});
test("log: pencarian kembali ke halaman 1 dan bisa mencari nama alat pendukung",()=>{
  const n=sample.filter(r=>r.name.toLowerCase().includes("siti")).length;
  d.el("#q").oninput({target:{value:"siti"}});assert.equal(rows(),Math.min(n,10));assert.match(d.el("#log-pager").innerHTML,new RegExp(`${n} record`));
  const m=sample.filter(r=>r.eq.includes("Cutter")).length;
  d.el("#q").oninput({target:{value:"cutter"}});assert.match(d.el("#log-pager").innerHTML,new RegExp(`${m} record`));
  d.el("#q").oninput({target:{value:"tidak-ada"}});assert.match(d.el("#log").innerHTML,/No matching records/);
  d.el("#q").oninput({target:{value:""}});
});
test("log: filter alat pendukung (satu alat, dan tanpa alat pendukung)",()=>{
  assert.match(d.el("#eqsel").innerHTML,/All equipment/);assert.match(d.el("#eqsel").innerHTML,/value="__none">No supporting equipment/);assert.match(d.el("#eqsel").innerHTML,/value="Caliper">Caliper/);
  d.el("#eqsel").onchange({target:{value:"Caliper"}});
  const c=sample.filter(r=>r.eq.includes("Caliper")).length;assert.match(d.el("#log-pager").innerHTML+d.el("#log").innerHTML,new RegExp(`${c} record|<div class="row">`));
  assert.equal(rows(),Math.min(c,10));
  d.el("#eqsel").onchange({target:{value:"__none"}});
  const n=sample.filter(r=>!r.eq.length).length;assert.equal(rows(),Math.min(n,10));
  d.el("#eqsel").onchange({target:{value:""}});assert.equal(rows(),10);
});
test("log: detail diberi kelas (ok disembunyikan di HP, bad merah)",()=>{
  const b=sample.find(r=>r.cond==="broken");
  d.el("#q").oninput({target:{value:`${b.name} ${b.loc} ${b.sn}`.toLowerCase()}});
  assert.match(d.el("#log").innerHTML,new RegExp(`class="d bad">Broken: ${b.rem}`));
  d.el("#q").oninput({target:{value:""}});
  assert.match(d.el("#log").innerHTML,/class="d ok">Good condition/);
});
test("peta: viewBox ada dan penanda tetap tergambar",()=>{assert.match(d.el("#map").innerHTML,/viewBox="[-\d. ]+"/)});
