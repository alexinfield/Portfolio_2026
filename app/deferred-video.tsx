import { withBasePath } from "../lib/base-path";
import type { CSSProperties } from "react";
import { videoSources } from "@/lib/video-sources";
import { Button } from "./compass";
import MediaToggle from "./media-toggle";
import FilmControls from "./film-controls";
import { RotateCw } from "lucide-react";

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
  longFilm?: boolean;
  durationSeconds?: number;
  mediaStyle?: CSSProperties;
  frameBackground?: string;
};

export default function DeferredVideo({
  source, poster, label, className, width, height,
  loop = true, autoplay = true, controls = false, active = true, paused = false,
  userStarted = false, showToggle = true, longFilm = false, durationSeconds, mediaStyle, frameBackground,
}: DeferredVideoProps) {
  const sources = videoSources(source).map(item=>({...item,src:withBasePath(item.src)}));
  const file = sources[0].src;
  return (
    <div className={className} data-video-frame data-media-reveal data-long-film={longFilm || undefined} style={frameBackground?{background:frameBackground}:undefined}>
      <video
        style={mediaStyle}
        data-lazy-video
        data-autoplay-video={autoplay && !longFilm ? "true" : undefined}
        data-demand-only={longFilm ? "true" : undefined}
        data-media-active={active ? "true" : "false"}
        data-playback-paused={paused ? "true" : "false"}
        data-user-started={userStarted ? "true" : "false"}
        data-original-source={withBasePath(source)}
        data-video-label={label}
        aria-label={label}
        loop={longFilm ? false : loop}
        muted={autoplay && !longFilm}
        playsInline
        controls={controls}
        preload="none"
        poster={poster ? withBasePath(poster) : undefined}
        width={width}
        height={height}
      >
        {sources.map((item) => <source data-src={item.src} type={item.type} key={item.src} />)}
        <p>Video unavailable in this browser. <Button asChild variant="link" size="sm"><a href={file}>Open video file</a></Button></p>
      </video>
      {longFilm ? <FilmControls label={label} durationSeconds={durationSeconds}/> : !controls && showToggle && <div className="media-controls">
        <MediaToggle label={label} />
      </div>}
        <p className="media-status" data-video-status hidden role="status">
          <span data-video-message>Video unavailable in this browser.</span>{" "}
          <Button asChild variant="link" size="sm"><a href={file}>Open video file</a></Button>
          <Button type="button" variant="secondary" size="icon-sm" data-video-retry aria-label={`Retry ${label}`}><RotateCw aria-hidden="true" /></Button>
        </p>
      <noscript><p className="media-noscript">Enable JavaScript to play here. <Button asChild variant="link" size="sm"><a href={file}>Open video file</a></Button></p></noscript>
    </div>
  );
}
