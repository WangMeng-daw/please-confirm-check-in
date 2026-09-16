'use strict';
const button=document.querySelector('#download-button'),pause=document.querySelector('#pause-button'),statusLine=document.querySelector('#download-status'),count=document.querySelector('#download-count'),bar=document.querySelector('progress'),heading=document.querySelector('#download-title');
let worker,downloading=false,ready=false,lastStatus=null;
const mb=n=>(n/1024/1024).toFixed(1)+' MB';
function hasSave(){try{return !!localStorage.getItem('haunted-stay-v1');}catch{return false;}}
function display(s){lastStatus=s;bar.value=s.totalBytes?Math.min(100,s.bytes/s.totalBytes*100):0;count.textContent=`${mb(s.bytes)} / ${mb(s.totalBytes)}`;ready=s.cached===s.total&&s.total>0;heading.textContent=ready?'资源已就绪':downloading?'正在下载游戏资源':'准备进入604';document.body.dataset.phase=ready?'ready':downloading?'downloading':'idle';
 if(ready){statusLine.textContent='本机资源已备好，可以进入这一夜。';button.textContent=hasSave()?'继续这一夜':'开始游戏';button.disabled=false;pause.hidden=true;}
 else if(downloading){statusLine.textContent=`已完成 ${s.cached} / ${s.total} 项。请保持页面打开，下载期间不会推进游戏时间。`;button.textContent=`下载中 · ${Math.floor(bar.value)}%`;button.disabled=true;}
 else{statusLine.textContent=s.cached?`已保留 ${s.cached} / ${s.total} 项，只需补齐剩余资源。`:`首次完整下载约 ${mb(s.totalBytes)}，建议使用 Wi-Fi。`;button.textContent=s.cached?'继续下载剩余资源':'一键下载游戏资源';button.disabled=false;}}
function failure(message){downloading=false;pause.hidden=true;document.body.dataset.phase='error';statusLine.textContent=message;button.disabled=!worker||!lastStatus;button.textContent=worker?'重试剩余资源':'此浏览器无法预下载';}
function request(type,onMessage){const c=new MessageChannel();c.port1.onmessage=e=>onMessage(e.data,c);worker.postMessage({type},[c.port2]);return c;}
async function connect(){try{
 if(!('serviceWorker' in navigator)||!('caches' in window))throw Error('unsupported');
 const reg=await navigator.serviceWorker.register('resource-worker.js',{updateViaCache:'none'});
 await reg.update().catch(()=>{});
 const candidate=reg.installing||reg.waiting||reg.active;
 if(candidate&&candidate.state!=='activated')await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('timeout')),20000);candidate.addEventListener('statechange',()=>{if(candidate.state==='activated'){clearTimeout(timer);resolve();}if(candidate.state==='redundant'){clearTimeout(timer);reject(Error('install'));}});});
 worker=reg.active||(await navigator.serviceWorker.ready).active;request('STATUS',(s,c)=>{c.port1.close();if(s.error)failure(s.error);else display(s);});
 }catch{failure('暂时无法准备离线资源。你仍可直接在线游玩，或刷新后重试。');}}
button.addEventListener('click',()=>{if(ready){location.href='game.html';return;}if(!worker||downloading)return;downloading=true;pause.hidden=false;display(lastStatus);navigator.storage?.persist?.().catch(()=>{});
 request('DOWNLOAD',(s,c)=>{if(s.type==='ERROR'){c.port1.close();failure(s.error);return;}if(s.type==='DONE'||s.type==='PAUSED'){downloading=false;pause.hidden=true;c.port1.close();}display(s);if(s.failed)failure(`${s.failed} 项资源暂未下载成功。已完成的资源会保留，请重试剩余资源。`);else if(s.type==='PAUSED')statusLine.textContent='下载已暂停，已完成的资源会保留。';});});
pause.addEventListener('click',()=>{if(worker)worker.postMessage({type:'PAUSE'});});
document.querySelector('#online-link').addEventListener('click',()=>{if(downloading)worker.postMessage({type:'PAUSE'});});
window.render_game_to_text=()=>JSON.stringify({screen:'game-cover',phase:document.body.dataset.phase||'checking',ready,resources:lastStatus});window.advanceTime=()=>{};
connect();
