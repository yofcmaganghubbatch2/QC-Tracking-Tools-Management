import {missingColumns,parseRows} from "../js/data/parser.js";
import {COLUMNS} from "../js/config/schema.js";

// Baris mentah dari Google Sheets (baris pertama = header) -> catatan sesuai js/data/sample.json.
// Kolom email sengaja dibuang di sini: browser tidak perlu menerimanya.
export function valuesToRecords(values){
  const [head=[],...body]=values||[];
  if(!head.length)return {rows:[],skipped:0};
  const miss=missingColumns([],head);
  if(miss.length){
    const e=new Error("Required columns not found in the sheet header: "+miss.map(f=>COLUMNS[f][0]).join(", ")+".");
    e.code="SCHEMA";throw e;
  }
  const objs=body.filter(r=>r.some(c=>c!==""&&c!=null)).map(r=>{
    const o={};head.forEach((h,i)=>{if(r[i]!==undefined&&r[i]!=="")o[String(h)]=r[i]});return o;
  });
  const parsed=parseRows(objs);
  return {rows:parsed.map(({email,...rest})=>rest),skipped:objs.length-parsed.length};
}
