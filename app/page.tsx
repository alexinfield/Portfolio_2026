import { projects, type Project } from "@/lib/portfolio";
import SiteHeader from "./site-header";

function FeatureMedia({ project, motion = false }: { project: Project; motion?: boolean }) {
  if (motion && project.hoverVideo) {
    return (
      <video
        data-autoplay-video
        loop
        muted
        playsInline
        preload="metadata"
        poster={project.cover}
        aria-hidden="true"
      >
        <source src={project.hoverVideo} type="video/mp4" />
      </video>
    );
  }

  return <img src={project.cover} alt={`${project.title} project`} />;
}

export default function Home() {
  const [molekule, luma] = projects;

  return (
    <main className="home-page">
      <SiteHeader />

      <section className="home-hero" aria-label="Featured projects">
        <a className="home-hero-feature home-hero-feature-primary" href={`/projects/${molekule.slug}`}>
          <FeatureMedia project={molekule} />
          <span>{molekule.title}</span>
        </a>
        <a className="home-hero-feature home-hero-feature-secondary" href={`/projects/${luma.slug}`}>
          <FeatureMedia project={luma} motion />
          <span>{luma.title}</span>
        </a>
      </section>

      <section className="home-statement" aria-labelledby="home-statement-title">
        <h1 id="home-statement-title">
          Alex Infield is an industrial designer working across physical products,
          digital interfaces, and the systems that connect them.
        </h1>
      </section>

      <section className="selected-work" aria-labelledby="selected-work-title">
        <div className="section-heading">
          <h2 id="selected-work-title">Selected<br />Work</h2>
          <a href="/all">View all projects</a>
        </div>

        <div className="selected-work-grid">
          {projects.map((project, index) => (
            <a className="selected-work-card" href={`/projects/${project.slug}`} key={project.slug}>
              <div className="selected-work-media">
                <FeatureMedia project={project} motion={index % 2 === 1 || project.slug === "ping"} />
              </div>
              <div className="selected-work-caption">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <a href="mailto:alex@infield.net">Contact</a>
        <span>Alex Infield</span>
        <span>2026</span>
      </footer>
    </main>
  );
}
