(function () {
  function init() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safePlay(video) {
    const promise = video.play();
    if (promise && typeof promise.catch === "function") promise.catch(function () {});
  }

  function updateClock() {
    const now = new Date();
    const date = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(now);
    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);

    document.querySelectorAll("[data-local-date]").forEach(function (node) {
      node.textContent = date;
    });
    document.querySelectorAll("[data-local-time]").forEach(function (node) {
      node.textContent = "New York, " + time;
    });
  }

  if (document.querySelector("[data-local-date]")) {
    updateClock();
    window.setInterval(updateClock, 1000);
  }

  function activateHomeProject(slug) {
    document.querySelectorAll("[data-home-project-panel]").forEach(function (panel) {
      const active = panel.getAttribute("data-home-project-panel") === slug;
      panel.classList.toggle("is-active", active);
      panel.setAttribute("aria-hidden", active ? "false" : "true");

      panel.querySelectorAll("video[data-home-preview-video]").forEach(function (video) {
        if (active && !reduceMotion) safePlay(video);
        else {
          video.pause();
          video.currentTime = 0;
        }
      });
    });

    document.querySelectorAll("[data-home-project-trigger]").forEach(function (trigger) {
      trigger.classList.toggle(
        "is-current",
        trigger.getAttribute("data-home-project-trigger") === slug,
      );
    });
  }

  const initialHomePanel = document.querySelector("[data-home-project-panel]");
  if (initialHomePanel && document.querySelector("[data-home-project-trigger]")) {
    const initial = initialHomePanel.getAttribute("data-home-project-panel");
    if (initial) activateHomeProject(initial);

    document.addEventListener("pointerover", function (event) {
      const trigger = event.target.closest("[data-home-project-trigger]");
      if (!trigger || !finePointer) return;
      const slug = trigger.getAttribute("data-home-project-trigger");
      if (slug) activateHomeProject(slug);
    });

    document.addEventListener("focusin", function (event) {
      const trigger = event.target.closest("[data-home-project-trigger]");
      const slug = trigger && trigger.getAttribute("data-home-project-trigger");
      if (slug) activateHomeProject(slug);
    });
  }

  if (!reduceMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const video = entry.target;
          if (entry.isIntersecting) safePlay(video);
          else video.pause();
        });
      },
      { rootMargin: "120px 0px", threshold: 0.18 },
    );

    document.querySelectorAll("video[data-autoplay-video]").forEach(function (video) {
      observer.observe(video);
    });
  }

  if (finePointer && !reduceMotion) {
    document.addEventListener("pointerover", function (event) {
      const card = event.target.closest(".project-card");
      if (!card || (event.relatedTarget && card.contains(event.relatedTarget))) return;
      const video = card.querySelector("video[data-hover-video]");
      if (!video) return;
      card.classList.add("is-playing");
      safePlay(video);
    });

    document.addEventListener("pointerout", function (event) {
      const card = event.target.closest(".project-card");
      if (!card || (event.relatedTarget && card.contains(event.relatedTarget))) return;
      const video = card.querySelector("video[data-hover-video]");
      if (!video) return;
      card.classList.remove("is-playing");
      video.pause();
      video.currentTime = 0;
    });

    document.addEventListener("focusin", function (event) {
      const card = event.target.closest(".project-card");
      const video = card && card.querySelector("video[data-hover-video]");
      if (!card || !video) return;
      card.classList.add("is-playing");
      safePlay(video);
    });

    document.addEventListener("focusout", function (event) {
      const card = event.target.closest(".project-card");
      if (!card || (event.relatedTarget && card.contains(event.relatedTarget))) return;
      const video = card.querySelector("video[data-hover-video]");
      if (!video) return;
      card.classList.remove("is-playing");
      video.pause();
      video.currentTime = 0;
    });
  }
  }

  if (document.readyState === "complete") window.setTimeout(init, 600);
  else {
    window.addEventListener("load", function () {
      window.setTimeout(init, 600);
    }, { once: true });
  }
})();
