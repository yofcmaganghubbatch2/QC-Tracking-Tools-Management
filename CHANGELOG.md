# Changelog

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
