import { withBasePath } from "../lib/base-path";
import type { CSSProperties } from "react";
import { videoSources } from "@/lib/video-sources";
import { Button } from "./compass";
import MediaToggle from "./media-toggle";
import FilmControls from "./film-controls";
import { Play, RotateCw } from "lucide-react";

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
  previewTime?: number;
  edgeFill?: boolean;
  /** Film with sound that starts muted; mute and full screen turn the sound on. */
  startMuted?: boolean;
  /** Pre-blurred placeholder painted until the poster loads. */
  posterLqip?: string;
};

export default function DeferredVideo({
  source, poster, label, className, width, height,
  loop = true, autoplay = true, controls = false, active = true, paused = false,
  userStarted = false, showToggle = true, longFilm = false, durationSeconds, mediaStyle, frameBackground, previewTime, edgeFill=false, startMuted=false, posterLqip,
}: DeferredVideoProps) {
  const sources = videoSources(source).map(item=>({...item,src:withBasePath(item.src)}));
  const file = sources[0].src;
  const ratio=(width??4)/(height??3),portrait=ratio<4/3;
  const edgeSize=(1-(portrait?ratio/(4/3):(4/3)/ratio))*50;
  const edgeStyle=portrait?{width:`calc(${edgeSize}% + 12px)`}:{height:`calc(${edgeSize}% + 12px)`};
  return (
    <div className={className} data-video-frame data-media-reveal data-long-film={longFilm || undefined} style={frameBackground?{background:frameBackground}:undefined}>
      {edgeFill && <>
        <span className={`portfolio-video-edge portfolio-video-edge-${portrait?"left":"top"}`} data-video-edge={portrait?"left":"top"} aria-hidden="true" style={edgeStyle}/>
        <span className={`portfolio-video-edge portfolio-video-edge-${portrait?"right":"bottom"}`} data-video-edge={portrait?"right":"bottom"} aria-hidden="true" style={edgeStyle}/>
      </>}
      <video
        data-lqip={posterLqip ? "" : undefined}
        style={{...mediaStyle,...(posterLqip?{"--lqip":`url(${posterLqip})`}:{}),...(edgeFill?{maskImage:`linear-gradient(${portrait?90:180}deg, transparent, #000 12px, #000 calc(100% - 12px), transparent)`}:{})}}
        data-lazy-video
        data-preview-time={previewTime}
        data-autoplay-video={autoplay && !longFilm ? "true" : undefined}
        data-demand-only={longFilm ? "true" : undefined}
        data-media-active={active ? "true" : "false"}
        data-playback-paused={paused ? "true" : "false"}
        data-user-started={userStarted ? "true" : "false"}
        data-original-source={withBasePath(source)}
        data-video-label={label}
        data-start-muted={startMuted ? "true" : undefined}
        aria-label={label}
        loop={longFilm ? false : loop}
        muted={(autoplay && !longFilm) || startMuted}
        playsInline
        controls={controls}
        suppressHydrationWarning
        preload="none"
        poster={poster ? withBasePath(poster) : undefined}
        width={width}
        height={height}
      >
        {sources.map((item) => <source src={longFilm ? item.src : undefined} data-src={item.src} type={item.type} key={item.src} />)}
        <p>Video unavailable in this browser. <Button asChild variant="link" size="sm"><a href={file}>Open video file</a></Button></p>
      </video>
      {longFilm ? <>
        <Button type="button" variant="secondary" size="icon-sm" className="native-film-start" data-native-film-play aria-label={`Play ${label}`}>
          <Play aria-hidden="true" />
        </Button>
        <FilmControls label={label} durationSeconds={durationSeconds} startMuted={startMuted}/>
        {startMuted && <FilmControls label={label} durationSeconds={durationSeconds} startMuted compact/>}
      </> : !controls && showToggle && <div className="media-controls">
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
