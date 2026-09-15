'use strict';
// Replies react to evidence already read; they never supply undiscovered facts or destinations.
function rdGuideEnsure(){const r=S.redemption,g=r.guide??={started:false,last:'',sent:[]};if(g.interactionVersion!==1){g.reactionsSent=g.started?[...r.read,...(r.blogLogin?['login']:[])]:[];g.discussions={};g.replyIndex=0;g.interactionVersion=1;}return g;}
const RD_GHOST_HINTS={
 photo:'你盯着屏幕多久，我就看着你多久。别装作没听见。',
 rumor:'别人说得那么肯定。你也打算跟着说，然后把我留在这里？',
 wedding:'好听的话谁都会说。你凭什么信他。',
 waiting:'我等过了。别再叫我等。',
 login:'你停在那里做什么。又想把我关回黑里？',
 work:'几行字就够了吗。你自己也还在犹豫。',
 letter:'说到一半就不说了？我最恨这样。',
 dispatch:'你说的和我记得的不一样。别急着叫我相信。',
 news:'这些话能接得上吗。你自己再想一遍。',
 followup:'“不知道”……又是这三个字。我已经听够了。',
 original:'你确定自己看清了吗。别因为害怕，就随便回答我。'
};
const RD_GHOST_INTRO=['谁准你翻这张照片的。','周同安……这个负心汉。说好会回来，转头就跟那个女人走了。还笑。照片里他还在笑。','别把屏幕扣下。我看得见你的脸。','你不是要替他说话吗？那就把他留下的东西翻干净。敢漏掉一句……你也别走。'];
const RD_GHOST_REACTIONS={
 'rd-photo':['照片里还笑得出来。你再看我一眼。现在还像那时候吗？','我记得拍那张照片的时候。他让我靠近一点。后来，就再也没让我靠近过。'],
 'rd-rumor':['你也看见那些话了。一个传一个，谁都说得像亲眼见过。','我问过很多遍。他们都这样说。你凭什么说他们错了。'],
 'blog-wedding':['那一天，我一直记着。他写得倒轻巧。','不是随口说说。至少对我不是。别拿这个哄我。'],
 'rd-wait':['那几句话发出去以后，我等到屏幕都暗了。没有人回我。','你现在会回我。等你能走的时候呢？'],
 login:['你进去了。……这一次，不许看见了又装作没看见。','别急着退出。我还在这里。'],
 'blog-voyage':['你说他有自己的苦衷？几行字，就能把那些夜里都抵掉吗。','你刚读过的那些话，是他写的。可我没有听他当面对我说过。'],
 'blog-letter':['这些话……为什么不当面对我说。到现在，还要别人念给我听。','别替他添字。也别替他删。就照你看见的说。'],
 manifest:['纸上是一回事。门外一直没有脚步，是另一回事。你让我怎么信。','我听见你说的了。可我记了这么多年……不是一句话就能松开的。'],
 'news-report':['别念得那么快。……我还没听清。','我不喜欢你刚才停下来的样子。把话说完。'],
 'news-followup':['只有一个编号？连名字都不给，就想让我认。','别拿不相干的人来骗我。你得知道自己在说谁。'],
 original:['这回你看清了？……别急着回答。','我在听。你说的每一个字，我都听得见。']
};
function rdGuideCurrent(){
 const r=S.redemption,has=id=>r.read.includes(id),hint=key=>({key,text:RD_GHOST_HINTS[key]});
 if(!has('rd-photo'))return hint('photo');if(!has('blog-wedding'))return hint('wedding');if(!has('rd-wait'))return hint('waiting');
 if((!has('blog-voyage')||!has('blog-letter'))&&!r.blogLogin)return hint('login');if(!has('blog-voyage'))return hint('work');if(!has('blog-letter'))return hint('letter');if(!has('manifest'))return hint('dispatch');if(!has('news-report'))return hint('news');if(!has('news-followup'))return hint('followup');if(!r.originalVerified)return hint('original');return null;
}
function rdGuideKnown(){const r=S.redemption;return r.read.filter(id=>RD_GHOST_REACTIONS[id]&&rdAllowed(id));}
function rdGuideProgress(){
 const r=S.redemption,g=rdGuideEnsure();if(r.contactPhase!=='guiding'||!rdCanAct()||threadPending('wx','hr'))return;
 const known=[...rdGuideKnown().filter(id=>id!=='rd-photo'),...(r.blogLogin?['login']:[]),...(r.originalVerified?['original']:[])];
 const id=known.find(id=>!g.reactionsSent.includes(id));if(!id)return;
 g.reactionsSent.push(id);wxQueue('hr',[{text:RD_GHOST_REACTIONS[id][0],redemption:true,rdGuideSource:id}],1400);save();
}
function rdGuideStart(){
 const r=S.redemption,g=rdGuideEnsure();if(!rdCanAct()||r.contactPhase==='shen'||(r.contactPhase==='deleted'&&rdReady())||g.started)return;
 g.started=true;g.last='';r.active=true;r.contactPhase='guiding';r.step='guided-research';r.contactMs=0;S.contactAccepted=true;S.accounts.wechat='player';S.messages.hr??=[];S.queue=S.queue.filter(q=>q.id!=='hr');
 if(!S.messages.hr.some(m=>m.system&&m.text==='该账号已注销'))appendWx('hr','该账号已注销',false,{system:true,redemption:true});
 wxQueue('hr',RD_GHOST_INTRO.map((text,i)=>({text,redemption:true,rdGuideIntro:true,guideIntroIndex:i})),1500);save();
}
const guideRecordBefore=rdRecord;rdRecord=id=>{guideRecordBefore(id);if(id==='rd-photo')rdGuideStart();if(S.redemption.contactPhase==='guiding')rdGuideProgress();};
const guideGalleryBefore=ACTIONS['rd-blog-gallery'];ACTIONS['rd-blog-gallery']=d=>{guideGalleryBefore(d);rdGuideStart();};
const guideForumImageBefore=ACTIONS['forum-image'];ACTIONS['forum-image']=d=>{guideForumImageBefore(d);if(d.id==='rd-photo')rdGuideStart();};
function rdGuideSay(text,source){
 if(S.redemption.contactPhase!=='guiding'||!rdCanAct()||threadPending('wx','hr'))return;text=text.trim();if(!text)return;
 const g=rdGuideEnsure();if(source&&!rdGuideKnown().includes(source))return;
 S.drafts.hr='';appendWx('hr',text,true,{redemption:true});let answer;
 if(source){const n=g.discussions[source]??(g.reactionsSent.includes(source)?1:0);g.discussions[source]=n+1;answer=RD_GHOST_REACTIONS[source][n%2];}
 else if(/你.*是谁|注销|头像|周先生/.test(text))answer='你叫谁？他不在这里。照片里剩下的那个，才一直在。别往身后找。';
 else{const replies=[rdGuideCurrent()?.text||'我在听。把你确定的事告诉我。','你不用回头确认。我一直在。继续说。','别为了让我放你走，就把猜的说成真的。','你停下来的时候，屋里就只剩我在等。'];answer=replies[g.replyIndex++%replies.length];}
 wxQueue('hr',[{text:answer,redemption:true,rdGuideConversation:true,...(source?{rdGuideSource:source}:{})}],1400);save();render();
}
ACTIONS['rd-guide-remind']=()=>rdGuideSay('我还在查。你还在吗？');
ACTIONS['rd-guide-identity']=()=>rdGuideSay('你到底是谁？');
ACTIONS['rd-guide-findings']=()=>{if(S.redemption.contactPhase!=='guiding'||threadPending('wx','hr'))return;sheet('和她谈谈','<div class="rd-findings">'+(rdGuideKnown().map(id=>B('rd-guide-discuss','<span>'+esc(rdTitle(id))+'</span>','setting rd-findings-entry',{id})).join('')||'<p>还没有可以谈的内容。</p>')+'</div>');};
ACTIONS['rd-guide-discuss']=d=>{if(!rdGuideKnown().includes(d.id))return;close();rdGuideSay('我想和你说说《'+rdTitle(d.id)+'》里的事。',d.id);};
const findingsShenBefore=rdShenArrives;rdShenArrives=()=>{if($('.rd-findings'))close();findingsShenBefore();};
delete ACTIONS['rd-guide-open'];
const guideReplyBefore=wxReply;reply=wxReply=(id,text)=>id==='hr'&&S.redemption.contactPhase==='guiding'?rdGuideSay(text):guideReplyBefore(id,text);
const guideChatBefore=wxChat;wxChat=id=>{
 if(id!=='hr'||S.redemption.contactPhase!=='guiding')return guideChatBefore(id);
 const pending=threadPending('wx','hr');
 return appHeader('用户已注销','wx-list',B('wx-profile',I('dots'),'',{id:'hr'}))+'<div class="scroll chatbody" id="chatbody">'+(S.messages.hr||[]).map(m=>m.system?'<div class="chat-time">'+esc(m.text)+'</div>':'<div class="msg '+(m.self?'self':'')+'">'+avatarLink(m.self?'self':'hr')+((m.image||m.mediaAsset)?wxPhotoBubble(m):'<div class="bubble">'+esc(m.text)+'</div>')+'</div>').join('')+(pending?'<div class="typing-dots"><i></i><i></i><i></i></div>':'')+'</div><div class="chat-choices">'+(!pending?B('rd-guide-findings','我找到了一些东西。')+B('rd-guide-remind','你还在吗？')+B('rd-guide-identity','你到底是谁？'):'')+'</div><form class="composer" id="chat-form" data-id="hr"><input id="chat-input" aria-label="消息" placeholder="回复这条消息…" maxlength="600" value="'+esc(S.drafts.hr||'')+'" '+(pending?'disabled':'')+'>'+B('wx-attach',I('plus'),'',{id:'hr'})+'<button type="submit" class="send" '+(pending?'disabled':'')+'>发送</button></form>';
};

// Past memories replace the recruitment feed only after all sources have been checked.
const SHEN_MOMENTS=[
 {id:'shen-home',owner:'hr',date:'2006年6月21日 19:36',text:'终于有自己的小屋了。爬六楼好累，他说以后买菜都算他的。先记下来，免得有人反悔。',images:['memory-door-2006-v8.png'],likes:[],comments:[]},
 {id:'shen-photo',owner:'hr',date:'2006年7月22日 20:14',text:'今天去拍了合照。他不太会笑，我也紧张。挑来挑去，还是最喜欢那张我们挤在一起的。',images:['couple-2006.png'],likes:[],comments:[]},
 {id:'shen-dinner',owner:'hr',date:'2006年7月30日 18:25',text:'两个人吃饭，菜总是做多。那只缺了小口的碗他说归他，好的留给我。其实我都喜欢。',images:['memory-dining-2006.png'],likes:[],comments:[]},
 {id:'shen-wait',owner:'hr',date:'2006年8月13日 22:07',text:'他说出去做几天工。出门太急，晾好的衬衫还挂在阳台。灯先留着，等他到了给我电话。',images:['memory-balcony-2006.png'],likes:[],comments:[]},
 {id:'shen-light',owner:'hr',date:'刚刚',text:'原来你一直想回来。那两只碗没有收起来，灯也终于可以关了。谢谢替我们找回这些日子的人。',images:['memory-living-2006.png'],likes:[],comments:[]}
];
Object.defineProperty(SHEN_MOMENTS.at(-1),'text',{get:()=>S.redemption.restored?'原来你一直想回来。那两只碗没有收起来，灯也终于可以关了。谢谢替我们找回这些日子的人。':'那些藏起来的话，你都找到了吗？我想听你亲口告诉我。'});
const shenOriginalProfile=PROFILES.hr;Object.defineProperty(PROFILES,'hr',{configurable:true,get:()=>S.redemption.contactPhase==='shen'?{nick:'沈秋芸',wxid:'zhou_anzhu604',region:'中国 · 临川',sign:S.redemption.restored?'往后，不再把灯留给一个误会。':'两个人，一盏灯。',cover:'memory-living-2006.png'}:['guiding','deleted'].includes(S.redemption.contactPhase)?{nick:'用户已注销',wxid:'zhou_anzhu604',region:'',sign:'该账号已注销',cover:'living.png'}:zhouMomentsHaunted()?{...shenOriginalProfile,sign:'你醒了。那刚才替你闭眼的是谁。'}:shenOriginalProfile});
function shenPosts(){return [SHEN_MOMENTS.at(-1),...[...S.social.posts,...POSTS].filter(p=>p.owner!=='hr'),...SHEN_MOMENTS.slice(0,-1).reverse()];}
const shenGetPostBefore=getPost;getPost=id=>SHEN_MOMENTS.find(p=>p.id===id)||shenGetPostBefore(id);
const shenFeedBefore=feed;feed=owner=>{
 if(S.redemption.contactPhase!=='shen')return shenFeedBefore(owner);
 const selected=visibleMoments(shenPosts()).filter(p=>(!owner||p.owner===owner)&&canSeePeer(p.owner)),p=PROFILES[owner||'self'];
 return appHeader(owner?personName(owner):'朋友圈',owner?'wx-profile-back':'wx-discover',B('wx-post-new',I('camera'),'',{owner:owner||''}))+'<div class="scroll wx-feed"><div class="moments-banner"><img src="assets/'+(owner==='hr'?p.cover:S.social.covers[owner||'self']||p.cover)+'" alt="朋友圈封面">'+B('wx-profile','<strong>'+esc(personName(owner||'self'))+'</strong>'+AV(owner||'self'),'banner-profile',{id:owner||'self'})+'</div>'+(owner?'<div class="album-signature">'+p.sign+'</div>':'')+selected.map(postCard).join('')+'</div>';
};
const shenProfileBefore=wxProfile;wxProfile=id=>{
 if(id!=='hr'||S.redemption.contactPhase==='research')return shenProfileBefore(id);
 const shen=S.redemption.contactPhase==='shen',p=PROFILES.hr;
 return appHeader('','wx-list',B('profile-more',I('dots'),'',{id}))+'<div class="scroll wx-profile"><div class="profile-main">'+AV('hr')+'<div><h2>'+esc(personName('hr'))+'</h2><p>昵称：'+p.nick+'</p><p>威信号：'+p.wxid+'</p></div></div><div class="setting"><span>个性签名</span><small>'+p.sign+'</small></div>'+(shen?B('wx-album','<span>朋友圈</span><span class="album-preview">'+SHEN_MOMENTS.slice(-3).map(x=>'<img src="assets/'+x.images[0]+'" alt="沈秋芸的朋友圈照片">').join('')+'</span>','setting',{id:'hr'}):'')+B('chat',I('wechat')+'发消息','profile-action',{id:'hr'})+'</div>';
};
const shenAccountMomentsBefore=accountMoments;accountMoments=()=>S.redemption.contactPhase==='shen'?feed('hr'):shenAccountMomentsBefore();
const guideAdvanceBefore=advance;advance=ms=>{if(!document.hidden&&!savePanelOpen&&rdCanAct()){if(S.redemption.contactPhase==='research'&&S.redemption.read.includes('rd-photo'))rdGuideStart();if(S.redemption.contactPhase==='guiding')rdGuideProgress();}guideAdvanceBefore(ms);};
const guideTextBefore=window.render_game_to_text;window.render_game_to_text=()=>{const data=JSON.parse(guideTextBefore());data.redemption.guide={started:rdGuideEnsure().started,next:S.redemption.contactPhase==='guiding'?rdGuideCurrent()?.key:null};return JSON.stringify(data);};
rdGuideEnsure();

function rdMigrateGhostTone(state=S){
 const g=state.redemption.guide??={started:false,last:'',sent:[]};if(g.toneVersion===3)return;let introIndex=0;
 for(const m of [...(state.messages.hr||[]),...state.queue.filter(q=>q.id==='hr')]){
  if(m.self)continue;
  if(m.rdGuideHint&&RD_GHOST_HINTS[m.guideKey])m.text=RD_GHOST_HINTS[m.guideKey];
  if(m.rdGuideIntro){m.guideIntroIndex??=introIndex++;m.text=RD_GHOST_INTRO[Math.min(m.guideIntroIndex,RD_GHOST_INTRO.length-1)];}
  if(m.text==='别叫我周先生。照片里站在他身边的人，是我。这个名字已经空了很久……先帮我找找那些留下来的话，好吗？')m.text='你叫谁？他不在这里。照片里剩下的那个，才一直在。别往身后找。';
 }
 g.toneVersion=3;
}
const ghostToneDefaultsBefore=v2Defaults;v2Defaults=s=>{ghostToneDefaultsBefore(s);rdMigrateGhostTone(s);return s;};
rdMigrateGhostTone();
