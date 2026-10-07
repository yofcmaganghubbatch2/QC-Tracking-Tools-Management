# Changelog

## 3.6.0
- Peta: alat yang dikirim dari kota yang sama digabung jadi satu titik berangka (sebelumnya satu titik per alat yang saling menumpuk). Busur digambar satu per tujuan berbeda: alat dengan tujuan sama berbagi satu busur, dan semua yang tujuannya kosong berbagi satu busur pendek "destination not set" (sebelumnya tulisan ini bertumpuk lima kali)
- Kartu info titik peta memuat daftar semua alatnya di area yang bisa di-scroll: nomor seri, tujuan, pengirim dan tanggal kirim, ekspedisi dan resi, alat pendukung, dan status rusak. Judulnya "In transit from Jakarta" dengan jumlah alat
- Kartu bisa di-pin: klik (atau Enter/tap) membuat kartu tetap terbuka supaya bisa di-scroll, tutup dengan x, klik di luar, atau Esc. Dengan hover saja kartu tetap muncul sementara dan kursor boleh berpindah ke dalamnya. Di HP kartu ditutup saat peta digeser
- Kotak outline hitam di titik setelah diklik dihilangkan
- 84 tes otomatis

## 3.5.0
- Kolom baru **Destination (Blank if as Recipient)** dari Google Form dibaca sebagai `dest` (hanya untuk pengirim). `apps-script/Code.gs` tidak berubah karena hanya membuang email dan foto
- Peta: alat yang sedang dikirim digambar sebagai busur dari kota pengirim ke kota tujuan, dengan cincin putus-putus dan nama kota tujuan. Tujuan kosong atau kota belum dikenal ditulis jelas di ujung busur, dan kota yang belum ada di `cities.js` dilaporkan di catatan peta. Tooltip memuat tujuan, legenda menambah "destination"
- Kartu ("Sent from X to Y via ..."), riwayat kartu ("sent, X → Y"), dan kolom Location di handover log memuat tujuan. Tujuan kosong tampil "destination not set" / "not set"
- Data demo (`sample.json`) dan `samples/QC_Measurement_Tools_sample.xlsx` ikut diberi kolom Destination
- 80 tes otomatis, termasuk tes dengan header persis dari file xlsx terbaru, 100 baris kosong, dan Code.gs yang tidak diubah

## 3.4.0
- Handover log kini memuat keterangan kelengkapan alat pendukung seperti di kartu. Baris penerima menampilkan "Not received: ..." (kurang), "Extra: ..." (lebih), atau "Complete, matches what was sent". Hasilnya dihitung dari riwayat lengkap tiap alat sehingga tidak berubah saat filter dipakai, dan jumlahnya sama dengan angka Equipment mismatches di statistik
- 68 tes otomatis

## 3.3.0
- Tombol "Today" dihapus. Tombol "Reload data" pindah dari bagian Current tool positions ke panel filter (ikon berputar saat memuat)
- Animasi tambahan: kartu miring tipis dan bercahaya mengikuti kursor (hanya perangkat dengan mouse), garis progres scroll di atas halaman, garis warna di bawah judul bagian yang memanjang saat muncul, penanda peta muncul satu per satu, titik "live" berkedip di gelombang hero, baris log masuk bergantian, ringkasan filter berdenyut saat berubah, dan kerangka kartu berkilau saat data dimuat. Semuanya mengikuti "reduce motion"
- 66 tes otomatis

## 3.2.0
- Semua kartu alat kini satu ukuran (layar lebar). Riwayat lengkap yang dibuka menimpa area daftar terbaru, jadi tinggi kartu tidak berubah dan kartu tetangga tidak ikut bergeser. Di HP (1 kolom) tinggi mengikuti isi
- Handover log mengikuti filter di atas halaman sebagai **riwayat**: Tool, City, dan PIC dicocokkan ke tiap catatan, bukan ke posisi alat sekarang. Memilih Denpasar menampilkan semua catatan di Denpasar. Ada keterangan filter di bawah judul log
- Dropdown City dan PIC berisi semua kota dan PIC yang pernah ada di log. Angka di kurung tetap jumlah alat yang sekarang ada di situ (0 = hanya ada di riwayat). Kartu dan peta tetap menunjukkan keadaan sekarang, dengan pesan kosong yang menunjuk ke log
- Filter alat pendukung dan kotak pencarian di handover log dihapus. Kontrol log tinggal All / Senders / Recipients. Chip alat pendukung tetap tampil di tiap baris
- 64 tes otomatis

## 3.1.0
- Kartu alat dirombak: hanya 3 riwayat terbaru yang tampil. Klik kartu (atau tombol "All N records") untuk membuka riwayat lengkap di area scroll di dalam kartu. Kartu tidak lagi ikut memanjang mengikuti kartu tetangga yang riwayatnya panjang. Kartu yang dibuka tetap terbuka saat filter atau halaman berubah
- Tombol "Show on map" di kartu menyorot alat di peta (mengganti perilaku klik kartu yang lama)
- Filter jadi satu panel di atas halaman (Tool, City, PIC). Filter ini sekarang menyaring peta, kartu, dan handover log sekaligus (sebelumnya filter Tool hanya mengubah peta). Ada ringkasan jumlah alat dan tombol Reset. Panel menempel di atas saat scroll di layar lebar
- Peta di HP: SVG tidak lagi dikecilkan. Peta dibuat lebih lebar dari layar, bisa digeser, ada tombol zoom + dan -, dan mulai dari tengah area yang ada alatnya. Memperbaiki aturan `.scope svg{height:...}` milik gelombang hero yang ikut memampatkan tinggi peta di layar sempit
- Animasi dan tampilan: latar bergerak pelan, judul bergradasi, kotak statistik dan kartu muncul bertahap lalu terangkat saat disorot, angka hari menghitung naik, titik berkedip pada status "In transit", bagian halaman muncul saat di-scroll, baris log menyala saat disorot. Semuanya mati otomatis kalau perangkat memilih "reduce motion"
- Judul hero dirapikan (rata tengah, subjudul baru) dan komentar di `main.js` tentang tanggal data demo dibetulkan
- 62 tes otomatis (tes baru di `tests/ui-filters.test.mjs`)

## 3.0.0
- Mengikuti Google Form baru: kolom tanggal jadi "Tools Departure or Arrival Date", nomor seri berupa pilihan tetap, ada "Supporting Equipment Included?", "Supporting Equipment" (checkbox), dan "Supporting Equipment Photo"
- Alat pendukung (Ultrasonic Gel, Measuring Tape, Tailor Tape, Cutter, Caliper, Tape) dicatat sebagai isi tiap pengiriman, tampil sebagai label di kartu, garis waktu, log, dan tooltip peta. Posisi tiap alat pendukung tidak dilacak karena tidak punya nomor seri
- Tanda "tidak cocok": kalau alat pendukung yang dikirim berbeda dengan yang dicentang penerima, muncul peringatan ("Not received: ..." atau "Extra: ...") dan statistik baru "Equipment mismatches"
- Log punya filter alat pendukung (satu alat, atau "No supporting equipment") dan pencarian ikut mencari nama alat pendukung
- Header dicocokkan tanpa peduli spasi di ujung dan huruf besar/kecil. Kolom "Supporting Equipment" dicocokkan persis supaya tidak tertukar dengan "Included?" dan "Photo"
- Data master (6 nomor seri dan 6 alat pendukung) di `js/config/master.js`; kartu diurutkan sesuai master
- Data dummy baru: 6 alat, 99 catatan, 19 Januari sampai 1 Oktober 2026. Ada alat rusak, alat dalam pengiriman, dan 6 pengiriman yang alat pendukungnya tidak cocok. File contoh `samples/QC_Measurement_Tools_sample.xlsx` berkolom persis seperti Form baru
- `Code.gs` ikut membuang kolom "Supporting Equipment Photo"
- 51 tes otomatis

## 2.2.1
- Handover log di HP dibuat padat: tiap catatan 2 sampai 3 baris dengan tanggal di kolom kiri, nama PIC dan peran di atas, lokasi dan nomor seri di bawahnya, lalu detail pengiriman atau kerusakan. "Good condition" dan ID disembunyikan di HP supaya tidak ramai (tetap tampil di layar lebar)
- Tombol filter peran tidak lagi menyempit jadi bulatan di HP

## 2.2.0
- Responsif untuk semua perangkat: kartu menyesuaikan jumlah kolom (1 sampai 3), kontrol memenuhi lebar di HP, area sentuh minimal 44px, mendukung layar berponi
- Current tool positions berhalaman (2 baris per halaman) dengan tombol Prev/Next, geser jari di HP, dan animasi geser
- Filter baru: Route map punya filter City dan Tool, Current tool positions punya filter PIC. Tiap bagian punya filter sendiri
- Handover log berhalaman (10 baris per halaman). Di HP, tiap catatan tampil sebagai kartu rapi (tanggal dan peran, PIC, lokasi dan alat), bukan kolom yang menumpuk
- Di layar sempit, peta otomatis di-zoom ke area yang ada alatnya supaya tulisannya terbaca
- Klik kartu sekarang menyorot alat itu di peta tanpa menyembunyikan kartu lain
- Tes baru untuk paging dan filter (41 tes)

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
