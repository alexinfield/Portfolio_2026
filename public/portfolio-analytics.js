(() => {
  const config = document.currentScript?.dataset || {};
  const key = 'portfolio:analytics-consent:v1';
  const revokedKey = 'portfolio:analytics-revoked:v1';
  const revokedCookie = 'portfolio-analytics-revoked';
  const setting = null;
  const status = null;
  const owned = /^(?:_ga(?:_|$)|_gid$|_gat(?:_|$)|_gcl(?:_|$)|_gac(?:_|$)|_cl(?:ck|sk|tk)$|clarity(?:[:._-]|$)|google[_:-]?(?:analytics|tag)|gtm(?:[:._-]|$)|__utm[abczvt]$|AMP_TOKEN$|FP(?:LC|ID)$|CLID$|MUID$|ANONCHK$|MR$|SM$)/i;
  let allowed = false, started = false, locked = false, generation = 0;
  const scripts = new Set(), idleJobs = new Set(), timers = new Set();
  let channel=null;try{if(typeof BroadcastChannel==='function')channel=new BroadcastChannel('portfolio-analytics-consent');}catch{/* storage events remain available */}
  const stored = () => {try {return localStorage.getItem(key);} catch {return null;}};
  const revokedCookiePresent=()=>{try{return document.cookie.split(';').some(c=>c.trim().startsWith(revokedCookie+'=1'));}catch{return true;}};
  const readConsent = () => {
    try {
      return stored()!=='denied' && sessionStorage.getItem(revokedKey)!=='1' &&
        !revokedCookiePresent() &&
        new URL(location.href).searchParams.get('analytics')!=='off';
    } catch {return false;}
  };
  allowed=readConsent();
  const googleDenied = args => args[0]==='consent' && args[2] && args[2].analytics_storage==='denied' && !Object.values(args[2]).includes('granted');
  const clarityDenied = args => args[0]==='consentv2' && args[1]?.analytics_Storage==='denied' && args[1]?.ad_Storage==='denied';
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){if((allowed&&readConsent())||googleDenied(arguments))window.dataLayer.push(arguments);};
  const denied={analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'};
  window.gtag('consent','default',denied);
  const reflect=()=>{if(setting)setting.checked=allowed;if(status)status.textContent=allowed?'Analytics is on.':'Analytics is off.';};
  const domains=()=>{const out=[''];const parts=location.hostname.split('.');while(parts.length>1){out.push(parts.join('.'),'.'+parts.join('.'));parts.shift();}return out;};
  const paths=()=>{const out=new Set(['/']);const parts=location.pathname.split('/').filter(Boolean);for(let i=1;i<=parts.length;i++){out.add('/'+parts.slice(0,i).join('/'));out.add('/'+parts.slice(0,i).join('/')+'/');}return out;};
  const purge=()=>{
    let names=[];try{names=document.cookie.split(';').map(c=>c.split('=')[0].trim()).filter(name=>owned.test(name));}catch{/* no cookie access */}
    for(const name of names)for(const domain of domains())for(const path of paths())try{document.cookie=name+'=; Max-Age=0; path='+path+(domain?'; domain='+domain:'');}catch{/* denied startup repeats cleanup */}
    for(const type of ['localStorage','sessionStorage'])try{const storage=window[type];for(const name of Object.keys(storage))if(owned.test(name))storage.removeItem(name);}catch{/* unavailable storage stays off */}
    try{if(window.indexedDB?.databases)indexedDB.databases().then(dbs=>{for(const db of dbs)if(db.name&&owned.test(db.name))indexedDB.deleteDatabase(db.name);}).catch(()=>{});}catch{/* unavailable storage stays off */}
  };
  const fence=win=>{
    const doc=win.document;
    if(!doc.querySelector('[data-analytics-stop]')){
      const hashes=[...doc.querySelectorAll('meta[http-equiv="Content-Security-Policy"]')].flatMap(meta=>meta.content.match(/'(?:sha(?:256|384|512)-[^']+|nonce-[^']+)'/g)||[]);
      const policy=doc.createElement('meta');policy.httpEquiv='Content-Security-Policy';policy.dataset.analyticsStop='';
      policy.content="connect-src 'self'; img-src 'self' data:; script-src 'self' "+[...new Set(hashes)].join(' ')+"; worker-src 'none'; frame-src 'self'; object-src 'none'; form-action 'none'";
      doc.head.append(policy);
    }
    const contexts=[win];
    for(const frame of doc.querySelectorAll('iframe'))try{contexts.push(...fence(frame.contentWindow));}catch{frame.remove();}
    return contexts;
  };
  const save=value=>{try{localStorage.setItem(key,value);return stored()===value;}catch{return false;}};
  const withdraw=(persist=true)=>{
    allowed=false;generation++;
    for(const job of idleJobs)window.cancelIdleCallback?.(job);idleJobs.clear();for(const job of timers)clearTimeout(job);timers.clear();
    // Install the new-request barrier before provider APIs and unload, including
    // cached native request functions. Earlier fetches are not retracted: their
    // queues are neutralized below and a denied reload purges storage again.
    const contexts=fence(window);locked=true;
    try{sessionStorage.setItem(revokedKey,'1');}catch{/* cookie and URL fallback below */}
    try{document.cookie=revokedCookie+'=1; path=/; SameSite=Lax';}catch{/* URL fallback below */}
    let durable=false;
    if(persist){
      durable=save('denied');
      // Removing an old grant can still succeed when a quota blocks writes.
      if(!durable)try{localStorage.removeItem(key);durable=localStorage.getItem(key)!=='granted';}catch{/* URL fallback below */}
    }else try{durable=localStorage.getItem(key)!=='granted';}catch{/* URL fallback below */}
    for(const win of contexts){
      const google=win.gtag,clarity=win.clarity,queue=win.dataLayer,clarityQueue=clarity?.q;
      try{if(queue)queue.length=0;if(clarityQueue)clarityQueue.length=0;}catch{/* CSP remains the boundary */}
      win['ga-disable-'+config.gaId]=true;
      try{google?.('consent','update',denied);}catch{/* teardown must continue */}
      try{clarity?.('consentv2',{ad_Storage:'denied',analytics_Storage:'denied'});}catch{/* teardown must continue */}
      try{if(queue)queue.length=0;if(clarityQueue)clarityQueue.length=0;}catch{/* cached queues are network-fenced */}
      // A loader already in flight may still execute after its tag is removed.
      // Give that installer explicit denials, rather than an empty queue that
      // could restore its default storage permission. Old grant arrays stay empty.
      const googleDenied=[['consent','default',{...denied}],['consent','update',{...denied}]];
      const clarityDeniedQueue=[['consentv2',{ad_Storage:'denied',analytics_Storage:'denied'}]];
      googleDenied.push=()=>googleDenied.length;clarityDeniedQueue.push=()=>clarityDeniedQueue.length;
      win.dataLayer=googleDenied;win.gtag=function(){};win.clarity=function(){};win.clarity.q=clarityDeniedQueue;
    }
    for(const script of scripts){script.remove();}scripts.clear();purge();reflect();
    if(persist)channel?.postMessage('denied');
    if(!durable){const url=new URL(location.href);url.searchParams.set('analytics','off');history.replaceState(history.state,'',url.href);}
    if(started)location.reload();
  };
  const inject=src=>{if(!allowed||locked||!readConsent())return;const script=document.createElement('script');script.async=true;script.src=src;scripts.add(script);document.head.append(script);};
  const start=epoch=>{
    if(epoch!==generation||!allowed||locked||started||!readConsent())return;
    started=true;
    window.gtag('consent','update',{analytics_storage:'granted'});window.gtag('js',new Date());window.gtag('config',config.gaId);
    window.clarity=function(){if((allowed&&readConsent())||clarityDenied(arguments))(window.clarity.q=window.clarity.q||[]).push(arguments);};
    window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'granted'});
    inject('https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(config.gaId));inject('https://www.clarity.ms/tag/'+encodeURIComponent(config.clarityId));
    readAttribution();if(projectSlug){setClarityTag('landing_project',projectSlug);sendEvent('portfolio_project_open',{project_slug:projectSlug,current_route:currentRoute,previous_route:previousRoute()});}
  };
  const schedule=()=>{
    const epoch=generation;
    const idle=()=>{if(epoch!==generation||!allowed||locked||!readConsent())return;if('requestIdleCallback'in window)idleJobs.add(requestIdleCallback(()=>start(epoch)));else timers.add(setTimeout(()=>start(epoch),2000));};
    if(document.readyState==='complete')idle();else addEventListener('load',idle,{once:true});
  };
  const choose=value=>{
    if(!value){withdraw();return;}
    if(!save('granted')){allowed=false;reflect();return;}
    try{sessionStorage.removeItem(revokedKey);}catch{/* remaining marker keeps this tab off */}
    try{document.cookie=revokedCookie+'=; Max-Age=0; path=/; SameSite=Lax';}catch{allowed=false;reflect();return;}
    const url=new URL(location.href);if(url.searchParams.get('analytics')==='off'){url.searchParams.delete('analytics');history.replaceState(history.state,'',url.href);}
    allowed=readConsent();reflect();if(locked&&allowed)location.reload();else if(allowed)schedule();
  };
  // Invisible controls preserve explicit withdrawal without adding consent UI.
  window.portfolioAnalytics={withdraw:()=>withdraw(),enable:()=>choose(true)};
  addEventListener('storage',event=>{
    if(event.key!==key&&event.key!==null)return;
    if(stored()==='granted'&&!revokedCookiePresent()){try{sessionStorage.removeItem(revokedKey);}catch{/* fail closed */}allowed=readConsent();reflect();if(allowed&&locked)location.reload();else if(allowed)schedule();}
    else withdraw(false);
  });
  channel?.addEventListener('message',event=>{if(event.data==='denied')withdraw(false);});
  addEventListener('pageshow',event=>{if(event.persisted&&!readConsent())withdraw(false);});
  reflect();if(!allowed)purge();schedule();
  const currentRoute = window.location.pathname;
  const projectMatch = currentRoute.match(/\/projects\/([^/]+)/);
  const projectSlug = projectMatch?.[1] || "";
  const videoState = new WeakMap();

  const safeValue = (value, maxLength = 64) => {
    const normalized = String(value || "").toLowerCase();
    return /^[a-z0-9_-]+$/.test(normalized) ? normalized.slice(0, maxLength) : "";
  };

  const sendEvent = (name, parameters = {}) => {
    if (!allowed || !started) return;
    if (typeof window.gtag === "function") {
      window.gtag("event", name, parameters);
    }
    if (typeof window.clarity === "function") {
      window.clarity("event", name);
    }
  };

  const setClarityTag = (key, value) => {
    if (allowed && started && value && typeof window.clarity === "function") {
      window.clarity("set", key, value);
    }
  };

  const previousRoute = () => {
    if (!document.referrer) return "direct";
    try {
      const previous = new URL(document.referrer);
      return previous.origin === window.location.origin ? previous.pathname : "external";
    } catch {
      return "external";
    }
  };

  const readAttribution = () => {
    const query = new URLSearchParams(window.location.search);
    const entryType = safeValue(query.get("entry_type"));
    const entryId = safeValue(query.get("entry_id"), 24);
    const source = safeValue(query.get("utm_source"));
    const medium = safeValue(query.get("utm_medium"));
    const campaign = safeValue(query.get("utm_campaign"));

    if (![entryType, entryId, source, medium, campaign].some(Boolean)) return;

    const parameters = {
      current_route: currentRoute,
      ...(entryType ? { entry_type: entryType } : {}),
      ...(entryId ? { entry_id: entryId } : {}),
      ...(source ? { campaign_source: source } : {}),
      ...(medium ? { campaign_medium: medium } : {}),
      ...(campaign ? { campaign_name: campaign } : {}),
    };

    setClarityTag("entry_type", entryType || source);
    setClarityTag("entry_id", entryId);
    setClarityTag("campaign", campaign);
    sendEvent("portfolio_entry_attributed", parameters);
  };

  const mediaId = (video) => {
    const source = video.currentSrc || video.querySelector("source")?.src || "video";
    const filename = source.split("/").pop()?.split("?")[0] || "video";
    return safeValue(filename.replace(/\.[^.]+$/, ""), 80) || "video";
  };

  const videoParameters = (video) => ({
    current_route: currentRoute,
    ...(projectSlug ? { project_slug: projectSlug } : {}),
    media_id: mediaId(video),
  });

  const stateFor = (video) => {
    if (!videoState.has(video)) {
      videoState.set(video, { played: false, milestones: new Set() });
    }
    return videoState.get(video);
  };

  const recordVideoProgress = (video) => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    const state = stateFor(video);
    const percent = (video.currentTime / video.duration) * 100;
    for (const milestone of [25, 50, 75]) {
      if (percent >= milestone && !state.milestones.has(milestone)) {
        state.milestones.add(milestone);
        sendEvent(`portfolio_media_${milestone}`, videoParameters(video));
      }
    }
    if (percent >= 98 && !state.milestones.has(100)) {
      state.milestones.add(100);
      sendEvent("portfolio_media_complete", videoParameters(video));
    }
  };

  for (const video of document.querySelectorAll("video")) {
    const state = stateFor(video);
    video.addEventListener("play", () => {
      if (state.played) return;
      state.played = true;
      sendEvent("portfolio_media_play", videoParameters(video));
    });
    for(const event of ['pause','seeked','volumechange','error'])video.addEventListener(event,()=>sendEvent('portfolio_media_'+event,{...videoParameters(video),position_seconds:Math.round(video.currentTime||0),muted:video.muted}));
    video.addEventListener("timeupdate", () => recordVideoProgress(video));
    video.addEventListener("ended", () => {
      if (state.milestones.has(100)) return;
      state.milestones.add(100);
      sendEvent("portfolio_media_complete", videoParameters(video));
    });
  }

  document.addEventListener('fullscreenchange',()=>sendEvent('portfolio_fullscreen',{current_route:currentRoute,active:!!document.fullscreenElement}));
  document.addEventListener("click", (event) => {
    const control=event.target.closest?.('button');
    if(control){const gallery=control.closest('[data-personal-id]');if(gallery)sendEvent('portfolio_gallery_control',{current_route:currentRoute,project_slug:gallery.dataset.personalId,action:(control.getAttribute('aria-label')||'').slice(0,100)});}

    const link = event.target.closest?.("a[href]");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    if (href.startsWith("mailto:")) {
      sendEvent("portfolio_contact_click", { current_route: currentRoute, contact_method: "email" });
      return;
    }

    let destination;
    try {
      destination = new URL(link.href, window.location.href);
    } catch {
      return;
    }

    if (link.closest("header")) {
      sendEvent("portfolio_nav_click", {
        current_route: currentRoute,
        destination_route: destination.pathname,
      });
    }

    if (destination.origin !== window.location.origin) {
      sendEvent("portfolio_outbound_click", {
        current_route: currentRoute,
        destination_host: destination.hostname,
      });
    }

    if (link.hasAttribute("download") || /resume.*\.pdf$/i.test(destination.pathname)) {
      sendEvent("portfolio_resume_download", { current_route: currentRoute });
    }
  });

  if (projectSlug && started) {
    setClarityTag("landing_project", projectSlug);
    sendEvent("portfolio_project_open", {
      project_slug: projectSlug,
      current_route: currentRoute,
      previous_route: previousRoute(),
    });
  }

})();
