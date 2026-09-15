'use strict';
// Front camera photos belong to a place and a moment, never to a contact avatar.
const SELFIE_ROOMS=ROOMS.map(r=>r.id);
function selfieLocation(){
 if(S.night?.escapeStep>=3||S.ending==='escape')return 'street';
 if(S.checked)return SELFIE_ROOMS.includes(S.currentRoom)?S.currentRoom:'hall';
 return S.arrived||S.nav?.elapsed>0?'street':'home';
}
function selfieIdentity(){return isHaunted()&&(S.twoPaths?.choice==='replacement'||S.twoPaths?.committed)?'zhou':'player';}
function selfieAsset(){const location=selfieLocation();return `selfie-${location==='home'?'player':selfieIdentity()}-${location}.png`;}
const defaultsBeforeSelfies=v2Defaults;
v2Defaults=s=>{defaultsBeforeSelfies(s);s.selfies??=[];if(!s.selfieVersion){s.selfieVersion=1;if(s.checked&&['sleeping','awake','escaping'].includes(s.night.phase))s.currentRoom=s.night.escapeStep>=1?'bath':'bed';}return s;};
v2Defaults(S);

const cameraDrawBeforeSelfies=drawCamera;
drawCamera=()=>{
 if(S.lens!=='front')return cameraDrawBeforeSelfies();
 const canvas=$('#camera-canvas');if(!canvas)return;
 const asset=selfieAsset(),img=loadImage(asset);
 canvas.dataset.asset=asset;canvas.setAttribute('aria-label','前置相机取景');
 const draw=()=>{
  if(!canvas.isConnected||S.lens!=='front'||selfieAsset()!==asset)return;
  const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio,2);
  canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);
  const ctx=canvas.getContext('2d'),scale=Math.max(canvas.width/img.naturalWidth,canvas.height/img.naturalHeight)*Math.max(1,S.zoom||1);
  const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
  ctx.drawImage(img,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
  canvas.dataset.loaded=asset;
 };
 if(img.complete&&img.naturalWidth)draw();else img.addEventListener('load',draw,{once:true});
};

const captureBeforeSelfies=capture;
capture=id=>{
 if(S.lens!=='front'){
  const before=S.photos.length;captureBeforeSelfies(id);
  if(S.photos.length>before){S.latestCameraPhoto={room:id};save();render();}
  return;
 }
 if(R.busy||S.ending)return;
 const asset=selfieAsset(),index=S.savedImages.length;
 S.savedImages.push(asset);
 S.selfies.push({asset,index,at:time(),minute:S.time,location:selfieLocation(),identity:selfieIdentity()});
 S.latestCameraPhoto={index};
 tone('shutter');save();render();
 if(S.flash){$('#flash').className='on';setTimeout(()=>$('#flash').className='',160);}
 notify('照片','照片已保存。','photos');
};

const cameraViewBeforeSelfies=VIEWS.camera;
VIEWS.camera=()=>{
 const html=cameraViewBeforeSelfies(),latest=S.latestCameraPhoto;
 if(!latest||latest.index===undefined||!S.savedImages[latest.index])return html;
 const original=B('latest-photo',S.photos.length?`<img src="assets/${room(S.photos.at(-1).room).photo}" alt="最近照片">`:I('photos'),'thumb');
 return html.replace(original,B('latest-photo',`<img src="assets/${esc(S.savedImages[latest.index])}" alt="最近照片">`,'thumb'));
};
const latestBeforeSelfies=ACTIONS['latest-photo'];
ACTIONS['latest-photo']=()=>{const last=S.latestCameraPhoto;if(last?.index!==undefined&&S.savedImages[last.index])return ACTIONS['saved-view']({index:last.index});return latestBeforeSelfies();};

// Sleeping and moving through the escape route also move the player physically.
const deliveryBeforeSelfies=deliveryEvent;
deliveryEvent=q=>{if(q.event==='night-sleep')S.currentRoom='bed';deliveryBeforeSelfies(q);};
const routeBeforeSelfies=nightRoute;
nightRoute=route=>{const before=S.night.escapeStep;routeBeforeSelfies(route);if(S.night.escapeStep>before&&!S.ending){S.currentRoom='bath';save();}};
const textBeforeSelfies=window.render_game_to_text;
window.render_game_to_text=()=>JSON.stringify({...JSON.parse(textBeforeSelfies()),camera:{lens:S.lens,location:selfieLocation(),identity:selfieIdentity(),asset:S.lens==='front'?selfieAsset():null,selfieCount:S.selfies.length}});
save();render();
