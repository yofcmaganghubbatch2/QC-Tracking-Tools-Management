import {checkAccess} from "./access.js";
import {valuesToRecords} from "./records.js";

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// fetchSheetValues disuntikkan dari luar supaya logika ini bisa dites tanpa Google.
export function createHandler({fetchSheetValues}){
  return async function handler(req,res){
    res.setHeader("Cache-Control","no-store");
    if(req.method!=="GET")return res.status(405).json({error:"Method not allowed."});

    const access=checkAccess(req);
    if(!access.ok){
      if(access.status===401)await sleep(400); // memperlambat tebak-tebakan kode
      return res.status(access.status).json({error:access.error});
    }

    const url=process.env.APPS_SCRIPT_URL,key=process.env.APPS_SCRIPT_KEY;
    if(!url||!key)return res.status(503).json({error:"The spreadsheet connection is not configured on the server."});

    try{
      const values=await fetchSheetValues({url,key});
      return res.status(200).json(valuesToRecords(values));
    }catch(err){
      if(err&&err.code==="SCHEMA")return res.status(422).json({error:err.message});
      console.error("[api/tools]",err&&err.message); // detail hanya di log server
      return res.status(502).json({error:"Could not read the spreadsheet. Check the Apps Script deployment (Execute as: Me, access: Anyone) and that APPS_SCRIPT_KEY matches API_KEY in the script."});
    }
  };
}
