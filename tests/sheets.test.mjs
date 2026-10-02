import test from "node:test";import assert from "node:assert/strict";
import {fetchSheetValues} from "../lib/sheets.js";

const URL_OK="https://script.google.com/macros/s/AKfycb-abc_123/exec";
const stub=(body,calls=[])=>{globalThis.fetch=async(u,o)=>{calls.push({u,o});return {text:async()=>typeof body==="string"?body:JSON.stringify(body)}};return calls};

test("memanggil URL dengan key ter-encode dan mengikuti redirect",async()=>{
  const calls=stub({values:[["a"],[1]]});
  const v=await fetchSheetValues({url:URL_OK,key:"k&y=1"});
  assert.deepEqual(v,[["a"],[1]]);
  assert.equal(calls[0].u,URL_OK+"?key=k%26y%3D1");assert.equal(calls[0].o.redirect,"follow");
});
test("URL web app Workspace juga diterima",async()=>{
  stub({values:[]});await fetchSheetValues({url:"https://script.google.com/a/macros/contoh.com/s/AKfy123/exec",key:"k"});
});
test("URL yang bukan Apps Script ditolak tanpa memanggil fetch",async()=>{
  const calls=stub({values:[]});
  for(const u of ["","http://script.google.com/macros/s/abc/exec","https://evil.example.com/macros/s/abc/exec","https://script.google.com.evil.com/macros/s/abc/exec"])
    await assert.rejects(()=>fetchSheetValues({url:u,key:"k"}),/APPS_SCRIPT_URL/);
  assert.equal(calls.length,0);
});
test("jawaban HTML (akses bukan Anyone) memberi pesan yang jelas",async()=>{
  stub("<html>Sign in</html>");await assert.rejects(()=>fetchSheetValues({url:URL_OK,key:"k"}),/did not return JSON/);
});
test("error dari script diteruskan tanpa membocorkan kunci",async()=>{
  stub({error:"Unauthorized."});
  await assert.rejects(()=>fetchSheetValues({url:URL_OK,key:"rahasia-banget"}),e=>/Unauthorized/.test(e.message)&&!/rahasia-banget/.test(e.message));
});
test("tanpa values: array kosong",async()=>{stub({});assert.deepEqual(await fetchSheetValues({url:URL_OK,key:"k"}),[])});
