import type { Project } from "@/lib/portfolio";

export type PortfolioCard = Pick<Project, "title" | "slug" | "domain" | "year" | "cover" | "hoverVideo"> & {
  href?: string;
};

export default function PortfolioGrid({
  projects,
  section,
}: {
  projects: readonly PortfolioCard[];
  section: "work" | "play";
}) {
  return (
    <section className="portfolio-grid" aria-label={section === "work" ? "Selected work" : "Play projects"}>
      {projects.map((project) => (
        <a
          className="portfolio-card project-card"
          href={project.href ?? (section === "work" ? `/projects/${project.slug}` : `/play/${project.slug}`)}
          key={project.slug}
        >
          <div className="portfolio-card-media project-card-media">
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
          <div className="portfolio-card-caption">
            <h2>{project.title}</h2>
            <p>{project.domain} <span aria-hidden="true">·</span> {project.year}</p>
          </div>
        </a>
      ))}
    </section>
  );
}
