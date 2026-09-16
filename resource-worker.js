'use strict';
importScripts('resource-manifest.js');
// Cache ownership is limited to this game's scope. Save data is never touched.
const CACHE='check-in-resources-v1-'+new URL(self.registration.scope).pathname;
const manifest=self.GAME_RESOURCES,base=self.registration.scope;
const records=manifest.files.map(f=>({...f,url:new URL(f.url,base).href,key:new URL(f.url+'?asset='+f.revision,base).href}));
const byUrl=new Map(records.map(f=>[f.url,f]));
const totalBytes=records.reduce((n,f)=>n+f.bytes,0);
let job=null;
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
async function summary(cache){const keys=new Set((await cache.keys()).map(r=>r.url)),done=records.filter(f=>keys.has(f.key));return{version:manifest.version,total:records.length,cached:done.length,bytes:done.reduce((n,f)=>n+f.bytes,0),totalBytes};}
function emit(j,data){for(const port of j.ports){try{port.postMessage(data);}catch{}}}
function cacheError(e){return e?.name==='QuotaExceededError'?'本机存储空间不足。已下载的部分会保留；可腾出空间后重试，或直接在线游玩。':'资源下载暂时中断。已完成的部分会保留，请检查网络后重试。';}
async function download(j){
 try{const cache=await caches.open(CACHE),keys=new Set((await cache.keys()).map(r=>r.url)),pending=records.filter(f=>!keys.has(f.key));let state=await summary(cache),cursor=0,failed=0;
  emit(j,{type:'PROGRESS',...state});
  async function consume(){while(cursor<pending.length&&!j.paused&&!j.fatal){const f=pending[cursor++],controller=new AbortController();j.controllers.add(controller);const timer=setTimeout(()=>controller.abort(),45000);
   try{const response=await fetch(f.url,{cache:'reload',signal:controller.signal});if(!response.ok||response.type==='opaque')throw Error('HTTP '+response.status);
    // Only mark complete after the entire body and cache write succeed.
    const data=await response.arrayBuffer();if(data.byteLength!==f.bytes)throw Error('Resource version mismatch');
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==f.revision)throw Error('Resource integrity mismatch');
    const headers=new Headers(response.headers);headers.delete('content-encoding');headers.delete('content-length');
    await cache.put(f.key,new Response(data,{status:200,headers}));state.cached++;state.bytes+=f.bytes;emit(j,{type:'PROGRESS',...state});
   }catch(e){if(e.name==='QuotaExceededError'){j.fatal=e;for(const c of j.controllers)c.abort();}else if(!j.paused)failed++;}finally{clearTimeout(timer);j.controllers.delete(controller);}
  }}
  await Promise.all([consume(),consume(),consume()]);
  if(j.fatal)throw j.fatal;
  state=await summary(cache);
  if(state.cached===state.total){const keep=new Set(records.map(f=>f.key));for(const key of await cache.keys())if(!keep.has(key.url))await cache.delete(key);}
  emit(j,{type:j.paused?'PAUSED':'DONE',...state,failed});
 }catch(e){emit(j,{type:'ERROR',error:cacheError(e)});}finally{if(job===j)job=null;}
}
self.addEventListener('message',event=>{
 const type=event.data?.type,port=event.ports?.[0];
 if(type==='PAUSE'){if(job){job.paused=true;for(const c of job.controllers)c.abort();}return;}
 if(!port)return;
 if(type==='STATUS'){event.waitUntil(caches.open(CACHE).then(summary).then(s=>port.postMessage(s)).catch(e=>port.postMessage({error:cacheError(e)})));}
 if(type==='DOWNLOAD'){if(job){job.ports.push(port);event.waitUntil(job.promise);return;}const next={ports:[port],controllers:new Set(),paused:false};job=next;next.promise=download(next);event.waitUntil(next.promise);}
});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const url=new URL(req.url);if(url.origin!==location.origin)return;
 if(url.href.split('?')[0]===base)url.pathname+='index.html';url.search='';url.hash='';
 const f=byUrl.get(url.href);if(!f)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),cached=await cache.match(f.key);
  // Landing documents stay fresh when online; cached game art needs no network.
  const shell=f.url.endsWith('/index.html')||f.url.endsWith('/launch.js')||f.url.endsWith('/launch.css');
  if(cached&&!shell)return cached;
  try{const response=await fetch(req);if(response.ok)return response;if(cached)return cached;return response;}catch(e){if(cached)return cached;throw e;}
 })());
});
// manifest-version: 56d1ad9f7eb5c003
