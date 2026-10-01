import {COLUMNS,REQUIRED} from "../config/schema.js";
import {iso,DAY} from "../logic/format.js";

const toIso=v=>v instanceof Date?iso(v):typeof v=="number"?iso(new Date(Math.round((v-25569)*DAY)+ (new Date().getTimezoneOffset()*6e4))):String(v||"").slice(0,10);
const get=(o,f)=>{for(const p of COLUMNS[f]){const k=Object.keys(o).find(x=>x.toLowerCase().startsWith(p));if(k&&o[k]!==""&&o[k]!=null)return o[k]}};

export function missingColumns(rows){
  const keys=[...new Set(rows.flatMap(r=>Object.keys(r)))].map(k=>k.toLowerCase());
  return REQUIRED.filter(f=>!COLUMNS[f].some(p=>keys.some(k=>k.startsWith(p))));
}

export function parseRows(rows){
  return rows.map(o=>({d:toIso(get(o,"date")),email:get(o,"email")||"",name:String(get(o,"name")||""),id:get(o,"id")||"",loc:String(get(o,"loc")||""),
    role:/^s/i.test(String(get(o,"role")||""))?"s":"r",sn:String(get(o,"sn")||""),
    cond:/broken|rusak/i.test(String(get(o,"cond")||""))?"broken":"good",
    rem:String(get(o,"rem")||""),ship:String(get(o,"ship")||""),trk:String(get(o,"trk")||"")})).filter(r=>r.sn&&r.d);
}

// Baca file xlsx/csv di browser (memakai library XLSX dari CDN di index.html).
export async function readSpreadsheet(file){
  if(typeof XLSX==="undefined")throw new Error("Library pembaca xlsx belum termuat. Cek koneksi internet lalu muat ulang halaman.");
  const wb=XLSX.read(await file.arrayBuffer(),{cellDates:true});
  const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  if(!rows.length)throw new Error("Sheet pertama kosong.");
  const miss=missingColumns(rows);
  if(miss.length)throw new Error("Kolom wajib tidak ditemukan: "+miss.map(f=>COLUMNS[f][0]).join(", "));
  const data=parseRows(rows);
  if(!data.length)throw new Error("Tidak ada baris valid (cek nomor seri dan tanggal).");
  return data;
}
