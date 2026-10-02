import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";
import {install,wait,count} from "./helpers/fake-dom.mjs";
const sample=JSON.parse(fs.readFileSync(new URL("../js/data/sample.json",import.meta.url),"utf8"));
const d=install({search:"?demo=1",fetch:async()=>({ok:true,status:200,json:async()=>sample})});
await import("../js/main.js");await wait(150);

test("mode demo: kartu, penanda, rute, log",()=>{
  assert.equal(count(d.el("#cards").innerHTML,/<article class="card/g),4,"halaman pertama: 2 kolom x 2 baris");
  assert.match(d.el("#cards-pager").innerHTML,/Page 1 of 3 · 9 tools/);
  assert.equal(count(d.el("#map").innerHTML,/class="mk"/g),8);
  assert.equal(count(d.el("#map").innerHTML,/class="arc"/g),2);
  assert.equal(count(d.el("#log").innerHTML,/<div class="row">/g),10,"10 baris per halaman");
  assert.match(d.el("#log-pager").innerHTML,/Page 1 of 2 · 20 records/);
  assert.ok(!/No record/.test(d.el("#cards").innerHTML+d.el("#map").innerHTML+d.el("#log").innerHTML));
});
test("teks berbahasa Inggris dan tanggal acuan = tanggal terakhir data",()=>{
  assert.match(d.el("#cards").innerHTML,/With PIC/);assert.match(d.el("#cards").innerHTML,/In transit/);assert.match(d.el("#cards").innerHTML,/days with PIC|day with PIC/);
  assert.match(d.el("#log").innerHTML,/Recipient/);assert.match(d.el("#foot").textContent,/demo data/);
  assert.equal(d.el("#ref").value,"2026-12-05");
});
