// UI: keys, search, season loading, preview rendering.
try{$('tk').value=localStorage.tk||'';$('ok').value=localStorage.ok||'';if(!localStorage.tk)$('kd').open=true}catch(e){}
$('sk').onclick=()=>{try{localStorage.tk=K().t;localStorage.ok=K().o;$('kd').open=false}catch(e){}};
$('sf').onsubmit=async e=>{e.preventDefault();$('cfg').innerHTML=$('out').innerHTML='';
 try{const ty=$('ty').value,d=await tm('/search/'+ty,'&query='+encodeURIComponent($('q').value));
  $('res').innerHTML=d.results.slice(0,8).map(r=>`<button class="r" data-id="${r.id}">${esc(r.title||r.name)} (${(r.release_date||r.first_air_date||'').slice(0,4)||'?'})<small>${esc((r.overview||'').slice(0,150))}</small></button>`).join('')||'<p class="m">No results.</p>';
  document.querySelectorAll('.r').forEach(b=>b.onclick=()=>pick(ty,b.dataset.id));
 }catch(x){msg(x.message)}};
async function pick(ty,id){try{$('res').innerHTML=$('cfg').innerHTML='';msg('Loading…');flags=[];
 const d=await tm(`/${ty}/${id}`,'&append_to_response=credits,external_ids,'+(ty=='tv'?'content_ratings':'release_dates'));
 S={ty,d,om:await omdb(d.external_ids?.imdb_id)};S.img=await imgs(ty,d);
 if(ty=='movie'){if((Date.now()-new Date(d.release_date))/864e5<45)flags.push('Recent release: ratings are early and volatile.');render()}
 else{$('out').innerHTML='';$('cfg').innerHTML=`<h3>${esc(d.name)}</h3><div class="cf"><label>Season<select id="sn"><option value="all">All seasons (batch)</option>${d.seasons.filter(s=>s.season_number>0).map(s=>`<option value="${s.season_number}">Season ${s.season_number} (${s.episode_count} eps)</option>`).join('')}</select></label><label>From ep<input id="ef" type="number" min="1"></label><label>To ep<input id="et" type="number" min="1"></label><button id="go">Fetch episodes</button></div><label><input id="fu" type="checkbox" style="width:auto;margin-right:6px">Include episodes not yet marked as aired</label><label><input id="er" type="checkbox" style="width:auto;margin-right:6px">Include per-episode IMDb ratings (uses OMDb)</label>`;
  $('go').onclick=loadSeason}
 }catch(x){msg(x.message)}}
async function prep(n,l,a,b,force,today,fill,un){
 const s=await tm(`/tv/${S.d.id}/season/${n}`),sel=s.episodes.filter(e=>e.episode_number>=a&&e.episode_number<=b);
 sel.forEach(e=>{const m=l&&l.find(x=>x.season==n&&x.number==e.episode_number),k='S'+pad(n)+'E'+pad(e.episode_number);if(!m)return;
  if((!e.air_date&&m.airdate)||(e.air_date>today&&m.airdate&&m.airdate<=today)){e.air_date=m.airdate;fill.push(k+' date')}
  if((!e.name||/^Episode \d+$/.test(e.name))&&m.name){e.name=m.name;fill.push(k+' title')}
  if(!e.overview&&m.summary){e.overview=m.summary.replace(/<[^>]+>/g,'').trim();fill.push(k+' plot')}
  if(!e.runtime&&m.runtime){e.runtime=m.runtime;fill.push(k+' runtime')}});
 if($('er').checked&&K().o){try{const j=await(await fetch(`https://www.omdbapi.com/?i=${S.d.external_ids.imdb_id}&Season=${n}&apikey=${K().o}`)).json();
  (j.Episodes||[]).forEach(x=>{const e=sel.find(y=>y.episode_number==+x.Episode);if(e&&x.imdbRating&&x.imdbRating!='N/A')e.imdb=x.imdbRating})}catch(e){}}
 const ok=e=>force||(e.air_date&&e.air_date<=today);
 sel.filter(e=>!ok(e)).forEach(e=>un.push(`S${pad(n)}E${pad(e.episode_number)} ${e.air_date||'no date'}`));
 return{n,season:s,eps:sel.filter(ok)}}
async function loadSeason(){try{const v=$('sn').value,batch=v=='all',l=await tvm(),today=new Date().toISOString().slice(0,10),force=$('fu').checked,fill=[],un=[],sets=[],
 ns=batch?S.d.seasons.filter(s=>s.season_number>0).map(s=>s.season_number):[+v],a=batch?1:+$('ef').value||1,b=batch?999:+$('et').value||999;
 for(let i=0;i<ns.length;i++){msg(`Loading season ${ns[i]} (${i+1}/${ns.length})…`);const st=await prep(ns[i],l,a,b,force,today,fill,un);if(st.eps.length)sets.push(st)}
 flags=flags.filter(f=>!/^(Not aired|Season is new|Source|TMDB and TVmaze|TVmaze|TMDB was missing|Per-episode)/.test(f));
 if(fill.length)flags.push('TMDB was missing data, filled from TVmaze: '+fill.join(', ')+'. Check these before saving.');
 if(un.length)flags.push('Not aired yet, excluded: '+un.join(', ')+'. Tick "Include episodes not yet marked as aired" if they have actually aired.');
 if($('er').checked){const all=sets.flatMap(x=>x.eps);flags.push(K().o?`Per-episode IMDb ratings found for ${all.filter(e=>e.imdb).length} of ${all.length} episodes; unrated ones are left out. Scores for new episodes are early.`:'No OMDb key: per-episode ratings omitted.')}
 const last=sets.at(-1)?.eps.filter(e=>e.air_date).at(-1)?.air_date;if(last&&(Date.now()-new Date(last))/864e5<45)flags.push('Season is new or ongoing: ratings are early and volatile.');
 S.sets=sets;S.batch=batch;S.sn=ns[0];S.season=sets[0]?.season||{};S.eps=sets[0]?.eps||[];
 if(!batch)await cross(l);render();
 }catch(x){msg(x.message)}}
async function cross(l){try{if(!l)throw 0;const n=s=>(s||'').toLowerCase().replace(/[^a-z0-9]/g,''),df=[];
 S.eps.forEach(e=>{const m=l.find(x=>x.season==S.sn&&x.number==e.episode_number),k='E'+pad(e.episode_number);
  if(!m)df.push(k+' missing on TVmaze');else{if(n(m.name)!=n(e.name))df.push(`${k} title: TMDB "${e.name}" vs TVmaze "${m.name}"`);
  if(m.airdate&&e.air_date&&m.airdate!=e.air_date)df.push(`${k} date: TMDB ${e.air_date} vs TVmaze ${m.airdate}`)}});
 flags.push(df.length?'Source mismatch (TMDB used, edit below if needed): '+df.slice(0,6).join('; '):'TMDB and TVmaze agree on titles and dates.')
 }catch(e){flags.push('TVmaze cross-check unavailable.')}}
function render(){const{ty,d,om}=S;let h='';
 if(flags.length)h+='<div class="fl"><b>Flags</b><ul>'+flags.map(f=>`<li>${esc(f)}</li>`).join('')+'</ul></div>';
 h+=`<p class="m">${ty=='tv'?'Series-level':'Movie'} ratings from OMDb: IMDb ${om.imdb?om.imdb+' ('+Number(om.votes).toLocaleString()+' votes)':'n/a'}, Rotten Tomatoes critics ${om.rt!=null?om.rt+'%':'n/a'}</p>`;
 if(ty=='movie')h+=`<label>Title<input id="mt0" value="${esc(d.title)}"></label><label>Runtime (min)<input id="mr" value="${d.runtime||''}"></label><label>Tagline<input id="mg" value="${esc(d.tagline)}"></label><label>Plot<textarea id="mp" rows="5">${esc(d.overview)}</textarea></label>`;
 else if(S.batch)h+=`<h3>${S.sets.length} seasons, ${S.sets.reduce((a,x)=>a+x.eps.length,0)} episodes</h3><p class="m">`+S.sets.map(x=>`Season ${x.n}: ${x.eps.length}`).join(' · ')+'</p><p class="m">Batch mode skips per-episode editing and the manual season scores. Use a single season to edit.</p>';
 else h+=`<label>Season plot<textarea id="sp" rows="3">${esc(S.season.overview||d.overview)}</textarea></label><h3>Season ${S.sn} ratings</h3><p class="m">Optional. Type the season scores from rottentomatoes.com; they go in the season file only.</p><div class="g"><input id="mt" placeholder="Tomatometer %"><input id="mc" placeholder="Review count"><input id="pm" placeholder="Popcornmeter %"></div><h3>Episodes</h3>`+
  S.eps.map((e,i)=>`<div class="ep"><div class="h"><input data-i="${i}" data-f="name" value="${esc(e.name)}" aria-label="Title E${e.episode_number}"><input data-i="${i}" data-f="rt" value="${e.runtime||''}" placeholder="min" aria-label="Runtime"></div><textarea data-i="${i}" data-f="ov" rows="3" aria-label="Plot">${esc(e.overview)}</textarea></div>`).join('')||'<p class="m">No aired episodes in that range.</p>';
 if(ty=='movie'||S.sets.length){const I=S.img,sp=ty=='tv'?S.sets.filter(x=>x.season.poster_path):[],tn=ty=='tv'?S.sets.flatMap(x=>x.eps.filter(e=>e.still_path)):[],te=ty=='tv'?S.sets.reduce((a,x)=>a+x.eps.length,0):0;
  h+='<h3>Images</h3><div class="im">'+[['poster','Poster'],['backdrop','Backdrop'],['logo','Logo']].map(([k,t])=>I[k]?`<label><input type="checkbox" id="i_${k}" style="width:auto"> ${t}<img src="https://image.tmdb.org/t/p/w185${I[k]}" alt="${t}"></label>`:`<label class="m">${t}: not available</label>`).join('')+(ty=='tv'?(sp.length?`<label><input type="checkbox" id="i_season" style="width:auto"> ${S.batch?'Season posters ('+sp.length+')':'Season '+S.sn+' poster'}<img src="https://image.tmdb.org/t/p/w185${sp[0].season.poster_path}" alt="Season poster"></label>`:'<label class="m">Season poster: not available</label>')+(tn.length?`<label><input type="checkbox" id="i_thumbs" style="width:auto"> Episode thumbnails (${tn.length} of ${te})</label>`:'<label class="m">Episode thumbnails: not available</label>'):'')+'</div><label>Image size<select id="isz"><option value="m">Medium (faster, smaller files)</option><option value="o">Original (largest, slower)</option></select></label>';
  h+='<button id="dl">Download files</button>'}
 $('out').innerHTML=h;if($('dl'))$('dl').onclick=download}
