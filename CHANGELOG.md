# Changelog

## 2.1.1
- Tanggal berupa teks dibaca day-first (dd/mm/yyyy, sesuai date picker Google Form). Sebelumnya teks seperti 05/10/2026 bisa terbaca 10 Mei. Tanggal mustahil atau ambigu kini dilewati dan dilaporkan sebagai "skipped", bukan ditebak

## 2.1.0
- Sumber data pindah dari service account Google Cloud ke Google Apps Script (`apps-script/Code.gs`). Tidak perlu Google Cloud, file kunci JSON, maupun library tambahan (`npm install` tidak diperlukan)
- Script membuang kolom email dan foto sebelum data keluar dari Google, dan mengirim tanggal sebagai teks supaya tidak bergeser hari
- Fungsi Vercel memanggil web app dari sisi server; URL dan kunci Apps Script tidak pernah sampai ke browser
- Variabel server sekarang hanya: `APPS_SCRIPT_URL`, `APPS_SCRIPT_KEY`, `ACCESS_CODE`
- Tes baru untuk Code.gs (dengan layanan Google tiruan) dan untuk pemanggil Apps Script

## 2.0.0 (final)
- Data langsung dari Google Sheet lewat `api/tools.js` (service account, izin Viewer saja). Kolom email tidak dikirim ke browser
- Akses dilindungi kode akses (`ACCESS_CODE`); tanpa kode, server menolak dan sheet tidak dibaca
- Data kosong: seluruh tampilan tetap ada, isinya "No record"
- Seluruh teks tampilan berbahasa Inggris
- Mode demo: tambahkan `?demo` di alamat untuk melihat data contoh tanpa koneksi spreadsheet
- Tombol "Load spreadsheet" dan library xlsx dari CDN dihapus (tidak diperlukan lagi)
- Header keamanan di `vercel.json` (CSP, nosniff, no-referrer, X-Frame-Options)
- Tes otomatis di `tests/` (`npm test`): API, tampilan demo, kosong, API, dan kode akses
- `Count until` otomatis hari ini untuk data asli

## 1.2.0
- Peta digambar ulang: bentuk pulau lebih akurat (Sumatra, Jawa, Kalimantan, Sulawesi, Nusa Tenggara, Maluku, Papua, Semenanjung Malaysia), latar berwarna lembut, garis khatulistiwa
- Daftar kota diperluas jadi ±75 kota (ibu kota provinsi dan kota industri), nama dicocokkan otomatis ("Kota Bandung" tetap kena "bandung"). Jambi dan kota di data contoh semuanya sudah ada
- Kalau ada kota yang belum ada di peta, catatan di bawah peta menyebut nama kotanya
- Kartu alat: riwayat serah terima jadi garis waktu vertikal (tidak terpotong lagi, tanpa scroll samping). Riwayat lebih dari 4 dilipat
- Tombol filter terpilih di mode gelap kini terbaca jelas, favicon ditambahkan (menghilangkan error 404 di console)

## 1.1.0
- Judul jadi "Tracking QC Measurement Tools", lebar judul diperlebar (`max-width:20ch` di css/hero.css)
- Data contoh diperluas: 9 alat, 11 PIC, 20 catatan (ada alat rusak, 2 alat dalam pengiriman, 1 PIC memegang 2 alat, 1 kota yang belum ada di peta)
- File contoh xlsx untuk uji tombol "Muat spreadsheet": `samples/QC_Material_Measurement_Tools_sample.xlsx`
- Pengaturan sumber data di `js/config/app.js` (`sample` atau `api`) dan kontrak data di `js/data/source.js`
- Tombol "Muat ulang data" dan kotak pesan error (`js/ui/notice.js`)
- `.env.example` dan `api/tools.js` disiapkan untuk hari ke-2

## 1.0.0
- Kerangka awal: CSS dan JS dipecah per bagian, data contoh dipisah ke sample.json
