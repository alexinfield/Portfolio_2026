"use client";
import { useState, useSyncExternalStore,type CSSProperties } from "react";
import { Button, Card, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../compass";
import { type PersonalProject } from "@/lib/personal-media";
import ProjectCard from "../project-card";
import PersonalGallery, { PersonalImage } from "./personal-gallery";

import {captionLines,personalAspect,masonry} from "@/lib/personal-layout";

const subscribe = () => () => {};
// The approved filter data and AND logic stay available behind one UI flag.
export const PERSONAL_FILTERS_VISIBLE = false;
export default function PersonalCollection({ projects }: {projects: PersonalProject[]}) {
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const [year, setYear] = useState("all");
  const [category, setCategory] = useState("all");
  const years = [...new Set(projects.flatMap(item => item.year === null ? [] : [item.year]))].sort((a,b) => b-a);
  const categories = [...new Set(projects.flatMap(item => item.category ? [item.category] : []))].sort();
  const matches = (item: PersonalProject) => (year === "all" || (year === "unknown" ? item.year === null : item.year !== null && String(item.year) === year)) && (category === "all" || (category === "uncategorised" ? !item.category : category === item.category));
  const count = projects.filter(matches).length;
  const reset = () => {setYear("all"); setCategory("all");};
  const shown=projects.filter(matches);
  const entries=shown.map(item=>({id:item.id,aspect:personalAspect(item),lines:captionLines(item.short_text)}));
  const layout=masonry(entries.map(e=>({id:e.id,aspect:e.aspect,caption:44+(e.lines.length?e.lines.length*20+8:0)})));
  const renderProject = (item: PersonalProject, index: number) => {
    const entry=entries[index],aspect=entry.aspect;
    return <article className="portfolio-project masonry-card" id={item.id} data-personal-id={item.id} data-frame-aspect={aspect}
    style={{...layout.cells.get(item.id),"--personal-aspect":aspect} as CSSProperties} data-year={item.year ?? undefined} data-category={item.category ?? undefined} key={item.id}>
    {item.link ? <ProjectCard href={`..${item.link}/`} title={item.title} collection="personal"><PersonalImage media={item.cover} eager={index<2} priority={index===0} retry={false} framing={item.framing} aspect={aspect} /></ProjectCard>
      : <Card className="portfolio-personal-card"><PersonalGallery media={item.gallery.length ? item.gallery : [item.cover]} title={item.title} visible framing={item.framing} aspect={aspect} id={item.id} /></Card>}
    {!item.link && <h2 className="portfolio-project-title portfolio-card-label">{item.title}</h2>}
    {entry.lines.length>0&&<p className="personal-description">{entry.lines.map((line,i)=><span key={i}>{line}{i<entry.lines.length-1?' ':''}</span>)}</p>}
  </article>;};
  return <>
    {PERSONAL_FILTERS_VISIBLE && <div className="portfolio-filters" aria-label="Filter Personal projects">
      <Select value={year} onValueChange={setYear} disabled={!ready}><SelectTrigger className="portfolio-filter-trigger" aria-label="Filter by year"><SelectValue /></SelectTrigger><SelectContent className="portfolio-filter-options"><SelectItem value="all">All years</SelectItem>{years.map(value => <SelectItem value={String(value)} key={value}>{value}</SelectItem>)}{projects.some(item=>item.year===null) && <SelectItem value="unknown">Year not recorded</SelectItem>}</SelectContent></Select>
      <Select value={category} onValueChange={setCategory} disabled={!ready}><SelectTrigger className="portfolio-filter-trigger" aria-label="Filter by category"><SelectValue /></SelectTrigger><SelectContent className="portfolio-filter-options"><SelectItem value="all">All categories</SelectItem>{categories.map(value => <SelectItem value={value} key={value}>{value}</SelectItem>)}{projects.some(item=>!item.category) && <SelectItem value="uncategorised">Uncategorised</SelectItem>}</SelectContent></Select>
      {(year!=="all" || category!=="all") && <Button type="button" variant="secondary" data-plain="" onClick={reset}>Reset</Button>}
      <span className="sr-only" role="status" aria-live="polite">{count} projects shown</span>
    </div>}
    <noscript><p className="text-sm text-muted">The complete collection is shown below. Swipe or scroll each gallery to browse its images.</p></noscript>
    {count===0 && <div className="portfolio-filter-empty" role="status"><p>No projects match these filters.</p><Button type="button" variant="secondary" onClick={reset}>Show all projects</Button></div>}
    <div className="personal-masonry-shell"><div className="portfolio-personal-front personal-masonry" data-personal-ready={ready} style={layout.shell}>{shown.map(renderProject)}</div></div>
  </>;
}
