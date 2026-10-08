import test from "node:test";import assert from "node:assert/strict";
import {install,wait,count} from "./helpers/fake-dom.mjs";
// 5 alat dikirim dari Jakarta: 2 ke Surabaya, 1 ke Medan, 1 tanpa tujuan, 1 ke kota yang belum ada di peta; satu alat lain sudah sampai di Bandung.
const mk=(sn,dest,over={})=>({d:"2026-10-02",name:"Muhammad Januar Siswanto Putro",id:2500904,loc:"Jakarta",role:"s",sn,cond:"good",rem:"",ship:"JNE",trk:"CGK"+sn.slice(-3),dest,eq:["Ultrasonic Gel"],...over});
const rows=[mk("OH3365869","Surabaya"),mk("OH3368068","Surabaya"),mk("OH3365868","Medan"),mk("OH3365849",""),mk("LE:2961864","Atlantis"),
  mk("OH3368075","",{loc:"Bandung",role:"r",name:"Hazle",id:120004,ship:"",trk:"",eq:[]})];
const d=install({search:"?demo=1",fetch:async()=>({ok:true,status:200,json:async()=>rows})});
await import("../js/main.js");await wait(150);
const {getTip}=await import("../js/ui/map.js");
const html=()=>d.el("#map").innerHTML;

test("alat yang dikirim dari kota yang sama jadi SATU penanda berangka (+1 penanda untuk alat yang dipegang PIC)",()=>{
  assert.equal(count(html(),/class="mk"/g),2);
  assert.match(html(),/class="cnt" y="3.5">5</);
});
test("busur: satu per tujuan berbeda; alat bertujuan sama berbagi busur",()=>{
  // Surabaya, Medan, (tanpa tujuan), Atlantis
  assert.equal(count(html(),/class="arc"/g),4);
  assert.match(html(),/class="arc" data-sns="OH3365869 OH3368068"/);
});
test("kartu info penanda: judul, jumlah, dan semua 5 alat di area scroll dengan tujuannya masing-masing",()=>{
  const tip=[0,1].map(getTip).find(t=>/In transit from/.test(t));
  assert.match(tip,/In transit from Jakarta/);assert.match(tip,/5 Ultrasonic Thickness Gauges/);
  assert.match(tip,/class="tipscroll"/);assert.equal(count(tip,/<li>/g),5);
  ["OH3365869","OH3368068","OH3365868","OH3365849","LE:2961864"].forEach(sn=>assert.ok(tip.includes(`<strong>${sn}</strong>`),sn));
  assert.equal(count(tip,/&rarr; Surabaya/g),2);assert.match(tip,/&rarr; Medan/);assert.match(tip,/&rarr; Atlantis/);
  assert.equal(count(tip,/destination not set/g),1);
  assert.match(tip,/class="tipx"/);
});
test("kartu info alat yang dipegang PIC tetap memuat nama PIC dan alatnya",()=>{
  const tip=[0,1].map(getTip).find(t=>/Holding since/.test(t));
  assert.match(tip,/Hazle/);assert.match(tip,/<strong>OH3368075<\/strong>/);assert.match(tip,/class="tipscroll"/);
});

// ---- tooltip mengikuti filter dan fokus ("Show on map") ----
const {pick}=await import("../js/ui/filters.js");
const transit=()=>[0,1].map(getTip).find(t=>/In transit from/.test(t));
const lis=t=>count(t,/<li>/g);
test("tanpa filter: kartu info titik memuat semua 5 alat",()=>{assert.equal(lis(transit()),5)});
test("filter Tool: kartu info hanya memuat alat itu (bukan 5), dengan kalimat tunggal",()=>{
  d.el("#snsel").onchange({target:{value:"OH3365868"}});
  const t=transit();
  assert.equal(lis(t),1);assert.ok(t.includes("<strong>OH3365868</strong>"));assert.ok(!t.includes("OH3365869"));
  assert.match(t,/1 Ultrasonic Thickness Gauge</);assert.match(t,/Waiting for the recipient to confirm/);assert.match(t,/&rarr; Medan/);
  d.el("#freset").onclick();
  assert.equal(lis(transit()),5,"setelah Reset kembali 5");
});
test("Show on map (fokus) pada 1 alat: kartu info hanya memuat alat itu; klik lagi mengembalikan semua",()=>{
  pick("LE:2961864");
  const t=transit();assert.equal(lis(t),1);assert.ok(t.includes("<strong>LE:2961864</strong>"));assert.match(t,/&rarr; Atlantis/);
  pick("LE:2961864");
  assert.equal(lis(transit()),5);
});
test("fokus pada alat di kota lain: titik yang diredupkan tetap menampilkan isi lengkap sebagai konteks",()=>{
  pick("OH3368075"); // alat yang sudah sampai di Bandung
  assert.equal(lis(transit()),5,"titik Jakarta redup, isinya tetap lengkap");
  const held=[0,1].map(getTip).find(t=>/Holding since/.test(t));assert.equal(lis(held),1);
  pick("OH3368075");
});
test("filter City yang tidak cocok dengan titik: titik redup, isi lengkap",()=>{
  d.el("#citysel").onchange({target:{value:"bandung"}});
  assert.equal(lis(transit()),5);d.el("#freset").onclick();
});
