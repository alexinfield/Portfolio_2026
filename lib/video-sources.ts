// Web derivatives of the retained originals. Prefer VP9 where supported, with
// H.264 for Safari and other browsers. No source URL is assigned before demand.
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
    ? [{ src: `${base}.webm`, type: "video/webm" }, { src: `${base}.mp4`, type: "video/mp4" }]
    : [{ src: source, type: "video/mp4" }];
}
