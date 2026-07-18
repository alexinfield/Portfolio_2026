import { projects } from "@/lib/portfolio";
import SiteHeader from "../site-header";

export default function AllProjectsPage() {
  return (
    <main className="all-page">
      <SiteHeader variant="index" title="All projects" />
      <section className="project-index" aria-label="All projects">
        {projects.map((project) => (
          <a className="project-card" href={`/projects/${project.slug}`} key={project.slug}>
            <div className="project-card-media">
              <img src={project.cover} alt={`${project.title} project`} />
              {project.hoverVideo ? (
                <video
                  data-hover-video
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  poster={project.cover}
                  aria-hidden="true"
                >
                  <source src={project.hoverVideo} type="video/mp4" />
                </video>
              ) : null}
            </div>
            <div className="project-card-caption">
              <h2>{project.title}</h2>
              <p>{project.description}</p>
            </div>
          </a>
        ))}
      </section>
    </main>
  );
}
