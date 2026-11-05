"use client";
import {useEffect,useRef,useState,type CSSProperties} from "react";
import {Card,Button} from "../compass";
import {withBasePath} from "@/lib/base-path";
import catalog from "../../public/assets/original-tracks/tracks.json";
import versions from "../../lib/original-tracks-assets.json";

type Mounted={element:HTMLElement;destroy:()=>void};
type HostWindow=Window&{OriginalTracks?:{mount:(host:HTMLElement,options:unknown)=>Promise<Mounted>}};
let loader:Promise<void>|undefined;
export default function OriginalTracksCard({style}:{style?:CSSProperties}){
  const card=useRef<HTMLElement>(null),host=useRef<HTMLDivElement>(null);
  const [ready,setReady]=useState(false),[error,setError]=useState(false),[attempt,setAttempt]=useState(0);
  useEffect(()=>{
    if(!card.current||!host.current)return;let canceled=false,mounted:Mounted|undefined,started=false;
    const start=async()=>{
      if(started)return;started=true;
      try{
        if(!loader)loader=new Promise<void>((resolve,reject)=>{const s=document.createElement('script');s.src=withBasePath('/assets/original-tracks/boot.js')+'?v='+versions['boot.js'];s.onload=()=>resolve();s.onerror=()=>{loader=undefined;reject(Error('Player unavailable'));};document.head.append(s);});
        await loader;if(canceled||!host.current)return;
        mounted=await (window as HostWindow).OriginalTracks!.mount(host.current,{base:withBasePath('/assets/original-tracks/'),versions,catalog});
        if(canceled){mounted.destroy();return;}setReady(true);setError(false);if(document.activeElement===card.current)mounted.element.focus({preventScroll:true});
      }catch{if(!canceled)setError(true);}
    };
    const element=card.current,observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();void start();}},{rootMargin:'300px'});
    observer.observe(element);element.addEventListener('focusin',start,{once:true});
    return()=>{canceled=true;observer.disconnect();element.removeEventListener('focusin',start);mounted?.destroy();};
  },[attempt]);
  const files=<nav className="tracks-file-links" aria-label="Original recordings">{catalog.tracks.map(track=><a key={track.id} href={withBasePath('/assets/original-tracks/'+track.url.replace(/^\.\//,''))}>Play {track.name}</a>)}</nav>;
  return <article ref={card} id="original-tracks" className="portfolio-project masonry-card" style={style} tabIndex={ready?-1:0} aria-label="Original Tracks">
    <Card className="portfolio-personal-card original-tracks-card">
      <div className="tracks-stage" data-ready={ready} aria-busy={!ready&&!error}>
        <div ref={host} className="tracks-mount"/>
        {<picture className="tracks-poster"><source media="(prefers-color-scheme: dark)" srcSet={withBasePath('/assets/original-tracks/poster-dark.png')}/><img src={withBasePath('/assets/original-tracks/poster-light.png')} width="415" height="1042" alt="Original Tracks: white music player with a blue screen and circular wheel" loading="lazy"/></picture>}
      </div>
    </Card>
    <div className="tracks-caption"><h2 className="portfolio-project-title portfolio-card-label">Original Tracks</h2></div>
    {error&&<div className="tracks-error"><p>Player unavailable.</p><Button type="button" variant="secondary" onClick={()=>{setError(false);setAttempt(n=>n+1);}}>Retry player</Button>{files}</div>}
    <noscript>{files}<a className="tracks-noscript-licence" href={withBasePath("/assets/original-tracks/NOTICE.txt")}>Licences</a></noscript>
  </article>;
}
