import SiteShell from "./site-shell";
import { Button, Card } from "./compass";
import ResponsiveImage from "./responsive-image";
import { workProjects } from "@/lib/portfolio";

export default function Home() {
  return <SiteShell current="work">
    <h1 className="sr-only">Work</h1>
    <div className="portfolio-work-grid">
      {workProjects.map((project, index) => <article className="portfolio-work-link" key={project.slug}>
        <Card className="portfolio-work-card">
          <ResponsiveImage src={project.cover} alt={project.coverAlt} width={project.coverWidth} height={project.coverHeight}
            sizes="(max-width: 767px) 100vw, 50vw" loading={index < 2 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"} decoding={index === 0 ? "sync" : "async"} />
        </Card>
        <h2 className="portfolio-card-label text-sm"><Button asChild variant="link" size="sm"><a href={`./projects/${project.slug}/`}>{project.title}</a></Button></h2>
      </article>)}
    </div>
    <div className="portfolio-personal-link"><Button asChild variant="secondary" data-plain=""><a href="./personal/">Personal work →</a></Button></div>
  </SiteShell>;
}
