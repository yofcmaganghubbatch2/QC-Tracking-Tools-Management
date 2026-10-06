// State bersama yang dipakai semua modul.
// Filter gabungan (atas halaman): sel = alat, city = kota posisi sekarang, pic = PIC terakhir. Berlaku untuk peta, kartu, dan log.
// focus = alat yang disorot di peta (tidak menyaring apa pun). open = nomor seri kartu yang riwayatnya sedang dibuka.
// page = halaman kartu; role/query/eq/logPage = kontrol khusus log serah terima (eq = filter alat pendukung).
export const state={data:[],g:[],role:"all",query:"",sel:null,city:null,pic:null,eq:null,focus:null,open:new Set(),page:0,logPage:0,source:""};
