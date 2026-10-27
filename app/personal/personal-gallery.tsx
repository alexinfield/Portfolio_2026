"use client";
import { useCallback, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../compass";
import DeferredVideo from "../deferred-video";
import { personalAsset, personalMediaStyle, type PersonalMedia, type PersonalFraming } from "@/lib/personal";

export function PersonalImage({media, eager=false, retry=true, framing, sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"}: {media: PersonalMedia; eager?: boolean; retry?: boolean; framing?: PersonalFraming; sizes?: string}) {
  const [failed,setFailed] = useState(false);
  const [attempt,setAttempt] = useState(0);
  const [edgeSource,setEdgeSource]=useState<{src:string;width:number}|null>(null);
  const ratio=media.width/media.height;
  const extendEdges=framing?.fill==="edge-extend"&&framing.fit==="pad"&&ratio<4/3;
  const edgeWidth=(1-ratio/(4/3))*50;
  const updateEdgeSource=useCallback((image:HTMLImageElement)=>{
    if(!extendEdges||!image.complete||image.naturalWidth===0)return;
    const src=image.currentSrc||personalAsset(media.src);
    const width=media.variants?.find(item=>src.endsWith(item.src))?.width??media.width;
    setEdgeSource(previous=>previous?.src===src&&previous.width===width?previous:{src,width});
  },[extendEdges,media.src,media.variants,media.width]);
  const imageRef=useCallback((image:HTMLImageElement|null)=>{if(image)updateEdgeSource(image);},[updateEdgeSource]);
  const edgeStyle={width:`calc(${edgeWidth}% + 12px)`,backgroundImage:edgeSource?`url("${edgeSource.src}")`:"none",backgroundSize:`${(edgeSource?.width??media.width)*100}% 100%`};
  return <div className="portfolio-image" style={framing?{background:framing.background}:undefined}>
    {extendEdges && <><span className="portfolio-edge-fill portfolio-edge-left" aria-hidden="true" style={edgeStyle}/><span className="portfolio-edge-fill portfolio-edge-right" aria-hidden="true" style={edgeStyle}/></>}
    {/* Package variants are native-size capped; never synthesize missing paths. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img ref={imageRef} style={framing?{...personalMediaStyle(media,framing),...(extendEdges?{maskImage:"linear-gradient(90deg, transparent, #000 12px, #000 calc(100% - 12px), transparent)"}:{})}:undefined} key={attempt} src={personalAsset(media.src)} alt={media.alt} width={media.width} height={media.height}
      srcSet={media.variants?.map(item=>`${personalAsset(item.src)} ${item.width}w`).join(", ")}
      sizes={sizes} loading={eager ? "eager" : "lazy"} decoding="async"
      onError={()=>setFailed(true)} onLoad={event=>{
        setFailed(false);
        updateEdgeSource(event.currentTarget);
      }} />
    {failed && <div className="portfolio-image-failure"><p role="status">Image unavailable.</p>{retry && <Button type="button" variant="secondary" size="sm" aria-label={`Retry image: ${media.alt}`} onClick={event=>{
      (event.currentTarget.closest("[data-media-reveal]") as HTMLElement|null)?.focus({preventScroll:true}); setFailed(false); setAttempt(value=>value+1);
    }}>Retry image</Button>}</div>}
  </div>;
}

// Manual, stable galleries from the approved Compass composition. Mouse focus
// never changes playback policy. Every slide stays mounted for the static runtime.
export default function PersonalGallery({media,title,visible,framing}: {media: PersonalMedia[]; title: string; visible: boolean; framing:PersonalFraming}) {
  const [active,setActive]=useState(0);
  const touch=useRef<{x:number;y:number}|null>(null);
  const move=(delta:number)=>setActive(value=>(value+delta+media.length)%media.length);

  function key(event:KeyboardEvent<HTMLDivElement>) {
    if(event.target!==event.currentTarget || media.length<2)return;
    if(["ArrowLeft","ArrowRight","Home","End"].includes(event.key)){
      event.preventDefault();
      if(event.key==="Home")setActive(0);else if(event.key==="End")setActive(media.length-1);else move(event.key==="ArrowRight"?1:-1);
    }
  }
  function begin(event:TouchEvent<HTMLDivElement>) {
    const first=event.touches[0]; touch.current=event.touches.length===1 && !(event.target as HTMLElement).closest("button,a,input,[role=slider],[data-film-controls]")?{x:first.clientX,y:first.clientY}:null;
  }
  function end(event:TouchEvent<HTMLDivElement>) {
    const start=touch.current,last=event.changedTouches[0];touch.current=null;
    if(!start || !last)return;
    const dx=last.clientX-start.x,dy=last.clientY-start.y;
    if(Math.abs(dx)>=40 && Math.abs(dx)>Math.abs(dy)*1.5)move(dx<0?1:-1);
  }
  return <div className="portfolio-gallery" role="region" aria-label={`${title} images`} aria-roledescription={media.length>1?"carousel":undefined}
    tabIndex={media.length>1?0:-1} data-media-reveal onKeyDown={key}>
    <div className="portfolio-gallery-stage" style={{aspectRatio:4/3}} onTouchStart={begin} onTouchEnd={end} onTouchCancel={()=>{touch.current=null;}}>
      {media.map((item,index)=><div className="portfolio-gallery-slide" role="group" aria-label={`${index+1} of ${media.length}`} aria-hidden={index!==active} inert={index!==active} hidden={index!==active} key={item.id} style={{background:(item.framing??framing).background}}>
        {item.kind==="video"?<DeferredVideo className="personal-video" source={personalAsset(item.src)} poster={item.poster?personalAsset(item.poster.src):undefined}
          label={item.alt} width={item.width} height={item.height} active={visible && index===active} loop longFilm={(item.duration_seconds??0)>=60} durationSeconds={item.duration_seconds} mediaStyle={personalMediaStyle(item,item.framing??framing)} frameBackground={(item.framing??framing).background}/>:<PersonalImage media={item} framing={item.framing??framing} />}
      </div>)}
      {media.length>1 && <div className="media-controls gallery-navigation">
        <Button type="button" variant="secondary" size="icon-sm" aria-label={`Previous image for ${title}`} onClick={()=>move(-1)}><ArrowLeft aria-hidden="true"/></Button>
        <Button type="button" variant="secondary" size="icon-sm" aria-label={`Next image for ${title}`} onClick={()=>move(1)}><ArrowRight aria-hidden="true"/></Button>
      </div>}
    </div>
    {media.length>1 && <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{active+1} of {media.length}</span>}
  </div>;
}
