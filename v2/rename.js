// Rename videos: paste file names, preview, download rename.bat and undo.bat (zipped). Never touches files itself.
const VID=/\.(mkv|mp4|avi|m4v|mov|wmv|ts|m2ts|webm|srt|ass|ssa|sub|idx|vtt)$/i;
const parseEp=n=>{const b=n.replace(/\.[^.]+$/,'');
 if(/[Ee]\d{1,3}[\s._-]*[Ee]\d{1,3}/.test(b))return null;
 const m=b.match(/[Ss](\d{1,2})[\s._-]*[Ee](\d{1,3})/)||b.match(/(?<!\d)(\d{1,2})x(\d{2,3})(?!\d)/)||b.match(/season[\s._-]*(\d+)[\s._-]*episode[\s._-]*(\d+)/i);
 return m?[+m[1],+m[2]]:null};
const extOf=n=>(n.match(/((?:\.[A-Za-z]{2,3})?\.(?:srt|ass|ssa|sub|idx|vtt))$/i)||n.match(/(\.[^.]+)$/))[1];
let R=[];
$('rd').ontoggle=()=>{if($('rd').open&&!$('rs').value&&S.d&&S.d.name)$('rs').value=safe(S.d.name)};
$('rp').onclick=()=>{if(!$('rs').value.trim()){alert('Enter the show name first.');return}
 const all=$('rl').value.split('\n').map(x=>x.trim()).filter(Boolean),lines=all.filter(x=>VID.test(x));
 R=lines.map(o=>{const p=parseEp(o)||['',''];return{o,s:p[0],e:p[1],x:extOf(o)}});
 $('rr').innerHTML=R.length?`<p class="m" id="rc"></p><p class="m">${all.length-lines.length?(all.length-lines.length)+' other lines ignored. ':''}Fix any row marked "Set season and episode". Nothing is renamed until you run the .bat on your PC.</p>`+
  R.map((r,i)=>`<div class="ep"><small class="m">${esc(r.o)}</small><div class="h" style="margin-top:4px"><input data-r="${i}" data-k="s" value="${r.s}" placeholder="S" inputmode="numeric" style="width:64px"><input data-r="${i}" data-k="e" value="${r.e}" placeholder="E" inputmode="numeric" style="width:64px"><span id="rn${i}" style="align-self:center"></span></div></div>`).join('')+
  '<button id="rb" style="margin-top:14px;width:100%;padding:12px">Download rename scripts (zip)</button>':'<p class="m">No video or subtitle file names found.</p>';
 if(R.length){rUpd();$('rb').onclick=rBat}};
$('rr').oninput=e=>{const t=e.target;if(t.dataset.r==null)return;t.value=t.value.replace(/\D/g,'');R[+t.dataset.r][t.dataset.k]=t.value;rUpd()};
$('rs').oninput=()=>{if(R.length)rUpd()};
function rUpd(){const show=safe($('rs').value),cnt={};
 R.forEach(r=>{r.n=r.s&&r.e&&show?`${show} S${pad(r.s)}E${pad(r.e)}${r.x}`:'';if(r.n){const k=r.n.toLowerCase();cnt[k]=(cnt[k]||0)+1}});
 R.forEach((r,i)=>{r.st=!r.n?'manual':r.n==r.o?'same':cnt[r.n.toLowerCase()]>1?'conflict':'ok';
  const el=$('rn'+i);el.textContent={manual:'Set season and episode',same:'Already correct',conflict:'Duplicate name, skipped',ok:'→ '+r.n}[r.st];el.style.color=r.st=='ok'?'var(--ok)':'var(--mu)'});
 $('rc').textContent=`${R.filter(r=>r.st=='ok').length} of ${R.length} files will be renamed`}
async function rBat(){const ok=R.filter(r=>r.st=='ok');if(!ok.length){alert('Nothing to rename.');return}
 const q=s=>s.replace(/%/g,'%%'),head=['@echo off','chcp 65001 >nul','cd /d "%~dp0"'],
 ren=[...head,...ok.map(r=>`if exist "${q(r.n)}" (echo Skipped, already exists: "${q(r.n)}") else (ren "${q(r.o)}" "${q(r.n)}")`),'echo Done.','pause'],
 und=[...head,...ok.map(r=>`if exist "${q(r.n)}" if not exist "${q(r.o)}" ren "${q(r.n)}" "${q(r.o)}"`),'echo Undone.','pause'],
 z=new JSZip();z.file('rename.bat',ren.join('\r\n')+'\r\n');z.file('undo.bat',und.join('\r\n')+'\r\n');
 save('Rename scripts.zip',await z.generateAsync({type:'blob'}))}
