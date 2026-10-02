import {$} from "../dom.js";

// Kotak dialog kode akses. onSubmit(kode) dipanggil saat user menekan Unlock.
export function initGate(onSubmit){
  $("#gate-form").onsubmit=e=>{
    e.preventDefault();
    const v=$("#gate-code").value;if(!v)return;
    $("#gate").close();$("#gate-code").value="";
    onSubmit(v);
  };
}

export function askCode(wrong){
  const d=$("#gate");
  $("#gate-err").hidden=!wrong;$("#gate-code").value="";
  if(!d.open)d.showModal();
  $("#gate-code").focus();
}
