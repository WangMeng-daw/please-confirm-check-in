'use strict';
// Task order follows the first missing room, including partially completed old saves.
function nextPhotoTask(){const i=ROOMS.findIndex(r=>!hasPhoto(r.id));return i<0?ROOMS.length-1:i;}
function expandRoomSave(s){
 if(s.roomSetVersion===8)return s;
 const completedNight=s.checked&&s.night&&(s.night.phase!=='calm'||s.queue.some(q=>q.event==='night-sleep'));
 if(completedNight||s.redemption?.restored){
  const anchor=s.photos.find(p=>p.room==='living')||s.photos[0];
  if(anchor)for(const id of ['kitchen','dining','balcony'])if(!s.photos.some(p=>p.room===id))s.photos.push({room:id,at:anchor.at,date:anchor.date});
  s.photos.sort((a,b)=>ROOMS.findIndex(r=>r.id===a.room)-ROOMS.findIndex(r=>r.id===b.room));
 }
 const firstMissing=ROOMS.findIndex(r=>!s.photos.some(p=>p.room===r.id));
 s.taskReady=firstMissing<0?ROOMS.length-1:firstMissing;
 if(s.redemption?.restored&&!s.redemption.resolved)s.redemption.finaleMs=0;
 for(const m of [...(s.messages.hr||[]),...s.queue])if(typeof m.text==='string')m.text=m.text.replace('五个位置各拍一张','八个位置各拍一张');
 s.roomSetVersion=8;return s;
}
const roomsDefaultsBefore=v2Defaults;
v2Defaults=s=>expandRoomSave(roomsDefaultsBefore(s));
v2Defaults(S);save();render();
