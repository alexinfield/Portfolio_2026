import { projects } from "@/lib/portfolio";
import ProjectRail from "./project-rail";
import SiteHeader from "./site-header";

export default function Home() {
  return (
    <main className="home-workspace">
      <SiteHeader variant="home" />
      <ProjectRail activeSlug={projects[0].slug} interactive />

      <section className="home-stage" aria-label="Selected project preview">
        {projects.map((project, index) => (
          <article
            className={`home-stage-panel${index === 0 ? " is-active" : ""}`}
            data-home-project-panel={project.slug}
            aria-hidden={index === 0 ? undefined : "true"}
            key={project.slug}
          >
            <a className="home-stage-media" href={`/projects/${project.slug}`}>
              {project.hoverVideo ? (
                <video
                  data-home-preview-video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload={index === 0 ? "metadata" : "none"}
                  poster={project.cover}
                  aria-hidden="true"
                >
                  <source src={project.hoverVideo} type="video/mp4" />
                </video>
              ) : (
                <img src={project.cover} alt={`${project.title} project`} />
              )}
            </a>

            <div className="home-stage-notes">
              <div>
                <span>Selected work</span>
                <h1>{project.title}</h1>
                <p>{project.description}</p>
              </div>
              <div>
                <span>Practice</span>
                <p>Industrial design, product systems, and digital interfaces.</p>
              </div>
              <a href={`/projects/${project.slug}`}>
                <span>Case study</span>
                <strong>Open project</strong>
              </a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
