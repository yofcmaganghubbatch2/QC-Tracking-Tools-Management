# Tracking QC Measurement Tools (v1.1)

Dashboard pelacak alat ukur QC: posisi alat sekarang, PIC, lama di PIC, peta rute, dan log serah terima.
Versi ini memakai data contoh (`js/data/sample.json`) atau file xlsx yang dimuat user lewat tombol "Muat spreadsheet".

## Cara menjalankan
Modul JS tidak jalan kalau `index.html` dibuka langsung (file://). Jalankan lewat server lokal:

    npx serve .

lalu buka alamat yang muncul di terminal. Untuk uji upload, pakai `samples/QC_Material_Measurement_Tools_sample.xlsx`.

## Struktur
- `index.html`: kerangka halaman saja
- `css/`: gaya, dipecah per bagian (tokens, base, hero, map, controls, cards, log, notice, responsive, motion)
- `js/main.js`: pintu masuk
- `js/config/`: pengaturan (`app.js`), format spreadsheet (`schema.js`), kota (`cities.js`), bentuk pulau (`land.js`)
- `js/data/`: sumber data (`source.js`), pembaca spreadsheet (`parser.js`), `sample.json`
- `js/logic/`: format tanggal dan teks, pengelompokan alat, proyeksi peta
- `js/ui/`: stats, cards, map, tooltip, filters, log, notice
- `api/tools.js`: placeholder fungsi Vercel untuk hari ke-2
- `samples/`: file xlsx contoh

## Kontrak data
Sumber data mana pun harus mengembalikan array catatan seperti `js/data/sample.json`:

    { "d":"2026-09-28", "email":"", "name":"Abu Jahal", "id":120001, "loc":"Bandung",
      "role":"s", "sn":"1234555", "cond":"good", "rem":"", "ship":"shopeexpress", "trk":"987655" }

`role` bernilai `s` (pengirim) atau `r` (penerima). `cond` bernilai `good` atau `broken`.

## Menambah kota di peta
Edit `js/config/cities.js` (format `nama:[longitude,latitude]`, huruf kecil). Data contoh sengaja memuat kota Jambi yang belum ada di daftar, jadi 1 alat belum tampil di peta dan ada catatan di bawah peta. Coba tambahkan `jambi:[103.61,-1.61]` lalu muat ulang.

## Rencana hari ke-2 (sambung ke spreadsheet)
1. Buat service account Google, aktifkan Sheets API, share sheet ke emailnya (viewer saja).
2. Isi variabel di `.env.example` (salin ke `.env.local`, dan isi juga di Vercel).
3. Isi `api/tools.js`: cek akses, baca sheet, ubah ke catatan dengan `missingColumns()` dan `parseRows()`.
4. Di `js/config/app.js` ubah `source` jadi `"api"`.
5. Tes: endpoint tanpa akses tidak boleh mengeluarkan data; `.env.local` tidak ikut git.
