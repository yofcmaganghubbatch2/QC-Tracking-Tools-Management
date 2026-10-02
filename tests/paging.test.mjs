import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";
import {paginate} from "../js/logic/paging.js";
import {group,allowedSerials,locKey,picKey} from "../js/logic/gauges.js";

const sample=JSON.parse(fs.readFileSync(new URL("../js/data/sample.json",import.meta.url),"utf8"));
const g=group(sample);

test("paginate: potong halaman dan jaga batas",()=>{
  const l=[...Array(23).keys()];
  assert.deepEqual(paginate(l,0,10),{items:l.slice(0,10),page:0,pages:3,total:23,from:1,to:10});
  assert.equal(paginate(l,2,10).items.length,3);assert.equal(paginate(l,2,10).to,23);
  assert.equal(paginate(l,99,10).page,2);assert.equal(paginate(l,-5,10).page,0);
  assert.deepEqual(paginate([],3,10),{items:[],page:0,pages:1,total:0,from:0,to:0});
});
test("filter peta: kota = posisi alat sekarang",()=>{
  assert.deepEqual([...allowedSerials(g,{city:"medan"})],["1234555"]);
  assert.deepEqual([...allowedSerials(g,{city:"denpasar"})].sort(),["1234564","1234565"]);
  assert.equal(allowedSerials(g,{}).size,9);
});
test("filter peta: tool dan kota digabung (irisan)",()=>{
  assert.deepEqual([...allowedSerials(g,{sel:"1234564",city:"denpasar"})],["1234564"]);
  assert.equal(allowedSerials(g,{sel:"1234560",city:"medan"}).size,0);
});
test("kunci kota dan PIC",()=>{
  assert.equal(locKey("Kota Bandung"),"bandung");assert.equal(locKey("Kota Antah Berantah"),"kota antah berantah");
  assert.equal(picKey({id:120004,name:"Hazle"}),"120004");assert.equal(picKey({name:"Hazle"}),"hazle");
});
