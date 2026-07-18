(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safePlay(video) {
    const promise = video.play();
    if (promise && typeof promise.catch === "function") promise.catch(function () {});
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
    document.querySelectorAll("video[data-hover-video]").forEach(function (video) {
      const card = video.closest(".project-card");
      if (!card) return;
      card.dataset.hoverReady = "true";

      function start() {
        card.classList.add("is-playing");
        safePlay(video);
      }

      function stop() {
        card.classList.remove("is-playing");
        video.pause();
        video.currentTime = 0;
      }

      card.addEventListener("pointerenter", start);
      card.addEventListener("pointerleave", stop);
      card.addEventListener("focusin", start);
      card.addEventListener("focusout", stop);
    });
  }
})();
