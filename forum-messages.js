'use strict';
// Every message and scheduled reply has an explicit owning account.
const PM_PLAYER='summer_lin',PM_OLD='nightboat';
const pmAccount=()=>S.forum.user===PM_OLD?PM_OLD:PM_PLAYER;
const pmName=id=>id===PM_PLAYER?'林砚':id===PM_OLD?'夜航不靠岸':id;
const pmDate=()=>deviceDate().toISOString().slice(0,10)+' '+time();
function pmLegacyDate(s,at){if(/^\d{4}-/.test(at||''))return at;const now=Date.UTC(2026,8,13)+s.time*60000,d=new Date(now),[h,m]=String(at||'00:00').split(':').map(Number);d.setUTCHours(h||0,m||0,0,0);if(d.getTime()>now)d.setUTCDate(d.getUTCDate()-1);return d.toISOString().slice(0,10)+' '+String(at||'00:00');}
function pmThread(owner,peer,create=true){const account=S.forum.dm.accounts[owner];if(!account)return null;if(create)account.threads[peer]??={peer,messages:[],unread:0};return account.threads[peer];}
function seedOldMessages(){const prompts={north:['我在604。门和窗都打不开，你说你以前住过，能不能帮帮我？','我把手机声音关了。哪里能出去？','我一靠近窗户，门外就开始走路。它知道我醒着吗？','怎么让它以为我睡了？现在拍卧室会不会被发现？','发过去了。我说我还没醒，它说要进来看看。接下来怎么办？','我听见敲门了。我先把你说的记进草稿，万一手机断了。'],zhou:['你怎么找到我这个账号的？','你到底是谁？为什么一直盯着我的帖子？','床上没有别人。我一直拿着手机。','别进来。求你了。']};const threads={};for(const t of PRIVATE_THREADS){const messages=[];t.messages.forEach(([at,text],i)=>{const stamp=at.length>5?at:'2024-11-07 '+at;messages.push({from:PM_OLD,to:t.name,text:prompts[t.id][i],at:stamp,historical:true});messages.push({from:t.name,to:PM_OLD,text,at:stamp,historical:true});});threads[t.name]={peer:t.name,messages,unread:0};}return threads;}
const defaultsBeforePM=v2Defaults;
v2Defaults=s=>{defaultsBeforePM(s);if(!s.forum.dm){const f=s.forum;f.dm={version:1,accounts:{[PM_PLAYER]:{threads:{},drafts:{}},[PM_OLD]:{threads:seedOldMessages(),drafts:{}}},pending:[]};
 // The old outbox was written by the player's account; legacy private-thread
 // sends could only be made while authenticated as nightboat.
 for(const [peer,list] of Object.entries(f.outbox||{})){if(!list.length)continue;f.dm.accounts[PM_PLAYER].threads[peer]={peer,unread:0,messages:list.map(m=>({from:PM_PLAYER,to:peer,text:m.text,at:pmLegacyDate(s,m.at)}))};}
 for(const [key,list] of Object.entries(f.sent||{})){const peer=PRIVATE_THREADS.find(t=>'dm:'+t.id===key)?.name;if(!peer)continue;f.dm.accounts[PM_OLD].threads[peer].messages.push(...list.map(m=>({from:PM_OLD,to:peer,text:m.text,at:pmLegacyDate(s,m.at)})));}
 }return s;};v2Defaults(S);
function pmUnread(){return Object.values(S.forum.dm.accounts[pmAccount()].threads).reduce((n,t)=>n+t.unread,0);}
function pmPeerFromView(){if(S.view.startsWith('forum:chat:'))return S.view.slice(11);if(S.view.startsWith('forum:dm:')&&pmAccount()===PM_OLD)return PRIVATE_THREADS.find(t=>t.id===S.view.slice(9))?.name;return null;}
function pmWaiting(owner,peer){return S.forum.dm.pending.some(q=>q.owner===owner&&q.peer===peer);}
function pmConversation(peer){const owner=pmAccount();if(peer===pmName(owner))return tbHeader('私信')+'<p class="empty">不能给自己发送私信</p>';const t=pmThread(owner,peer),draft=S.forum.dm.accounts[owner].drafts[peer]||'';if(t.unread){t.unread=0;save();}let previous='';const messages=t.messages.map(m=>{const timestamp=m.at!==previous?`<div class="pm-time">${esc(m.at)}</div>`:'';previous=m.at;const self=m.from===owner;return timestamp+`<div class="pm-message ${self?'self':''}" data-sender="${esc(m.from)}">${B('forum-profile',forumFace(pmName(m.from)),'pm-avatar-button',{author:pmName(m.from)})}<div class="pm-bubble">${esc(m.text)}</div></div>`;}).join('');return `<header class="pm-header">${B('pm-back',I('back'),'',{label:'返回消息'})}<div><strong>${esc(peer)}</strong>${peer==='夜航不靠岸'?'<small>最后在线 2024-11-07</small>':''}</div>${B('forum-profile',I('user'),'',{author:peer,label:'查看个人主页'})}</header><div class="scroll pm-chat" id="pm-chat" data-owner="${owner}">${messages||'<p class="pm-empty">你们还没有聊过天</p>'}${peer==='夜航不靠岸'&&t.messages.length?'<p class="pm-delivery">已发送 · 对方离线，暂未读</p>':''}${pmWaiting(owner,peer)?`<div class="pm-message pm-typing">${forumFace(peer)}<div class="pm-bubble">对方正在输入<span>…</span></div></div>`:''}</div><form id="tb-dm-compose" class="pm-composer" data-owner="${owner}" data-peer="${esc(peer)}"><textarea id="tb-dm-input" rows="1" maxlength="500" aria-label="私信内容" placeholder="发送消息…">${esc(draft)}</textarea><button type="submit">发送</button></form>`;}
forumInbox=()=>{const owner=pmAccount(),list=Object.values(S.forum.dm.accounts[owner].threads).filter(t=>t.messages.length).sort((a,b)=>b.messages.at(-1).at.localeCompare(a.messages.at(-1).at));return tbHeader('消息',B('forum-go',I('user'),'',{view:'me',label:'我的账号'}))+`<div class="pm-account-bar">${forumFace(pmName(owner))}<span>${pmName(owner)}<small>${owner}</small></span>${B('pm-switch','切换账号')}</div><div class="scroll pm-inbox">${list.map(t=>{const m=t.messages.at(-1),at=m.at.startsWith(pmDate().slice(0,10))?m.at.slice(-5):m.at.slice(0,10).replaceAll('-','/');return B('tb-chat',`<span class="pm-list-avatar">${forumFace(t.peer)}${t.unread?'<b class="pm-badge">'+(t.unread>99?'99+':t.unread)+'</b>':''}</span><span class="pm-list-text"><b>${esc(t.peer)}</b><p>${m.from===owner?'我：':''}${esc(m.text)}</p></span><small>${at}</small>`,'pm-inbox-row',{author:t.peer});}).join('')||'<p class="empty">暂无私信</p>'}</div>`+forumNav('inbox');};
const viewBeforePM=forumView;forumView=()=>{if(S.view.startsWith('forum:chat:'))return pmConversation(S.view.slice(11));return viewBeforePM();};
const privateBeforePM=forumPrivate;forumPrivate=view=>{if(!view.startsWith('dm:'))return privateBeforePM(view);if(pmAccount()!==PM_OLD)return forumLogin();const peer=PRIVATE_THREADS.find(t=>t.id===view.slice(3))?.name;return peer?pmConversation(peer):forumInbox();};
const navBeforePM=forumNav;forumNav=active=>navBeforePM(active).replace('<span>消息</span>','<span>消息'+(pmUnread()?'<b class="pm-nav-dot"></b>':'')+'</span>');
const loginBeforePM=forumLogin;forumLogin=()=>loginBeforePM()+B('pm-player-account','使用已登录账号：林砚','pm-saved-account');
function openPM(peer){if(peer===pmName(pmAccount()))return sheet('私信','<p>不能给自己发送私信。</p>');forumLink('chat:'+peer);const t=pmThread(pmAccount(),peer),chat=$('#pm-chat');if(chat&&t.messages.some(m=>!m.historical))chat.scrollTop=chat.scrollHeight;}
ACTIONS['forum-message']=d=>openPM(d.author);ACTIONS['tb-chat']=d=>openPM(d.author);ACTIONS['pm-back']=()=>forumLink('inbox');
ACTIONS['pm-player-account']=()=>{S.forum.user=null;S.forum.loginError='';save();forumLink('inbox');};
ACTIONS['pm-switch']=()=>forumLink('login');
function pmReplyLines(owner,peer,text){if(peer==='夜航不靠岸')return [];
 if(peer==='老楼北窗'){
  if(owner===PM_OLD){if(/窗|出去|平台|路/.test(text))return ['浴室那扇小窗，右边是消防梯。以前的消息还在，别走错。'];if(/敲|声音|几声/.test(text))return ['一声先别动。等三声，等脚步回到卧室。'];if(/照片|床|醒/.test(text))return ['用你刚进去时拍的卧室照。告诉他你还在床上。'];return ['这个账号……你不是那天跟我说话的人吧。','先把上面的聊天看完。那晚他最后一次回我之后，就没再来过。'];}
  if(/604|槐安|房|试睡|周/.test(text))return ['你说槐安里那套？前两年也有人私信问过。','我以前在吧里发过那栋楼的维修帖子，你可以找找。'];return ['在，刚看到。你是问吧里的那栋老楼吗？'];
 }
 if(peer==='周同安')return [owner===PM_OLD?'这个账号不是已经睡了吗。':'你怎么找到这里的？'];
 if(peer==='奶油卷')return [/面|吃|店|地址|哪/.test(text)?'江北路路口那家，招牌写着老陈面馆，开到凌晨三点。':'在呢，刚下班。你看到我发的那条帖子啦？'];
 if(peer==='山路')return [/路|楼|槐安|604/.test(text)?'今晚南门那边有积水，走东门。老楼的事我不太熟。':'在的。你想问哪条帖子？'];
 if(peer==='阿岚')return ['你好，刚看到。你也是最近在临川找房子吗？'];
 if(peer==='鱼饼')return ['我还在上夜班，回复有点慢。你说，我看着。'];
 if(peer==='站务')return ['你好，吧务已收到你的私信。请描述具体问题。'];
 return ['你好，刚看到你的消息。你想问我发的哪条帖子？'];
}
function pmSend(owner,peer,text){if(owner!==pmAccount()||!text||peer===pmName(owner))return;const t=pmThread(owner,peer);t.messages.push({from:owner,to:peer,text,at:pmDate()});S.forum.dm.accounts[owner].drafts[peer]='';const lines=pmReplyLines(owner,peer,text);for(const line of lines)S.forum.dm.pending.push({owner,peer,text:line,remaining:1600});save();render();$('#pm-chat').scrollTop=$('#pm-chat').scrollHeight;}
document.addEventListener('submit',e=>{if(e.target.id!=='tb-dm-compose')return;e.preventDefault();pmSend(e.target.dataset.owner,e.target.dataset.peer,$('#tb-dm-input').value.trim());});
document.addEventListener('input',e=>{if(e.target.id!=='tb-dm-input')return;const f=e.target.form;if(f.dataset.owner!==pmAccount())return;S.forum.dm.accounts[pmAccount()].drafts[f.dataset.peer]=e.target.value;save();});
const advanceBeforePM=advance;advance=ms=>{advanceBeforePM(ms);if(document.hidden||!Number.isFinite(ms)||ms<=0)return;const q=S.forum.dm.pending[0];if(!q)return;q.remaining-=ms;if(q.remaining>0)return;S.forum.dm.pending.shift();const t=pmThread(q.owner,q.peer),visible=pmAccount()===q.owner&&S.app==='browser'&&pmPeerFromView()===q.peer;t.messages.push({from:q.peer,to:q.owner,text:q.text,at:pmDate()});if(!visible)t.unread++;save();if(S.app==='browser'&&pmAccount()===q.owner){if(visible||S.view==='forum:inbox'){const input=$('#tb-dm-input'),typing=input&&document.activeElement===input,selection=typing?[input.selectionStart,input.selectionEnd]:null,sc=$('#pm-chat'),bottom=sc&&sc.scrollHeight-sc.scrollTop-sc.clientHeight<80,y=$('#screen .scroll')?.scrollTop||0;render();const target=$('#screen .scroll');if(target)target.scrollTop=bottom?target.scrollHeight:y;if(typing){const next=$('#tb-dm-input');next.focus({preventScroll:true});next.setSelectionRange(...selection);}}else{const nav=$('.tb-nav [data-view="inbox"] span');if(nav)nav.innerHTML='消息'+(pmUnread()?'<b class="pm-nav-dot"></b>':'');}}};
const textBeforePM=window.render_game_to_text;window.render_game_to_text=()=>JSON.stringify({...JSON.parse(textBeforePM()),forumMessages:{account:pmAccount(),peer:pmPeerFromView(),unread:pmUnread(),pending:S.forum.dm.pending.map(q=>({account:q.owner,peer:q.peer,remaining:q.remaining}))}});
save();render();
