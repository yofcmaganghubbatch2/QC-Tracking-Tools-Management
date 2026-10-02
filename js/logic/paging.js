// Potong daftar jadi halaman. Nomor halaman otomatis dijaga di antara 0 dan halaman terakhir.
export function paginate(list,page,size){
  const total=list.length,pages=Math.max(1,Math.ceil(total/size));
  const p=Math.min(Math.max(0,page),pages-1),start=p*size;
  return {items:list.slice(start,start+size),page:p,pages,total,from:total?start+1:0,to:Math.min(total,start+size)};
}
