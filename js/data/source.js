import {CONFIG} from "../config/app.js";

// Kontrak data: sumber mana pun harus mengembalikan array catatan seperti di sample.json:
// { d:"2026-09-28", email, name, id, loc, role:"s"|"r", sn, cond:"good"|"broken", rem, ship, trk }

async function getJson(url){
  let r;
  try{r=await fetch(url,{headers:{Accept:"application/json"}})}
  catch(e){throw new Error("Tidak bisa terhubung ke sumber data. Cek koneksi internet.")}
  if(!r.ok){
    let msg="";try{msg=(await r.json()).error||""}catch(e){}
    throw new Error(`Gagal memuat data (${r.status})${msg?": "+msg:""}`);
  }
  return r.json();
}

export async function loadSample(){
  try{return await getJson(new URL("./sample.json",import.meta.url))}
  catch(e){throw new Error("Data contoh gagal dimuat. Jalankan lewat server lokal (npx serve .), jangan buka index.html dengan klik dua kali.")}
}

export const loadFromApi=()=>getJson(CONFIG.apiUrl);

export async function loadData(){
  if(CONFIG.source==="api")return {rows:await loadFromApi(),label:"spreadsheet"};
  return {rows:await loadSample(),label:"data contoh"};
}
