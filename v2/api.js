// Calls to TMDB, OMDb and TVmaze.
async function tm(p,x=''){if(!K().t)throw new Error('Add your TMDB key first.');const r=await fetch(`${T}${p}?api_key=${K().t}&language=en-US${x}`);if(!r.ok)throw new Error('TMDB error '+r.status);return r.json()}
async function omdb(id){const k=K().o;
 if(!k){flags.push('No OMDb key: IMDb and Rotten Tomatoes ratings omitted.');return{}}
 if(!id){flags.push('No IMDb id found: ratings omitted.');return{}}
 try{const j=await(await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${k}`)).json();
  if(j.Response=='False'){flags.push('OMDb: '+j.Error);return{}}
  const rt=(j.Ratings||[]).find(r=>r.Source=='Rotten Tomatoes'),ok=v=>v&&v!='N/A';
  return{imdb:ok(j.imdbRating)?j.imdbRating:null,votes:ok(j.imdbVotes)?j.imdbVotes.replace(/\D/g,''):null,rt:rt?parseInt(rt.Value):null}
 }catch(e){flags.push('OMDb request failed: '+e.message);return{}}}
async function imgs(ty,d){let lg=null;
 try{const im=await tm(`/${ty}/${d.id}/images`,'&include_image_language=en,null'),L=(im.logos||[]).filter(x=>x.file_path.endsWith('.png')).sort((a,b)=>(b.iso_639_1=='en')-(a.iso_639_1=='en')||b.vote_average-a.vote_average);lg=L[0]?.file_path}catch(e){}
 return{poster:d.poster_path,backdrop:d.backdrop_path,logo:lg}}
async function tvm(){try{const id=S.d.external_ids?.imdb_id,sh=await(await fetch('https://api.tvmaze.com/lookup/shows?imdb='+id)).json();return await(await fetch(`https://api.tvmaze.com/shows/${sh.id}/episodes`)).json()}catch(e){return null}}
