import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";
import {createHandler} from "../lib/handler.js";

const sample=JSON.parse(fs.readFileSync(new URL("../js/data/sample.json",import.meta.url),"utf8"));
const HEAD=["Timestamp","Email Address","Full Name","Employee ID","Location","As Sender or Recipient","Ultrasonic Thickness Gauge Serial Number","Ultrasonic Thickness Gauge Condition","Remarks if Broken (Blank if in Good Condition)","Ultrasonic Thickness Gauge Photo","Supporting Equipment Included?","Supporting Equipment","Supporting Equipment Photo","Tools Departure or Arrival Date","Shipping Service Company (Blank if as Recipient)","Tracking Number (Blank if as Recipient)","Destination (Blank if as Recipient)"];
const DATE_COL=13;
const serial=d=>Math.round((Date.parse(d+"T00:00:00Z")-Date.parse("1899-12-30T00:00:00Z"))/864e5);
// seperti jawaban Sheets API dengan UNFORMATTED_VALUE: tanggal berupa serial number, checkbox berupa teks "A, B"
const rowFor=r=>[serial(r.d)+0.4,r.email,r.name,r.id,r.loc,r.role=="s"?"sender":"recipient",r.sn,r.cond,r.rem,"drive-link",r.eq.length?"Yes":"No",r.eq.join(", "),r.eq.length?"drive-link":"",serial(r.d),r.ship,r.trk?Number(r.trk):"",r.dest];
const VALUES=[HEAD,...sample.map(rowFor)];

const res=()=>({headers:{},statusCode:200,body:null,setHeader(k,v){this.headers[k]=v},status(c){this.statusCode=c;return this},json(b){this.body=b;return this}});
const call=async(fetchSheetValues,{method="GET",code}={})=>{const r=res();await createHandler({fetchSheetValues})({method,headers:code===undefined?{}:{"x-access-code":code}},r);return r};
const env=(o)=>{for(const k of ["ACCESS_CODE","APPS_SCRIPT_URL","APPS_SCRIPT_KEY"])delete process.env[k];Object.assign(process.env,o)};
const OK={ACCESS_CODE:"secret-123",APPS_SCRIPT_URL:"https://script.google.com/macros/s/abc/exec",APPS_SCRIPT_KEY:"k"};

test("method selain GET ditolak",async()=>{env(OK);assert.equal((await call(async()=>VALUES,{method:"POST",code:"secret-123"})).statusCode,405)});
test("tanpa ACCESS_CODE di server: gagal tertutup (503)",async()=>{env({...OK,ACCESS_CODE:""});assert.equal((await call(async()=>VALUES,{code:"x"})).statusCode,503)});
test("kode salah atau kosong: 401 dan sheet tidak dibaca",async()=>{
  env(OK);let called=0;const f=async()=>{called++;return VALUES};
  assert.equal((await call(f,{code:"salah"})).statusCode,401);assert.equal((await call(f)).statusCode,401);assert.equal(called,0);
});
test("kode benar: catatan sama dengan sample.json, tanpa email, Cache-Control no-store",async()=>{
  env(OK);const r=await call(async()=>VALUES,{code:"secret-123"});
  assert.equal(r.statusCode,200);assert.equal(r.headers["Cache-Control"],"no-store");
  assert.equal(r.body.skipped,0);
  assert.deepEqual(r.body.rows,sample.map(({email,...x})=>x));
  assert.ok(r.body.rows.every(x=>!("email" in x)));
});
// bentuk jawaban Code.gs: kolom email dan foto dibuang, tanggal sudah berupa teks yyyy-MM-dd
const keepIdx=HEAD.map((h,i)=>/^(email|ultrasonic thickness gauge photo|supporting equipment photo)/i.test(h)?-1:i).filter(i=>i>=0);
const scriptValues=[keepIdx.map(i=>HEAD[i]),...sample.map(r=>{const row=rowFor(r);row[0]=r.d;row[DATE_COL]=r.d;return keepIdx.map(i=>row[i])})];
test("bentuk data dari Apps Script (tanpa email/foto, tanggal teks): hasil sama dengan sample.json",async()=>{
  env(OK);const r=await call(async()=>scriptValues,{code:"secret-123"});
  assert.equal(r.statusCode,200);assert.equal(r.body.skipped,0);assert.deepEqual(r.body.rows,sample.map(({email,...x})=>x));
});
test("sheet baru berisi header saja: rows kosong, bukan error",async()=>{
  env(OK);const r=await call(async()=>[HEAD],{code:"secret-123"});assert.equal(r.statusCode,200);assert.deepEqual(r.body,{rows:[],skipped:0});
});
test("sheet benar-benar kosong: rows kosong",async()=>{env(OK);const r=await call(async()=>[],{code:"secret-123"});assert.deepEqual(r.body,{rows:[],skipped:0})});
test("baris dengan tanggal rusak atau tanpa serial dihitung skipped",async()=>{
  env(OK);const bad=[...rowFor(sample[0])];bad[DATE_COL]="bukan tanggal";bad[0]="";
  const noSn=[...rowFor(sample[1])];noSn[6]="";
  const r=await call(async()=>[HEAD,bad,noSn,rowFor(sample[2]),[]],{code:"secret-123"});
  assert.equal(r.body.rows.length,1);assert.equal(r.body.skipped,2);
});
test("header kolom wajib hilang: 422 dengan nama kolom",async()=>{
  env(OK);const h=HEAD.filter(x=>!x.startsWith("Location"));const r=await call(async()=>[h],{code:"secret-123"});
  assert.equal(r.statusCode,422);assert.match(r.body.error,/location/);
});
test("Google error: 502 dan pesan tidak membocorkan detail",async()=>{
  env(OK);const r=await call(async()=>{throw new Error("private_key=XYZ invalid_grant")},{code:"secret-123"});
  assert.equal(r.statusCode,502);assert.ok(!/XYZ|private_key/.test(JSON.stringify(r.body)));
});
test("env spreadsheet belum diisi: 503",async()=>{env({ACCESS_CODE:"secret-123"});assert.equal((await call(async()=>VALUES,{code:"secret-123"})).statusCode,503)});
