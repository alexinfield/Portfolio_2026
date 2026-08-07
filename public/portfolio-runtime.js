(() => {
  const videos = Array.from(document.querySelectorAll("video[data-autoplay-video]"));
  if (!("IntersectionObserver" in window)) {
    videos.forEach((video) => video.play().catch(() => {}));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (!(video instanceof HTMLVideoElement)) return;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    },
    { rootMargin: "100% 0px", threshold: 0.01 },
  );

  videos.forEach((video) => observer.observe(video));
})();
