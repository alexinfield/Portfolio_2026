(() => {
  const currentRoute = window.location.pathname;
  const projectMatch = currentRoute.match(/\/projects\/([^/]+)/);
  const projectSlug = projectMatch?.[1] || "";
  const videoState = new WeakMap();

  const safeValue = (value, maxLength = 64) => {
    const normalized = String(value || "").toLowerCase();
    return /^[a-z0-9_-]+$/.test(normalized) ? normalized.slice(0, maxLength) : "";
  };

  const sendEvent = (name, parameters = {}) => {
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

  if (projectSlug) {
    setClarityTag("landing_project", projectSlug);
    sendEvent("portfolio_project_open", {
      project_slug: projectSlug,
      current_route: currentRoute,
      previous_route: previousRoute(),
    });
  }

  readAttribution();
})();
