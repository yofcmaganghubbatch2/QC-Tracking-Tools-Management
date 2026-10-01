import {CITY,ALIAS} from "../config/cities.js";

// Proyeksi sederhana: longitude/latitude -> koordinat SVG (20 piksel per derajat).
export const xy=(o,a)=>[(o-95)*20,(6-a)*20];

const KEYS=Object.keys(CITY).sort((a,b)=>b.length-a.length);
const cache=new Map();

// Cocokkan nama kota di spreadsheet ke kunci di CITY ("Kota Bandung" -> "bandung").
export function cityKey(name){
  const n=String(name||"").toLowerCase().replace(/[.,]/g," ").replace(/\s+/g," ").trim();
  if(!n)return null;
  if(cache.has(n))return cache.get(n);
  let k=ALIAS[n]||(CITY[n]?n:null);
  if(!k)k=KEYS.find(x=>new RegExp("(^|\\s)"+x+"(\\s|$)").test(n))||null;
  if(k&&ALIAS[k])k=ALIAS[k];
  cache.set(n,k);
  return k;
}

export const ll=name=>{const k=cityKey(name);return k?xy(CITY[k][0],CITY[k][1]):null};
