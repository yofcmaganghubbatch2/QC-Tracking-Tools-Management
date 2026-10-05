import test from "node:test";import assert from "node:assert/strict";
import {toIso,parseRows,missingColumns} from "../js/data/parser.js";

test("serial number, Date, dan ISO tetap benar",()=>{
  assert.equal(toIso(46293),"2026-09-28");assert.equal(toIso(46293.75),"2026-09-28");
  assert.equal(toIso("2026-10-05"),"2026-10-05");assert.equal(toIso("2026-10-05T17:00:00.000Z"),"2026-10-05");
});
test("teks dd/mm/yyyy dibaca day-first, bukan month-first",()=>{
  assert.equal(toIso("05/10/2026"),"2026-10-05");   // 5 Oktober, bukan 10 Mei
  assert.equal(toIso("28/09/2026"),"2026-09-28");
  assert.equal(toIso("5/9/2026"),"2026-09-05");
  assert.equal(toIso("05-10-2026"),"2026-10-05");assert.equal(toIso("05.10.2026"),"2026-10-05");
});
test("tanggal mustahil atau ambigu tidak ditebak (dilewati)",()=>{
  assert.equal(toIso("10/13/2026"),"");assert.equal(toIso("31/02/2026"),"");assert.equal(toIso("2026"),"");assert.equal(toIso(""),"");assert.equal(toIso("bukan tanggal"),"");
});
test("nama bulan tetap bisa dibaca",()=>{assert.equal(toIso("5 Oct 2026"),"2026-10-05")});

const NEW={"Timestamp":"2026-09-28","Email Address":"a@x.com","Full Name":"Abu","Employee ID":1,"Location":"Bandung","As Sender or Recipient":"Sender","Ultrasonic Thickness Gauge Serial Number":"LE:2961864","Ultrasonic Thickness Gauge Condition":"Good","Ultrasonic Thickness Gauge Photo":"link","Supporting Equipment Included?":"Yes","Supporting Equipment":"Caliper, Cutter","Supporting Equipment Photo":"link","Tools Departure or Arrival Date":"2026-09-30","Shipping Service Company (Blank if as Recipient)":"jne","Tracking Number (Blank if as Recipient)":123};
test("kolom Form baru terbaca: tanggal dari kolom Tools Departure or Arrival Date",()=>{
  const [r]=parseRows([NEW]);
  assert.equal(r.d,"2026-09-30");assert.equal(r.sn,"LE:2961864");assert.equal(r.role,"s");assert.equal(r.ship,"jne");assert.equal(r.trk,"123");
  assert.deepEqual(r.eq,["Cutter","Caliper"]);assert.deepEqual(missingColumns([NEW]),[]);
});
test("tiga kolom Supporting Equipment tidak tertukar (cocok persis)",()=>{
  const [r]=parseRows([{...NEW,"Supporting Equipment Included?":"No"}]);
  assert.deepEqual(r.eq,[],"jawaban No mengosongkan daftar, bukan membaca kolom Included atau Photo");
  const [r2]=parseRows([{...NEW,"Supporting Equipment":"Tape","Supporting Equipment Photo":"Caliper"}]);assert.deepEqual(r2.eq,["Tape"]);
});
test("spasi di ujung header dan huruf besar/kecil tidak masalah",()=>{
  const [r]=parseRows([{...NEW,"Supporting Equipment Included? ":"No","Supporting Equipment Included?":undefined}]);
  assert.deepEqual(r.eq,[]);
  assert.deepEqual(missingColumns([],["  FULL NAME ","location","As Sender or Recipient","ULTRASONIC THICKNESS GAUGE SERIAL NUMBER","tools departure or arrival date"]),[]);
});
test("header lama (Sent or Receipt Date) masih didukung",()=>{
  const {"Tools Departure or Arrival Date":_,...old}=NEW;const [r]=parseRows([{...old,"Sent or Receipt Date":"2026-08-01"}]);assert.equal(r.d,"2026-08-01");
});
