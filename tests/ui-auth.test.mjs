import test from "node:test";import assert from "node:assert/strict";
import {install,wait} from "./helpers/fake-dom.mjs";
let shown=0;
const d=install({props:{"#gate":{open:false,showModal(){shown++}}},fetch:async()=>({ok:false,status:401,json:async()=>({error:"Access code required."})})});
globalThis.sessionStorage.setItem("qc_access_code","salah");
await import("../js/main.js");await wait(150);

test("401: dialog kode akses muncul, kode lama dihapus, tampilan tetap ada",()=>{
  assert.equal(shown,1);
  assert.equal(d.el("#gate-err").hidden,false,"menampilkan pesan kode salah");
  assert.equal(d.session.has("qc_access_code"),false);
  assert.match(d.el("#notice").textContent,/Access code required/);
  assert.match(d.el("#cards").innerHTML,/No record/);
});
