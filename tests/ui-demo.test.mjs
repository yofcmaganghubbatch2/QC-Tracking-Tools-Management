import test from "node:test";import assert from "node:assert/strict";
import {install,wait,count} from "./helpers/fake-dom.mjs";
import {sample,g,markerCount,arcCount} from "./helpers/expect.mjs";
const d=install({search:"?demo=1",fetch:async()=>({ok:true,status:200,json:async()=>sample})});
await import("../js/main.js");await wait(150);

test("mode demo: kartu, penanda, rute, log",()=>{
  assert.equal(g.length,6);
  assert.equal(count(d.el("#cards").innerHTML,/<article class="card/g),4,"halaman pertama: 2 kolom x 2 baris");
  assert.match(d.el("#cards-pager").innerHTML,/Page 1 of 2 · 6 tools/);
  assert.equal(count(d.el("#map").innerHTML,/class="mk"/g),markerCount);
  assert.equal(count(d.el("#map").innerHTML,/class="arc"/g),arcCount);
  assert.equal(count(d.el("#log").innerHTML,/<div class="row">/g),10,"10 baris per halaman");
  assert.match(d.el("#log-pager").innerHTML,new RegExp(`Page 1 of ${Math.ceil(sample.length/10)} · ${sample.length} records`));
  assert.ok(!/No record/.test(d.el("#cards").innerHTML+d.el("#map").innerHTML+d.el("#log").innerHTML));
});
test("statistik memuat 5 kotak termasuk Equipment mismatches",()=>{
  assert.equal(count(d.el("#stats").innerHTML,/class="stat/g),5);assert.match(d.el("#stats").innerHTML,/Equipment mismatches/);
});
test("teks berbahasa Inggris dan tanggal acuan = tanggal terakhir data",()=>{
  assert.match(d.el("#cards").innerHTML,/With PIC|In transit/);assert.match(d.el("#log").innerHTML,/Recipient/);assert.match(d.el("#foot").textContent,/demo data/);
  assert.equal(d.el("#ref").value,sample.map(r=>r.d).sort().pop());
  assert.equal(d.el("#ref").value<="2026-10-01",true,"data dummy berbatas 1 Oktober 2026");
});
test("alat pendukung tampil sebagai chip di log dan kartu",()=>{
  assert.match(d.el("#log").innerHTML,/class="eqchip"/);assert.match(d.el("#log").innerHTML,/class="c-eq none">–/);
  assert.match(d.el("#cards").innerHTML,/class="eqchip"/);
});
