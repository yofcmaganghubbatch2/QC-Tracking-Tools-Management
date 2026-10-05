import test from "node:test";import assert from "node:assert/strict";
import {parseEquipment,canonEquip,diffEquip,handoverChecks,countMismatches} from "../js/logic/equipment.js";
import {g,sample} from "./helpers/expect.mjs";

test("parseEquipment: urut sesuai master, nama dirapikan, duplikat dibuang",()=>{
  assert.deepEqual(parseEquipment("Caliper, Ultrasonic Gel, Cutter","Yes"),["Ultrasonic Gel","Cutter","Caliper"]);
  assert.deepEqual(parseEquipment(" caliper ,  CUTTER, caliper"),["Cutter","Caliper"]);
  assert.deepEqual(parseEquipment("Tape"),["Tape"]);
});
test("parseEquipment: jawaban No atau kosong = tidak ada alat pendukung",()=>{
  assert.deepEqual(parseEquipment("Caliper","No"),[]);assert.deepEqual(parseEquipment("","Yes"),[]);assert.deepEqual(parseEquipment(undefined,undefined),[]);
});
test("parseEquipment: nama di luar master tetap disimpan di urutan akhir",()=>{
  assert.deepEqual(parseEquipment("Ruler, Caliper"),["Caliper","Ruler"]);assert.equal(canonEquip("measuring  tape"),"Measuring Tape");
});
test("handoverChecks: bandingkan yang dikirim dengan yang dicentang penerima",()=>{
  const S=eq=>({role:"s",eq}),R=eq=>({role:"r",eq});
  const c=handoverChecks([S(["Caliper","Cutter"]),R(["Caliper"]),S([]),R(["Tape"]),S(["Tape"]),R(["Tape"])]);
  assert.equal(c[0],null);
  assert.deepEqual(c[1],{missing:["Cutter"],extra:[],ok:false});
  assert.deepEqual(c[3],{missing:[],extra:["Tape"],ok:false});
  assert.deepEqual(c[5],{missing:[],extra:[],ok:true});
});
test("handoverChecks: tanpa pasangan pengirim tidak dinilai",()=>{
  assert.deepEqual(handoverChecks([{role:"r",eq:["Tape"]},{role:"s",eq:[]},{role:"s",eq:[]}]),[null,null,null]);
  assert.equal(diffEquip(["a","b"],["b"]).length,1);
});
test("countMismatches pada data demo sama dengan hitungan manual",()=>{
  let n=0;
  for(const [,l] of g)for(let i=1;i<l.length;i++)if(l[i-1].role==="s"&&l[i].role==="r"&&[...l[i-1].eq].sort().join()!==[...l[i].eq].sort().join())n++;
  assert.equal(countMismatches(g),n);assert.ok(n>0);
  assert.ok(sample.every(r=>Array.isArray(r.eq)));
});
