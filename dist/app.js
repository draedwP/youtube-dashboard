const handles=['theovonaction','ducktheoryone','foxbarra','ManBarra'];
const fmt=n=>new Intl.NumberFormat('en-US').format(n);
function el(tag,text,cls){const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n}
async function load(){
 const button=document.querySelector('#refresh');button.disabled=true;
 try{
  const response=await fetch('data.json?t='+Date.now(),{cache:'no-store'});if(!response.ok)throw Error('Snapshot file unavailable');const data=await response.json();
  const stale=data.updatedAt&&Date.now()-Date.parse(data.updatedAt)>3600000;
  document.querySelector('#status').textContent=data.updatedAt?`${stale?'Updates delayed · ':''}Last collected ${new Date(data.updatedAt).toLocaleString()} · Collection scheduled every 30 minutes`:'Waiting for the first snapshot. Collection starts after the API key is configured.';
  const grid=document.querySelector('#channels');grid.replaceChildren();
  for(const handle of handles){
   const c=data.channels.find(x=>x.handle===handle);const card=el('article');const heading=el('h2');const link=el('a',c?.title||'@'+handle);link.href='https://www.youtube.com/@'+handle;heading.append(link);card.append(heading,el('p','48h view-count increase','label'));
   card.append(el('p',c?.increase48h!=null?`${c.increase48h>0?'+':''}${fmt(c.increase48h)}`:'—','count'));
   card.append(el('p',c?.increase48h!=null?`Compared with snapshot from ${new Date(c.baselineAt).toLocaleString()}`:c?'Building 48-hour history…':'Not connected yet','meta'));
   const v=el('div',null,'video');
   if(c?.latest){const video=c.latest;if(video.thumbnail){const img=el('img');img.src=video.thumbnail;img.alt='';v.append(img)}const details=el('div');details.append(el('p','LATEST VIDEO','label'));const a=el('a',video.title);a.href='https://www.youtube.com/watch?v='+encodeURIComponent(video.id);details.append(a,el('strong',fmt(video.views)+' views'),el('p',new Date(video.publishedAt).toLocaleString(),'meta'));v.append(details)}else{v.append(el('p',c?'No public video found.':'Latest video appears after the first collection.','meta'))}card.append(v);grid.append(card);
  }
 }catch{document.querySelector('#status').textContent='Could not load snapshots. Please try again.'}finally{button.disabled=false}
}
document.querySelector('#refresh').addEventListener('click',load);load();setInterval(load,60000);
