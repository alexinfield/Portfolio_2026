import { notFound } from "next/navigation";
import ProjectRail from "@/app/project-rail";
import SiteHeader from "@/app/site-header";
import { getNextProject, getProject, getProjectMedia, projects, type ProjectSlug } from "@/lib/portfolio";

type MediaItem = ReturnType<typeof getProjectMedia>[number];

function ProjectMedia({
  item,
  projectTitle,
  priority = false,
  className = "",
}: {
  item: MediaItem;
  projectTitle: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={`project-slide ${className}`.trim()}>
      {item.kind === "video" ? (
        <video
          data-autoplay-video
          loop
          muted
          playsInline
          preload={priority ? "metadata" : "none"}
          poster={item.poster}
          aria-label={`${projectTitle} motion study`}
        >
          <source src={item.source} type={item.contentType ?? "video/mp4"} />
        </video>
      ) : (
        <img
          src={item.source}
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      )}
    </figure>
  );
}

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  const projectSlug = project.slug as ProjectSlug;
  const [hero, ...media] = getProjectMedia(projectSlug);
  const nextProject = getNextProject(projectSlug);

  return (
    <main className="project-page">
      <SiteHeader variant="detail" title={project.title} closeHref="/all" />

      <div className="project-workspace">
        <ProjectRail activeSlug={project.slug} />

        <article className="project-canvas" aria-labelledby="project-title">
          <section className="project-gallery" aria-label={`${project.title} project gallery`}>
            <ProjectMedia item={hero} projectTitle={project.title} priority className="project-hero" />

            <header className="project-story">
              <div>
                <span>Project</span>
                <h1 id="project-title">{project.title}</h1>
                <p>{project.description}</p>
              </div>
              <div>
                <span>Designer</span>
                <p>Alex Infield</p>
              </div>
            </header>

            {media.map((item, index) => (
              <ProjectMedia
                item={item}
                projectTitle={project.title}
                priority={index < 2}
                key={item.key}
              />
            ))}
          </section>

          <a className="next-project" href={`/projects/${nextProject.slug}`}>
            <span>Next project</span>
            <strong>{nextProject.title}</strong>
          </a>
        </article>
      </div>
    </main>
  );
}
