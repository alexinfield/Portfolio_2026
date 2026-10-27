(() => {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const states = new Map();

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
      if (isIntersecting && !motion.matches && video.dataset.mediaActive !== "false" && video.dataset.demandOnly !== "true") load(video);
    });
  }, { rootMargin: "200px 0px" }) : null;
  const visibleObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach(({ target: video, isIntersecting }) => {
      states.get(video).visible = isIntersecting;
      sync(video);
    });
  }, { threshold: 0.01 }) : null;

  document.querySelectorAll("video[data-lazy-video]").forEach((video) => {
    states.set(video, { loaded: false, visible: !visibleObserver, userPaused: false, userStarted: false });
    nearObserver?.observe(video);
    visibleObserver?.observe(video);
    video.addEventListener("play", () => updateButton(video));
    video.addEventListener("pause", () => updateButton(video));
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
    // A native-control activation also counts as demand, including reduced motion.
    const nativeDemand = () => {
      if (!video.controls) return;
      const state = states.get(video);
      state.userStarted = true;
      state.userPaused = false;
      load(video);
    };
    video.addEventListener("pointerdown", nativeDemand);
    video.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") nativeDemand();
    });
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
