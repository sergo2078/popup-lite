// embed.js — легкий pop-up, логирует события в Apps Script
(function(){
  const cfg = {
    clientId: document.currentScript && document.currentScript.getAttribute('data-client-id') || 'demo',
    trackUrl: document.currentScript && document.currentScript.getAttribute('data-track-url') || '',
    delayMs: parseInt(document.currentScript && document.currentScript.getAttribute('data-delay') || '3000', 10),
    title: document.currentScript && document.currentScript.getAttribute('data-title') || 'Нужна помощь?',
    text: document.currentScript && document.currentScript.getAttribute('data-text') || 'Оставьте контакт — перезвоним',
    ctaText: document.currentScript && document.currentScript.getAttribute('data-cta-text') || 'Получить',
    ctaHref: document.currentScript && document.currentScript.getAttribute('data-cta-href') || '#'
  };

  function track(event){
    if(!cfg.trackUrl) return;
    const payload = {
      client_id: cfg.clientId,
      page: location.href,
      event: event,
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      ts: new Date().toISOString()
    };
    // try sendBeacon first, fallback to fetch
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], {type: 'application/json'});
        navigator.sendBeacon(cfg.trackUrl, blob);
      } else {
        fetch(cfg.trackUrl, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)}).catch(()=>{});
      }
    } catch(e){}
  }

  function render(){
    // простой стиль, не ломает сайт
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:999999;font-family:system-ui,Arial,Helvetica,sans-serif';
    const box = document.createElement('div');
    box.style.cssText = 'background:#fff;max-width:420px;width:92%;border-radius:12px;padding:18px;box-shadow:0 10px 30px rgba(0,0,0,.25);';
    box.innerHTML = `
      <div style="font-size:18px;font-weight:700;margin-bottom:8px">${cfg.title}</div>
      <div style="font-size:14px;color:#444;margin-bottom:14px">${cfg.text}</div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="pp-close" style="padding:9px 13px;background:#eee;border:0;border-radius:9px;cursor:pointer">Позже</button>
        <a id="pp-cta" href="${cfg.ctaHref}" style="padding:9px 13px;background:#2563eb;color:#fff;text-decoration:none;border-radius:9px">${cfg.ctaText}</a>
      </div>`;
    wrap.appendChild(box);
    document.body.appendChild(wrap);

    document.getElementById('pp-close').onclick = function(){
      track('close');
      wrap.remove();
    };
    document.getElementById('pp-cta').onclick = function(){
      track('click');
      // переход по ссылке; не закрыим, т.к. клиент может перейти
    };
    track('impression');
  }

  window.addEventListener('load', function(){
    setTimeout(render, cfg.delayMs);
  });
})();
