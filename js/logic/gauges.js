import {GAUGES} from "../config/master.js";
import {cityKey} from "./geo.js";
// Kelompokkan catatan per nomor seri, urut tanggal.
export function group(data){const m={};[...data].sort((a,b)=>a.d.localeCompare(b.d)).forEach(r=>(m[r.sn]=m[r.sn]||[]).push(r));const idx=sn=>{const i=GAUGES.indexOf(sn);return i<0?GAUGES.length:i};
  return Object.entries(m).sort((a,b)=>idx(a[0])-idx(b[0]))}

// Kunci kota dan PIC untuk filter. Kota dicocokkan lewat daftar kota (misal "Kota Bandung" = "bandung").
export const locKey=loc=>cityKey(loc)||String(loc||"").toLowerCase().trim();
export const picKey=r=>String(r.id||r.name||"").toLowerCase();
// Nomor seri yang lolos filter gabungan: alat terpilih, kota posisi sekarang, dan PIC terakhir (semuanya digabung).
export function allowedSerials(g,{sel,city,pic}){
  return new Set(g.filter(([sn,l])=>{const c=l[l.length-1];return (!sel||sn===sel)&&(!city||locKey(c.loc)===city)&&(!pic||picKey(c)===pic)}).map(([sn])=>sn));
}
