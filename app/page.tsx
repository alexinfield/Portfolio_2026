import SiteShell from "./site-shell";
import { Button } from "./compass";
import ResponsiveImage from "./responsive-image";
import ProjectCard from "./project-card";
import { workProjects } from "@/lib/portfolio";

export default function Home() {
  return <SiteShell current="work">
    <h1 className="sr-only">Work</h1>
    <div className="portfolio-work-grid">
      {workProjects.map((project, index) => <article key={project.slug}><ProjectCard href={`./projects/${project.slug}/`} title={project.title}>
          <ResponsiveImage src={project.cover} alt={project.coverAlt} width={project.coverWidth} height={project.coverHeight}
            sizes="(max-width: 767px) 100vw, 50vw" loading={index < 2 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"} decoding={index === 0 ? "sync" : "async"} />
        </ProjectCard></article>)}
    </div>
    <div className="portfolio-personal-link"><Button asChild variant="secondary" data-plain=""><a href="./personal/">Personal work →</a></Button></div>
  </SiteShell>;
}
