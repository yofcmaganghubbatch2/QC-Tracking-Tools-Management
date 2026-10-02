// Ambil isi sheet lewat web app Google Apps Script (lihat apps-script/Code.gs).
// Dipanggil dari server, jadi URL dan kuncinya tidak pernah sampai ke browser.
const ALLOWED=/^https:\/\/script\.google\.com\/(?:a\/macros\/[\w.-]+\/|macros\/)s\/[\w-]+\/exec$/;

export async function fetchSheetValues({url,key}){
  if(!ALLOWED.test(url||""))throw new Error("APPS_SCRIPT_URL must look like https://script.google.com/macros/s/<id>/exec");
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),20000);
  try{
    const res=await fetch(`${url}?key=${encodeURIComponent(key)}`,{redirect:"follow",signal:ctrl.signal,headers:{Accept:"application/json"}});
    const text=await res.text();
    let data;
    try{data=JSON.parse(text)}catch(e){throw new Error("Apps Script did not return JSON. Check that the deployment access is set to Anyone.")}
    if(data&&data.error)throw new Error("Apps Script: "+data.error);
    return (data&&data.values)||[];
  }finally{clearTimeout(timer)}
}
