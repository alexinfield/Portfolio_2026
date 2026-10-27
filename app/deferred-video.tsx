import { videoSources } from "@/lib/video-sources";
import { Button } from "./compass";
import MediaToggle from "./media-toggle";

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
  userStarted?: boolean;
  showToggle?: boolean;
};

export default function DeferredVideo({
  source, poster, label, className, width, height,
  loop = true, autoplay = true, controls = false, active = true, paused = false,
  userStarted = false, showToggle = true,
}: DeferredVideoProps) {
  const sources = videoSources(source);
  const file = sources[0].src;
  return (
    <div className={className} data-video-frame data-media-reveal>
      <video
        data-lazy-video
        data-autoplay-video={autoplay ? "true" : undefined}
        data-media-active={active ? "true" : "false"}
        data-playback-paused={paused ? "true" : "false"}
        data-user-started={userStarted ? "true" : "false"}
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
      {!controls && showToggle && <div className="media-controls">
        <MediaToggle label={label} />
      </div>}
        <p className="media-status" data-video-status hidden role="status">
          <span data-video-message>Video unavailable in this browser.</span>{" "}
          <Button asChild variant="link" size="sm"><a href={file}>Open video file</a></Button>
        </p>
      <noscript><p className="media-noscript">Enable JavaScript to play here. <Button asChild variant="link" size="sm"><a href={file}>Open video file</a></Button></p></noscript>
    </div>
  );
}
