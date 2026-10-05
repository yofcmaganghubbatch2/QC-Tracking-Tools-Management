import {EQUIPMENT} from "../config/master.js";

const norm=s=>String(s).toLowerCase().replace(/\s+/g," ").trim();
const rank=n=>{const i=EQUIPMENT.indexOf(n);return i<0?EQUIPMENT.length:i};

// "caliper " -> "Caliper" (nama resmi dari daftar master). Nama yang tidak dikenal dibiarkan apa adanya.
export const canonEquip=name=>EQUIPMENT.find(e=>norm(e)===norm(name))||String(name).trim();

// Isi kolom checkbox Form ("Caliper, Cutter") -> ["Cutter","Caliper"] urut sesuai master. Jawaban "No" = tidak ada.
export function parseEquipment(cell,included){
  if(/^\s*no\b/i.test(String(included||"")))return [];
  const out=[...new Set(String(cell||"").split(/[,;\n]/).map(s=>s.trim()).filter(Boolean).map(canonEquip))];
  return out.sort((a,b)=>rank(a)-rank(b)||a.localeCompare(b));
}

export const diffEquip=(from,to)=>from.filter(x=>!to.includes(x));

// Untuk tiap catatan penerima yang didahului catatan pengirim: apa yang dikirim tapi tidak dicentang penerima (missing),
// dan apa yang dicentang penerima tapi tidak dikirim (extra). Hasilnya sejajar dengan array l.
export function handoverChecks(l){
  const out=new Array(l.length).fill(null);
  for(let i=1;i<l.length;i++){
    const s=l[i-1],r=l[i];
    if(s.role==="s"&&r.role==="r"){
      const sent=s.eq||[],got=r.eq||[],missing=diffEquip(sent,got),extra=diffEquip(got,sent);
      out[i]={missing,extra,ok:!missing.length&&!extra.length};
    }
  }
  return out;
}

export const countMismatches=g=>g.reduce((n,[,l])=>n+handoverChecks(l).filter(c=>c&&!c.ok).length,0);
