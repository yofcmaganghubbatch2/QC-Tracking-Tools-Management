// HARI KE-2: fungsi ini nanti membaca Google Sheet dan mengembalikan JSON.
//
// Kontrak respons: array catatan, bentuknya sama seperti js/data/sample.json
//   { d:"2026-09-28", name, id, loc, role:"s"|"r", sn, cond:"good"|"broken", rem, ship, trk }
// Kolom email sebaiknya TIDAK dikirim ke browser kalau tidak dipakai tampilan.
//
// Langkah:
//  1. Cek akses dulu (ACCESS_CODE atau login) sebelum membaca data apa pun.
//  2. Baca sheet pakai service account (nama variabel ada di .env.example).
//  3. Ubah baris sheet jadi catatan: missingColumns() dan parseRows() di js/data/parser.js.
//  4. Di js/config/app.js ganti source jadi "api".
export default function handler(req,res){
  res.status(501).json({error:"API belum dibuat (pekerjaan hari ke-2)."});
}
