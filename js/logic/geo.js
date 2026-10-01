import {CITY} from "../config/cities.js";
export const xy=(o,a)=>[(o-95)*20,(6-a)*20];
export const ll=c=>{const p=CITY[String(c||"").toLowerCase().trim()];return p&&xy(p[0],p[1])};
