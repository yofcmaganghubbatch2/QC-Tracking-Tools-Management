import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";import vm from "node:vm";
import {parseRows} from "../js/data/parser.js";
import {valuesToRecords} from "../lib/records.js";

// Header persis seperti file QC_Measurement_Tools.xlsx terbaru (17 kolom, kolom Q = Destination).
const HEAD=["Timestamp","Email Address","Full Name","Employee ID","Location","As Sender or Recipient","Ultrasonic Thickness Gauge Serial Number","Ultrasonic Thickness Gauge Condition","Remarks if Broken (Blank if in Good Condition)","Ultrasonic Thickness Gauge Photo","Supporting Equipment Included? ","Supporting Equipment","Supporting Equipment Photo","Tools Departure or Arrival Date","Shipping Service Company (Blank if as Recipient)","Tracking Number (Blank if as Recipient)","Destination (Blank if as Recipient)"];
const d=s=>new Date(s+"T00:00:00Z");
const row=(sn,dest,over={})=>{const r=[d("2026-10-07"),"x@x.com","Muhammad Januar Siswanto Putro",2500904,"Jakarta","Sender",sn,"Good","","https://drive.google.com/open?id=a","Yes","Ultrasonic Gel, Measuring Tape, Tailor Tape","https://drive.google.com/open?id=b",d("2026-10-02"),"JNE","CGKEC77833429826",dest];Object.entries(over).forEach(([i,v])=>r[i]=v);return r};
const blank=()=>new Array(17).fill("");

// Menjalankan apps-script/Code.gs (TIDAK diubah) dengan layanan Google tiruan.
function appsScript(tab){
  const ctx={PropertiesService:{getScriptProperties:()=>({getProperty:()=>"k"})},
    SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:()=>({getDataRange:()=>({getValues:()=>tab})}),getSpreadsheetTimeZone:()=>"Asia/Jakarta"})},
    Utilities:{formatDate:(v)=>v.toISOString().slice(0,10)},
    ContentService:{MimeType:{JSON:"json"},createTextOutput:s=>({s,setMimeType(){return this}})}};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL("../apps-script/Code.gs",import.meta.url),"utf8"),ctx);
  return JSON.parse(ctx.doGet({parameter:{key:"k"}}).s);
}

test("Apps Script yang sekarang tetap meneruskan kolom Destination (hanya email dan foto yang dibuang)",()=>{
  const out=appsScript([HEAD,row("OH3365869","Surabaya")]);
  assert.ok(out.values[0].includes("Destination (Blank if as Recipient)"));
  assert.ok(!out.values[0].some(h=>/email|photo/i.test(h)));
  assert.equal(out.values[1][out.values[0].length-1],"Surabaya");
});
test("data nyata saat ini (5 pengirim dari Jakarta, Destination masih kosong, 100 baris kosong): 5 catatan, dest kosong, tidak error",()=>{
  const tab=[HEAD,blank(),blank(),...["OH3365869","OH3368068","OH3365868","OH3365849","LE:2961864"].map(sn=>row(sn,"")),...Array.from({length:100},blank)];
  const {rows,skipped}=valuesToRecords(appsScript(tab).values);
  assert.equal(rows.length,5);assert.equal(skipped,0);
  assert.ok(rows.every(r=>r.role==="s"&&r.loc==="Jakarta"&&r.dest===""));
});
test("Destination terisi dibaca, dirapikan, dan hanya berlaku untuk pengirim",()=>{
  const {rows}=valuesToRecords(appsScript([HEAD,row("OH3365869","  Surabaya "),row("OH3368068","Medan",{5:"Recipient"}),row("OH3365868","")]).values);
  assert.equal(rows[0].dest,"Surabaya");
  assert.equal(rows[1].dest,"","penerima tidak punya tujuan walau sel terisi");
  assert.equal(rows[2].dest,"");
});
test("urutan kolom bebas: Destination dikenali dari namanya",()=>{
  const r=parseRows([{"Destination (Blank if as Recipient)":"Bandung","Full Name":"A","Location":"Medan","As Sender or Recipient":"Sender","Ultrasonic Thickness Gauge Serial Number":"X1","Tools Departure or Arrival Date":"2026-10-02"}]);
  assert.equal(r[0].dest,"Bandung");
});
test("sheet lama tanpa kolom Destination tetap jalan (dest kosong)",()=>{
  const old=HEAD.slice(0,16);const {rows}=valuesToRecords([old,row("OH3365869","").slice(0,16)]);
  assert.equal(rows.length,1);assert.equal(rows[0].dest,"");
});
