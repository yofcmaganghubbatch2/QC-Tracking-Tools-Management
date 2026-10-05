import fs from "node:fs";
import {group} from "../../js/logic/gauges.js";
export const sample=JSON.parse(fs.readFileSync(new URL("../../js/data/sample.json",import.meta.url),"utf8"));
export const g=group(sample);
export const lastOf=([,l])=>l[l.length-1];
// jumlah penanda di peta: satu per alat yang sedang dikirim, satu per PIC per kota untuk alat yang sudah sampai
export const markerCount=new Set(g.map(x=>{const c=lastOf(x);return c.role==="s"?"t|"+x[0]:"h|"+c.id+"|"+c.loc.toLowerCase()})).size;
export const arcCount=g.filter(x=>lastOf(x).role==="s").length;
export const fmtDate=d=>new Date(d+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
