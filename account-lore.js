'use strict';
function replaceForumPost(id,text){const p=FORUM_POSTS.find(p=>p.id===id);if(p)p.text=text;}
replaceForumPost('recruit-copy',['同一套房的招聘号，几年里一直叫“周先生”。我遇到过很冷漠的，也遇到过突然劝我别去的。','2024年11月7日凌晨那次，对方先催我来，过几分钟又让我取消车。','昵称没变，说话的人好像变了。别只凭名字认人。']);
replaceForumPost('blank-name',['有个叫顾遥的姑娘来取猫用品，说替一位没能回家的年轻人照顾 Momo。','她给我看了两段聊天：一段在贴吧叫夜航，一段在威信却叫周先生。她说，是那个人借用了别人的号。','他最后发的是“别来”，后来再也没回。']);
FORUM_POSTS.find(p=>p.id==='blank-name').title='帮一只叫Momo的猫转交东西';
replaceForumPost('night-replacement',['以前夜班群里有人说，房间只要一个留宿的人。不是领钥匙就算，要睡过去，再也叫不醒。','借来的招聘账号一直叫周先生，但拿着手机的未必是同一个人。','我知道有人真从北侧平台下来了，也知道有人试着招人又反悔，最后没能等到天亮。']);
if(!FORUM_POSTS.some(p=>p.id==='north-survived'))FORUM_POSTS.push({id:'north-survived',author:'老楼北窗',date:'2026-09-11 06:42',tag:'旧城',title:'我从槐安里北侧平台下来了，留一点能用的话',text:['2023年那晚，我没有找人接班。发旧照片让它回床边，静音，关闪光，等三声再动。','当时右侧铁梯还在。我没有回头，也没有接自己号码的电话。维修会改路线，后来的人一定要看新通知。','我后来把这些办法私信给夜航。他回了头，又回到了床上。最后，他只说已经让两个求职的人回家了。'],likes:77,comments:[['顾遥','我记得那个让我别来的年轻人。'],['老楼北窗','他至少把你们劝回去了。']]});
Object.assign(FORUM_DRAFTS.find(d=>d.id==='handover'),{title:'接手账号以后',time:'2024-11-07 03:19',text:['原来不是换一份工作，是换成他的名字。','交接页我另留了一份，链接放在下面。两个软件的账号、改口令时写的便签都在，不能放到公开帖子里。','验房号记的是那个钟点，招人的两个号记的是接手那天。我差点又输错。','“周先生”是原来就挂在账号上的名字，不是我的名字。','我把日结1200的招聘发出去了。顾遥和陈远来问，我像他一样催人快来。','我在干什么。']});

const privateBeforeHandover=forumPrivate;
forumPrivate=view=>{let html=privateBeforeHandover(view);if(view==='draft:handover'&&S.forum.user==='nightboat')html=html.replace('</article>',B('account-handover',I('files')+'<span>房源交接回执<small>附：旧设备便签 · 私人留存</small></span>','handover-link')+'</article>');return html;};
function handoverReceipt(){
 const allowed=isHaunted()&&S.forum.user==='nightboat';
 if(allowed&&!S.accounts.handoverRead){S.accounts.handoverRead=true;S.accounts.bossCredentials=true;S.accounts.wxCredentials=true;save();}
 return `<header class="handover-header">${B('browser-back',I('back'),'',{label:'返回草稿'})}<span class="handover-mark">住</span><div><b>安住房源协作</b><small>历史资料 · 交接回执</small></div></header><div class="scroll handover-page">${allowed?`
 <div class="handover-owner">${forumFace('夜航不靠岸')}<span>夜航不靠岸<small>私人草稿附件 · 2024年11月7日保存</small></span></div>
 <article class="handover-paper"><div class="handover-kicker">房源协作台 / 留存副本</div><h1>604 房源交接回执</h1><p class="handover-serial">回执编号 AZ-604-20241107-0319</p>
 <dl class="handover-facts"><div><dt>交接完成</dt><dd>2024年11月7日 03:19</dd></div><div><dt>机构代号</dt><dd>AZ</dd></div><div><dt>登记人</dt><dd>夜航（临时联络人）</dd></div><div><dt>对外称呼</dt><dd>周先生 · 沿用原资料</dd></div></dl>
 <h2>沿用的联系账号</h2><div class="handover-account"><span>biss<span>招聘沟通</span></span><code>zhou_604</code></div><div class="handover-account"><span>威信<span>到岗联络</span></span><code>zhou_anzhu604</code></div><p class="handover-caption">两端分别登录，历史记录随账号保留。</p>
 <aside class="handover-note"><small>旧设备便签 · 夜航</small><p>先写机构代号，两个字母都要大写。后面是交接完成那天的月日，补足四位。</p><p>两个号改成一样的了。验房号仍用那个钟点，别混了。</p><p class="handover-scribble">名字还是他的。发出去的话，已经是我写的。</p></aside>
 <footer class="handover-foot">原件留在旧设备 · 此页为草稿附件副本</footer></article>`:'<div class="handover-unavailable"><h1>私人附件</h1><p>此回执保存在原作者的私人草稿中。请登录原保存账号后查看。</p>'+B('forum-go','返回贴吧登录','secondary',{view:'login'})+'</div>'}</div>`+webBar();
}
const browserBeforeHandover=VIEWS.browser;VIEWS.browser=()=>S.view==='handover:604'?handoverReceipt():browserBeforeHandover();
const addressBeforeHandover=browserAddress;browserAddress=()=>S.view==='handover:604'?'work.anzhu.invalid/records/604':addressBeforeHandover();
ACTIONS['account-handover']=()=>open('browser','handover:604');
for(const [action,button,entries] of [['browser-tabs','web-tab-open',()=>S.web.tabs.map(t=>t.stack[t.at])],['browser-bookmarks','web-bookmark-open',()=>S.web.bookmarks]]){const before=ACTIONS[action];ACTIONS[action]=()=>{before();for(const b of document.querySelectorAll(`[data-action="${button}"]`))if(entries()[Number(b.dataset.index)]?.view==='handover:604')b.textContent='安住 · 604房源交接回执';};}
document.addEventListener('submit',e=>{if(e.target.id==='web-address-form'&&/work\.anzhu\.invalid\/records\/604/.test($('#web-address-input')?.value||'')){e.preventDefault();e.stopImmediatePropagation();close();open('browser','handover:604');}},true);
Object.assign(FORUM_DRAFTS.find(d=>d.id==='lastdraft'),{title:'没有发出去的最后一条',time:'2024-11-07 04:03',text:['北窗告诉我的路是真的。他活着出去了。是我回头，又回到了床上。','接过账号后，我骗了两个人。顾遥说她妈不放心，陈远说房租要到期。我看见了刚才的自己。','我在biss里取消了工作，又用那个威信号劝他们离开。他们都回去了。','我不是周先生。我只是短暂用过他的账号，差点成了和他一样的人。','它说没人替我，我就得留在这里。浴室已经没有缝了。','那就留下我。别再把别人叫来。','请帮我照顾Momo。天亮以后，不要再等我回消息。']});
// A private note introduces the next investigation after the player has followed Nightboat.
FORUM_DRAFTS.push({id:'photo-receipt',title:'床底的旧取片单',time:'2024-11-07 03:57',text:['劝走他们以后，我把掉在床底的手机摸出来，碰到一张发黄的取片单。','抬头是“海棠照相馆”，日期：2006年7月22日。取件地址写着槐安里三幢六楼。','这栋楼以前不叫六栋？纸上的印章已经褪成了粉色，边角像是被水泡过。','我记下店名了。也许那家店还留着原来的照片，能查到这间屋子以前住过谁。','网又断了。这张单子先夹回床脚。']});
const cloudBeforeAccountLore=cloudView;cloudView=()=>cloudBeforeAccountLore().replace('导出账户：n***boat　　对外联系称呼：沿用原设置','账号交接：2024-11-07 03:19<br>房源账号：az604_1107　初始密码：0319<br>操作人自填昵称：夜航（非账号实名）').replace('最后修改：2024-11-07 03:19<br>公开动态最后一条：03:17','最后修改：2024-11-07 03:38<br>招聘草稿旁有一行未发送的字：两个求职者都劝回去了，别再用这个号联系他们。');
const pmBeforeAccountLore=pmReplyLines;pmReplyLines=(owner,peer,text)=>{if(peer==='老楼北窗'&&/夜航|死|周|账号|接班|替/.test(text))return ['我活着从平台下来了。夜航不是我，也不是最初的周先生。','他短暂接手过招聘和威信账号，后来把两个人劝走了。他最后没能出来。草稿和那两个账号的旧消息都还在。'];return pmBeforeAccountLore(owner,peer,text);};
PEOPLE.unknown.name='老楼北窗';PROFILES.unknown.wxid='north_window';PROFILES.unknown.sign='活着出来以后，才知道天亮有多好。';Object.assign(POSTS.find(p=>p.id==='xu1'),{date:'2026年9月11日 06:42',text:'2023年那晚的经历写在临川吧了。账号老楼北窗。旧路线已在修，别照着过去的图走。'});Object.assign(POSTS.find(p=>p.id==='xu2'),{date:'2023年8月18日 23:50',text:'到地方了。拍完照片，希望今晚能睡好。'});
const extraPosts=[
 {id:'zhou-recruit-2026',owner:'hr',date:'9月13日 18:20',text:'临川夜间房源体验，1200元/晚，日结不收押金。会用手机拍照即可，应届生可沟通。具体安排私聊。',images:['living.png'],likes:[],comments:[]},
 {id:'zhou-recruit-old',onlySelf:true,owner:'hr',date:'2024年11月7日 03:20',text:'今晚还有一位名额。照片拍完休息，明早六点联系我。',images:['hall.png'],likes:[],comments:[]},
 {id:'zhou-recruit-withdraw',onlySelf:true,owner:'hr',date:'2024年11月7日 03:33',text:'刚才的夜班取消。已经出门的请回去。不要去槐安里6栋604，也不要相信后续从这个号发出的邀请。',images:[],likes:[],comments:[]}
];for(const p of extraPosts)if(!POSTS.some(x=>x.id===p.id))POSTS.unshift(p);

// The same dated posts change with the avatar; historical evidence stays intact.
const ZHOU_HAUNTED_MOMENTS={
 'zhou-recruit-2026':'今晚只住一位。\n床上那位已经睡了。\n正在看手机的这位，也登记过吗？',
 'zhou1':'房间里没有多出来的人。\n照片里数不清，是因为有一个一直站在拍照的人后面。\n别再数了。'
};
function zhouMomentsHaunted(){return isHaunted()&&(!S.redemption||S.redemption.contactPhase==='research');}
function zhouMomentAppearance(post){return post&&post.owner==='hr'&&zhouMomentsHaunted()&&ZHOU_HAUNTED_MOMENTS[post.id]?{...post,text:ZHOU_HAUNTED_MOMENTS[post.id]}:post;}
const visibleBeforeZhouHaunting=visibleMoments;visibleMoments=posts=>visibleBeforeZhouHaunting(posts).map(zhouMomentAppearance);
const postBeforeZhouHaunting=getPost;getPost=id=>zhouMomentAppearance(postBeforeZhouHaunting(id));

// Earlier account activity: routine property upkeep before Nightboat's stay.
const EARLY_HOUSE_MOMENTS=[
 {id:'zhou-2020-keys',owner:'hr',date:'2020年12月18日 16:42',text:'年底把几套房的钥匙重新贴了签。看房提前说，别到了楼下再打电话。老小区门牌改过，第一次来容易找错。',images:[],likes:[],comments:[]},
 {id:'zhou-2021-window',owner:'hr',date:'2021年3月26日 14:08',text:'客厅窗缝换了胶条，试了几遍，关上不漏风了。窗扣要往里压一下，别硬掰。',images:['zhou-moment-window-2021.png'],likes:[],comments:[]},
 {id:'zhou-2021-water',owner:'hr',date:'2021年12月9日 11:35',text:'洗手池下面的软管换新了，水压也试过。师傅的扳手落这儿了，下次过来记得带走。',images:['zhou-moment-repair-2021.png'],likes:[],comments:[]},
 {id:'zhou-2022-airing',owner:'hr',date:'2022年5月17日 15:26',text:'下午来开窗透透气。沙发和柜子都还能用，就先不换了。看房不用太晚，白天光线好些。',images:['zhou-moment-living-2022.png'],likes:[],comments:[]},
 {id:'zhou-2022-register',owner:'hr',date:'2022年11月4日 18:10',text:'这个月的水电表抄完了。来往登记本换了一本，旧的先收在柜子里。临时改时间的，提前留个消息。',images:[],likes:[],comments:[]},
 {id:'zhou-2023-hall',owner:'hr',date:'2023年7月12日 10:52',text:'玄关的杂物清过了，过道别再堆纸箱。灯泡换了新的，晚上进门先开灯。',images:['zhou-moment-hall-2023.png'],likes:[],comments:[]}
];
for(const post of EARLY_HOUSE_MOMENTS)if(!POSTS.some(p=>p.id===post.id))POSTS.push(post);
const HOUSE_MOMENT_IMAGES={zhou1:[],zhou2:[],'zhou-recruit-2026':['zhou-moment-living-2022.png'],'zhou-recruit-old':['zhou-moment-hall-2023.png'],...Object.fromEntries(EARLY_HOUSE_MOMENTS.map(p=>[p.id,p.images]))};
for(const post of POSTS)if(HOUSE_MOMENT_IMAGES[post.id])post.images=[...HOUSE_MOMENT_IMAGES[post.id]];
PROFILES.hr.cover='zhou-moment-living-2022.png';
function refreshHouseMomentAssets(state){for(const post of [...(state.social?.posts||[]),...(state.accounts?.posts||[])])if(HOUSE_MOMENT_IMAGES[post.id])post.images=[...HOUSE_MOMENT_IMAGES[post.id]];if(['living.png','hall.png'].includes(state.social?.covers?.hr))state.social.covers.hr='zhou-moment-living-2022.png';return state;}
const houseMomentDefaultsBefore=v2Defaults;v2Defaults=state=>refreshHouseMomentAssets(houseMomentDefaultsBefore(state));refreshHouseMomentAssets(S);

// Replace obsolete statements in existing saves while retaining player messages.
const obsoleteLines=new Map([
 ['biss里已经切到招聘身份，岗位草稿在里面。','上一个人把交接记录藏进了只有自己能看的地方。'],
 ['对外称呼沿用。说话客气些，你刚来时不也是信这个。','对外称呼沿用。以前也有人短暂接手，后来又反悔。']
]);
if(!S.accounts.loreMigrated){for(const m of S.messages.hr||[])if(!m.self&&obsoleteLines.has(m.text))m.text=obsoleteLines.get(m.text);S.accounts.loreMigrated=true;}
const endingsBeforeAccounts=VIEWS.ending;VIEWS.ending=()=>endingsBeforeAccounts().replace('论坛账号 nightboat：最后在线 2024-11-07 03:17<br>招聘记录：2024-11-07 03:19','旧账号的聊天里，有人在2024年11月7日劝求职者回去。<br>那个人最后留在了房间里。你做了不同的选择。').replace('贴吧里那张蓝色纸船的头像，和招聘页一起变成了灰色。<br>最后一条未发送的文案里，仍然有“明早六点”。','老楼北窗：出来就好，别再回去。<br>夜航的头像仍然灰着。他最后留下的不是招聘，是“别来”。');
save();render();


for(const action of ['post-actions','post-like','post-comment','comment-reply','post-collect','post-image']){const before=ACTIONS[action];ACTIONS[action]=data=>{if(!getPost(data.id))return;return before(data);};}
