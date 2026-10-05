import test from "node:test";import assert from "node:assert/strict";
import {install,wait,count} from "./helpers/fake-dom.mjs";
import {sample as all} from "./helpers/expect.mjs";
const sample=all.map(({email,...r})=>r);
let seen;
const d=install({fetch:async(url,opt)=>{seen={url:String(url),code:opt.headers["x-access-code"]};return {ok:true,status:200,json:async()=>({rows:sample,skipped:2})}}});
globalThis.sessionStorage.setItem("qc_access_code","kode-uji");
await import("../js/main.js");await wait(150);

test("mode API: kode akses dikirim lewat header dan data tampil",()=>{
  assert.equal(seen.url,"/api/tools");assert.equal(seen.code,"kode-uji");
  assert.equal(count(d.el("#cards").innerHTML,/<article class="card/g),4);assert.match(d.el("#cards-pager").innerHTML,/6 tools/);
  assert.match(d.el("#foot").textContent,new RegExp(`${sample.length} records from the spreadsheet`));
  assert.match(d.el("#ref").value,/^\d{4}-\d{2}-\d{2}$/);
});
test("baris yang dilewati diberi tahu",()=>{assert.match(d.el("#notice").textContent,/2 rows were skipped/)});
