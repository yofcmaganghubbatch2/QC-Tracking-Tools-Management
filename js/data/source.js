import {CONFIG} from "../config/app.js";

// Kontrak data: sumber mana pun mengembalikan {rows, skipped}. rows = array catatan seperti sample.json:
// { d:"2026-09-28", name, id, loc, role:"s"|"r", sn, cond:"good"|"broken", rem, ship, trk }

export class AuthError extends Error{}

const KEY="qc_access_code";
export const getCode=()=>{try{return sessionStorage.getItem(KEY)||""}catch(e){return ""}};
export const setCode=v=>{try{sessionStorage.setItem(KEY,v)}catch(e){}};
export const clearCode=()=>{try{sessionStorage.removeItem(KEY)}catch(e){}};

async function request(url,headers={}){
  let r;
  try{r=await fetch(url,{headers:{Accept:"application/json",...headers},cache:"no-store"})}
  catch(e){throw new Error("Cannot reach the data source. Check your internet connection.")}
  if(r.status===401)throw new AuthError("Access code required.");
  if(!r.ok){
    let msg="";try{msg=(await r.json()).error||""}catch(e){}
    throw new Error(`Failed to load data (${r.status})${msg?": "+msg:""}`);
  }
  return r.json();
}

export async function loadSample(){
  try{return {rows:await request(new URL("./sample.json",import.meta.url)),skipped:0}}
  catch(e){throw new Error("Demo data could not be loaded. Run the site through a local server (npx serve .), do not open index.html by double-clicking.")}
}

export async function loadFromApi(){
  const j=await request(CONFIG.apiUrl,{"x-access-code":getCode()});
  if(!j||!Array.isArray(j.rows))throw new Error("Unexpected data format from the server.");
  return {rows:j.rows,skipped:j.skipped||0};
}

export async function loadData(){
  const demo=CONFIG.source==="sample"||new URLSearchParams(location.search).has("demo");
  return demo?{...await loadSample(),label:"demo data"}:{...await loadFromApi(),label:"the spreadsheet"};
}
