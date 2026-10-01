export const DAY=864e5;
export const D=s=>new Date(s+"T00:00:00");
export const fmt=d=>D(d).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});
export const iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
export const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
export const cap=s=>String(s||"").replace(/\b\w/g,c=>c.toUpperCase());
export const diff=(a,b)=>Math.max(0,Math.round((D(b)-D(a))/DAY));
