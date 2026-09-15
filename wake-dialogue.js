'use strict';
function newWakeStory(advanced=false){return {version:1,toldFriend:advanced,friendReady:advanced,situation:advanced,situationDone:advanced,avatar:advanced,avatarDone:advanced,crying:advanced,cryingDone:advanced,debrief:advanced,debriefDone:advanced,escapeAsked:advanced,escapeDone:advanced,legacy:advanced};}
const defaultsBeforeWakeStory=v2Defaults;
v2Defaults=s=>{defaultsBeforeWakeStory(s);if(!s.wakeStory)s.wakeStory=newWakeStory(!!(s.night.talked||s.night.lure||s.twoPaths.offered||s.twoPaths.employer||s.night.escapeStep));return s;};v2Defaults(S);
function wakeForumReady(){return S.wakeStory.debriefDone&&(S.wakeStory.legacy||['awake','door','last','building','north-survived','replacement-rumor','power-notice','same-number'].some(id=>S.forum.reads.includes(id)));}
function wakeQuestionsDone(){return S.wakeStory.situationDone&&S.wakeStory.avatarDone&&S.wakeStory.cryingDone;}
function cryWakeSound(){
 if(!S.settings.sound||R.muted)return;
 try{audioCtx??=new(window.AudioContext||window.webkitAudioContext)();audioCtx.resume().catch(()=>{});const start=audioCtx.currentTime,filter=audioCtx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=950;filter.connect(audioCtx.destination);
 for(let i=0;i<3;i++){const t=start+i*1.05,osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='triangle';osc.frequency.setValueAtTime(370-i*18,t);osc.frequency.exponentialRampToValueAtTime(520-i*15,t+.25);osc.frequency.exponentialRampToValueAtTime(235,t+.82);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.021,t+.18);gain.gain.exponentialRampToValueAtTime(.0001,t+.92);osc.connect(gain);gain.connect(filter);osc.start(t);osc.stop(t+1);}
 }catch{}
}
nightWake=()=>{
 S.night.wakeIntroDone=false;S.night.phase='awake';S.night.sleepMs=0;S.currentRoom='bed';S.time=Math.max(S.time+60,1573);S.queue=[];S.wakeStory=newWakeStory();
 S.messages.friend.push({text:time(),system:true,at:time()});R.notice=null;R.noticeLeft=0;renderNotice();
 cryWakeSound();save();nightCheckpoint();open('wechat','friend');
};
nightWakeMessagesReady=()=>wakeQuestionsDone();

function wakeSend(kind,text){
 const w=S.wakeStory,id=kind==='friend'||kind==='debrief'?'friend':'hr';
 if(!isHaunted()||S.ending||threadPending('wx',id))return;
 const say=value=>appendWx(id,text||value,true);
 if(kind==='friend'&&!w.toldFriend){
  w.toldFriend=true;say('小张，我被一个女人的哭声吵醒了。像在隔壁，又像就在床边。');
  wxQueue(id,['我在。先把灯打开，别开门出去。','有没有可能是隔壁住户？你先找周先生问清楚，他不是这套房的负责人吗？',{text:'问完告诉我。我不睡了，等你。',event:'wake-friend-ready'}],1800);
 }else if(kind==='situation'&&w.friendReady&&!w.situation){
  w.situation=true;say('周先生，房间里发生什么了？我被一个女人的哭声吵醒了。');
  wxQueue(id,['你醒了？','我这里一直显示，你还在睡。',{text:'先别下床。她哭的时候，不喜欢有人站着。',event:'wake-situation-ready'}],2100);
 }else if(kind==='avatar'&&w.situationDone&&!w.avatar){
  w.avatar=true;say('你的头像怎么回事？刚才明明不是这张脸。biss上的职位怎么也删了？');
  wxQueue(id,['我没换过。','你刚来时，看到的是它愿意让你看到的。',{text:'别把头像放大。它会以为你在认它。',event:'wake-avatar-ready'}],2100);
 }else if(kind==='crying'&&w.situationDone&&!w.crying){
  w.crying=true;say('那个女人是谁？为什么一直哭？我试了门窗，都打不开。');
  wxQueue(id,['她在等人回家。等很久了。','不是门窗打不开。是她还没决定让谁出去。',{text:'如果哭声停了，就把脚收回被子里。别低头找她。',event:'wake-crying-ready'}],2200);
 }else if(kind==='debrief'&&wakeQuestionsDone()&&!w.debrief){
  w.debrief=true;S.night.talked=true;say('他说哭的是等人回家的女人，还说别下床。他头像变成了一张死人脸，职位也删了，门窗都打不开。');
  wxQueue(id,['这不是正常的工作。你先别按他说的做。','把地址留给我，我现在过去。你看看睡前拍的照片，有没有什么不一样。',{text:'在网上搜搜槐安里604。去贴吧找以前住过的人，尤其是后来怎么离开的，别只听周先生一个人说。',event:'wake-debrief-ready'}],1900);
 }else if(kind==='escape'&&wakeForumReady()&&!w.escapeAsked){
  w.escapeAsked=true;say('我在贴吧找到了这套房子以前的记录。你到底知道什么？我怎么才能出去？');
  wxQueue(id,['你找到他了。','他也问过同一句话。后来，他把手机里的名字改了。','房间要留一个醒着的人。你想走，就得让它看见别的人。',{text:'有人从窗外走过。也有人，等来了下一位。你想问哪一种？',event:'wake-escape-ready'}],2200);
 }else return;
 save();render();
}
Object.assign(ACTIONS,{'wake-friend':()=>wakeSend('friend'),'wake-situation':()=>wakeSend('situation'),'wake-avatar':()=>wakeSend('avatar'),'wake-crying':()=>wakeSend('crying'),'wake-debrief':()=>wakeSend('debrief'),'wake-escape':()=>wakeSend('escape')});
ACTIONS['wake-window']=()=>{const w=S.wakeStory;if(!w.escapeDone||w.windowAsked||threadPending('wx','hr'))return;w.windowAsked=true;appendWx('hr','从窗外走的人，是怎么出去的？',true);wxQueue('hr',['那条路，我没走过。','以前有个人没有接我的电话。后来，这里就听不见他的呼吸了。','你既然找到了旧记录，就去问留下那些话的人。别问我。'],2200);save();render();};
nightPanic=()=>wakeSend('debrief');
const wakeDeliveryBefore=deliveryEvent;
deliveryEvent=q=>{wakeDeliveryBefore(q);const map={'wake-friend-ready':'friendReady','wake-situation-ready':'situationDone','wake-avatar-ready':'avatarDone','wake-crying-ready':'cryingDone','wake-debrief-ready':'debriefDone','wake-escape-ready':'escapeDone'};if(map[q.event]){S.wakeStory[map[q.event]]=true;if(wakeQuestionsDone())S.night.wakeIntroDone=true;save();if(q.event==='wake-debrief-ready')nightCheckpoint();}};

const chatBeforeWakeStory=wxChat;
wxChat=id=>{
 let html=chatBeforeWakeStory(id);if(!isHaunted()||S.ending||!['hr','friend'].includes(id))return html;
 const w=S.wakeStory,n=S.night,t=S.twoPaths,pending=threadPending('wx',id);
 if(id==='friend'&&w.debriefDone){
  if(n.escapeStep===0&&!n.lure&&!n.seenPhotos.length)html=html.replace(/<div class="chat-choices">[\s\S]*?<\/div>/,'');
  return html;
 }
 const buttons=[];
 if(!pending&&id==='friend'){
  if(!w.toldFriend)buttons.push(B('wake-friend','我被一个女人的哭声吵醒了。'));
  else if(wakeQuestionsDone()&&!w.debrief)buttons.push(B('wake-debrief','周先生的回答太奇怪了，门窗也打不开。'));
 }
 if(!pending&&id==='hr'){
  if(w.friendReady&&!w.situation)buttons.push(B('wake-situation','房间里发生什么了？我听到了女人哭。'));
  if(w.situationDone&&!w.avatar)buttons.push(B('wake-avatar','你的头像怎么回事？职位为什么删了？'));
  if(w.situationDone&&!w.crying)buttons.push(B('wake-crying','那个女人是谁？为什么哭，门窗为什么打不开？'));
  if(wakeForumReady()&&!w.escapeAsked)buttons.push(B('wake-escape','贴吧里也有人遇到过。我怎么才能出去？'));
  if(w.escapeDone){
   if(!w.windowAsked&&!t.committed)buttons.push(B('wake-window','从窗外走的人，是怎么出去的？'));
   if(!t.offered)buttons.push(B('two-offer','你说的等来下一位，是什么意思？'));
   else if(!t.employer)buttons.push(B('two-accept','我去找他留下的账号。'),B('two-refuse','我不会找人来替我。'));
   else if(!t.committed&&t.stage!=='withdrawn')buttons.push(accountHandoverKnown()?B('open','打开biss直聘','',{app:'biss'}):B('open','看看网上留下的记录','',{app:'browser'}),B('two-withdraw','我不做了，撤回招聘。'));
  }
  if(wakeForumReady()&&n.lurePhoto==='bed'&&!n.lure)buttons.push(B('night-hr','我还在床上，没醒。','',{text:'我还在床上，没醒。'}));
 }
 html=html.replace(/<div class="chat-choices">[\s\S]*?<\/div>/,'');
 return buttons.length?twoChoices(html,buttons.join('')):html;
};
// Both buttons and free typing respect the same dialogue stages.
for(const action of ['two-offer','two-accept','two-refuse']){const before=ACTIONS[action];ACTIONS[action]=d=>{if(!S.wakeStory.escapeDone||!wakeForumReady()||threadPending('wx','hr'))return;return before(d);};}
const hrBeforeWakeStory=nightHr;
nightHr=text=>{if(!S.wakeStory.debriefDone)return;return hrBeforeWakeStory(text);};
const shareBeforeWakeStory=nightShare;
nightShare=(id,to)=>{if(to==='hr'&&isHaunted()&&!S.wakeStory.debriefDone){if(hasPhoto(id)){appendWx('hr','',true,{image:id});save();open('wechat','hr');}return;}return shareBeforeWakeStory(id,to);};
const replyBeforeWakeStory=wxReply;
reply=wxReply=(id,text)=>{
 text=text.trim();if(!text)return;
 if(!isHaunted()||!['friend','hr'].includes(id))return replyBeforeWakeStory(id,text);
 const w=S.wakeStory;S.drafts[id]='';
 if(threadPending('wx',id)){appendWx(id,text,true);save();render();return;}
 if(id==='friend'){
  if(!w.toldFriend)return wakeSend('friend',text);
  if(wakeQuestionsDone()&&!w.debrief)return wakeSend('debrief',text);
  if(!w.debriefDone){appendWx(id,text,true);wxQueue(id,['我在等你，先问问周先生。别自己出去找声音。']);save();render();return;}
 }else{
  if(w.friendReady&&!w.situation)return wakeSend('situation',text);
  if(w.situationDone&&!w.avatar&&/头像|脸|职位|删除/.test(text))return wakeSend('avatar',text);
  if(w.situationDone&&!w.crying&&/哭|女人|门|窗|谁|声音/.test(text))return wakeSend('crying',text);
  if(wakeForumReady()&&!w.escapeAsked&&/逃|出去|离开|贴吧|以前|办法/.test(text))return wakeSend('escape',text);
  if(w.escapeDone&&!w.windowAsked&&/窗外|不害人|自己逃|另一条路/.test(text))return ACTIONS['wake-window']();
  if(!w.escapeDone&&/接班|替|招聘账号|给我账号|我来招/.test(text)){appendWx(id,text,true);save();render();return;}
  if(!w.debriefDone){appendWx(id,text,true);save();render();return;}
 }
 return replyBeforeWakeStory(id,text);
};
const textBeforeWakeStory=window.render_game_to_text;
window.render_game_to_text=()=>JSON.stringify({...JSON.parse(textBeforeWakeStory()),wakeStory:{...S.wakeStory,forumReady:wakeForumReady()}});
const postBeforeWakeStory=ACTIONS['forum-post'];
ACTIONS['forum-post']=d=>{postBeforeWakeStory(d);if(isHaunted()&&wakeForumReady()&&!S.night.lure&&!S.ending)nightCheckpoint();};
const previousAwakePost=FORUM_POSTS.find(p=>p.id==='awake');
previousAwakePost.text[0]='刚被一个女人的哭声吵醒。问了周先生，他反问我：你醒了？我这里明明显示你还在睡。';
save();render();
