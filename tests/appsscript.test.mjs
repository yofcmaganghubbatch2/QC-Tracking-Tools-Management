import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";import vm from "node:vm";

// Menjalankan apps-script/Code.gs dengan layanan Google tiruan.
function run({props={API_KEY:"kunci"},tabs,tz="Asia/Jakarta"}){
  const out=[];
  const ctx={
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]??null})},
    SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:n=>tabs[n]?{getDataRange:()=>({getValues:()=>tabs[n]})}:null,getSpreadsheetTimeZone:()=>tz})},
    Utilities:{formatDate:(d,z,f)=>{out.push([z,f]);return d.toISOString().slice(0,10)}},
    ContentService:{MimeType:{JSON:"json"},createTextOutput:s=>({s,setMimeType(m){this.m=m;return this}})},
  };
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL("../apps-script/Code.gs",import.meta.url),"utf8"),ctx);
  return {call:e=>{const o=ctx.doGet(e);return JSON.parse(o.s)},fmt:out};
}
const d=s=>new Date(s+"T00:00:00Z");
const TAB=[["Timestamp","Email Address","Full Name","Location","Ultrasonic Thickness Gauge Photo","Supporting Equipment Included?","Supporting Equipment","Supporting Equipment Photo","Tools Departure or Arrival Date"],[d("2026-09-28"),"a@x.com","Abu","Bandung","https://drive/xx","Yes","Caliper, Cutter","https://drive/yy",d("2026-09-28")],[d("2026-09-30"),"b@x.com","Lahab","Sidoarjo","","No","","",d("2026-09-30")]];

test("kunci salah atau kosong: Unauthorized",()=>{
  const s=run({tabs:{"Form Responses 1":TAB}});
  assert.deepEqual(s.call({parameter:{key:"salah"}}),{error:"Unauthorized."});assert.deepEqual(s.call({parameter:{}}),{error:"Unauthorized."});assert.deepEqual(s.call(undefined),{error:"Unauthorized."});
});
test("API_KEY belum diisi: ditolak walau kunci kosong",()=>{
  const s=run({props:{},tabs:{"Form Responses 1":TAB}});assert.match(s.call({parameter:{key:""}}).error,/API_KEY is not set/);
});
test("kunci benar: email dan kedua foto dibuang, tanggal jadi teks yyyy-MM-dd",()=>{
  const s=run({tabs:{"Form Responses 1":TAB}});const r=s.call({parameter:{key:"kunci"}});
  assert.deepEqual(r.values[0],["Timestamp","Full Name","Location","Supporting Equipment Included?","Supporting Equipment","Tools Departure or Arrival Date"]);
  assert.deepEqual(r.values[1],["2026-09-28","Abu","Bandung","Yes","Caliper, Cutter","2026-09-28"]);
  assert.ok(!JSON.stringify(r).includes("@x.com")&&!JSON.stringify(r).includes("drive"));
  assert.deepEqual(s.fmt[0],["Asia/Jakarta","yyyy-MM-dd"]);
});
test("tab tidak ada: pesan jelas",()=>{const s=run({tabs:{}});assert.match(s.call({parameter:{key:"kunci"}}).error,/not found/)});
test("sheet kosong: values kosong",()=>{const s=run({tabs:{"Form Responses 1":[]}});assert.deepEqual(s.call({parameter:{key:"kunci"}}),{values:[]})});
