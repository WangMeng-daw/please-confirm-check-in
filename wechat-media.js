'use strict';
const mediaDefaultsBefore=v2Defaults;v2Defaults=s=>{mediaDefaultsBefore(s);if(!s.forum.repairAuthorVersion){const replacements={'我当年说的是右边，但那架铁梯前天已经拆了。':'我当年走的是右边。后来那里一直在施工，我没再进去过。','你搜我新发的维修进度，别照着旧聊天走。':'今晚的路我不敢替你认。找现场维修人员最近发的记录，别只照着我的旧聊天走。'};for(const account of Object.values(s.forum.dm?.accounts||{}))for(const thread of Object.values(account.threads||{}))for(const m of thread.messages||[])if(replacements[m.text])m.text=replacements[m.text];for(const q of s.forum.dm?.pending||[])if(replacements[q.text])q.text=replacements[q.text];s.forum.repairAuthorVersion=1;}return s;};v2Defaults(S);
// Selecting and previewing are local; only the green Send button writes a message.
function wxMediaState(){return S.social.mediaPicker??={to:'',selected:[],preview:'',original:false};}
function wxMediaItems(){return [...S.photos].reverse().map(p=>({key:'room:'+p.room,room:p.room,asset:room(p.room).photo,label:room(p.room).name+'照片',at:p.at})).concat([...new Set([...(S.savedImages||[]),...(S.social.savedImages||[])])].map((asset,i)=>({key:'saved:'+i,asset,label:'保存的图片',at:''})));}
function wxMediaCanSend(to){return S.accounts.wechat==='player'&&!S.ending&&!!S.messages[to]&&(to!=='hr'||S.contactAccepted);}
function wxMediaSendButton(){const n=wxMediaState().selected.length;return '<button class="wx-media-send" data-action="wx-media-send" '+(!n?'disabled':'')+'>发送'+(n?'('+n+')':'')+'</button>';}
function wxMediaPicker(){
 const m=wxMediaState();if(!wxMediaCanSend(m.to))return appHeader('照片','wx-list')+'<p class="empty">请返回聊天后重新选择。</p>';
 const items=wxMediaItems();m.selected=m.selected.filter(k=>items.some(p=>p.key===k));
 if(S.view==='media-preview'){
  const item=items.find(p=>p.key===m.preview)||items[0];if(!item)return wxMediaGrid();const index=m.selected.indexOf(item.key);
  return '<div class="wx-media-preview-head">'+B('wx-media-grid',I('back'),'',{label:'返回相册'})+'<span>'+esc(item.at||'照片')+'</span>'+B('wx-media-toggle',index<0?'○':String(index+1),index<0?'wx-preview-select':'wx-preview-select selected',{key:item.key,label:index<0?'选择这张照片':'取消选择'})+'</div><div class="scroll wx-media-preview-image"><img src="assets/'+esc(item.asset)+'" alt="'+esc(item.label)+'"></div><div class="wx-media-footer">'+B('wx-media-original',(m.original?'◉':'○')+' 原图')+wxMediaSendButton()+'</div>';
 }
 return wxMediaGrid();
}
function wxMediaGrid(){const m=wxMediaState(),items=wxMediaItems();return '<header class="wx-media-header">'+B('wx-media-cancel','取消')+'<b>最近项目</b>'+wxMediaSendButton()+'</header><div class="scroll wx-media-scroll"><div class="wx-media-grid">'+items.map(p=>{const i=m.selected.indexOf(p.key);return '<div class="wx-media-tile">'+B('wx-media-preview','<img src="assets/'+esc(p.asset)+'" alt="'+esc(p.label)+'">','wx-media-thumb',{key:p.key})+B('wx-media-toggle',i<0?'':String(i+1),'wx-media-check'+(i<0?'':' selected'),{key:p.key,label:(i<0?'选择':'取消选择')+p.label})+'</div>';}).join('')+'</div>'+(!items.length?'<p class="empty">暂无照片</p>':'')+'</div><footer class="wx-media-footer">'+B('wx-media-preview-selected','预览'+(m.selected.length?'('+m.selected.length+')':'')) +B('wx-media-original',(m.original?'◉':'○')+' 原图')+'</footer>';}
let wxAttachmentContact='';
const mediaChatBefore=wxChat;wxChat=id=>{const html=mediaChatBefore(id);if(wxAttachmentContact!==id||!wxMediaCanSend(id)||!html.includes('id="chat-form"'))return html;return html+'<div class="wx-attachment-panel">'+B('wx-media-open','<span>'+I('photos')+'</span><small>相册</small>','',{id})+B('wx-media-camera','<span>'+I('camera')+'</span><small>拍摄</small>','',{id})+B('call','<span>'+I('phone')+'</span><small>语音通话</small>','',{id})+'</div>';};
const mediaViewBefore=VIEWS.wechat;VIEWS.wechat=()=>['media-picker','media-preview'].includes(S.view)?wxMediaPicker():mediaViewBefore();
ACTIONS['wx-attach']=d=>{if(!wxMediaCanSend(d.id))return;wxAttachmentContact=wxAttachmentContact===d.id?'':d.id;render();};
ACTIONS['wx-media-open']=d=>{if(!wxMediaCanSend(d.id))return;S.social.mediaPicker={to:d.id,selected:[],preview:'',original:false};wxAttachmentContact='';open('wechat','media-picker');};
ACTIONS['wx-media-camera']=()=>{wxAttachmentContact='';open('camera',S.currentRoom||'hall');};
ACTIONS['wx-media-toggle']=d=>{const m=wxMediaState();if(!wxMediaItems().some(p=>p.key===d.key))return;const i=m.selected.indexOf(d.key);if(i>=0)m.selected.splice(i,1);else if(m.selected.length<9)m.selected.push(d.key);save();const y=$('.wx-media-scroll')?.scrollTop||0;render();if($('.wx-media-scroll'))$('.wx-media-scroll').scrollTop=y;};
ACTIONS['wx-media-preview']=d=>{if(!wxMediaItems().some(p=>p.key===d.key))return;wxMediaState().preview=d.key;open('wechat','media-preview');};
ACTIONS['wx-media-preview-selected']=()=>{const m=wxMediaState();if(m.selected.length)ACTIONS['wx-media-preview']({key:m.selected[0]});};
ACTIONS['wx-media-grid']=()=>open('wechat','media-picker');
ACTIONS['wx-media-original']=()=>{wxMediaState().original=!wxMediaState().original;save();render();};
ACTIONS['wx-media-cancel']=()=>{const to=wxMediaState().to;S.social.mediaPicker=null;wxAttachmentContact='';open('wechat',to||'chats');};
ACTIONS['wx-media-send']=()=>{
 const m=wxMediaState(),to=m.to;if(!wxMediaCanSend(to))return;
 const items=wxMediaItems(),selected=m.selected.map(k=>items.find(p=>p.key===k)).filter(Boolean).slice(0,9);if(!selected.length)return;
 S.social.mediaPicker=null;wxAttachmentContact='';
 for(const p of selected){
  if(p.room&&!(to==='hr'&&S.redemption.contactPhase!=='research'))nightShare(p.room,to);
  else{appendWx(to,'',true,p.room?{image:p.room}:{mediaAsset:p.asset});if(!threadPending('wx',to)){if(to==='hr'&&S.redemption.contactPhase==='guiding')wxQueue('hr',['你发来的，我看见了。你想对我说什么。']);else wxQueue(to,[to==='hr'?'我看见图片了。你想说什么？':'图片收到了。']);}}
 }
 save();open('wechat',to);
};
ACTIONS['wx-message-image']=d=>{const asset=d.room?room(d.room)?.photo:d.asset;if(!asset)return;$('#modal').innerHTML='<section class="wx-chat-image-viewer">'+B('close',I('back'),'wx-chat-image-close',{label:'返回聊天'})+'<img src="assets/'+esc(asset)+'" alt="聊天图片原图"></section>';};
const mediaTextBefore=window.render_game_to_text;window.render_game_to_text=()=>{const data=JSON.parse(mediaTextBefore());if(S.app==='wechat'&&['media-picker','media-preview'].includes(S.view))data.mediaPicker={recipient:wxMediaState().to,selected:wxMediaState().selected,preview:wxMediaState().preview};return JSON.stringify(data);};
save();render();
