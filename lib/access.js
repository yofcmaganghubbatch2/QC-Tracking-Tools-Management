import {createHash,timingSafeEqual} from "node:crypto";

// Cek kode akses dari header "x-access-code". Tanpa ACCESS_CODE di server, semua permintaan ditolak.
export function checkAccess(req){
  const expected=process.env.ACCESS_CODE;
  if(!expected)return {ok:false,status:503,error:"The access code is not configured on the server."};
  const given=String((req.headers&&req.headers["x-access-code"])||"");
  const h=s=>createHash("sha256").update(s).digest();
  return timingSafeEqual(h(given),h(expected))?{ok:true}:{ok:false,status:401,error:"Access code required."};
}
