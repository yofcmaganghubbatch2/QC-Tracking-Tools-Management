import {$} from "../dom.js";

export function showNotice(msg,kind="info"){const n=$("#notice");n.textContent=msg;n.className="notice "+kind;n.hidden=false}
export function clearNotice(){const n=$("#notice");n.hidden=true;n.textContent=""}
