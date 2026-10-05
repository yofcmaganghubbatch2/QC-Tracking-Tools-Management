import test from "node:test";import assert from "node:assert/strict";
import {paginate} from "../js/logic/paging.js";
import {allowedSerials,locKey,picKey} from "../js/logic/gauges.js";
import {g,lastOf} from "./helpers/expect.mjs";

test("paginate: potong halaman dan jaga batas",()=>{
  const l=[...Array(23).keys()];
  assert.deepEqual(paginate(l,0,10),{items:l.slice(0,10),page:0,pages:3,total:23,from:1,to:10});
  assert.equal(paginate(l,2,10).items.length,3);assert.equal(paginate(l,2,10).to,23);
  assert.equal(paginate(l,99,10).page,2);assert.equal(paginate(l,-5,10).page,0);
  assert.deepEqual(paginate([],3,10),{items:[],page:0,pages:1,total:0,from:0,to:0});
});
test("filter peta: kota = posisi alat sekarang",()=>{
  const k=locKey(lastOf(g[0]).loc),exp=g.filter(x=>locKey(lastOf(x).loc)===k).map(x=>x[0]);
  assert.deepEqual([...allowedSerials(g,{city:k})].sort(),exp.sort());
  assert.equal(allowedSerials(g,{}).size,g.length);
  assert.equal(allowedSerials(g,{city:"kota-tidak-ada"}).size,0);
});
test("filter peta: tool dan kota digabung (irisan)",()=>{
  const [sn,l]=g[0],k=locKey(l[l.length-1].loc);
  assert.deepEqual([...allowedSerials(g,{sel:sn,city:k})],[sn]);
  const other=g.find(x=>locKey(lastOf(x).loc)!==k)[0];assert.equal(allowedSerials(g,{sel:other,city:k}).size,0);
});
test("kunci kota dan PIC",()=>{
  assert.equal(locKey("Kota Bandung"),"bandung");assert.equal(locKey("Kota Antah Berantah"),"kota antah berantah");
  assert.equal(picKey({id:120004,name:"Hazle"}),"120004");assert.equal(picKey({name:"Hazle"}),"hazle");
});
