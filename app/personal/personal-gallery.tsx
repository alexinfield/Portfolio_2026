"use client";
import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../compass";
import DeferredVideo from "../deferred-video";
import { personalAsset, type PersonalMedia } from "@/lib/personal";

export function PersonalImage({media, eager=false, retry=true}: {media: PersonalMedia; eager?: boolean; retry?: boolean}) {
  const [failed,setFailed] = useState(false);
  const [attempt,setAttempt] = useState(0);
  return <div className="portfolio-image">
    {/* Package variants are native-size capped; never synthesize missing paths. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img key={attempt} src={personalAsset(media.src)} alt={media.alt} width={media.width} height={media.height}
      srcSet={media.variants?.map(item=>`${personalAsset(item.src)} ${item.width}w`).join(", ")}
      sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw" loading={eager ? "eager" : "lazy"} decoding="async"
      onError={()=>setFailed(true)} onLoad={()=>setFailed(false)} />
    {failed && <div className="portfolio-image-failure"><p role="status">Image unavailable.</p>{retry && <Button type="button" variant="secondary" size="sm" aria-label={`Retry image: ${media.alt}`} onClick={event=>{
      (event.currentTarget.closest("[data-media-reveal]") as HTMLElement|null)?.focus({preventScroll:true}); setFailed(false); setAttempt(value=>value+1);
    }}>Retry image</Button>}</div>}
  </div>;
}

// Manual, stable galleries from the approved Compass composition. Mouse focus
// never changes playback policy. Every slide stays mounted for the static runtime.
export default function PersonalGallery({media,title,visible}: {media: PersonalMedia[]; title: string; visible: boolean}) {
  const [active,setActive]=useState(0);
  const touch=useRef<{x:number;y:number}|null>(null);
  const move=(delta:number)=>setActive(value=>(value+delta+media.length)%media.length);
  const ratio=Math.max(3/4,Math.min(16/9,media[0].width/media[0].height));
  function key(event:KeyboardEvent<HTMLDivElement>) {
    if(event.target!==event.currentTarget || media.length<2)return;
    if(["ArrowLeft","ArrowRight","Home","End"].includes(event.key)){
      event.preventDefault();
      if(event.key==="Home")setActive(0);else if(event.key==="End")setActive(media.length-1);else move(event.key==="ArrowRight"?1:-1);
    }
  }
  function begin(event:TouchEvent<HTMLDivElement>) {
    const first=event.touches[0]; touch.current=event.touches.length===1 && !(event.target as HTMLElement).closest("button,a")?{x:first.clientX,y:first.clientY}:null;
  }
  function end(event:TouchEvent<HTMLDivElement>) {
    const start=touch.current,last=event.changedTouches[0];touch.current=null;
    if(!start || !last)return;
    const dx=last.clientX-start.x,dy=last.clientY-start.y;
    if(Math.abs(dx)>=40 && Math.abs(dx)>Math.abs(dy)*1.5)move(dx<0?1:-1);
  }
  return <div className="portfolio-gallery" role="region" aria-label={`${title} images`} aria-roledescription={media.length>1?"carousel":undefined}
    tabIndex={media.length>1?0:-1} data-media-reveal onKeyDown={key}>
    <div className="portfolio-gallery-stage" style={{aspectRatio:ratio}} onTouchStart={begin} onTouchEnd={end} onTouchCancel={()=>{touch.current=null;}}>
      {media.map((item,index)=><div className="portfolio-gallery-slide" role="group" aria-label={`${index+1} of ${media.length}`} aria-hidden={index!==active} inert={index!==active} hidden={index!==active} key={item.id}>
        {item.kind==="video"?<DeferredVideo className="personal-video" source={personalAsset(item.src)} poster={item.poster?personalAsset(item.poster.src):undefined}
          label={item.alt} width={item.width} height={item.height} active={visible && index===active} loop />:<PersonalImage media={item} />}
      </div>)}
      {media.length>1 && <div className="media-controls gallery-navigation">
        <Button type="button" variant="secondary" size="icon-sm" aria-label={`Previous image for ${title}`} onClick={()=>move(-1)}><ArrowLeft aria-hidden="true"/></Button>
        <Button type="button" variant="secondary" size="icon-sm" aria-label={`Next image for ${title}`} onClick={()=>move(1)}><ArrowRight aria-hidden="true"/></Button>
      </div>}
    </div>
    {media.length>1 && <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{active+1} of {media.length}</span>}
  </div>;
}
