import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const HOUR=3600000;
export function baseline(history,now){const target=now-48*HOUR;const tolerance=6*HOUR;return history.filter(p=>Math.abs(p.at-target)<=tolerance).sort((a,b)=>Math.abs(a.at-target)-Math.abs(b.at-target)||a.at-b.at)[0]||null}
async function api(resource,params,key){const url=new URL('https://www.googleapis.com/youtube/v3/'+resource);for(const [k,v]of Object.entries({...params,key}))url.searchParams.set(k,v);const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok){const error=Error(`YouTube ${resource} request failed (HTTP ${r.status}); check key, quota and API enablement.`);error.status=r.status;throw error;}return r.json()}
async function main(){
 const key=process.env.YOUTUBE_API_KEY;if(!key)throw Error('Add the YOUTUBE_API_KEY repository secret first.');
 const channelRefs=JSON.parse(await readFile('channels.json','utf8'));let history={};try{history=JSON.parse(await readFile('history/snapshots.json','utf8'))}catch(e){if(e.code!=='ENOENT')throw e}
 const now=Date.now();const channels=[];
 for(const ref of channelRefs){
  const isChannelId=/^UC[\w-]{22}$/.test(ref);const lookup=isChannelId?{id:ref}:{forHandle:ref};
  const result=await api('channels',{part:'snippet,statistics,contentDetails',...lookup},key);const c=result.items?.[0];if(!c)throw Error('Channel not found: '+ref);
  const views=Number(c.statistics.viewCount);if(!Number.isSafeInteger(views))throw Error('Invalid channel count');
  const subscribers=c.statistics.hiddenSubscriberCount?null:Number(c.statistics.subscriberCount);if(subscribers!=null&&!Number.isSafeInteger(subscribers))throw Error('Invalid subscriber count');
  const points=history[c.id]||[];const base=baseline(points,now);
  let uploads={items:[]};const playlistId=c.contentDetails?.relatedPlaylists?.uploads;
  if(playlistId){try{uploads=await api('playlistItems',{part:'snippet,contentDetails',playlistId,maxResults:50},key)}catch(error){if(error.status!==404)throw error;console.log('No uploads playlist yet for '+ref)}}
  const ids=(uploads.items||[]).map(x=>x.contentDetails.videoId);let latest=null;
  if(ids.length){const videos=await api('videos',{part:'snippet,statistics,status',id:ids.join(',')},key);const v=(videos.items||[]).filter(x=>x.status.privacyStatus==='public'&&x.snippet.liveBroadcastContent!=='upcoming').sort((a,b)=>Date.parse(b.snippet.publishedAt)-Date.parse(a.snippet.publishedAt))[0];if(v)latest={id:v.id,title:v.snippet.title,publishedAt:v.snippet.publishedAt,thumbnail:v.snippet.thumbnails.medium?.url||v.snippet.thumbnails.default?.url,views:Number(v.statistics.viewCount||0)}}
  points.push({at:now,views});history[c.id]=points.filter(p=>p.at>=now-7*24*HOUR);
  channels.push({handle:ref,id:c.id,title:c.snippet.title,url:isChannelId?'https://www.youtube.com/channel/'+c.id:'https://www.youtube.com/@'+ref,subscribers,totalViews:views,increase48h:base?views-base.views:null,baselineAt:base?new Date(base.at).toISOString():null,latest});
 }
 await mkdir('history',{recursive:true});await writeFile('history/snapshots.json',JSON.stringify(history));await writeFile('dist/data.json',JSON.stringify({updatedAt:new Date(now).toISOString(),channels},null,2));
 console.log('Collected '+channels.length+' channels.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(e.message);process.exitCode=1});
