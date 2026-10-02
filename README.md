# Tracking QC Measurement Tools (v2.1.1)

Dashboard pelacak alat ukur QC: posisi alat sekarang, PIC, lama di PIC, peta rute, dan log serah terima.
Data diambil langsung dari Google Sheet lewat Google Apps Script dan fungsi server di Vercel. Teks tampilan berbahasa Inggris.

## Cara kerjanya
Browser memanggil `/api/tools` dengan kode akses. Fungsi Vercel itu memeriksa kode, lalu memanggil web app Apps Script dari sisi server memakai kunci rahasia. Script membaca sheet, membuang kolom email dan foto, lalu mengirim datanya. URL dan kunci Apps Script tidak pernah ada di browser.

## Menyambungkan ke Google Sheet (Apps Script)
Lakukan dengan akun Google pemilik sheet.

1. Buka Google Sheet, lalu **Extensions > Apps Script**.
2. Hapus isi `Code.gs` bawaan, tempel seluruh isi `apps-script/Code.gs` dari proyek ini, lalu Save. Cek `TAB_NAME` di baris atas: harus sama dengan nama tab di sheet (default `Form Responses 1`).
3. Klik ikon roda gigi (**Project Settings**), turun ke **Script Properties**, **Add script property**: nama `API_KEY`, nilai berupa huruf dan angka acak minimal 32 karakter (pakai password generator). Simpan nilainya, nanti dipakai lagi di Vercel.
4. Klik **Deploy > New deployment**, ikon roda gigi > **Web app**. Isi:
   - Execute as: **Me**
   - Who has access: **Anyone**
   Klik Deploy. Google akan meminta izin (Authorize access). Kalau muncul peringatan "Google hasn't verified this app", klik Advanced > Go to ... (unsafe) > Allow. Itu script lo sendiri, dan izinnya terbatas ke spreadsheet ini saja.
5. Salin **Web app URL** (berakhiran `/exec`).
6. **Tes dulu di browser:** buka `URL?key=API_KEY_LO`. Harus muncul JSON berisi `values`, dan kolom email serta foto tidak ada. Tanpa `?key=` harus muncul `{"error":"Unauthorized."}`. Cek juga tanggalnya sudah benar (tidak bergeser sehari).
7. **Vercel > Settings > Environment Variables:** isi `APPS_SCRIPT_URL`, `APPS_SCRIPT_KEY` (sama dengan API_KEY), dan `ACCESS_CODE` (kode untuk membuka dashboard, buat panjang dan acak). Deploy ulang.
8. Buka situs, masukkan kode akses.

Kalau script diubah nanti: **Deploy > Manage deployments > ikon pensil > Version: New version > Deploy**. URL tetap sama.

Tanggal: sel bertipe tanggal (yang otomatis dibuat Google Form dari date picker) dikirim sebagai yyyy-MM-dd. Kalau ada sel tanggal yang berupa teks, formatnya dibaca dd/mm/yyyy. Cara cek di sheet: tanggal asli rata kanan, teks rata kiri.

Kolom sheet dikenali dari nama header (urutan bebas), definisinya di `js/config/schema.js`. Sheet yang masih kosong tidak error: tampilan muncul dengan "No record".

## Serah-terima akun
Semua (Google Sheet, Apps Script, GitHub, Vercel) ada di satu akun, jadi tinggal serahkan akun itu. Pastikan penerima akun tahu kode akses dan di mana variabel Vercel disimpan. Kalau suatu saat sheet dipindahkan ke akun lain, pemilik baru harus deploy ulang web app-nya, lalu `APPS_SCRIPT_URL` di Vercel diganti.

## Menjalankan di komputer
- Hanya tampilan (data demo): `npx serve .` lalu buka alamatnya dengan `?demo` di belakang, misalnya `http://localhost:3000/?demo`.
- Dengan API: salin `.env.example` jadi `.env.local`, isi, lalu `npx vercel dev`.
- Jangan buka `index.html` dengan klik dua kali (modul JS tidak jalan lewat `file://`).

## Tes
`npm test` (butuh Node 18 atau lebih baru, tanpa `npm install`). Tes memakai layanan Google tiruan, jadi tidak butuh koneksi.

## Struktur
- `index.html`, `css/`, `js/`: tampilan (`js/config/` untuk pengaturan, format sheet, kota, dan bentuk pulau)
- `apps-script/Code.gs`: script yang ditempel di Google Sheet
- `api/tools.js`: titik masuk fungsi Vercel
- `lib/`: akses (`access.js`), pemanggil Apps Script (`sheets.js`), ubah baris jadi catatan (`records.js`), pengatur permintaan (`handler.js`)
- `tests/`: tes otomatis
- `samples/`: xlsx contoh. Impor ke Google Sheet baru untuk mencoba tanpa data asli

## Menambah kota di peta
Edit `js/config/cities.js` (`nama:[longitude,latitude]`, huruf kecil). Kota yang belum terdaftar disebut namanya di bawah peta.

## Catatan keamanan
- Pertahankan "Who has access: Anyone" hanya untuk web app Apps Script. Yang melindungi datanya adalah `API_KEY`, jadi jangan dibagikan dan jangan ditaruh di kode atau GitHub.
- Kode akses bersama itu pengaman dasar. Untuk tim besar, pertimbangkan Password Protection Vercel atau login Google dibatasi domain kantor.
- Tidak ada rate limit selain jeda pada kode salah.
- Kalau halaman tampil tanpa gaya atau kosong setelah deploy, kemungkinan header CSP di `vercel.json` terlalu ketat. Hapus header itu sementara untuk mengecek.
