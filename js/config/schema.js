// Definisi format spreadsheet: HTML yang menentukan kolom apa yang dibaca.
// Header dicocokkan tanpa peduli huruf besar/kecil dan spasi berlebih. Pola biasa = cocok dari awal teks.
// Pola berawalan "=" = harus sama persis (dipakai karena "Supporting Equipment" awalnya sama dengan kolom lain).
export const ITEM="Ultrasonic Thickness Gauge";
export const COLUMNS={
  date:["tools departure or arrival date","sent or receipt","timestamp"],
  email:["email"],
  name:["full name"],
  id:["employee"],
  loc:["location"],
  role:["as sender"],
  sn:["ultrasonic thickness gauge serial"],
  cond:["ultrasonic thickness gauge condition"],
  rem:["remarks"],
  ship:["shipping"],
  trk:["tracking"],
  eqInc:["supporting equipment included"],
  eq:["=supporting equipment"]
};
// Kolom yang wajib ada. Kalau hilang, file ditolak dengan pesan jelas.
export const REQUIRED=["date","name","loc","role","sn"];
