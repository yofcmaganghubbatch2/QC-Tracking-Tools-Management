import test from "node:test";import assert from "node:assert/strict";
import {install,wait,count} from "./helpers/fake-dom.mjs";
// Data nyata saat ini: pengirim dari Jakarta yang Destination-nya belum terisi.
const rows=["OH3365869","OH3368068","OH3365868"].map((sn,i)=>({d:"2026-10-0"+(2+i),name:"Muhammad Januar Siswanto Putro",id:2500904,loc:"Jakarta",role:"s",sn,cond:"good",rem:"",ship:"JNE",trk:"CGKEC778334298"+i,dest:"",eq:["Ultrasonic Gel"]}));
// satu lagi dengan tujuan yang kotanya belum ada di js/config/cities.js
rows.push({...rows[0],sn:"LE:2961864",dest:"Atlantis"});
const d=install({search:"?demo=1",fetch:async()=>({ok:true,status:200,json:async()=>rows})});
await import("../js/main.js");await wait(150);

test("tujuan kosong: peta memberi keterangan 'destination not set', tidak error",()=>{
  const html=d.el("#map").innerHTML;
  assert.equal(count(html,/destination not set/g),3);
  assert.equal(count(html,/class="endn"/g),4);
});
test("tujuan yang kotanya belum dikenal: ditampilkan sebagai teks dan dilaporkan di catatan peta",()=>{
  const html=d.el("#map").innerHTML;
  assert.match(html,/to Atlantis/);assert.match(html,/not on the map yet: Atlantis/);
});
test("kartu dan log: tujuan kosong ditulis jelas",()=>{
  assert.match(d.el("#cards").innerHTML,/Sent from Jakarta, destination not set via JNE/);
  assert.match(d.el("#log").innerHTML,/<small class="dest none">&rarr; not set<\/small>/);
});
