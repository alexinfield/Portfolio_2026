import { projects } from "@/lib/portfolio";
import Link from "next/link";

export function PortfolioIdentity() {
  return (
    <div className="portfolio-identity">
      <Link className="portfolio-wordmark" href="/">Alex Infield</Link>
      <p className="portfolio-clock" aria-label="Current time in New York">
        <span data-local-date suppressHydrationWarning>New York</span>
        <span data-local-time suppressHydrationWarning>Industrial designer</span>
      </p>
    </div>
  );
}

export default function ProjectRail({
  activeSlug,
  interactive = false,
}: {
  activeSlug?: string;
  interactive?: boolean;
}) {
  return (
    <aside className="project-rail" aria-label="Portfolio navigation">
      <PortfolioIdentity />

      <nav className="rail-card-list">
        <Link className="rail-card rail-about-card" href="/info">
          <span>
            <strong>About Alex</strong>
            <small>Industrial designer working across products, interfaces, and the systems between them.</small>
          </span>
        </Link>

        {projects.map((project) => (
          <Link
            className={`rail-card rail-project-card${activeSlug === project.slug ? " is-current" : ""}`}
            href={`/projects/${project.slug}`}
            key={project.slug}
            aria-current={activeSlug === project.slug ? "page" : undefined}
            data-home-project-trigger={interactive ? project.slug : undefined}
          >
            <img src={project.cover} alt="" aria-hidden="true" />
            <span>
              <strong>{project.title}</strong>
              <small>{project.description}</small>
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
