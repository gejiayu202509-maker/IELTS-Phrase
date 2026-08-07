(function(){
  if(!('serviceWorker' in navigator) || !(location.protocol==='https:' || location.hostname==='localhost')) return;
  let refreshing=false;
  function showUpdate(reg){
    if(document.getElementById('pwaUpdateNotice')) return;
    const style=document.createElement('style');
    style.textContent='#pwaUpdateNotice{position:fixed;top:max(12px,env(safe-area-inset-top));right:12px;z-index:9999;display:flex;align-items:center;gap:10px;max-width:min(92vw,420px);padding:10px 11px 10px 13px;background:rgba(17,24,39,.96);color:#fff;border-radius:13px;box-shadow:0 12px 36px rgba(0,0,0,.24);font:600 12px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;backdrop-filter:blur(10px)}#pwaUpdateNotice button{border:0;border-radius:9px;padding:7px 10px;background:#fff;color:#172033;font-weight:850;cursor:pointer;white-space:nowrap}#pwaUpdateNotice button:disabled{opacity:.65;cursor:default}@media(max-width:540px){#pwaUpdateNotice{left:10px;right:10px;top:max(10px,env(safe-area-inset-top));max-width:none;justify-content:space-between}}';
    document.head.appendChild(style);
    const box=document.createElement('div');box.id='pwaUpdateNotice';box.innerHTML='<span>检测到新版本</span><button type="button">点击立即更新</button>';
    const btn=box.querySelector('button');
    btn.onclick=function(){btn.disabled=true;btn.textContent='正在更新…';if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});else location.reload()};
    document.body.appendChild(box);
  }
  navigator.serviceWorker.addEventListener('controllerchange',function(){if(refreshing)return;refreshing=true;location.reload()});
  window.addEventListener('load',async function(){
    try{
      const reg=await navigator.serviceWorker.register('./sw.js');
      if(reg.waiting && navigator.serviceWorker.controller) showUpdate(reg);
      reg.addEventListener('updatefound',function(){const w=reg.installing;if(!w)return;w.addEventListener('statechange',function(){if(w.state==='installed' && navigator.serviceWorker.controller)showUpdate(reg)})});
      setTimeout(function(){reg.update().catch(function(){})},1200);
    }catch(e){console.warn('SW registration failed',e)}
  });
})();
