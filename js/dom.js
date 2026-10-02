export const $=s=>document.querySelector(s);
export const $$=s=>document.querySelectorAll(s);
export const smooth=()=>matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth";
