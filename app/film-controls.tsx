"use client";
import { useCallback, useRef, useSyncExternalStore } from "react";
import { Maximize, Minimize, Volume2, VolumeX } from "lucide-react";
import { Button, Slider } from "./compass";
import MediaToggle from "./media-toggle";

const serverSnapshot = () => "0|0|0|0|0|0";
function clock(seconds:number) {
  const value=Number.isFinite(seconds)?Math.max(0,Math.floor(seconds)):0;
  return `${Math.floor(value/60)}:${String(value%60).padStart(2,"0")}`;
}
export default function FilmControls({label,durationSeconds=0}: {label:string;durationSeconds?:number}) {
  const controls=useRef<HTMLDivElement>(null);
  const frame=useCallback(()=>controls.current?.closest<HTMLElement>("[data-video-frame]"),[]);
  const video=useCallback(()=>frame()?.querySelector("video"),[frame]);
  const snapshot=useCallback(()=>{
    const media=video(),container=frame();
    if(!media||!container)return serverSnapshot();
    const duration=Number.isFinite(media.duration)?media.duration:0;
    return [media.currentTime.toFixed(2),duration.toFixed(2),Number(media.muted),Number(media.readyState>=1),Number(document.fullscreenElement===container),Number(Boolean(typeof container.requestFullscreen==="function"&&document.fullscreenEnabled))].join("|");
  },[frame,video]);
  const subscribe=useCallback((change:()=>void)=>{
    const media=video();
    const events=["timeupdate","durationchange","loadedmetadata","volumechange","seeking","seeked","emptied","ended"];
    events.forEach(event=>media?.addEventListener(event,change));
    document.addEventListener("fullscreenchange",change);
    return ()=>{events.forEach(event=>media?.removeEventListener(event,change));document.removeEventListener("fullscreenchange",change);};
  },[video]);
  const values=useSyncExternalStore(subscribe,snapshot,serverSnapshot).split("|").map(Number);
  const [time,duration,muted,ready,fullscreen,fullscreenAvailable]=values;
  const total=duration||durationSeconds;
  return <div ref={controls} className="media-controls film-controls" data-film-controls>
    <MediaToggle label={label}/>
    <Slider className="film-timeline" min={0} max={Math.max(1,total)} step={.1} value={[Math.min(time,total)]} disabled={!ready}
      aria-label={`Seek ${label}`} onValueChange={value=>{const media=video();if(media&&ready)media.currentTime=value[0];}} />
    <span className="film-time" aria-hidden="true">{clock(time)} / {clock(total)}</span>
    <Button type="button" variant="secondary" size="icon-sm" aria-label={`${muted?"Unmute":"Mute"} ${label}`} onClick={()=>{const media=video();if(media)media.muted=!media.muted;}}>
      {muted?<VolumeX aria-hidden="true"/>:<Volume2 aria-hidden="true"/>}
    </Button>
    <Button type="button" variant="secondary" size="icon-sm" disabled={!fullscreenAvailable} aria-label={`${fullscreen?"Exit":"Enter"} fullscreen: ${label}`} onClick={()=>{
      if(fullscreen)void document.exitFullscreen();else void frame()?.requestFullscreen().catch(()=>{});
    }}>{fullscreen?<Minimize aria-hidden="true"/>:<Maximize aria-hidden="true"/>}</Button>
  </div>;
}
