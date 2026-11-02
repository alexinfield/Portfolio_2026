(() => {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const states = new Map();
  const coarseFilm = window.matchMedia("(max-width: 767px) and (pointer: coarse)");

  // Low-res placeholders are only needed until the real pixels arrive; dropping them after
  // load keeps anti-aliased rounded corners exactly as they were without a placeholder.
  const placeholderDone = (element) => { element.dataset.lqipDone = "true"; };
  // Home cards: CSS hides the cover over the card's glass from first paint; once the cover is
  // decoded it fades in (data-lqip-show, 250 ms), then the glass drops. A cover whose CSS
  // failsafe (12 s from first style) has already fired, or any cover under reduced motion or
  // without the hiding CSS, gets no fade: show at once, drop the glass on load.
  const hidden = (image) => !motion.matches && Boolean(image?.getAnimations?.().some((a) => a.animationName === "lqip-failsafe" && a.playState !== "finished"));
  const frames = [...document.querySelectorAll("[data-lqip-frame]")].map((frame) => [frame, frame.querySelector("img[data-lqip]")]).map(([frame, image]) => [frame, image, hidden(image)]);
  if (frames.some(([, , fade]) => fade)) document.documentElement.dataset.lqipLive = "";
  frames.forEach(([frame, image, fade]) => {
    const finish = () => { placeholderDone(frame); if (image) placeholderDone(image); };
    const show = () => { frame.dataset.lqipShow = ""; };
    if (!image) return finish();
    if (!fade) show();
    const ready = () => { show(); if (fade) setTimeout(finish, 320); else finish(); };
    if (image.complete && image.naturalWidth) return ready();
    image.addEventListener("load", () => (image.decode ? image.decode().catch(() => {}) : Promise.resolve()).then(ready), { once: true });
    image.addEventListener("error", show, { once: true });
  });
  document.querySelectorAll("img[data-lqip]").forEach((image) => {
    if (image.closest("[data-lqip-frame]")) return;
    if (image.complete && image.naturalWidth) placeholderDone(image);
    else image.addEventListener("load", () => placeholderDone(image), { once: true });
  });
  document.querySelectorAll("video[data-lqip][poster]").forEach((video) => {
    const probe = new Image();
    probe.onload = () => placeholderDone(video);
    probe.src = video.poster;
  });

  const header = document.querySelector(".portfolio-header");
  const measureHeader = () => {
    if (header) document.documentElement.style.setProperty("--portfolio-header-height", `${header.getBoundingClientRect().height}px`);
  };
  measureHeader();
  if (header && "ResizeObserver" in window) new ResizeObserver(measureHeader).observe(header);

  // A focusable unavailable action discloses its state, without a content route.
  const unavailableAction = document.querySelector("[data-unavailable-toggle]");
  const unavailable = document.getElementById("unavailable-status");
  let pinnedUnavailable = false;
  let hoveringUnavailable = false;
  function discloseUnavailable(open) {
    if (!unavailableAction || !unavailable) return;
    unavailable.hidden = !open;
    unavailableAction.setAttribute("aria-expanded", String(open));
  }
  unavailableAction?.addEventListener("pointerenter", event => { if (event.pointerType !== "touch") { hoveringUnavailable = true; discloseUnavailable(true); } });
  unavailableAction?.addEventListener("pointerleave", () => { hoveringUnavailable = false; if (!pinnedUnavailable && document.activeElement !== unavailableAction) discloseUnavailable(false); });
  unavailableAction?.addEventListener("focus", () => { if (unavailableAction.matches(":focus-visible")) discloseUnavailable(true); });
  unavailableAction?.addEventListener("blur", () => { pinnedUnavailable = false; discloseUnavailable(false); });
  unavailableAction?.addEventListener("click", event => {
    pinnedUnavailable = hoveringUnavailable && event.detail > 0 ? true : unavailable.hidden;
    discloseUnavailable(pinnedUnavailable);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") { pinnedUnavailable = false; discloseUnavailable(false); }
  });
  document.addEventListener("pointerdown", event => {
    if (event.target !== unavailableAction && !unavailable?.contains(event.target)) { pinnedUnavailable = false; discloseUnavailable(false); }
  });

  // Explicit origin survives static document navigation. A pending entry is
  // consumed once, and only that exact case entry is eligible for history.back.
  const entryKey = "portfolio:collection-entry";
  const workUrl = document.querySelector('.portfolio-nav a')?.href;
  const collectionUrl = from => workUrl ? new URL(from === "personal" ? "personal/" : "./", workUrl).pathname : "/";
  const pathname = location.pathname.replace(/\/+$/, "") || "/";
  document.addEventListener("click", event => {
    const link = event.target.closest?.("a[data-case-origin]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank") return;
    const destination = new URL(link.href);
    if (destination.origin !== location.origin) return;
    try {
      sessionStorage.setItem(entryKey, JSON.stringify({ from: link.dataset.caseOrigin, collection: location.pathname, target: destination.pathname, scroll: scrollY }));
    } catch { /* Query origin and a normal Back link remain available. */ }
  });
  const back = document.querySelector("[data-case-back]");
  if (back) {
    const explicit = new URLSearchParams(location.search).get("from");
    const from = ["work", "personal"].includes(explicit) ? explicit : back.closest("[data-natural-collection]").dataset.naturalCollection;
    back.href = collectionUrl(from);
    let entry = null;
    try {
      const pending = JSON.parse(sessionStorage.getItem(entryKey) || "null");
      sessionStorage.removeItem(entryKey);
      const restored = history.state?.portfolioReturn;
      if (pending?.target.replace(/\/+$/, "") === pathname && pending.from === from && pending.collection.replace(/\/+$/, "") === collectionUrl(from).replace(/\/+$/, "")) {
        entry = pending;
        history.replaceState({ ...history.state, portfolioReturn: { ...pending, casePath: pathname } }, "");
      } else if (restored?.casePath === pathname && restored.from === from) entry = restored;
    } catch { /* Storage restrictions do not block navigation. */ }
    back.addEventListener("click", event => {
      if (!entry || history.length < 2 || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      history.back();
    });
  }

  // The kit's active scale is suppressed by CSS. This marker also works on
  // static pages and cancels touch feedback when the contact becomes a gesture.
  let press = null;
  const clearPress = () => {
    if (!press) return;
    clearTimeout(press.timer);
    delete press.target.dataset.pressed;
    press = null;
  };
  document.addEventListener("pointerdown", event => {
    clearPress();
    if (motion.matches || event.button !== 0 || event.target.closest?.('input, [role="slider"], [data-slot="slider"]')) return;
    const control = event.target.closest?.('[data-slot="button"]:not(.portfolio-skip-link)');
    if (!control || control.matches(':disabled, [aria-disabled="true"]')) return;
    const target = control.hasAttribute("data-press-surface") ? control.closest(".portfolio-gallery-stage") : control;
    press = { target, x: event.clientX, y: event.clientY, id: event.pointerId, timer: null };
    if (event.pointerType === "touch") press.timer = setTimeout(() => { if (press?.target === target) target.dataset.pressed = "true"; }, 70);
    else target.dataset.pressed = "true";
  }, true);
  document.addEventListener("pointermove", event => {
    if (press && (Math.abs(event.clientX - press.x) > 8 || Math.abs(event.clientY - press.y) > 8)) clearPress();
  }, {passive:true});
  document.addEventListener("pointerup", clearPress, true);
  document.addEventListener("pointercancel", clearPress, true);
  document.addEventListener("scroll", clearPress, {passive:true,capture:true});
  window.addEventListener("blur", clearPress);
  motion.addEventListener("change", clearPress);

  function updateButton(video) {
    const button = video.closest("[data-video-frame]")?.querySelector("[data-video-toggle]");
    if (!button) return;
    const action = video.paused ? "Play" : "Pause";
    button.dataset.playing = String(!video.paused);
    button.setAttribute("aria-label", `${action} ${video.dataset.videoLabel}`);
  }

  function load(video) {
    const state = states.get(video);
    if (state.loaded) return;
    video.querySelectorAll("source[data-src]").forEach((source) => {
      source.src = source.dataset.src;
    });
    state.loaded = true;
    video.load();
    nearObserver?.unobserve(video);
  }

  function initializeVideoEdges(video) {
    const frame = video.closest("[data-video-frame]");
    const edges = [...frame.querySelectorAll("[data-video-edge]")];
    if (edges.length) {
      const canvas = document.createElement("canvas"), context = canvas.getContext("2d");
      function extend(source) {
        if (!context) return;
        const width = source.videoWidth || source.naturalWidth, height = source.videoHeight || source.naturalHeight;
        if (!width || !height) return;
        for (const edge of edges) {
          const side = edge.dataset.videoEdge, vertical = side === "left" || side === "right";
          canvas.width = vertical ? 1 : 128; canvas.height = vertical ? 128 : 1;
          context.drawImage(source, side === "right" ? width - 1 : 0, side === "bottom" ? height - 1 : 0,
            vertical ? 1 : width, vertical ? height : 1, 0, 0, canvas.width, canvas.height);
          edge.style.backgroundImage = `url("${canvas.toDataURL()}")`;
        }
      }
      const poster = new Image(); poster.onload = () => extend(video.readyState>=2?video:poster); poster.src = video.poster;
      video.addEventListener("loadeddata", () => extend(video));
      video.addEventListener("seeked", () => extend(video));
      // Sample only the decoded edge rows/columns, at most ten times a second.
      // Offscreen media is paused by the existing observer; no extra playback.
      let previous = 0, callback = null;
      const sample = now => { callback = null; if (now - previous > 100) { extend(video); previous = now; } if (!video.paused) callback = video.requestVideoFrameCallback?.(sample); };
      video.addEventListener("play", () => { if (callback === null) callback = video.requestVideoFrameCallback?.(sample); });
      video.addEventListener("pause", () => { if (callback != null) video.cancelVideoFrameCallback?.(callback); callback = null; });
      if (!video.requestVideoFrameCallback) video.addEventListener("timeupdate", () => extend(video));
    }
  }

  function message(video, text) {
    const frame = video.closest("[data-video-frame]");
    frame.querySelector("[data-video-message]").textContent = text;
    frame.querySelector("[data-video-status]").hidden = false;
    updateButton(video);
  }

  function play(video) {
    load(video);
    const status = video.closest("[data-video-frame]").querySelector("[data-video-status]");
    status.hidden = true;
    video.play().catch((error) => {
      if (error.name === "AbortError") return;
      message(video, error.name === "NotAllowedError"
        ? "Playback paused. Press Play to start the video."
        : "Video unavailable in this browser.");
    });
  }

  function sync(video) {
    const state = states.get(video);
    const active = video.dataset.mediaActive !== "false";
    const groupPaused = video.dataset.playbackPaused === "true";
    const automatic = video.dataset.autoplayVideo === "true";
    if (document.hidden || !active || !state.visible || state.userPaused ||
        (groupPaused && !state.userStarted) || (motion.matches && !state.userStarted)) {
      video.pause();
      return;
    }
    if (automatic || state.userStarted) {
      if (video.paused) play(video);
    }
  }

  const nearObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach(({ target: video, isIntersecting }) => {
      if (isIntersecting && (!motion.matches || video.dataset.previewTime) && video.dataset.mediaActive !== "false" && video.dataset.demandOnly !== "true") load(video);
    });
  }, { rootMargin: "200px 0px" }) : null;
  const visibleObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach(({ target: video, isIntersecting }) => {
      states.get(video).visible = isIntersecting;
      sync(video);
    });
  }, { threshold: 0.01 }) : null;

  document.querySelectorAll("video[data-lazy-video]").forEach((video) => {
    // Long films have real sources plus preload=none from the first render.
    // Native browser controls can therefore select media without page pointer
    // events, which their shadow controls do not consistently dispatch.
    states.set(video, { loaded: Boolean(video.querySelector("source[src]")), visible: !visibleObserver, userPaused: false, userStarted: false });
    const frame = video.closest("[data-video-frame]");
    initializeVideoEdges(video);
    if (video.dataset.startMuted === "true") {
      // Films with sound start muted (React does not reflect muted on hydration).
      // Native or Compass full screen turns the sound on; the mute buttons toggle it.
      video.defaultMuted = true;
      video.muted = true;
      video.addEventListener("webkitbeginfullscreen", () => { video.muted = false; });
      document.addEventListener("fullscreenchange", () => {
        if (document.fullscreenElement && (document.fullscreenElement === video || document.fullscreenElement.contains(video))) video.muted = false;
      });
    }
    if (frame.hasAttribute("data-long-film")) {
      const nativeControls = () => {
        const native = coarseFilm.matches;
        video.controls = native && frame.dataset.nativeFilmStarted === "true";
        frame.dataset.nativeFilm = String(native);
      };
      nativeControls();
      coarseFilm.addEventListener("change", nativeControls);
      frame.querySelector("[data-native-film-play]")?.addEventListener("click", () => {
        const state = states.get(video);
        state.userStarted = true;
        state.userPaused = false;
        frame.dataset.nativeFilmStarted = "true";
        nativeControls();
        // Keep play() synchronous with this trusted gesture for iOS Safari.
        play(video);
        video.focus({ preventScroll: true });
      });
    }
    if (video.dataset.previewTime) {
      // The supplied growth poster is its nearly empty first frame. Seek the
      // unchanged clip to a readable still, including under reduced motion.
      video.addEventListener("loadedmetadata", () => {
        const time = Math.min(Number(video.dataset.previewTime), Math.max(0, video.duration - .1));
        if (Number.isFinite(time) && !states.get(video).userStarted) video.currentTime = time;
      }, {once:true});
      video.addEventListener("seeked", () => { frame.dataset.previewReady = "true"; }, {once:true});
    }
    nearObserver?.observe(video);
    visibleObserver?.observe(video);
    video.addEventListener("play", () => {
      if (video.controls) {
        states.get(video).userStarted = true;
        states.get(video).userPaused = false;
      }
      updateButton(video);
    });
    video.addEventListener("pause", () => {
      if (video.controls && !video.ended) states.get(video).userPaused = true;
      updateButton(video);
    });
    video.addEventListener("ended", () => {
      if (video.controls) states.get(video).userPaused = true;
      updateButton(video);
    });
    const sourceFailure = () => {
      // Source errors are captured; the media element may settle NETWORK_NO_SOURCE
      // after the last source's error dispatch, so also check on the next task.
      if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) message(video, "Video unavailable in this browser.");
    };
    video.addEventListener("error", () => {
      sourceFailure();
      setTimeout(sourceFailure, 0);
    }, true);
    if (!visibleObserver) sync(video);
  });

  // A touch reveals controls without also toggling playback. Keyboard controls
  // stay focusable while visually hidden; CSS reveals their focused container.
  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") return;
    let frame = event.target.closest?.("[data-media-reveal]");
    while (frame) {
      frame.dataset.controlsRevealed = "true";
      frame = frame.parentElement?.closest("[data-media-reveal]");
    }
  }, true);

  document.addEventListener("focusin", (event) => {
    const header = event.target.closest?.(".portfolio-header");
    if (!header) return;
    const bounds=header.getBoundingClientRect(),target=event.target.getBoundingClientRect();
    if(target.left<bounds.left+6)header.scrollLeft+=target.left-bounds.left-6;
    else if(target.right>bounds.right-6)header.scrollLeft+=target.right-bounds.right+6;
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-video-toggle], [data-video-retry]");
    if (!button) return;
    const video = button.closest("[data-video-frame]").querySelector("video");
    const state = states.get(video);
    if (button.hasAttribute("data-video-retry")) {
      const frame = button.closest("[data-video-frame]");
      const focus = frame.querySelector("[data-video-toggle]");
      if (focus) focus.focus({ preventScroll: true });
      else { frame.tabIndex = -1; frame.focus({ preventScroll: true }); }
      state.loaded = false;
      state.userPaused = false;
      state.userStarted = true;
      play(video);
      return;
    }
    state.userPaused = !video.paused;
    state.userStarted = video.paused;
    if (state.userPaused) video.pause();
    else play(video);
    updateButton(video);
  });

  new MutationObserver((records) => {
    records.forEach(({ target: video, attributeName }) => {
      const state = states.get(video);
      if (!state) return;
      if (attributeName === "data-playback-paused" && video.dataset.playbackPaused === "true") {
        state.userStarted = false;
      }
      if (video.dataset.mediaActive === "false") {
        state.userStarted = false;
        state.userPaused = false;
        video.pause();
        video.currentTime = 0;
      }
      if (video.dataset.userStarted === "true" && video.dataset.playbackPaused !== "true") state.userStarted = true;
      sync(video);
    });
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-media-active", "data-playback-paused", "data-user-started"] });

  motion.addEventListener("change", () => {
    states.forEach((state, video) => {
      state.userStarted = false;
      sync(video);
    });
  });
  document.addEventListener("visibilitychange", () => states.forEach((_state, video) => sync(video)));
})();
