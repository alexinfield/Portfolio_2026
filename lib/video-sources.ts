// The H.264 derivatives are smaller than VP9 and are preferred in every browser.
// No source URL is assigned before viewport or explicit playback demand.
const derivatives: Record<string, string> = {
  "/assets/molekule-go/media/UV-animation-transcode.mp4": "/assets/molekule-go/media/uv-web",
  "/assets/molekule-go/media/aq-indicator-transcode.mp4": "/assets/molekule-go/media/aq-web",
  "/assets/hyphae/media/growth-sim-transcode.mp4": "/assets/hyphae/media/growth-web",
  "/assets/hyphae/media/673e9d3ff35335eb252fe856_img-0469-transcode.mp4": "/assets/hyphae/media/making-web",
  "/assets/hyphae/media/hyphae-light-film.mp4": "/assets/hyphae/media/film-web",
};

export function videoSources(source: string) {
  const base = derivatives[source];
  return base
    ? [{ src: `${base}.mp4`, type: "video/mp4" }, { src: `${base}.webm`, type: "video/webm" }]
    : [{ src: source, type: "video/mp4" }];
}
