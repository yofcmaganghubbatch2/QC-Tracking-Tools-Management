import {cityKey} from "./geo.js";
// Kelompokkan catatan per nomor seri, urut tanggal.
export function group(data){const m={};[...data].sort((a,b)=>a.d.localeCompare(b.d)).forEach(r=>(m[r.sn]=m[r.sn]||[]).push(r));return Object.entries(m)}

// Kunci kota dan PIC untuk filter. Kota dicocokkan lewat daftar kota (misal "Kota Bandung" = "bandung").
export const locKey=loc=>cityKey(loc)||String(loc||"").toLowerCase().trim();
export const picKey=r=>String(r.id||r.name||"").toLowerCase();
// Nomor seri yang lolos filter peta: alat terpilih dan/atau alat yang posisinya sekarang di kota terpilih.
export function allowedSerials(g,{sel,city}){
  return new Set(g.filter(([sn,l])=>(!sel||sn===sel)&&(!city||locKey(l[l.length-1].loc)===city)).map(([sn])=>sn));
}
