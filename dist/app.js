const handles=['theovonaction','ducktheoryone','foxbarra','ManBarra'];
const fmt=n=>new Intl.NumberFormat('en-US').format(n);
function el(tag,text,cls){const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n}
let lastSnapshot;
let loading=false;
const feedback=el('p','','meta');feedback.setAttribute('role','status');document.querySelector('#status').after(feedback);
const collect=el('a','Collect fresh views →');collect.href='https://github.com/draedwP/youtube-dashboard/actions/workflows/update.yml';collect.target='_blank';collect.rel='noopener noreferrer';
const help=el('p',null,'meta');help.append(collect,document.createTextNode(' · On GitHub, choose Run workflow. New counts appear after collection and publishing finish.'));feedback.after(help);
async function load(manual=false){
 if(loading)return;loading=true;
 const button=document.querySelector('#refresh');button.disabled=true;button.textContent='Checking…';
 if(manual)feedback.textContent='Checking for a newer published snapshot…';
 try{
  const response=await fetch('data.json?t='+Date.now(),{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Snapshot file unavailable');const data=await response.json();
  if(manual)feedback.textContent=`Checked at ${new Date().toLocaleTimeString()}. `+(data.updatedAt===lastSnapshot?'No newer snapshot yet. Collection is scheduled every 30 minutes; GitHub may delay runs.':'Loaded the latest published snapshot.');
  else if(lastSnapshot&&data.updatedAt!==lastSnapshot)feedback.textContent='A new snapshot was loaded automatically.';
  lastSnapshot=data.updatedAt;
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
 }catch{feedback.textContent='Could not check for updates. Your displayed counts have been kept. Try again.'}finally{loading=false;button.disabled=false;button.textContent='Refresh snapshot'}
}
document.querySelector('#refresh').addEventListener('click',()=>load(true));load();setInterval(()=>load(),60000);
