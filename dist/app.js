const handles=['theovonaction','ducktheoryone','foxbarra','ManBarra'];
const fmt=n=>new Intl.NumberFormat('en-US').format(n);
function el(tag,text,cls){const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n}
let lastSnapshot;
let loading=false;
const feedback=el('p','','meta');feedback.setAttribute('role','status');document.querySelector('#status').after(feedback);
async function load(){
 if(loading)return;loading=true;
 try{
  const response=await fetch('data.json?t='+Date.now(),{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Snapshot file unavailable');const data=await response.json();
  if(lastSnapshot&&data.updatedAt!==lastSnapshot)feedback.textContent='A new snapshot was loaded automatically.';
  lastSnapshot=data.updatedAt;
  const stale=data.updatedAt&&Date.now()-Date.parse(data.updatedAt)>3600000;
  document.querySelector('#status').textContent=data.updatedAt?`${stale?'Updates delayed · ':''}Last collected ${new Date(data.updatedAt).toLocaleString()} · Snapshots collected automatically when GitHub runs the scheduled job`:'Waiting for the first snapshot. Collection starts after the API key is configured.';
  const grid=document.querySelector('#channels');grid.replaceChildren();
  for(const handle of handles){
   const c=data.channels.find(x=>x.handle===handle);const card=el('article');const heading=el('h2');const link=el('a',c?.title||'@'+handle);link.href='https://www.youtube.com/@'+handle;heading.append(link);card.append(heading,el('p','48h view-count increase','label'));
   card.append(el('p',c?.increase48h!=null?`${c.increase48h>0?'+':''}${fmt(c.increase48h)}`:'—','count'));
   card.append(el('p',c?.increase48h!=null?`Compared with snapshot from ${new Date(c.baselineAt).toLocaleString()}`:c?'Waiting for a snapshot at least 48 hours after tracking began…':'Not connected yet','meta'));
   const v=el('div',null,'video');
   if(c?.latest){const video=c.latest;if(video.thumbnail){const img=el('img');img.src=video.thumbnail;img.alt='';v.append(img)}const details=el('div');details.append(el('p','LATEST VIDEO','label'));const a=el('a',video.title);a.href='https://www.youtube.com/watch?v='+encodeURIComponent(video.id);details.append(a,el('strong',fmt(video.views)+' views'),el('p',new Date(video.publishedAt).toLocaleString(),'meta'));v.append(details)}else{v.append(el('p',c?'No public video found.':'Latest video appears after the first collection.','meta'))}card.append(v);grid.append(card);
  }
 }catch{feedback.textContent='Could not check for updates. Your displayed counts have been kept. Try again.'}finally{loading=false}
}
load();setInterval(()=>load(),60000);
