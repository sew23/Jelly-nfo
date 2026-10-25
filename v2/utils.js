// Shared constants and small helpers.
const $=id=>document.getElementById(id),T='https://api.themoviedb.org/3';
let S={},flags=[];
const K=()=>({t:$('tk').value.trim(),o:$('ok').value.trim()});
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const safe=s=>s.replace(/[:?*"<>|\/\\]/g,'').replace(/\s+/g,' ').trim(),pad=n=>String(n).padStart(2,'0');
const tag=(n,v)=>v==null||v===''?'':`  <${n}>${esc(v)}</${n}>\n`;
const uq=(v,i,a)=>a.indexOf(v)==i;
const outl=t=>(t||'').split(/(?<=[.!?])\s/)[0];
const msg=m=>{$('out').innerHTML=`<p class="m">${esc(m)}</p>`};
