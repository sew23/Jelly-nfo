// Image downloads, zip creation and file saving.
function save(n,c){const a=document.createElement('a');a.href=URL.createObjectURL(c instanceof Blob?c:new Blob([c],{type:'text/xml'}));a.download=n;a.click()}
async function pool(t,n,fn){let i=0;await Promise.all(Array.from({length:n},async()=>{while(i<t.length)await fn(t[i++])}))}
async function download(){const f={},bin={},btn=$('dl');
 const io=$('io')&&$('io').checked;
 if(io){}else if(S.ty=='movie')f['movie.nfo']=movieNfo();
 else{f['tvshow.nfo']=tvNfo();const sh=safe(S.d.name);S.sets.forEach(st=>{f[`season${pad(st.n)}.nfo`]=seasonNfo(st);st.eps.forEach((e,i)=>f[`${sh} S${pad(st.n)}E${pad(e.episode_number)}.nfo`]=epNfo(e,i,st.n))})}
 const bad=Object.keys(f).filter(k=>new DOMParser().parseFromString(f[k],'text/xml').querySelector('parsererror'));
 if(bad.length){alert('Invalid XML in: '+bad.join(', '));return}
 btn.disabled=true;
 try{const sz=$('isz').value,W={poster:'w780',backdrop:'w1280',logo:'w500'},N={poster:'poster',backdrop:'fanart',logo:'logo'},ex=p=>p.slice(p.lastIndexOf('.')),
   U=(p,w)=>`https://image.tmdb.org/t/p/${sz=='o'?'original':w}${p}`,tasks=[],fail=[];
  for(const k of['poster','backdrop','logo']){const c=$('i_'+k);if(c&&c.checked){const p=S.img[k];tasks.push({n:N[k]+ex(p),u:U(p,W[k]),l:k})}}
  if(S.ty=='tv'){
   if($('i_season')&&$('i_season').checked)S.sets.forEach(st=>{const p=st.season.poster_path;if(p)tasks.push({n:`season${pad(st.n)}-poster${ex(p)}`,u:U(p,'w780'),l:'season '+st.n+' poster'})});
   if($('i_thumbs')&&$('i_thumbs').checked){const sh=safe(S.d.name);S.sets.forEach(st=>st.eps.forEach(e=>{if(e.still_path)tasks.push({n:`${sh} S${pad(st.n)}E${pad(e.episode_number)}-thumb${ex(e.still_path)}`,u:U(e.still_path,'w780'),l:'thumbnail S'+pad(st.n)+'E'+pad(e.episode_number)})}))}}
  if(io&&!tasks.length){alert('Tick at least one image.');return}
  let done=0;const tick=()=>{btn.textContent=tasks.length?`Downloading images ${done}/${tasks.length}…`:'Working…'};tick();
  await pool(tasks,4,async t=>{try{const r=await fetch(t.u);if(!r.ok)throw 0;bin[t.n]=await r.blob()}catch(e){fail.push(t.l)}done++;tick()});
  if(fail.length)alert('Could not download: '+fail.join(', ')+'. Your browser may block image downloads. The rest is included.');
  if(S.ty=='movie'&&!io&&!Object.keys(bin).length)return save('movie.nfo',f['movie.nfo']);
  const z=new JSZip();for(const k in f)z.file(k,f[k]);for(const k in bin)z.file(k,bin[k]);
  const b=await z.generateAsync({type:'blob'},m=>{btn.textContent='Zipping '+Math.round(m.percent)+'%'});
  save((S.ty=='movie'?`${safe(S.d.title)} NFO.zip`:S.batch?`${safe(S.d.name)} NFO.zip`:`${safe(S.d.name)} S${pad(S.sn)} NFO.zip`).replace(' NFO',io?' images':' NFO'),b)
 }finally{btn.disabled=false;btn.textContent='Download files'}}
