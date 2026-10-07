import test from "node:test";import assert from "node:assert/strict";
import {install,wait,count} from "./helpers/fake-dom.mjs";
import {sample,g,lastOf,arcCount} from "./helpers/expect.mjs";
const d=install({search:"?demo=1",fetch:async()=>({ok:true,status:200,json:async()=>sample})});
await import("../js/main.js");await wait(150);

const sending=g.filter(x=>lastOf(x).role==="s");
test("data demo: setiap pengirim punya tujuan, penerima tidak",()=>{
  assert.ok(sample.filter(r=>r.role==="s").every(r=>r.dest));assert.ok(sample.filter(r=>r.role==="r").every(r=>r.dest===""));
});
test("peta: alat yang dikirim berujung di kota tujuan (bukan 'awaiting recipient'), kota tujuan diberi nama",()=>{
  const html=d.el("#map").innerHTML,dest=lastOf(sending[0]).dest;
  assert.equal(sending.length,arcCount);
  assert.equal(count(html,/class="endn"/g),arcCount);
  assert.ok(!/awaiting recipient|destination not set/.test(html));
  assert.match(html,new RegExp(`class="cy"[^>]*>${dest}<`));
});
test("kartu alat yang dikirim: 'Sent from X to Y via ...'; riwayat pengirim memuat tanda panah",()=>{
  const [sn,l]=sending[0],c=lastOf(sending[0]);
  d.el("#snsel").onchange({target:{value:sn}});
  const html=d.el("#cards").innerHTML;
  assert.match(html,new RegExp(`Sent from ${c.loc} to <span class="to">${c.dest}</span> via ${c.ship}`));
  assert.match(html,new RegExp(`sent, ${c.loc} &rarr; ${c.dest}`));
  d.el("#freset").onclick();
});
test("log: baris pengirim menampilkan '→ tujuan', baris penerima tidak",()=>{
  d.el("#snsel").onchange({target:{value:sending[0][0]}});
  const html=d.el("#log").innerHTML;
  assert.equal(count(html,/<small class="dest">&rarr; [^<]+<\/small>/g),count(html,/class="chip s"/g));
  assert.ok(count(html,/class="chip s"/g)>0);
  d.el("#freset").onclick();
});
