import fs from "node:fs";
import {group} from "../../js/logic/gauges.js";
import {cityKey} from "../../js/logic/geo.js";
export const sample=JSON.parse(fs.readFileSync(new URL("../../js/data/sample.json",import.meta.url),"utf8"));
export const g=group(sample);
export const lastOf=([,l])=>l[l.length-1];
// jumlah penanda di peta: satu per kota pengirim untuk semua alat yang sedang dikirim, satu per PIC per kota untuk alat yang sudah sampai
export const markerCount=new Set(g.map(x=>{const c=lastOf(x);return c.role==="s"?"t|"+cityKey(c.loc):"h|"+c.id+"|"+c.loc.toLowerCase()})).size;
// jumlah busur: satu per pasangan (kota pengirim, tujuan) yang berbeda
export const arcCount=new Set(g.filter(x=>lastOf(x).role==="s").map(x=>{const c=lastOf(x);return cityKey(c.loc)+">"+(cityKey(c.dest)||"?"+String(c.dest).toLowerCase())})).size;
export const fmtDate=d=>new Date(d+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
