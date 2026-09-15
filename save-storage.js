'use strict';
// Loaded before game.js so recovery runs before any boot-time autosave.
window.GameStorage=(()=>{
 // Normalize story names in existing saves, checkpoints and imported backups.
 // Internal account IDs remain stable so old conversations retain ownership.
 function migrateNames(x){
  if(!x||typeof x!=='object')return x;
  for(const k of Object.keys(x)){
   if(typeof x[k]==='string')x[k]=x[k].replaceAll('\u6797\u590f','林砚').replaceAll('\u5c0f\u590f','小砚').replaceAll('summer_after_graduation','yan_after_graduation');
   else migrateNames(x[k]);
  }
  return x;
 }
 const key='haunted-stay-v1',backupKey=key+'-backup',checkpointKey=key+'-checkpoint';
 const status={ok:true,error:'',savedAt:null,recovered:false};let backupAt=0;
 const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
 function safeTree(x){if(!x||typeof x!=='object')return true;return Object.entries(x).every(([k,v])=>!['__proto__','prototype','constructor'].includes(k)&&safeTree(v));}
 function valid(s){return object(s)&&safeTree(s)&&s.v===1&&Number.isFinite(s.time)&&s.time>=0&&typeof s.app==='string'&&typeof s.view==='string'&&object(s.messages)&&Object.values(s.messages).every(v=>Array.isArray(v)&&v.every(m=>object(m)&&(m.text===undefined||typeof m.text==='string')))&&Array.isArray(s.photos)&&s.photos.every(p=>object(p)&&['hall','living','kitchen','dining','balcony','bath','bed','door'].includes(p.room))&&Array.isArray(s.uploads)&&object(s.flags)&&object(s.settings)&&object(s.drafts);}
 function parse(raw){try{const s=JSON.parse(raw);return valid(s)?migrateNames(s):null;}catch{return null;}}
 function fail(){status.ok=false;status.error='浏览器未能保存进度。请导出存档备份，或检查网站储存权限与可用空间。';return false;}
 function read(){try{const raw=localStorage.getItem(key),main=parse(raw);if(main){status.savedAt=main.saveInfo?.savedAt||null;return main;}const recovered=parse(localStorage.getItem(backupKey));if(recovered){status.recovered=true;status.savedAt=recovered.saveInfo?.savedAt||null;try{localStorage.setItem(key,JSON.stringify(recovered));}catch{fail();}return recovered;}if(raw){localStorage.setItem(key+'-damaged',raw);status.error='原存档无法读取，已保留损坏副本；可导入之前导出的备份。';}return null;}catch{fail();return null;}}
 function write(s){if(!valid(s))return fail();migrateNames(s);const now=Date.now();s.saveInfo={version:1,savedAt:now};try{const raw=JSON.stringify(s),previous=localStorage.getItem(key);if(now-backupAt>15000&&parse(previous)){try{localStorage.setItem(backupKey,previous);backupAt=now;}catch{/* Primary saving still takes precedence when space is limited. */}}localStorage.setItem(key,raw);status.ok=true;status.error='';status.savedAt=now;return true;}catch{return fail();}}
 function readCheckpoint(){try{return parse(localStorage.getItem(checkpointKey));}catch{return null;}}
 function checkpoint(s){try{if(!valid(s))return false;localStorage.setItem(checkpointKey,JSON.stringify(s));return true;}catch{return fail();}}
 function replace(s,cp){if(!valid(s)||cp&&!valid(cp))throw Error('存档内容不完整');let oldMain,oldCheckpoint;try{oldMain=localStorage.getItem(key);oldCheckpoint=localStorage.getItem(checkpointKey);if(cp)localStorage.setItem(checkpointKey,JSON.stringify(cp));else localStorage.removeItem(checkpointKey);if(!write(s))throw Error(status.error);try{localStorage.setItem(backupKey,JSON.stringify(s));}catch{} }catch(e){try{if(oldMain)localStorage.setItem(key,oldMain);else localStorage.removeItem(key);if(oldCheckpoint)localStorage.setItem(checkpointKey,oldCheckpoint);else localStorage.removeItem(checkpointKey);}catch{}throw e;}}
 function resetBackup(){try{localStorage.removeItem(backupKey);localStorage.removeItem(key+'-damaged');backupAt=Date.now();}catch{fail();}}
 return {status,read,write,valid,readCheckpoint,checkpoint,replace,resetBackup,migrateNames};
})();
