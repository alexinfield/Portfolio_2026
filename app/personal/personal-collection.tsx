"use client";
import { useState, useSyncExternalStore } from "react";
import { Button, Card, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../compass";
import { type PersonalProject } from "@/lib/personal-media";
import ProjectCard from "../project-card";
import PersonalGallery, { PersonalImage } from "./personal-gallery";

import BeatsCard from "./beats-card";

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
  const renderProject = (item: PersonalProject, index: number) => <article className="portfolio-project" id={item.id} data-personal-id={item.id}
    data-year={item.year ?? undefined} data-category={item.category ?? undefined} key={item.id} hidden={!matches(item)}>
    {item.link ? <ProjectCard href={`..${item.link}/`} title={item.title} collection="personal"><PersonalImage media={item.cover} eager={index<2} priority={index===0} retry={false} framing={item.framing} sizes="(max-width: 767px) 100vw, 50vw" /></ProjectCard>
      : <Card className="portfolio-personal-card"><PersonalGallery media={item.gallery.length ? item.gallery : [item.cover]} title={item.title} visible={matches(item)} framing={item.framing} description={item.short_text} id={item.id} /></Card>}
    {!item.link && <h2 className="portfolio-project-title portfolio-card-label">{item.title}</h2>}
  </article>;
  return <>
    {PERSONAL_FILTERS_VISIBLE && <div className="portfolio-filters" aria-label="Filter Personal projects">
      <Select value={year} onValueChange={setYear} disabled={!ready}><SelectTrigger className="portfolio-filter-trigger" aria-label="Filter by year"><SelectValue /></SelectTrigger><SelectContent className="portfolio-filter-options"><SelectItem value="all">All years</SelectItem>{years.map(value => <SelectItem value={String(value)} key={value}>{value}</SelectItem>)}{projects.some(item=>item.year===null) && <SelectItem value="unknown">Year not recorded</SelectItem>}</SelectContent></Select>
      <Select value={category} onValueChange={setCategory} disabled={!ready}><SelectTrigger className="portfolio-filter-trigger" aria-label="Filter by category"><SelectValue /></SelectTrigger><SelectContent className="portfolio-filter-options"><SelectItem value="all">All categories</SelectItem>{categories.map(value => <SelectItem value={value} key={value}>{value}</SelectItem>)}{projects.some(item=>!item.category) && <SelectItem value="uncategorised">Uncategorised</SelectItem>}</SelectContent></Select>
      {(year!=="all" || category!=="all") && <Button type="button" variant="secondary" data-plain="" onClick={reset}>Reset</Button>}
      <span className="sr-only" role="status" aria-live="polite">{count} projects shown</span>
    </div>}
    <noscript><p className="text-sm text-muted">The complete collection is shown below. Swipe or scroll each gallery to browse its images.</p></noscript>
    {count===0 && <div className="portfolio-filter-empty" role="status"><p>No projects match these filters.</p><Button type="button" variant="secondary" onClick={reset}>Show all projects</Button></div>}
    <div className="portfolio-personal-front" data-personal-ready={ready}>{projects.slice(0,2).map(renderProject)}</div>
    <div className="portfolio-personal-grid">{projects.slice(2).map((item,index)=>renderProject(item,index+2))}<BeatsCard /></div>
  </>;
}
