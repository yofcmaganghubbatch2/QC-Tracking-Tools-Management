import test from "node:test";import assert from "node:assert/strict";
import {install,wait,count} from "./helpers/fake-dom.mjs";
import {sample,g,lastOf} from "./helpers/expect.mjs";
import {locKey} from "../js/logic/gauges.js";
import {state} from "../js/state.js";
const d=install({search:"?demo=1",fetch:async()=>({ok:true,status:200,json:async()=>sample})});
await import("../js/main.js");await wait(150);

const serials=()=>[...d.el("#cards").innerHTML.matchAll(/class="serial">([^<]+)</g)].map(m=>m[1]);
const rows=()=>count(d.el("#log").innerHTML,/<div class="row">/g);
const pick=(sel,v)=>d.el(sel).onchange({target:{value:v}});
const reset=()=>d.el("#freset").onclick();

test("filter Tool: kartu, log, dan ringkasan ikut berubah (bukan cuma peta)",()=>{
  const [sn]=g[0],n=sample.filter(r=>r.sn===sn).length;
  pick("#snsel",sn);
  assert.deepEqual(serials(),[sn]);
  assert.equal(rows(),Math.min(n,10));
  assert.match(d.el("#log-pager").innerHTML,new RegExp(`${n} record`));
  assert.ok(!d.el("#log").innerHTML.split('<div class="row">').slice(1).some(r=>!r.includes(sn)),"log hanya berisi alat itu");
  assert.match(d.el("#fsum").textContent,/Showing 1 of 6 tools/);assert.equal(d.el("#freset").hidden,false);
  reset();
  assert.equal(serials().length,4);assert.equal(rows(),10);assert.match(d.el("#fsum").textContent,/^6 tools$/);assert.equal(d.el("#freset").hidden,true);
});
test("filter City dan PIC digabung (AND), hasil kosong diberi pesan",()=>{
  const k=locKey(lastOf(g[0]).loc),inCity=g.filter(x=>locKey(lastOf(x).loc)===k).map(x=>x[0]);
  pick("#citysel",k);assert.deepEqual(serials(),inCity.slice(0,4));
  const other=g.find(x=>locKey(lastOf(x).loc)!==k);
  pick("#snsel",other[0]);
  assert.match(d.el("#cards").innerHTML,/No tools match the filters/);assert.match(d.el("#log").innerHTML,/No matching records/);
  assert.match(d.el("#fsum").textContent,/Showing 0 of 6 tools/);
  reset();assert.equal(serials().length,4);
});
test("kartu ringkas: 3 riwayat terbaru tampil, riwayat lengkap ada di area scroll",()=>{
  const [sn,l]=g.find(([,l])=>l.length>3);
  pick("#snsel",sn);
  const html=d.el("#cards").innerHTML,recent=html.split('class="tl recent"')[1].split("</ol>")[0],full=html.split('class="tlscroll"')[1]||html.split('tlscroll')[1];
  assert.equal(count(recent,/<li /g),3,"hanya 3 terbaru");
  assert.equal(count(full.split("</ol>")[0],/<li /g),l.length,"riwayat lengkap");
  assert.match(html,new RegExp(`data-more data-n="${l.length}" aria-expanded="false">All ${l.length} records`));
  assert.ok(!/class="card [^"]*\bopen\b/.test(html),"awalnya tertutup");
  state.open.add(sn);pick("#snsel",sn); // kartu yang dibuka tetap terbuka setelah digambar ulang
  assert.match(d.el("#cards").innerHTML,/class="card [^"]*\bopen\b/);assert.match(d.el("#cards").innerHTML,/aria-expanded="true">Hide history/);
  state.open.clear();reset();
});
test("tombol Show on map menyorot alat, bukan menyaring",()=>{
  const [sn]=g[1];
  state.focus=sn;pick("#citysel","");
  assert.equal(serials().length,4,"kartu lain tetap tampil");assert.match(d.el("#cards").innerHTML,/Clear map focus/);
  state.focus=null;
});
test("peta di HP: lebih lebar dari layar supaya bisa digeser, ada kelas narrow",()=>{
  assert.match(d.el("#map").innerHTML,/<svg viewBox="[-\d. ]+" class="narrow" style="width:\d+px;max-width:none"/);
});
