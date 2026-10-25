// Builds the Kodi/Jellyfin NFO XML.
const H='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
function ratings(l){l=l.filter(r=>r.value!=null&&r.value!==''&&!isNaN(r.value));if(!l.length)return'';
 return'  <ratings>\n'+l.map((r,i)=>`    <rating name="${r.name}" max="${r.max}"${i?'':' default="true"'}>\n      <value>${r.value}</value>\n`+(r.votes?`      <votes>${r.votes}</votes>\n`:'')+'    </rating>\n').join('')+'  </ratings>\n'}
const acts=l=>(l||[]).slice(0,20).map((a,i)=>`  <actor>\n    <name>${esc(a.name)}</name>\n    <role>${esc(a.character)}</role>\n    <order>${i}</order>\n  </actor>\n`).join('');
const gen=d=>(d.genres||[]).map(g=>tag('genre',g.name)).join('');
const stu=d=>[...(d.networks||[]),...(d.production_companies||[])].map(c=>c.name).filter(uq).map(n=>tag('studio',n)).join('');
const cty=d=>(d.production_countries||[]).map(c=>tag('country',c.name)).join('');
const crew=(c,j)=>(c||[]).filter(x=>j.includes(x.job)).map(x=>x.name).filter(uq);
const uid=d=>`  <uniqueid type="tmdb" default="true">${d.id}</uniqueid>\n`+(d.external_ids?.imdb_id||d.imdb_id?`  <uniqueid type="imdb">${d.external_ids?.imdb_id||d.imdb_id}</uniqueid>\n`:'');
const rts=()=>ratings([{name:'imdb',max:10,value:S.om.imdb,votes:S.om.votes},{name:'tomatometerallcritics',max:100,value:S.om.rt}]);
const tvMpaa=()=>(S.d.content_ratings?.results||[]).find(r=>r.iso_3166_1=='US')?.rating;
const mvMpaa=()=>((S.d.release_dates?.results||[]).find(r=>r.iso_3166_1=='US')?.release_dates||[]).map(x=>x.certification).find(Boolean);
function movieNfo(){const d=S.d,p=$('mp').value,c=d.credits?.crew;
 return H+'<movie>\n'+tag('title',$('mt0').value)+tag('originaltitle',d.original_title)+tag('year',(d.release_date||'').slice(0,4))+tag('premiered',d.release_date)+tag('releasedate',d.release_date)+tag('runtime',$('mr').value)+tag('plot',p)+tag('outline',outl(p))+tag('tagline',$('mg').value)+gen(d)+crew(c,['Director']).map(n=>tag('director',n)).join('')+crew(c,['Writer','Screenplay']).map(n=>tag('credits',n)).join('')+acts(d.credits?.cast)+stu(d)+tag('mpaa',mvMpaa())+cty(d)+uid(d)+rts()+'</movie>\n'}
function tvNfo(){const d=S.d;return H+'<tvshow>\n'+tag('title',d.name)+tag('originaltitle',d.original_name)+tag('showtitle',d.name)+tag('premiered',d.first_air_date)+tag('plot',d.overview)+tag('outline',outl(d.overview))+gen(d)+stu(d)+cty(d)+tag('mpaa',tvMpaa())+tag('status',d.status=='Returning Series'?'Continuing':d.status=='Ended'||d.status=='Canceled'?'Ended':'')+uid(d)+rts()+acts(d.credits?.cast)+'</tvshow>\n'}
function seasonNfo(st){const s=st.season,g=id=>$(id)?$(id).value.trim():'',p=$('sp')?$('sp').value:(s.overview||S.d.overview);
 return H+'<season>\n'+tag('title','Season '+st.n)+tag('seasonnumber',st.n)+tag('premiered',s.air_date)+tag('year',(s.air_date||'').slice(0,4))+tag('plot',p)+tag('outline',outl(p))+ratings([{name:'tomatometerallcritics',max:100,value:g('mt'),votes:g('mc')},{name:'tomatometeraudience',max:100,value:g('pm')}])+'</season>\n'}
function epNfo(e,i,n){const q=f=>{const el=document.querySelector(`[data-i="${i}"][data-f="${f}"]`);return el?el.value:{name:e.name,rt:e.runtime,ov:e.overview}[f]},p=q('ov');
 return H+'<episodedetails>\n'+tag('title',q('name'))+tag('showtitle',S.d.name)+tag('season',n)+tag('episode',e.episode_number)+tag('aired',e.air_date)+tag('premiered',e.air_date)+tag('runtime',q('rt'))+tag('plot',p)+crew(e.crew,['Director']).map(x=>tag('director',x)).join('')+crew(e.crew,['Writer','Screenplay','Teleplay']).map(x=>tag('credits',x)).join('')+tag('studio',(S.d.networks||[])[0]?.name)+tag('mpaa',tvMpaa())+ratings([{name:'imdb',max:10,value:e.imdb}])+acts(e.guest_stars)+'</episodedetails>\n'}
