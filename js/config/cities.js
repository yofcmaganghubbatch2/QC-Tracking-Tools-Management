// Koordinat kota [longitude, latitude]. Nama kunci huruf kecil.
// Tambah kota baru di sini; nama di spreadsheet dicocokkan otomatis
// (misal "Kota Bandung" atau "Bandung, Jawa Barat" tetap kena "bandung").
export const CITY={
  // Sumatra
  "banda aceh":[95.45,5.5],lhokseumawe:[97.15,5.18],medan:[98.67,3.6],padang:[100.35,-0.95],pekanbaru:[101.45,0.51],dumai:[101.45,1.67],
  batam:[104.03,1.05],tanjungpinang:[104.45,0.92],jambi:[103.61,-1.61],palembang:[104.75,-2.99],pangkalpinang:[106.12,-2.13],bengkulu:[102.26,-3.8],lampung:[105.26,-5.43],
  // Jawa
  cilegon:[106.01,-6.0],serang:[106.15,-6.12],tangerang:[106.63,-6.18],jakarta:[106.85,-6.2],bekasi:[107.0,-6.24],cikarang:[107.15,-6.3],karawang:[107.3,-6.3],
  bogor:[106.8,-6.6],sukabumi:[106.93,-6.92],purwakarta:[107.44,-6.56],bandung:[107.6,-6.9],cirebon:[108.55,-6.72],tegal:[109.14,-6.87],
  purwokerto:[109.23,-7.42],cilacap:[109.0,-7.73],semarang:[110.42,-6.97],yogyakarta:[110.37,-7.8],surakarta:[110.82,-7.57],madiun:[111.52,-7.63],
  tuban:[112.05,-6.9],kediri:[112.0,-7.82],gresik:[112.65,-7.16],surabaya:[112.75,-7.25],sidoarjo:[112.7,-7.45],malang:[112.63,-7.98],banyuwangi:[114.37,-8.22],
  // Kalimantan
  pontianak:[109.33,-0.03],singkawang:[108.98,0.9],sampit:[112.95,-2.53],palangkaraya:[113.9,-2.21],banjarmasin:[114.6,-3.32],
  balikpapan:[116.55,-1.3],samarinda:[117.0,-0.5],bontang:[117.25,0.05],tarakan:[117.4,3.3],
  // Sulawesi
  manado:[124.8,1.4],gorontalo:[123.06,0.54],palu:[119.87,-0.9],luwuk:[122.79,-0.95],mamuju:[118.89,-2.67],parepare:[119.62,-4.01],
  makassar:[119.41,-5.15],kendari:[122.5,-3.97],"bau bau":[122.6,-5.47],
  // Bali dan Nusa Tenggara
  denpasar:[115.2,-8.65],mataram:[116.1,-8.58],bima:[118.72,-8.46],"labuan bajo":[119.88,-8.5],waingapu:[120.26,-9.65],
  ende:[121.65,-8.84],maumere:[122.2,-8.62],kupang:[123.6,-10.17],
  // Maluku dan Papua
  ternate:[127.37,0.79],ambon:[128.18,-3.7],sorong:[131.25,-0.87],manokwari:[133.85,-0.85],biak:[136.1,-1.0],
  nabire:[135.48,-3.6],timika:[136.89,-4.55],jayapura:[140.6,-2.6],merauke:[140.4,-8.49]
};
// Nama lain yang menunjuk ke kota yang sama.
export const ALIAS={solo:"surakarta",jogja:"yogyakarta",yogya:"yogyakarta",bali:"denpasar","tangerang selatan":"tangerang"};
// Kota yang labelnya ditaruh di kiri titik (supaya tidak menumpuk dengan kota di sebelahnya).
export const LEFT=["jakarta","kediri","lampung"];
