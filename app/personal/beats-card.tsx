"use client";
import { useRef, useState } from "react";
import { Button, Card } from "../compass";
import { withBasePath } from "@/lib/base-path";
import catalog from "../../public/beats/tracks.json";

export default function OriginalTracksCard() {
  const [opened,setOpened]=useState(false);
  const trigger=useRef<HTMLAnchorElement>(null);
  return <article className="portfolio-project" id="beats">
    <Card className="portfolio-personal-card beats-card" data-open={opened}>
      {opened ? <><iframe title="Original Tracks player" src={withBasePath("/beats/?card")} onLoad={event=>{event.currentTarget.scrollIntoView({block:"nearest"});event.currentTarget.focus({preventScroll:true});}} /><Button type="button" variant="secondary" size="sm" className="beats-close" onClick={()=>{setOpened(false);requestAnimationFrame(()=>trigger.current?.focus());}}>Close player</Button></> :
        <Button asChild variant="ghost" className="beats-open">
          <a ref={trigger} href={withBasePath("/beats/")} onClick={event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();setOpened(true);}} aria-label={`Open Original Tracks · ${catalog.tracks.length} tracks`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBasePath("/beats/poster.webp")} alt="Original Tracks circular control and classic screen" width="520" height="600" loading="lazy" />
            <span>Open Original Tracks · {catalog.tracks.length} tracks</span>
          </a>
        </Button>}
    </Card>
    <h2 className="portfolio-project-title portfolio-card-label">Original Tracks</h2>
    <noscript><ul className="beats-fallback">{catalog.tracks.map(track=>{
      const file=withBasePath(`/beats/${track.url.replace(/^\.\//,"")}`);
      return <li key={track.id}>{track.name}<audio aria-label={track.name} controls preload="none" src={file} /><div className="beats-file-actions"><a href={file}>Open audio file</a><a href={file} download={track.url.split("/").at(-1)}>Download</a></div></li>;
    })}</ul></noscript>
  </article>;
}
