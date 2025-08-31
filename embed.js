// embed.js — pop-up с формой "Получить" и надёжной отправкой через image-ping (GET)
(function(){
  const script = document.currentScript || document.querySelector('script[src$="embed.js"]');
  const cfg = {
    clientId: script && script.getAttribute('data-client-id') || 'demo',
    trackUrl: script && script.getAttribute('data-track-url') || '',
    delayMs: parseInt(script && script.getAttribute('data-delay') || '2000', 10),
    title: script && script.getAttribute('data-title') || 'Нужна помощь?',
    text: script && script.getAttribute('data-text') || 'Оставьте телефон — перезвоним',
    ctaText: script && script.getAttribute('data-cta-text') || 'Получить',
    placeholderPhone: script && script.getAttribute('data-placeholder-phone') || 'Телефон или email',
  };

  // отправка через GET (image ping) — избегаем CORS
  function sendViaImage(paramsObj){
    if(!cfg.trackUrl) return;
    const params = [];
    for(const k in paramsObj){
      const v = paramsObj[k] == null ? '' : String(paramsObj[k]);
      params.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
    }
    const url = cfg.trackUrl + (cfg.trackUrl.indexOf('?') === -1 ? '?' : '&') + params.join('&') + '&_=' + Date.now();
    try {
      const img = new Image();
      img.src = url;
    } catch(e){}
  }

  function trackSimple(eventName){
    sendViaImage({
      client_id: cfg.clientId,
      page: location.href,
      event: eventName,
      ua: navigator.userAgent,
      ref: document.referrer,
      ts: new Date().toISOString()
    });
  }

  function render(){
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:999999;font-family:system-ui,Arial,Helvetica,sans-serif';
    const box = document.createElement('div');
    box.style.cssText = 'background:#fff;max-width:420px;width:92%;border-radius:12px;padding:18px;box-shadow:0 10px 30px rgba(0,0,0,.25);';
    box.innerHTML = `
      <div style="font-size:18px;font-weight:700;margin-bottom:8px">${cfg.title}</div>
      <div style="font-size:14px;color:#444;margin-bottom:12px">${cfg.text}</div>
      <div style="display:flex;gap:8px;align-items:center">
        <input id="pp-input" type="text" placeholder="${cfg.placeholderPhone}" style="flex:1;padding:10px;border:1px solid #e6e6e6;border-radius:8px;font-size:14px" />
        <button id="pp-get" style="padding:10px 14px;background:#2563eb;color:#fff;border:0;border-radius:8px;cursor:pointer">${cfg.ctaText}</button>
        <button id="pp-close" style="padding:10px 12px;background:#f3f4f6;border:0;border-radius:8px;cursor:pointer">Позже</button>
      </div>
      <div id="pp-msg" style="margin-top:8px;font-size:13px;color:#0f172a;opacity:.9"></div>
    `;
    wrap.appendChild(box);
    document.body.appendChild(wrap);

    const input = document.getElementById('pp-input');
    const btnGet = document.getElementById('pp-get');
    const btnClose = document.getElementById('pp-close');
    const msg = document.getElementById('pp-msg');

    btnClose.onclick = function(){
      trackSimple('close');
      wrap.remove();
    };

    btnGet.onclick = function(e){
      e.preventDefault();
      const val = (input.value || '').trim();
      if(!val){
        msg.style.color = '#b91c1c';
        msg.textContent = 'Пожалуйста, введите телефон или email';
        return;
      }
      // простая валидация (номер или email)
      const digits = val.replace(/\D/g,'');
      const isPhone = digits.length >= 7;
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if(!isPhone && !isEmail){
        msg.style.color = '#b91c1c';
        msg.textContent = 'Введите корректный телефон или email';
        return;
      }

      // блокируем кнопку
      btnGet.disabled = true;
      btnGet.style.opacity = '0.6';
      msg.style.color = '#111827';
      msg.textContent = 'Отправляем заявку...';

      // отправляем событие "lead" с данными
      sendViaImage({
        client_id: cfg.clientId,
        page: location.href,
        event: 'lead',
        contact: val,
        ua: navigator.userAgent,
        ref: document.referrer,
        ts: new Date().toISOString()
      });

      // также отправим обычный click/impression для аналитики
      trackSimple('click');

      // показать успех и закрыть через 1.2s
      setTimeout(function(){
        msg.style.color = '#047857';
        msg.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
        // можно сразу закрыть попап
        setTimeout(function(){ wrap.remove(); }, 1200);
      }, 600);
    };

    // трек импрешен
    trackSimple('impression');
  }

  window.addEventListener('load', function(){
    setTimeout(render, cfg.delayMs);
  });
})();
