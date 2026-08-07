(function(){
  'use strict';
  const SUPABASE_URL='https://xyaaxalrrntmhpfgijzu.supabase.co';
  const SUPABASE_KEY='sb_publishable_J7aI1rYqBVq_6FJ-_EY-SA_D1pg3vkB';
  const SDK='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  const DAY=24*60*60*1000, TTL=30*DAY;
  let client=null,user=null,profile=null,loading=false;

  const api={
    ready:null,
    get client(){return client},
    get user(){return user},
    get profile(){return profile},
    uid(){return user&&user.id||null},
    isSignedIn(){return !!user},
    historyStorageKey(){return user?`ieltsPhraseHistory:${user.id}`:'ieltsPhraseHistory'},
    masteredStorageKey(){return user?`ieltsPhraseMasteredV1:${user.id}`:'ieltsPhraseMasteredV1'},
    async saveHistory(record){return saveHistory(record)},
    async deleteHistory(clientId){return deleteHistory(clientId)},
    async setMastered(phraseKey,topicId,itemId,mastered){return setMastered(phraseKey,topicId,itemId,mastered)},
    async clearMastered(topicId){return clearMastered(topicId)},
    async syncAll(){return syncAll()},
    async signOut(){if(client)await client.auth.signOut()},
  };
  window.IELTSCloud=api;

  function emit(name,detail={}){window.dispatchEvent(new CustomEvent(name,{detail}))}
  function toast(msg){
    let t=document.getElementById('cloudToast');
    if(!t){t=document.createElement('div');t.id='cloudToast';t.className='cloud-toast';document.body.appendChild(t)}
    t.textContent=msg;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2400);
  }
  function safeJson(s,fallback){try{return JSON.parse(s)}catch(_){return fallback}}
  function readArray(key){const x=safeJson(localStorage.getItem(key)||'[]',[]);return Array.isArray(x)?x:[]}
  function writeArray(key,x){localStorage.setItem(key,JSON.stringify(Array.isArray(x)?x:[]))}
  function deletedKey(){return user?`ieltsPhraseDeletedHistory:${user.id}`:'ieltsPhraseDeletedHistory'}
  function deletedMasteredKey(){return user?`ieltsPhraseDeletedMastered:${user.id}`:'ieltsPhraseDeletedMastered'}
  function clearMasteredKey(){return user?`ieltsPhraseClearMastered:${user.id}`:'ieltsPhraseClearMastered'}
  function profileName(){return profile&&profile.nickname || user&&user.email&&user.email.split('@')[0] || '已登录'}

  function injectStyles(){
    if(document.getElementById('cloudStyles'))return;
    const s=document.createElement('style');s.id='cloudStyles';s.textContent=`
    .cloud-account{position:fixed;right:14px;top:14px;z-index:80;border:1px solid #e1e6f0;background:rgba(255,255,255,.94);backdrop-filter:blur(10px);border-radius:999px;padding:8px 12px;box-shadow:0 7px 24px rgba(23,32,51,.10);font:750 12px -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif;color:#344054;cursor:pointer}.cloud-account.online{color:#115e3d;border-color:#cce8d8}.cloud-account.syncing{color:#3559e0}.cloud-modal{position:fixed;inset:0;z-index:120;background:rgba(15,23,42,.48);display:none;align-items:center;justify-content:center;padding:18px}.cloud-modal.show{display:flex}.cloud-card{width:min(440px,100%);background:#fff;border-radius:22px;padding:22px;box-shadow:0 24px 80px rgba(0,0,0,.24);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif}.cloud-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.cloud-head h3{margin:0;font-size:20px;color:#172033}.cloud-head p{margin:6px 0 0;color:#667085;font-size:12px;line-height:1.55}.cloud-x{border:0;background:#f2f4f7;border-radius:999px;width:30px;height:30px;cursor:pointer}.cloud-tabs{display:flex;background:#f3f5f9;border-radius:10px;padding:3px;margin:17px 0 12px}.cloud-tabs button{flex:1;border:0;background:transparent;border-radius:8px;padding:8px;font-weight:800;color:#667085;cursor:pointer}.cloud-tabs button.active{background:#fff;color:#3559e0;box-shadow:0 2px 8px rgba(0,0,0,.06)}.cloud-form{display:grid;gap:9px}.cloud-form label{font-size:12px;font-weight:750;color:#475467}.cloud-form input{width:100%;margin-top:5px;border:1px solid #d9deea;border-radius:10px;padding:11px 12px;font:inherit;outline:none}.cloud-form input:focus{border-color:#8da1ff;box-shadow:0 0 0 3px rgba(53,89,224,.08)}.cloud-primary,.cloud-secondary{border:0;border-radius:10px;padding:11px 12px;font-weight:850;cursor:pointer}.cloud-primary{background:#3559e0;color:#fff}.cloud-secondary{background:#f2f4f7;color:#344054}.cloud-note{font-size:11px;color:#98a2b3;line-height:1.55}.cloud-userbox{background:#f8f9fc;border:1px solid #e5e9f2;border-radius:13px;padding:13px;margin:14px 0}.cloud-userbox b{display:block;color:#172033}.cloud-userbox span{font-size:12px;color:#667085}.cloud-toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,18px);opacity:0;pointer-events:none;z-index:150;background:#111827;color:#fff;padding:10px 14px;border-radius:10px;font:700 12px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;transition:.18s}.cloud-toast.show{transform:translate(-50%,0);opacity:1}@media(max-width:600px){.cloud-account{top:9px;right:9px;padding:7px 10px}.cloud-card{padding:18px}}
    `;document.head.appendChild(s);
  }

  function injectUI(){
    injectStyles();
    if(!document.getElementById('cloudAccount')){
      const b=document.createElement('button');b.id='cloudAccount';b.className='cloud-account';b.textContent='登录 · 多设备同步';b.onclick=()=>openModal();document.body.appendChild(b);
    }
    if(!document.getElementById('cloudModal')){
      const m=document.createElement('div');m.id='cloudModal';m.className='cloud-modal';m.innerHTML=`<div class="cloud-card"><div class="cloud-head"><div><h3>学习账号</h3><p>登录后同步已掌握短语、测试历史和错题复习进度。未登录时仍可在本机离线使用。</p></div><button class="cloud-x" id="cloudClose">×</button></div><div id="cloudSignedOut"><div class="cloud-tabs"><button id="cloudTabLogin" class="active">登录</button><button id="cloudTabRegister">注册</button></div><form id="cloudLoginForm" class="cloud-form"><label>邮箱<input id="cloudLoginEmail" type="email" autocomplete="email" required></label><label>密码<input id="cloudLoginPassword" type="password" autocomplete="current-password" minlength="6" required></label><button class="cloud-primary" type="submit">登录并同步</button><div class="cloud-note">密码由 Supabase Auth 处理，本网站不会明文保存密码。</div></form><form id="cloudRegisterForm" class="cloud-form" style="display:none"><label>昵称<input id="cloudNickname" type="text" maxlength="40" autocomplete="nickname" required></label><label>邮箱<input id="cloudRegisterEmail" type="email" autocomplete="email" required></label><label>密码<input id="cloudRegisterPassword" type="password" autocomplete="new-password" minlength="6" required></label><button class="cloud-primary" type="submit">创建账号</button><div class="cloud-note">如果项目开启了邮箱确认，注册后需要先去邮箱点击确认链接再登录。</div></form></div><div id="cloudSignedIn" style="display:none"><div class="cloud-userbox"><b id="cloudUserName"></b><span id="cloudUserEmail"></span></div><button id="cloudSyncNow" class="cloud-primary" style="width:100%;margin-bottom:8px">立即同步</button><button id="cloudSignOut" class="cloud-secondary" style="width:100%">退出登录</button><div class="cloud-note" style="margin-top:10px">同一账号在 Mac、Windows、iPad 和手机登录后会读取同一份云端进度。</div></div></div>`;document.body.appendChild(m);
      document.getElementById('cloudClose').onclick=closeModal;
      m.addEventListener('click',e=>{if(e.target===m)closeModal()});
      const switchTab=mode=>{const log=mode==='login';document.getElementById('cloudTabLogin').classList.toggle('active',log);document.getElementById('cloudTabRegister').classList.toggle('active',!log);document.getElementById('cloudLoginForm').style.display=log?'grid':'none';document.getElementById('cloudRegisterForm').style.display=log?'none':'grid'};
      document.getElementById('cloudTabLogin').onclick=()=>switchTab('login');document.getElementById('cloudTabRegister').onclick=()=>switchTab('register');
      document.getElementById('cloudLoginForm').onsubmit=async e=>{e.preventDefault();if(!client)return toast('云端服务尚未加载，请确认网络后重试');const email=document.getElementById('cloudLoginEmail').value.trim(),password=document.getElementById('cloudLoginPassword').value;const b=e.submitter;b.disabled=true;b.textContent='登录中…';const {error}=await client.auth.signInWithPassword({email,password});b.disabled=false;b.textContent='登录并同步';if(error)return toast(error.message||'登录失败');toast('登录成功，正在同步');closeModal()};
      document.getElementById('cloudRegisterForm').onsubmit=async e=>{e.preventDefault();if(!client)return toast('云端服务尚未加载，请确认网络后重试');const nickname=document.getElementById('cloudNickname').value.trim(),email=document.getElementById('cloudRegisterEmail').value.trim(),password=document.getElementById('cloudRegisterPassword').value;const b=e.submitter;b.disabled=true;b.textContent='创建中…';const {data,error}=await client.auth.signUp({email,password,options:{data:{nickname}}});b.disabled=false;b.textContent='创建账号';if(error)return toast(error.message||'注册失败');if(data&&data.session){toast('注册成功，正在同步');closeModal()}else toast('注册成功，请先到邮箱完成确认后再登录')};
      document.getElementById('cloudSignOut').onclick=async()=>{if(client)await client.auth.signOut();closeModal();toast('已退出登录')};
      document.getElementById('cloudSyncNow').onclick=async()=>{await syncAll(true);toast('同步完成')};
    }
    updateUI();
  }
  function openModal(){injectUI();document.getElementById('cloudModal').classList.add('show');updateUI()}
  function closeModal(){const m=document.getElementById('cloudModal');if(m)m.classList.remove('show')}
  function updateUI(state){
    const b=document.getElementById('cloudAccount');if(!b)return;
    b.classList.toggle('online',!!user);b.classList.toggle('syncing',state==='syncing');
    b.textContent=state==='syncing'?'同步中…':user?`☁ ${profileName()}`:'登录 · 多设备同步';
    const out=document.getElementById('cloudSignedOut'),inn=document.getElementById('cloudSignedIn');if(out&&inn){out.style.display=user?'none':'block';inn.style.display=user?'block':'none';if(user){document.getElementById('cloudUserName').textContent=profileName();document.getElementById('cloudUserEmail').textContent=user.email||''}}
  }

  function loadSdk(){return new Promise((resolve,reject)=>{if(window.supabase&&window.supabase.createClient)return resolve();const existing=document.querySelector('script[data-supabase-sdk]');if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return}const s=document.createElement('script');s.src=SDK;s.async=true;s.dataset.supabaseSdk='1';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  async function fetchProfile(){if(!client||!user)return null;const {data}=await client.from('profiles').select('nickname').eq('user_id',user.id).maybeSingle();return data||null}
  async function applySession(session){
    const old=user&&user.id;user=session&&session.user||null;profile=user?await fetchProfile():null;updateUI();
    if(user){await migrateLegacy();await syncAll()}else emit('ielts-cloud-sync',{signedIn:false});
    if(old!==(user&&user.id))emit('ielts-auth-change',{user,profile});
  }

  function recordToRow(r){
    return {user_id:user.id,client_id:String(r.id),completed_at:new Date(Number(r.timestamp)||Number(r.savedAt)||Date.now()).toISOString(),nickname_snapshot:r.name||null,mode:r.mode==='sentence'?'sentence':'phrase',modules:Array.isArray(r.modules)?r.modules:[],module_ids:Array.isArray(r.moduleIds)?r.moduleIds:[],correct_count:Number(r.correct)||0,total_count:Number(r.total)||1,rate:Number(r.rate)||0,wrong_items:Array.isArray(r.wrong)?r.wrong:[],review_log:Array.isArray(r.reviewLog)?r.reviewLog:[],keep_forever:r.keepForever===true,expires_at:r.keepForever?null:new Date(Number(r.expiresAt)||Date.now()+TTL).toISOString()};
  }
  function rowToRecord(r){
    const ts=Date.parse(r.completed_at)||Date.now(),exp=r.expires_at?Date.parse(r.expires_at):null;
    return {id:r.client_id,timestamp:ts,date:new Date(ts).toLocaleString('zh-CN',{hour12:false}),name:r.nickname_snapshot||'',correct:r.correct_count,total:r.total_count,rate:r.rate,mode:r.mode,modules:r.modules||[],moduleIds:r.module_ids||[],wrong:Array.isArray(r.wrong_items)?r.wrong_items:[],reviewLog:Array.isArray(r.review_log)?r.review_log:[],savedAt:Date.parse(r.created_at)||ts,keepForever:r.keep_forever===true,expiresAt:exp,cloudId:r.id};
  }
  async function saveHistory(record){
    if(!user||!client)return {ok:false,localOnly:true};
    const {error}=await client.from('test_records').upsert(recordToRow(record),{onConflict:'user_id,client_id'});if(error){console.warn('history sync failed',error);return{ok:false,error}}return{ok:true};
  }
  async function deleteHistory(clientId){
    if(!user||!client)return{ok:false,localOnly:true};
    const {error}=await client.from('test_records').delete().eq('user_id',user.id).eq('client_id',String(clientId));if(error){const t=readArray(deletedKey());if(!t.includes(String(clientId))){t.push(String(clientId));writeArray(deletedKey(),t)}console.warn(error);return{ok:false,error}}return{ok:true};
  }
  async function setMastered(phraseKey,topicId,itemId,mastered){
    if(!user||!client)return{ok:false,localOnly:true};const k=String(phraseKey);
    if(mastered){const tomb=readArray(deletedMasteredKey()).filter(x=>String(x)!==k);writeArray(deletedMasteredKey(),tomb);const {error}=await client.from('mastered_phrases').upsert({user_id:user.id,phrase_key:k,topic_id:String(topicId),item_id:Number(itemId)||0},{onConflict:'user_id,phrase_key'});return{ok:!error,error}}
    const {error}=await client.from('mastered_phrases').delete().eq('user_id',user.id).eq('phrase_key',k);if(error){const tomb=readArray(deletedMasteredKey());if(!tomb.includes(k)){tomb.push(k);writeArray(deletedMasteredKey(),tomb)}}return{ok:!error,error};
  }
  async function clearMastered(topicId){
    if(!user||!client)return{ok:false,localOnly:true};let q=client.from('mastered_phrases').delete().eq('user_id',user.id);if(topicId)q=q.eq('topic_id',String(topicId));const{error}=await q;if(error){localStorage.setItem(clearMasteredKey(),topicId?String(topicId):'*')}else localStorage.removeItem(clearMasteredKey());return{ok:!error,error};
  }
  async function cleanupExpired(){if(!user||!client)return;await client.from('test_records').delete().eq('user_id',user.id).eq('keep_forever',false).lt('expires_at',new Date().toISOString())}
  async function migrateLegacy(){
    if(!user||!client)return;const flag=`ieltsPhraseCloudMigratedV6:${user.id}`;if(localStorage.getItem(flag)==='1')return;
    const oldM=readArray('ieltsPhraseMasteredV1');if(oldM.length){const rows=oldM.map(k=>{const p=String(k).split(':');return{user_id:user.id,phrase_key:String(k),topic_id:p[0]||'unknown',item_id:Number(p[1])||0}});await client.from('mastered_phrases').upsert(rows,{onConflict:'user_id,phrase_key'})}
    const oldH=readArray('ieltsPhraseHistory');if(oldH.length){const rows=oldH.filter(r=>r&&r.id).map(recordToRow);if(rows.length)await client.from('test_records').upsert(rows,{onConflict:'user_id,client_id'})}
    localStorage.setItem(flag,'1');
  }
  async function syncAll(manual=false){
    if(loading||!user||!client)return;loading=true;updateUI('syncing');
    try{
      await cleanupExpired();
      // Push local signed-in cache first, so offline edits made earlier are not lost.
      const hk=api.historyStorageKey(),localH=readArray(hk);if(localH.length){const rows=localH.filter(r=>r&&r.id).map(recordToRow);if(rows.length)await client.from('test_records').upsert(rows,{onConflict:'user_id,client_id'})}
      const tomb=readArray(deletedKey());if(tomb.length){for(const id of tomb)await client.from('test_records').delete().eq('user_id',user.id).eq('client_id',String(id));writeArray(deletedKey(),[])}
      const pendingClear=localStorage.getItem(clearMasteredKey());if(pendingClear){let q=client.from('mastered_phrases').delete().eq('user_id',user.id);if(pendingClear!=='*')q=q.eq('topic_id',pendingClear);const{error}=await q;if(!error)localStorage.removeItem(clearMasteredKey())}
      const mtomb=readArray(deletedMasteredKey());if(mtomb.length){for(const k of mtomb)await client.from('mastered_phrases').delete().eq('user_id',user.id).eq('phrase_key',String(k));writeArray(deletedMasteredKey(),[])}
      const mk=api.masteredStorageKey(),localM=readArray(mk);if(localM.length){const rows=localM.map(k=>{const p=String(k).split(':');return{user_id:user.id,phrase_key:String(k),topic_id:p[0]||'unknown',item_id:Number(p[1])||0}});await client.from('mastered_phrases').upsert(rows,{onConflict:'user_id,phrase_key'})}
      const [{data:tests,error:te},{data:mastered,error:me}]=await Promise.all([client.from('test_records').select('*').eq('user_id',user.id).order('completed_at',{ascending:false}),client.from('mastered_phrases').select('phrase_key').eq('user_id',user.id)]);
      if(te)throw te;if(me)throw me;
      const allTests=tests||[],kept=allTests.filter(x=>x.keep_forever),regular=allTests.filter(x=>!x.keep_forever),excess=regular.slice(50);if(excess.length){for(const r of excess)await client.from('test_records').delete().eq('user_id',user.id).eq('id',r.id)}const visible=[...kept,...regular.slice(0,50)].sort((a,b)=>Date.parse(b.completed_at)-Date.parse(a.completed_at));
      writeArray(hk,visible.map(rowToRecord));writeArray(mk,(mastered||[]).map(x=>x.phrase_key));
      emit('ielts-cloud-sync',{signedIn:true,manual,history:visible.length,mastered:(mastered||[]).length});
    }catch(e){console.warn('Cloud sync failed',e);emit('ielts-cloud-error',{error:e})}finally{loading=false;updateUI()}
  }

  async function init(){
    injectUI();
    try{await loadSdk();if(!window.supabase||!window.supabase.createClient)throw new Error('Supabase SDK unavailable');client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});const {data}=await client.auth.getSession();await applySession(data&&data.session);client.auth.onAuthStateChange((_event,session)=>setTimeout(()=>applySession(session),0));window.addEventListener('online',()=>syncAll());}
    catch(e){console.warn('Cloud unavailable; local mode remains active.',e);emit('ielts-cloud-error',{error:e});updateUI()}
  }
  api.ready=new Promise(resolve=>{const run=()=>init().finally(resolve);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run()});
})();
