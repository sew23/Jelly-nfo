// Movie lists: match pasted titles, review, export a zip with one folder per movie.
let L=[];
const parseLine=t=>{const m=t.match(/^(.*?)[\s(\[]*((?:19|20)\d\d)[)\]]?$/);return m&&m[1].trim()?{q:m[1].trim(),y:m[2]}:{q:t,y:''}};
$('lm').onclick=async()=>{const lines=$('ml').value.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,50),btn=$('lm');
 if(!lines.length)return;btn.disabled=true;L=[];
 try{for(let i=0;i<lines.length;i++){btn.textContent=`Matching ${i+1}/${lines.length}…`;const{q,y}=parseLine(lines[i]),
   d=await tm('/search/movie','&query='+encodeURIComponent(q)+(y?'&year='+y:''));L.push({line:lines[i],res:d.results.slice(0,5)})}
  renderList()}catch(e){$('lr').innerHTML=`<p class="m">${esc(e.message)}</p>`}
 btn.disabled=false;btn.textContent='Match titles'};
function renderList(){
 const rows=L.map((x,i)=>x.res.length?`<div class="ep"><b>${esc(x.line)}</b><select data-l="${i}" style="width:100%;margin-top:4px">${x.res.map((r,j)=>`<option value="${j}">${esc(r.title)} (${(r.release_date||'').slice(0,4)||'?'}) ${esc((r.overview||'').slice(0,60))}</option>`).join('')}</select></div>`:`<div class="ep"><b>${esc(x.line)}</b><p class="m">No match, will be skipped.</p></div>`).join('');
 $('lr').innerHTML=`<p class="m">Check each match and change it if it is wrong (first 50 lines only).</p>${rows}<h3>Images</h3><div class="im">`+[['poster','Poster'],['backdrop','Backdrop'],['logo','Logo']].map(([k,t])=>`<label><input type="checkbox" id="l_${k}" style="width:auto"> ${t}</label>`).join('')+`</div><label>Image size<select id="lsz"><option value="m">Medium (faster)</option><option value="o">Original (largest)</option></select></label><label><input type="checkbox" id="lio" style="width:auto;margin-right:6px">Images only (skip NFO files)</label><button id="ldl" style="margin-top:14px;width:100%;padding:12px">Download list zip</button>`;
 $('ldl').onclick=listDownload}
async function listDownload(){const btn=$('ldl'),io=$('lio').checked,sz=$('lsz').value,W={poster:'w780',backdrop:'w1280',logo:'w500'},N={poster:'poster',backdrop:'fanart',logo:'logo'},
 want=['poster','backdrop','logo'].filter(k=>$('l_'+k).checked),z=new JSZip(),rep=[],keep=S,items=L.map((x,i)=>({x,i})).filter(o=>o.x.res.length);
 if(io&&!want.length){alert('Tick at least one image.');return}
 btn.disabled=true;
 try{for(let n=0;n<items.length;n++){const{x,i}=items[n];btn.textContent=`Movie ${n+1}/${items.length}…`;
   const r=x.res[+document.querySelector(`[data-l="${i}"]`).value];
   try{const d=await tm(`/movie/${r.id}`,'&append_to_response=credits,external_ids,release_dates');flags=[];
    S={ty:'movie',d,om:await omdb(d.external_ids?.imdb_id)};
    const yr=(d.release_date||'').slice(0,4),dir=safe(d.title)+(yr?` (${yr})`:''),f=z.folder(dir),notes=[];
    if(!io)f.file('movie.nfo',movieNfo({t:d.title,r:d.runtime,g:d.tagline,p:d.overview}));
    if(yr&&(Date.now()-new Date(d.release_date))/864e5<45)notes.push('recent release, early ratings');
    if(!io&&!S.om.imdb)notes.push('no IMDb rating');
    if(want.length){const im=await imgs('movie',d);
     await Promise.all(want.map(async k=>{const p=im[k];if(!p){notes.push('no '+k);return}
      try{const rs=await fetch(`https://image.tmdb.org/t/p/${sz=='o'?'original':W[k]}${p}`);if(!rs.ok)throw 0;f.file(N[k]+p.slice(p.lastIndexOf('.')),await rs.blob())}catch(e){notes.push(k+' failed')}}))}
    rep.push(dir+(notes.length?': '+notes.join(', '):''))
   }catch(e){rep.push(`${x.line}: failed (${e.message||'error'})`)}}
  rep.unshift('Skipped (no match): '+(L.filter(x=>!x.res.length).map(x=>x.line).join('; ')||'none'));
  z.file('report.txt',rep.join('\n'));
  save(`Movie list ${io?'images':'NFO'}.zip`,await z.generateAsync({type:'blob'},m=>{btn.textContent='Zipping '+Math.round(m.percent)+'%'}));
 }finally{S=keep;btn.disabled=false;btn.textContent='Download list zip'}}
