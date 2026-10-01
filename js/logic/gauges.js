// Kelompokkan catatan per nomor seri, urut tanggal.
export function group(data){const m={};[...data].sort((a,b)=>a.d.localeCompare(b.d)).forEach(r=>(m[r.sn]=m[r.sn]||[]).push(r));return Object.entries(m)}
