// простой попап: задержка, заголовок, текст, CTA; события отправляются в Apps Script
(function(){
  const cfg = {
    clientId: document.currentScript.getAttribute('data-client-id') || 'demo',
    trackUrl: document.currentScript.getAttribute('data-track-url'), // Apps Script URL
    delayMs: parseInt(document.currentScript.getAttribute('data-delay') || '3000', 10),
    title: document.currentScript.getAttribute('data-title') || 'Вам помочь с выбором?',
    text: document.currentScript.getAttribute('data-text') || 'Оставьте контакт — вышлем подборку и подарок',
    ctaText: document.currentScript.getAttribute('data-cta-text') || 'Получить',
    ctaHref: document.currentScript.getAttribute('data-cta-href') || '#'
  };

  function track(event){
    if(!cfg.trackUrl) return;
    try {
      navigator.sendBeacon?.(cfg.trackUrl, JSON.stringify({
        client_id: cfg.clientId,
        page: location.href,
        event,
        user_agent: navigator.userAgent,
        referrer: document.referrer
      })) || fetch(cfg.trackUrl, {method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          client_id: cfg.clientId, page: location.href, event,
          user_agent: navigator.userAgent, referrer: document.referrer
        })
      });
    } catch(e){}
  }

  function render(){
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:999999';
    const box = document.createElement('div');
    box.style.cssText = 'background:#fff;max-width:420px;width:92%;border-radius:16px;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,.2);font-family:system-ui,Arial';
    box.innerHTML = `
      <div style="font-size:20px;font-weight:700;margin-bottom:8px">${cfg.title}</div>
      <div style="font-size:14px;opacity:.8;margin-bottom:16px">${cfg.text}</div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="pp-close" style="padding:10px 14px;background:#eee;border:0;border-radius:10px;cursor:pointer">Позже</button>
        <a id="pp-cta" href="${cfg.ctaHref}" style="padding:10px 14px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:10px"> ${cfg.ctaText} </a>
      </div>`;
    wrap.appendChild(box);
    document.body.appendChild(wrap);

    document.getElementById('pp-close').onclick = function(){
      wrap.remove(); track('close');
    };
    document.getElementById('pp-cta').onclick = function(){
      track('click');
      // не закрываем, переходит по ссылке
    };
    track('impression');
  }

  window.addEventListener('load', function(){
    setTimeout(render, cfg.delayMs);
  });
})();
