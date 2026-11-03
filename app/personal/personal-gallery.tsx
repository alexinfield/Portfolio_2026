"use client";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";

import { Button, Carousel, CarouselContent, CarouselSlide, CarouselControls, CarouselPrevious, CarouselNext, CarouselDots } from "../compass";
import DeferredVideo from "../deferred-video";
import { personalAsset, personalMediaStyle, type PersonalMedia, type PersonalFraming } from "@/lib/personal-media";

export function PersonalImage({media, eager=false, priority=false, retry=true, framing, aspect=4/3, sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"}: {media: PersonalMedia; eager?: boolean; priority?: boolean; retry?: boolean; framing?: PersonalFraming; aspect?:number; sizes?: string}) {
  const [failed,setFailed] = useState(false);
  const [attempt,setAttempt] = useState(0);
  const [edgeSource,setEdgeSource]=useState<{src:string;width:number;height:number}|null>(null);
  const ratio=media.width/media.height;
  const extendEdges=framing?.fill==="edge-extend"&&framing.fit==="pad"&&Math.abs(ratio-aspect)>.001;
  const portrait=ratio<aspect;
  const edgeSize=(1-(portrait?ratio/aspect:aspect/ratio))*50;
  const updateEdgeSource=useCallback((image:HTMLImageElement)=>{
    if(!extendEdges||!image.complete||image.naturalWidth===0)return;
    const src=image.currentSrc||personalAsset(media.src);
    const width=media.variants?.find(item=>src.endsWith(item.src))?.width??media.width;
    const height=Math.round(width/ratio);
    setEdgeSource(previous=>previous?.src===src&&previous.width===width?previous:{src,width,height});
  },[extendEdges,media.src,media.variants,media.width,ratio]);
  const imageRef=useCallback((image:HTMLImageElement|null)=>{if(image)updateEdgeSource(image);},[updateEdgeSource]);
  const edgeStyle={...(portrait?{width:`calc(${edgeSize}% + 12px)`}:{height:`calc(${edgeSize}% + 12px)`}),backgroundImage:edgeSource?`url("${edgeSource.src}")`:"none",backgroundSize:portrait?`${(edgeSource?.width??media.width)*100}% 100%`:`100% ${(edgeSource?.height??media.height)*100}%`};
  return <div className="portfolio-image" style={framing?{background:framing.background}:undefined}>
    {extendEdges && <><span className={`portfolio-edge-fill portfolio-edge-${portrait?"left":"top"}`} aria-hidden="true" style={edgeStyle}/><span className={`portfolio-edge-fill portfolio-edge-${portrait?"right":"bottom"}`} aria-hidden="true" style={edgeStyle}/></>}
    {/* Package variants are native-size capped; never synthesize missing paths. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img ref={imageRef} style={framing?{...personalMediaStyle(media,framing,aspect),...(extendEdges?{maskImage:`linear-gradient(${portrait?90:180}deg, transparent, #000 12px, #000 calc(100% - 12px), transparent)`}:{})}:undefined} key={attempt} src={personalAsset(media.src)} alt={media.alt} width={media.width} height={media.height}
      srcSet={media.variants?.map(item=>`${personalAsset(item.src)} ${item.width}w`).join(", ")}
      sizes={sizes} loading={eager ? "eager" : "lazy"} fetchPriority={priority ? "high" : eager ? "auto" : "low"} decoding="async"
      onError={()=>setFailed(true)} onLoad={event=>{
        setFailed(false);
        updateEdgeSource(event.currentTarget);
      }} />
    {failed && <div className="portfolio-image-failure"><p role="status">Image unavailable.</p>{retry && <Button type="button" variant="secondary" size="sm" aria-label={`Retry image: ${media.alt}`} onClick={event=>{
      (event.currentTarget.closest("[data-slot=carousel], [data-media-reveal]") as HTMLElement|null)?.focus({preventScroll:true}); setFailed(false); setAttempt(value=>value+1);
    }}>Retry image</Button>}</div>}
  </div>;
}

type GalleryProps={media: PersonalMedia[]; title: string; visible: boolean; framing:PersonalFraming; aspect:number; id:string};
// Capture only trusted kit SSR markup, before the outer page hydrates. The
// outer root leaves these nodes intact; a gallery's own root later hydrates
// them in place so Compass can adopt a native pre-hydration scroll position.
const gallerySnapshots=new Map<string,string>();
if(typeof document!=="undefined")for(const node of document.querySelectorAll<HTMLElement>("[data-gallery-static]"))gallerySnapshots.set(node.dataset.galleryStatic!,node.innerHTML);
function DeferredGallery(props:GalleryProps) {
  const host=useRef<HTMLDivElement>(null);
  const island=useRef<Root|null>(null);
  const latest=useRef(props);
  const [html]=useState<string|null>(()=>typeof document==="undefined"?null:document.getElementById(`${props.id}-gallery-static`)?.innerHTML??gallerySnapshots.get(props.id)??"");
  useEffect(()=>{
    if(!host.current)return;
    const element=host.current;
    const enhance=(synchronous=false)=>{
      if(island.current)return;
      const mount=()=>{
        const content=<Gallery {...latest.current}/>;
        island.current=element.hasChildNodes()?hydrateRoot(element,content,{onRecoverableError:error=>console.error("Gallery hydration error",error)}):createRoot(element);
        if(!element.hasChildNodes())island.current.render(content);
      };
      if(synchronous)flushSync(mount);else mount();
    };
    const focus=()=>enhance(true);
    element.addEventListener("focusin",focus,true);
    const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){enhance();observer.disconnect();}},{rootMargin:"0px"});
    observer.observe(element);return ()=>{observer.disconnect();element.removeEventListener("focusin",focus,true);const root=island.current;island.current=null;queueMicrotask(()=>root?.unmount());};
  },[]);
  useEffect(()=>{latest.current=props;island.current?.render(<Gallery {...props}/>);},[props]);
  const common={id:`${props.id}-gallery-static`,className:"portfolio-gallery-boundary","data-gallery-static":props.id,suppressHydrationWarning:true};
  return html===null?<div ref={host} {...common}><Gallery {...props}/></div>:<div ref={host} {...common} dangerouslySetInnerHTML={{__html:html}}/>;
}
export default memo(DeferredGallery,(a,b)=>a.id===b.id&&a.title===b.title&&a.visible===b.visible&&a.framing===b.framing&&a.aspect===b.aspect&&a.media.length===b.media.length&&a.media.every((item,index)=>item===b.media[index]));

// Compass owns gestures, focus, pagination and the native scroll fallback.
function Gallery({media,title,visible,framing,aspect,id}:GalleryProps) {
  const [onscreen,setOnscreen]=useState(false);const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const root=host.current;if(!root)return;
    const frame=root.querySelector<HTMLElement>(".ac-carousel-viewport");
    const focus=()=>{const enhanced=frame?.hasAttribute("data-enhanced")??false;if(frame)frame.tabIndex=enhanced?-1:0;const carousel=root.querySelector<HTMLElement>("[data-slot=carousel]");if(carousel)carousel.tabIndex=enhanced?0:-1;};
    const intersection=new IntersectionObserver(([entry])=>setOnscreen(entry.isIntersecting),{rootMargin:"150px"});intersection.observe(root);focus();
    const mutation=new MutationObserver(focus);if(frame)mutation.observe(frame,{attributes:true,attributeFilter:["data-enhanced"]});
    return()=>{intersection.disconnect();mutation.disconnect();};
  },[]);
  return <div ref={host} className="portfolio-gallery compass-personal-gallery" data-media-reveal>
    <Carousel label={`${title} images`} gap={0} aspectRatio={aspect} tabIndex={-1}>
      <CarouselContent tabIndex={0} aria-label={`${title} images`}>
        {media.map((item,index)=><CarouselSlide key={item.id} style={{background:(item.framing??framing).background}}>
          {({active,near,inView,enhanced:mounted})=>item.kind==="video"?<DeferredVideo className="personal-video" source={personalAsset(item.src)} poster={item.poster?personalAsset(item.poster.src):undefined}
            label={item.alt} width={item.width} height={item.height} active={visible&&onscreen&&inView&&active} controls={!mounted} nativeFallback loop longFilm={(item.duration_seconds??0)>=60} durationSeconds={item.duration_seconds} mediaStyle={personalMediaStyle(item,item.framing??framing,aspect)} frameBackground={(item.framing??framing).background} edgeFill={(item.framing??framing).fill==="edge-extend"} startMuted={item.has_audio===true}/>:<PersonalImage media={item} framing={item.framing??framing} aspect={aspect} eager={(index===0&&["stool","desk-pen"].includes(id))||(near&&onscreen&&mounted)} />}
        </CarouselSlide>)}
      </CarouselContent>
      {media.length>1&&<CarouselControls className="personal-carousel-controls"><CarouselPrevious aria-label={`Previous image for ${title}`}/>{onscreen&&<CarouselDots inert aria-hidden="true"/>}<CarouselNext aria-label={`Next image for ${title}`}/></CarouselControls>}
    </Carousel>
  </div>;
}
