'use strict';
let savePanelOpen=false,importCandidate=null;
function saveDate(ts){return ts?new Date(ts).toLocaleString('zh-CN',{hour12:false}):'尚未保存';}
function savePanel(message=''){
 savePanelOpen=true;const st=GameStorage.status;
 sheet('备份与恢复',`<div class="save-summary"><b>${st.ok?'自动保存已开启':'进度未能保存'}</b><p>游戏时间 ${time()} · 电量 ${batteryPercent()}%</p><small>最近保存：${esc(saveDate(st.savedAt))}</small>${st.recovered?'<p>已从本机备用存档恢复。</p>':''}</div><p class="save-explain">${st.ok?'关闭页面后，下次打开会自动接着玩。进度保存在当前浏览器。':'当前进度仍可继续游玩，但关闭页面前请先导出备份。'}</p><p class="save-feedback" role="status">${esc(message||st.error)}</p>${B('save-now','立即保存','primary')}${B('save-continue','继续游戏','secondary')}<div class="save-transfer">${B('save-export','导出存档文件','setting')}${B('save-import','导入存档文件','setting')}</div><p class="save-explain">更换设备、浏览器或网站地址前，请先导出存档。清除网站数据会删除本机进度。</p>`);
}
const settingsBeforeSaves=phoneSettingsView;phoneSettingsView=()=>settingsBeforeSaves().replace(B('restart','重新开始这一夜','ps-restart'),`<section class="ps-group">${B('save-panel',`<span class="ps-label">备份与恢复<small>${GameStorage.status.ok?'自动保存已开启':'未能保存 · 请备份'}</small></span>${I('next')}`,'ps-row')}</section>`+B('restart','重新开始这一夜','ps-restart'));
const openBeforeSaves=open;open=(app,view='')=>{if(app==='settings'&&S.app!=='settings')S.resumeTarget={app:S.app,view:S.view};openBeforeSaves(app,view);};
const advanceBeforeSaves=advance;advance=ms=>{if(!savePanelOpen)advanceBeforeSaves(ms);};
const closeBeforeSaves=close;close=()=>{savePanelOpen=false;importCandidate=null;lastFrame=performance.now();closeBeforeSaves();};
ACTIONS.close=()=>close();
ACTIONS['save-panel']=()=>{save();savePanel();};
ACTIONS['save-now']=()=>{const ok=save();savePanel(ok?'当前进度已保存。':GameStorage.status.error);};
ACTIONS['save-continue']=()=>{const target=S.resumeTarget;close();open(target&&VIEWS[target.app]?target.app:'home',target?.view||'');};
ACTIONS['save-export']=()=>{save();const payload={format:'haunted-stay-save',version:1,exportedAt:new Date().toISOString(),state:S,checkpoint:GameStorage.readCheckpoint()};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='请确认入住-存档-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);savePanel('存档文件已准备下载。请保留这份备份。');};
function validateSaveShape(value,example,path='state'){
 if(value===undefined||example===null||example===undefined)return;
 if(Array.isArray(example)){if(!Array.isArray(value))throw Error(path+' 格式不正确');return;}
 if(typeof example==='object'){if(!value||typeof value!=='object'||Array.isArray(value))throw Error(path+' 格式不正确');for(const k of Object.keys(example))if(k in value)validateSaveShape(value[k],example[k],path+'.'+k);return;}
 if(typeof value!==typeof example||typeof value==='number'&&!Number.isFinite(value))throw Error(path+' 格式不正确');
}
function decodeSave(raw){
 if(raw.length>8*1024*1024)throw Error('存档文件过大');const p=JSON.parse(raw);
 if(p.format!=='haunted-stay-save'||p.version!==1||!GameStorage.valid(p.state)||p.checkpoint&&!GameStorage.valid(p.checkpoint))throw Error('这不是受支持的《请确认入住》存档');
 for(const s of [p.state,p.checkpoint].filter(Boolean)){validateSaveShape(s,initial());if(!VIEWS[s.app])throw Error('存档中的应用不存在');const walk=x=>{if(!x||typeof x!=='object')return;for(const [k,v] of Object.entries(x)){if(['image','asset'].includes(k)&&typeof v==='string'&&!/^[\w./-]+$/.test(v))throw Error('存档图片名称不正确');walk(v);}};walk(s);}
 return p;
}
ACTIONS['save-import']=()=>{const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.hidden=true;document.body.append(input);input.addEventListener('change',async()=>{try{const file=input.files[0];if(!file)return;if(file.size>8*1024*1024)throw Error('存档文件过大');importCandidate=decodeSave(await file.text());sheet('恢复备份',`<p class="save-explain">这会替换当前这一夜的进度。</p><div class="save-summary"><b>备份时间</b><p>${esc(saveDate(Date.parse(importCandidate.exportedAt)))}</p><small>游戏时间 ${Math.floor(importCandidate.state.time/60)%24}:${String(Math.floor(importCandidate.state.time)%60).padStart(2,'0')}</small></div>${B('save-import-confirm','恢复这份存档','primary')}${B('save-panel','取消','secondary')}`);}catch(e){savePanel('无法导入：'+e.message);}finally{input.remove();}});input.addEventListener('cancel',()=>input.remove());input.click();};
ACTIONS['save-import-confirm']=()=>{if(!importCandidate)return;try{const candidate=importCandidate;GameStorage.replace(candidate.state,candidate.checkpoint);S=candidate.state;v2Defaults(S);close();R.scareLeft=0;R.noticeLeft=0;R.notice=null;$('#scare').className='';renderNotice();save();render();}catch(e){savePanel('恢复失败：'+e.message);}};
const resetBeforeSaves=ACTIONS['reset-now'];ACTIONS['reset-now']=()=>{close();resetBeforeSaves();GameStorage.resetBackup();save();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
const textBeforeSaves=window.render_game_to_text;window.render_game_to_text=()=>JSON.stringify({...JSON.parse(textBeforeSaves()),save:{ok:GameStorage.status.ok,savedAt:GameStorage.status.savedAt,recovered:GameStorage.status.recovered,panelOpen:savePanelOpen}});
save();render();
