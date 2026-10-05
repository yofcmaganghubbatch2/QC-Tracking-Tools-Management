import test from "node:test";import assert from "node:assert/strict";
import {install,wait,count} from "./helpers/fake-dom.mjs";
const d=install({fetch:async()=>({ok:true,status:200,json:async()=>({rows:[],skipped:0})})});
await import("../js/main.js");await wait(150);

test("data kosong: tampilan tetap ada dengan tulisan No record",()=>{
  assert.match(d.el("#cards").innerHTML,/No record/);
  assert.match(d.el("#map").innerHTML,/No record/);
  assert.ok(count(d.el("#map").innerHTML,/class="land"/g)>10,"peta tetap tergambar");
  assert.match(d.el("#log").innerHTML,/row head/);assert.match(d.el("#log").innerHTML,/No record/);
  assert.equal(count(d.el("#stats").innerHTML,/class="stat/g),5);
  assert.ok(d.el("#notice").hidden);
});
