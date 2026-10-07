import {COLUMNS,REQUIRED} from "../config/schema.js";
import {iso,DAY} from "../logic/format.js";
import {parseEquipment} from "../logic/equipment.js";

// Nilai tanggal dari spreadsheet -> "YYYY-MM-DD". Mendukung serial number, objek Date, dan teks.
export function toIso(v){
  if(v instanceof Date)return iso(v);
  if(typeof v=="number")return iso(new Date(Math.round((v-25569)*DAY)+new Date().getTimezoneOffset()*6e4));
  const s=String(v||"").trim();
  if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,10);
  // Teks tanggal angka dibaca day-first: 05/10/2026 = 5 Oktober (format date picker Google Form kita). Tidak pernah ditebak month-first.
  const m=s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  if(m){
    const dd=+m[1],mm=+m[2],yy=+m[3],chk=new Date(Date.UTC(yy,mm-1,dd));
    return chk.getUTCFullYear()===yy&&chk.getUTCMonth()===mm-1&&chk.getUTCDate()===dd?`${yy}-${String(mm).padStart(2,"0")}-${String(dd).padStart(2,"0")}`:"";
  }
  if(!/[a-z]/i.test(s))return ""; // angka lain yang ambigu: lewati dan laporkan sebagai skipped
  const t=Date.parse(s);
  return Number.isNaN(t)?"":iso(new Date(t));
}

const norm=s=>String(s).toLowerCase().replace(/\s+/g," ").trim();
const hit=(k,p)=>p[0]==="="?norm(k)===p.slice(1):norm(k).startsWith(p);
// Nilai pertama yang tidak kosong dari kolom mana pun yang cocok (aman kalau ada dua header yang mirip).
const get=(o,f)=>{for(const p of COLUMNS[f])for(const k of Object.keys(o))if(hit(k,p)&&o[k]!==""&&o[k]!=null)return o[k]};

// Kolom wajib yang tidak ditemukan. Beri `headers` kalau tersedia (berguna saat sheet masih kosong).
export function missingColumns(rows,headers){
  const keys=headers||[...new Set(rows.flatMap(r=>Object.keys(r)))];
  return REQUIRED.filter(f=>!COLUMNS[f].some(p=>keys.some(k=>hit(k,p))));
}

export function parseRows(rows){
  return rows.map(o=>{const role=/^s/i.test(String(get(o,"role")||""))?"s":"r";return ({d:toIso(get(o,"date")),email:get(o,"email")||"",name:String(get(o,"name")||""),id:get(o,"id")||"",loc:String(get(o,"loc")||""),
    role,sn:String(get(o,"sn")||""),
    cond:/broken|rusak/i.test(String(get(o,"cond")||""))?"broken":"good",
    rem:String(get(o,"rem")||""),ship:String(get(o,"ship")||""),trk:String(get(o,"trk")||""),dest:role==="s"?String(get(o,"dest")||"").trim():"",eq:parseEquipment(get(o,"eq"),get(o,"eqInc"))})}).filter(r=>r.sn&&r.d);
}
