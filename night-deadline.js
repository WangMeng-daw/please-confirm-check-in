'use strict';
// Absolute story minutes: 2026-09-14 06:00, not 06:00 on every calendar day.
const NIGHT_DEADLINE = 30 * 60;
function nightDeadlineDue(){return !S.ending && S.time >= NIGHT_DEADLINE;}
function markNightDeadline(){
 if(!nightDeadlineDue())return false;
 S.time=NIGHT_DEADLINE;S.ending='timeout';S.app='ending';S.view='';
 S.night.phase='lost';S.night.failure='六点了。你仍然没有离开这间房。';
 S.queue=[];S.twoPaths.queue=[];S.accounts.pending=[];
 S.twoPaths.finalCall=false;S.recording=false;S.route=null;S.nav=null;
 close();R.busy=false;R.scareLeft=0;R.noticeLeft=0;R.notice=null;R.zoom=false;
 $('#scare').className='';$('#scare').setAttribute('aria-hidden','true');
 $('#flash').className='';renderNotice();
 return true;
}
const saveBeforeDeadline=save;
save=()=>{const expired=markNightDeadline(),ok=saveBeforeDeadline();if(expired)render();return ok;};
const renderBeforeDeadline=render;
render=()=>{if(markNightDeadline())saveBeforeDeadline();if(S.ending==='timeout')S.app='ending';renderBeforeDeadline();};

// Check immediately after the clock advances and before message deliveries can
// grant an ending in that tick. Narrative jumps also pass through save/render.
const clockBeforeDeadline=V1.advance;
V1.advance=ms=>{clockBeforeDeadline(ms);if(markNightDeadline()){saveBeforeDeadline();render();}};
const advanceBeforeDeadline=advance;
advance=ms=>{
 if(!Number.isFinite(ms)||ms<=0||document.hidden||savePanelOpen)return;
 if(markNightDeadline()){saveBeforeDeadline();render();return;}
 if(S.ending==='timeout')return;
 advanceBeforeDeadline(ms);
 if(markNightDeadline()){saveBeforeDeadline();render();}
 if(S.ending==='timeout'){S.time=NIGHT_DEADLINE;S.app='ending';syncDeviceReadouts();}
};

const endingBeforeDeadline=VIEWS.ending;
VIEWS.ending=()=>S.ending==='timeout'?`<div class="end-view bad deadline-ending"><small>06:00 / STILL INSIDE</small><h2>六点了。</h2><p class="deadline-result">未能在天亮前离开 · 本次失败</p><div class="end-line">窗外已经亮了，房间里却还是黑的。<br><br>你等到的不是结算消息。<br>是门外重新响起的脚步声。<br><br>有人正在问，这份工作还招不招人。</div><div class="receipt">安住不动产 · 夜间体验<br>本次体验：未完成<br><br>你未能在06:00前达成任意一个结局。</div>${B('deadline-retry',S.checked?'回到惊醒后的分支点':'重新尝试','primary')}${B('restart','重新开始这一夜','secondary')}</div>`:endingBeforeDeadline();
ACTIONS['deadline-retry']=()=>{
 if(S.ending!=='timeout')return;
 const previous=S,branch=endingBranchSafe(previous.endingBranch)&&previous.endingBranch.time<NIGHT_DEADLINE?endingBranchCopy(previous.endingBranch):previous.checked?legacyEndingBranch():initial();
 branch.endingAwards=[...(previous.endingAwards||[])];
 branch.settings=JSON.parse(JSON.stringify(previous.settings));
 branch.phoneSettings=JSON.parse(JSON.stringify(previous.phoneSettings));
 branch.ending=null;branch.queue=[];
 S=v2Defaults(branch);S.night.quiet=previous.night.quiet;S.flash=previous.flash;S.night.flashOff=!S.flash;
 close();R.busy=false;R.scareLeft=0;R.noticeLeft=0;R.notice=null;
 $('#scare').className='';$('#flash').className='';renderNotice();
 if(S.checked){S.app='wechat';S.view='friend';S.endingBranch=endingBranchCopy(S);nightCheckpoint();}
 save();render();
};
// A stale button or submitted form cannot finish a route after the cutoff.
for(const event of ['click','submit'])document.addEventListener(event,e=>{
 if(markNightDeadline()){e.preventDefault();e.stopImmediatePropagation();saveBeforeDeadline();render();}
},true);
const textBeforeDeadline=window.render_game_to_text;
window.render_game_to_text=()=>JSON.stringify({...JSON.parse(textBeforeDeadline()),deadline:{at:'2026-09-14 06:00',expired:S.ending==='timeout',remainingMinutes:Math.max(0,NIGHT_DEADLINE-S.time)}});
save();render();
