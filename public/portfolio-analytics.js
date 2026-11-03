(() => {
  const config = document.currentScript?.dataset || {};
  const key = 'portfolio:analytics-consent:v1';
  const setting = document.querySelector('[data-analytics-consent]');
  const status = document.querySelector('[data-analytics-status]');
  let allowed = false, started = false;
  try { allowed = localStorage.getItem(key) === 'granted'; } catch { /* default off */ }
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ if (allowed || arguments[0] === 'consent') window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  const reflect = () => {if(setting) setting.checked=allowed; if(status) status.textContent=allowed?'Analytics is on.':'Analytics is off.';};
  const inject = src => {const script=document.createElement('script');script.async=true;script.src=src;document.head.append(script);};
  const start = () => {
    if (!allowed || started) return;
    started = true;
    window.gtag('consent','update',{analytics_storage:'granted'});
    window.gtag('js',new Date());
    window.gtag('config',config.gaId);
    window.clarity = function(){if(allowed)(window.clarity.q=window.clarity.q||[]).push(arguments);};
    window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'granted'});
    inject('https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(config.gaId));
    inject('https://www.clarity.ms/tag/'+encodeURIComponent(config.clarityId));
    readAttribution();
    if(projectSlug) {setClarityTag('landing_project',projectSlug); sendEvent('portfolio_project_open',{project_slug:projectSlug,current_route:currentRoute,previous_route:previousRoute()});}
  };
  const schedule = () => {
    const idle = () => 'requestIdleCallback' in window ? requestIdleCallback(start) : setTimeout(start,2000);
    if(document.readyState==='complete') idle(); else addEventListener('load',idle,{once:true});
  };
  const choose = value => {
    allowed=value;
    try {localStorage.setItem(key,value?'granted':'denied');} catch { /* this page only */ }
    reflect();
    if(value) schedule();
    else {
      window.gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      window.clarity?.('consentv2',{ad_Storage:'denied',analytics_Storage:'denied'});
      for(const cookie of document.cookie.split(';')) {
        const name=cookie.split('=')[0].trim();
        if(!/^(_ga(?:_|$)|_gid$|_gat|_clck$|_clsk$)/.test(name))continue;
        for(const domain of ['',location.hostname,'.'+location.hostname,'.alexinfield.com']) document.cookie=name+'=; Max-Age=0; path=/'+(domain?'; domain='+domain:'');
      }
      if(started) location.reload();
    }
  };
  setting?.addEventListener('change',()=>choose(setting.checked));
  addEventListener('storage',event=>{if(event.key===key) {allowed=event.newValue==='granted';reflect();if(!allowed&&started) location.reload();else if(allowed)schedule();}});
  reflect(); schedule();
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
    if (value && typeof window.clarity === "function") {
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
    video.addEventListener("timeupdate", () => recordVideoProgress(video));
    video.addEventListener("ended", () => {
      if (state.milestones.has(100)) return;
      state.milestones.add(100);
      sendEvent("portfolio_media_complete", videoParameters(video));
    });
  }

  document.addEventListener("click", (event) => {
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
