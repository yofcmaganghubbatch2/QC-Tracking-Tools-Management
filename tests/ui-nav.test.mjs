import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";
import {install,wait,count} from "./helpers/fake-dom.mjs";
const sample=JSON.parse(fs.readFileSync(new URL("../js/data/sample.json",import.meta.url),"utf8"));
const d=install({search:"?demo=1",fetch:async()=>({ok:true,status:200,json:async()=>sample})});
await import("../js/main.js");await wait(150);

const click=(sel,go)=>d.el(sel).onclick({target:{closest:()=>({dataset:{go:String(go)},disabled:false})}});
const serials=()=>[...d.el("#cards").innerHTML.matchAll(/class="serial">(\d+)/g)].map(m=>m[1]);

test("kartu: Next/Prev pindah halaman dengan animasi geser",()=>{
  assert.equal(serials().length,4);
  click("#cards-pager",1);
  assert.match(d.el("#cards-pager").innerHTML,/Page 2 of 3/);assert.equal(d.el("#cards").className,"cards slide-next");assert.equal(serials().length,4);
  click("#cards-pager",1);
  assert.equal(serials().length,1);assert.match(d.el("#cards-pager").innerHTML,/Page 3 of 3/);
  assert.match(d.el("#cards-pager").innerHTML,/data-go="1"[^>]*disabled/,"Next mati di halaman terakhir");
  click("#cards-pager",1);assert.match(d.el("#cards-pager").innerHTML,/Page 3 of 3/);
  click("#cards-pager",-1);assert.equal(d.el("#cards").className,"cards slide-prev");assert.match(d.el("#cards-pager").innerHTML,/Page 2 of 3/);
});
test("kartu: filter PIC kembali ke halaman 1 dan hanya menampilkan alat PIC itu",()=>{
  assert.match(d.el("#picsel").innerHTML,/value="120004">Hazle \(1\)/);
  d.el("#picsel").onchange({target:{value:"120004"}});
  assert.deepEqual(serials(),["1234557"]);assert.match(d.el("#cards-pager").innerHTML,/1 tool\b/);assert.ok(!/data-go/.test(d.el("#cards-pager").innerHTML));
  d.el("#picsel").onchange({target:{value:""}});assert.equal(serials().length,4);
});
test("dropdown kota berisi kota posisi alat sekarang beserta jumlahnya",()=>{
  assert.match(d.el("#citysel").innerHTML,/value="denpasar">Denpasar \(2\)/);assert.match(d.el("#citysel").innerHTML,/All cities/);
});
test("log: halaman 2 berisi catatan terlama; pencarian kembali ke halaman 1",()=>{
  click("#log-pager",1);
  assert.equal(count(d.el("#log").innerHTML,/<div class="row">/g),10);assert.match(d.el("#log").innerHTML,/28 Sept 2026/);assert.match(d.el("#log-pager").innerHTML,/Page 2 of 2/);
  d.el("#q").oninput({target:{value:"siti"}});
  assert.equal(count(d.el("#log").innerHTML,/<div class="row">/g),3);assert.match(d.el("#log-pager").innerHTML,/3 records/);
  d.el("#q").oninput({target:{value:"tidak-ada"}});assert.match(d.el("#log").innerHTML,/No matching records/);
});
test("peta: kontrol ada di HTML dan penanda tetap tergambar",()=>{
  assert.equal(count(d.el("#map").innerHTML,/class="mk"/g),8);assert.match(d.el("#map").innerHTML,/viewBox="[-\d. ]+"/);
});
