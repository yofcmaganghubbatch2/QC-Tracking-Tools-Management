import test from "node:test";import assert from "node:assert/strict";
import {toIso} from "../js/data/parser.js";

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
