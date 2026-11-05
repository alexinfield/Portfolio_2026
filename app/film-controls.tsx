"use client";
import { useCallback, useRef, useSyncExternalStore, useReducer } from "react";
import { flushSync } from "react-dom";
import { Maximize, Minimize, Volume2, VolumeX } from "lucide-react";
import { Button, Slider } from "./compass";
import MediaToggle from "./media-toggle";

// iPhone Safari has no element fullscreen; its video element offers its own.
type IosVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void; webkitExitFullscreen?: () => void; webkitDisplayingFullscreen?: boolean };

const serverSnapshotFor = (muted:boolean) => `0|0|${Number(muted)}|0|0|0`;
function clock(seconds:number) {
  const value=Number.isFinite(seconds)?Math.max(0,Math.floor(seconds)):0;
  return `${Math.floor(value/60)}:${String(value%60).padStart(2,"0")}`;
}
export default function FilmControls({label,durationSeconds=0,compact=false,startMuted=false}: {label:string;durationSeconds?:number;compact?:boolean;startMuted?:boolean}) {
  const serverSnapshot=useCallback(()=>serverSnapshotFor(startMuted),[startMuted]);
  const [,refresh]=useReducer((n:number)=>n+1,0);
  const controls=useRef<HTMLDivElement>(null);
  const frame=useCallback(()=>controls.current?.closest<HTMLElement>("[data-video-frame]"),[]);
  const video=useCallback(()=>frame()?.querySelector<IosVideo>("video"),[frame]);
  const snapshot=useCallback(()=>{
    const media=video(),container=frame();
    if(!media||!container)return serverSnapshot();
    const duration=Number.isFinite(media.duration)?media.duration:0;
    const elementFullscreen=typeof container.requestFullscreen==="function"&&document.fullscreenEnabled;
    const videoFullscreen=typeof media.webkitEnterFullscreen==="function";
    return [media.currentTime.toFixed(2),duration.toFixed(2),Number(media.muted),Number(media.readyState>=1),Number(document.fullscreenElement===container||Boolean(media.webkitDisplayingFullscreen)),Number(elementFullscreen||videoFullscreen)].join("|");
  },[frame,video,serverSnapshot]);
  const subscribe=useCallback((change:()=>void)=>{
    const media=video();
    const events=["timeupdate","durationchange","loadedmetadata","volumechange","seeking","seeked","emptied","ended","webkitbeginfullscreen","webkitendfullscreen"];
    events.forEach(event=>media?.addEventListener(event,change));
    document.addEventListener("fullscreenchange",change);
    return ()=>{events.forEach(event=>media?.removeEventListener(event,change));document.removeEventListener("fullscreenchange",change);};
  },[video]);
  const values=useSyncExternalStore(subscribe,snapshot,serverSnapshot).split("|").map(Number);
  const [time,duration,muted,ready,fullscreen,fullscreenAvailable]=values;
  const total=duration||durationSeconds;
  const mute=<Button type="button" variant="secondary" size="icon-sm" data-film-mute aria-label={`${muted?"Unmute":"Mute"} ${label}`} onClick={()=>{const media=video();if(media){media.muted=!media.muted;flushSync(()=>refresh());}}}>
    {muted?<VolumeX aria-hidden="true"/>:<Volume2 aria-hidden="true"/>}
  </Button>;
  // For films that start muted, entering full screen also turns the sound on.
  const full=<Button type="button" variant="secondary" size="icon-sm" data-film-fullscreen disabled={!fullscreenAvailable} aria-label={`${fullscreen?"Exit":"Enter"} fullscreen: ${label}`} onClick={()=>{
    const media=video(),container=frame();
    if(!media||!container)return;
    if(media.webkitDisplayingFullscreen){media.webkitExitFullscreen?.();return;}
    if(document.fullscreenElement){void document.exitFullscreen();return;}
    if(media.dataset.startMuted==="true")media.muted=false;
    if(typeof container.requestFullscreen==="function"&&document.fullscreenEnabled)void container.requestFullscreen().catch(()=>{});
    else if(typeof media.webkitEnterFullscreen==="function"){try{media.webkitEnterFullscreen();}catch{/* needs loaded metadata; native controls remain */}}
  }}>{fullscreen?<Minimize aria-hidden="true"/>:<Maximize aria-hidden="true"/>}</Button>;
  if(compact)return <div ref={controls} className="media-controls film-quick-controls" data-film-quick-controls>{mute}{full}</div>;
  return <div ref={controls} className="media-controls film-controls" data-film-controls>
    <MediaToggle label={label}/>
    <Slider className="film-timeline" min={0} max={Math.max(1,total)} step={.1} value={[Math.min(time,total)]} disabled={!ready}
      aria-label={`Seek ${label}`} onKeyDownCapture={event=>{if(event.key!=="Home"&&event.key!=="End")return;const media=video();if(!media||!ready)return;event.preventDefault();event.stopPropagation();media.currentTime=event.key==="Home"?0:Math.max(0,media.duration-.05);flushSync(()=>refresh());}} onValueChange={value=>{const media=video();if(media&&ready)media.currentTime=value[0];}} />
    <span className="film-time" aria-hidden="true">{clock(time)} / {clock(total)}</span>
    {mute}{full}
  </div>;
}
