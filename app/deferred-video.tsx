import { videoSources } from "@/lib/video-sources";

type DeferredVideoProps = {
  source: string;
  poster?: string;
  label: string;
  className: string;
  width?: number;
  height?: number;
  loop?: boolean;
  autoplay?: boolean;
  controls?: boolean;
  active?: boolean;
  paused?: boolean;
};

export default function DeferredVideo({
  source, poster, label, className, width, height,
  loop = true, autoplay = true, controls = false, active = true, paused = false,
}: DeferredVideoProps) {
  const sources = videoSources(source);
  const file = sources[sources.length - 1].src;
  return (
    <div className={className} data-video-frame>
      <video
        data-lazy-video
        data-autoplay-video={autoplay ? "true" : undefined}
        data-media-active={active ? "true" : "false"}
        data-playback-paused={paused ? "true" : "false"}
        data-original-source={source}
        data-video-label={label}
        aria-label={label}
        loop={loop}
        muted={autoplay}
        playsInline
        controls={controls}
        preload="none"
        poster={poster}
        width={width}
        height={height}
      >
        {sources.map((item) => <source data-src={item.src} type={item.type} key={item.src} />)}
        <p>Video unavailable in this browser. <a href={file}>Open video file</a>.</p>
      </video>
      <div className="portfolio-video-controls">
        <button type="button" data-video-toggle aria-label={`Play ${label}`}>Play</button>
        <p data-video-status hidden role="status">
          <span data-video-message>Video unavailable in this browser.</span>{" "}
          <a href={file}>Open video file</a>.
        </p>
      </div>
      <noscript><p className="video-noscript">Enable JavaScript to play here, or <a href={file}>open the video file</a>.</p></noscript>
    </div>
  );
}
