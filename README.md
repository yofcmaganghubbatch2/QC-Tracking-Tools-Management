# Tracking QC Measurement Tools (v3.2)

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
- `samples/QC_Measurement_Tools_sample.xlsx`: contoh dengan kolom persis seperti Form baru. Impor ke Google Sheet baru untuk mencoba tanpa data asli

## Data dari Google Form
Kolom yang dibaca (urutan bebas, huruf besar/kecil dan spasi di ujung tidak masalah), definisinya di `js/config/schema.js`:
- Wajib: tanggal ("Tools Departure or Arrival Date"), "Full Name", "Location", "As Sender or Recipient", "Ultrasonic Thickness Gauge Serial Number"
- Opsional: "Employee ID", "Ultrasonic Thickness Gauge Condition", "Remarks if Broken", "Shipping Service Company", "Tracking Number", "Supporting Equipment Included?", "Supporting Equipment"
- Email dan kedua kolom foto tidak dipakai, dan dibuang oleh `apps-script/Code.gs` sebelum data keluar dari Google.

Nomor seri dan daftar alat pendukung resmi ada di `js/config/master.js`. Kalau pilihan di Form berubah, ubah juga di sana.

## Alat pendukung
Alat pendukung tidak punya nomor seri, jadi yang dicatat adalah **isi tiap pengiriman**, bukan posisi tiap alat. Pengirim dan penerima sama-sama mencentang apa yang dikirim atau diterima. Kalau berbeda, kartu menampilkan peringatan ("Not received: ..." atau "Extra: ...") dan statistik "Equipment mismatches" bertambah. Jawaban "No" berarti tidak ada alat pendukung.

## Filter dan halaman
- **Panel filter di atas halaman** (Tool, City, PIC) satu kesatuan. Ketiganya digabung (AND) dan berlaku untuk peta, kartu, dan handover log. Ada ringkasan "Showing 2 of 6 tools" dan tombol Reset (muncul kalau ada filter aktif). Di layar lebar panel ikut menempel di atas saat di-scroll. Kotak statistik di hero tetap menghitung seluruh alat.
- **Beda arti untuk kartu/peta dan log:** kartu dan peta menunjukkan keadaan **sekarang** (City = kota posisi alat sekarang, PIC = pemegang atau pengirim terakhir). Handover log menunjukkan **riwayat**: semua catatan yang kotanya, PIC-nya, atau alatnya cocok. Jadi memilih City = Denpasar menampilkan semua alat yang pernah tercatat di Denpasar. Dropdown City dan PIC berisi semua yang pernah ada di log; angka di kurung = jumlah alat yang sekarang ada di situ (0 = pernah ada, sekarang tidak ada alat).
- Current tool positions: kartu berhalaman, jumlah per halaman mengikuti lebar layar (kolom x 2 baris). **Semua kartu satu ukuran** di layar lebar, dan tinggi kartu tidak berubah saat riwayat dibuka. Tiap kartu menampilkan 3 riwayat terbaru. Klik kartu (atau tombol "All N records") untuk membuka riwayat lengkap di area yang bisa di-scroll. Tombol **Show on map** menyorot alat itu di peta (hanya menyorot, tidak menyaring).
- Handover log: satu-satunya kontrol miliknya adalah tombol **All / Senders / Recipients**, 10 baris per halaman. Di bawah judul tampil keterangan filter yang sedang berlaku.
- Peta di HP: lebih lebar dari layar supaya tulisan terbaca. Geser dengan jari, tombol + dan - untuk zoom.
- Ubah jumlah baris log di `SIZE` pada `js/ui/log.js`, jumlah riwayat kartu yang langsung tampil di `KEEP` pada `js/ui/cards.js`, dan jumlah baris kartu di `cardsPerPage()` pada `js/ui/cards.js`.

## Menambah kota di peta
Edit `js/config/cities.js` (`nama:[longitude,latitude]`, huruf kecil). Kota yang belum terdaftar disebut namanya di bawah peta.

## Catatan keamanan
- Pertahankan "Who has access: Anyone" hanya untuk web app Apps Script. Yang melindungi datanya adalah `API_KEY`, jadi jangan dibagikan dan jangan ditaruh di kode atau GitHub.
- Kode akses bersama itu pengaman dasar. Untuk tim besar, pertimbangkan Password Protection Vercel atau login Google dibatasi domain kantor.
- Tidak ada rate limit selain jeda pada kode salah.
- Kalau halaman tampil tanpa gaya atau kosong setelah deploy, kemungkinan header CSP di `vercel.json` terlalu ketat. Hapus header itu sementara untuk mengecek.
