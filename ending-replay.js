'use strict';
// Keep a separate, portable snapshot before any ending route is chosen.
function endingBranchSafe(s){return GameStorage.valid(s)&&s.checked&&s.night?.phase==='awake'&&!s.ending&&s.wakeStory?.debriefDone&&!s.night.lure&&!s.night.escapeStep&&!s.twoPaths?.offered&&!s.twoPaths?.employer&&!s.twoPaths?.committed&&!s.accounts?.handoverRead&&!s.accounts?.handoverLegacyAccess&&!s.redemption?.read?.length&&!s.redemption?.restored;}
function endingBranchCopy(s){const copy=JSON.parse(JSON.stringify(s));delete copy.endingBranch;return copy;}
function rememberEndingBranch(){if(!S.endingBranch&&endingBranchSafe(S)){S.endingBranch=endingBranchCopy(S);save();}}
const endingBranchCheckpointBefore=nightCheckpoint;
nightCheckpoint=()=>{rememberEndingBranch();endingBranchCheckpointBefore();};

// Older completed saves may have no usable checkpoint. Reconstruct the shared
// investigation opening, with no final-route messages, identities or timers.
function legacyEndingBranch(){
 const s=initial();
 Object.assign(s,{app:'wechat',view:'friend',time:1575,applied:true,hired:true,arrived:true,checked:true,installed:true,contactAccepted:true,friendRequested:true,hrIntroduced:true,hrGreeting:true,currentRoom:'bed',taskReady:ROOMS.length-1});
 Object.assign(s.flags,{welcomed:true,addressSent:true,keyGiven:true});
 s.recruit.haunted={phase:'accepted'};
 s.photos=ROOMS.map(r=>({room:r.id,at:'00:06',date:'9月14日'}));
 s.night=newNight();Object.assign(s.night,{phase:'awake',talked:true,wakeIntroDone:true,reassured:{mom:true,friend:true}});
 s.wakeStory=newWakeStory(true);Object.assign(s.wakeStory,{escapeAsked:false,escapeDone:false,legacy:false});
 Object.assign(s.accounts,{stayLogged:true,stayCredentials:true,biss:'player',wechat:'player',bossCredentials:false,wxCredentials:false});
 s.messages.hr=[{text:'先别下床。她哭的时候，不喜欢有人站着。',at:'02:14'},{text:'她在等人回家。等很久了。',at:'02:14'},{text:'不是门窗打不开。是她还没决定让谁出去。',at:'02:14'}];
 s.messages.friend.push({self:true,text:'他说哭的是等人回家的女人，还说别下床。他头像变成了一张死人脸，职位也删了，门窗都打不开。',at:'02:15'},{text:'把地址留给我，我现在过去。你看看睡前拍的照片，有没有什么不一样。',at:'02:15'},{text:rdFriendSearchReply,at:'02:15'});
 s.queue=[];s.unread={};return s;
}
const endingBranchViewBefore=VIEWS.ending;
VIEWS.ending=()=>endingBranchViewBefore().replace('<div class="rd-ending-actions">','<div class="rd-ending-actions">'+B('rd-rechoose','回到结局分支点','primary')+'<p class="rd-replay-note">回到惊醒后与小张聊完异常的时刻。<br>保留结局标签与设置，重新调查其他路线。</p>');
ACTIONS['rd-rechoose']=()=>{
 if(!RD_ENDINGS[S.ending])return;
 const previous=S,cp=GameStorage.readCheckpoint();
 const branch=endingBranchSafe(previous.endingBranch)?previous.endingBranch:endingBranchSafe(cp)?cp:legacyEndingBranch();
 const restored=endingBranchCopy(branch);
 restored.endingBranch=endingBranchCopy(branch);
 restored.endingAwards=[...new Set([...(previous.endingAwards||[]),previous.ending])];
 restored.settings=JSON.parse(JSON.stringify(previous.settings));
 restored.phoneSettings=JSON.parse(JSON.stringify(previous.phoneSettings));
 restored.night.quiet=previous.night.quiet;restored.flash=previous.flash;
 restored.night.flashOff=!previous.flash;
 restored.app='wechat';restored.view='friend';restored.ending=null;
 restored.queue=[];restored.unread={};restored.drafts={};
 S=v2Defaults(restored);
 close();R.busy=false;R.scareLeft=0;R.noticeLeft=0;R.notice=null;R.zoom=false;
 $('#scare').className='';$('#flash').className='';renderNotice();
 save();nightCheckpoint();open('wechat','friend');
};
const endingBranchTextBefore=window.render_game_to_text;
window.render_game_to_text=()=>JSON.stringify({...JSON.parse(endingBranchTextBefore()),endingReplay:{available:!!RD_ENDINGS[S.ending],checkpointSaved:!!S.endingBranch}});
rememberEndingBranch();
save();render();
