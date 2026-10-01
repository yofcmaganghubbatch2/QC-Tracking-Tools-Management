// Definisi format spreadsheet: HTML yang menentukan kolom apa yang dibaca.
// Header dicocokkan dari awal teks (huruf kecil), jadi urutan kolom bebas.
export const ITEM="Ultrasonic Thickness Gauge";
export const COLUMNS={
  date:["sent or receipt","timestamp"],
  email:["email"],
  name:["full name"],
  id:["employee"],
  loc:["location"],
  role:["as sender"],
  sn:["ultrasonic thickness gauge serial"],
  cond:["ultrasonic thickness gauge condition"],
  rem:["remarks"],
  ship:["shipping"],
  trk:["tracking"]
};
// Kolom yang wajib ada. Kalau hilang, file ditolak dengan pesan jelas.
export const REQUIRED=["date","name","loc","role","sn"];
