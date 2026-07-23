import { notFound } from "next/navigation";
import SiteHeader from "@/app/site-header";
import ProjectSectionNavigator from "@/app/project-section-navigator";
import { getArchiveProject, getProjectPresentation, type ArchiveSlide } from "@/lib/archive";
import { getNextProject, getProject, projects, type ProjectSlug } from "@/lib/portfolio";
import { getProjectNarrative } from "@/lib/project-narratives";

type MediaItem = ReturnType<typeof getProjectPresentation>[number];

function ProjectMedia({
  item,
  slide,
  projectTitle,
  priority = false,
  className = "",
}: {
  item: MediaItem;
  slide: ArchiveSlide;
  projectTitle: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={`project-slide ${className}`.trim()}
      id={slide.anchor}
      data-archive-slide
      data-slide-order={slide.order}
    >
      {item.kind === "video" ? (
        <video
          data-autoplay-video
          loop
          muted
          playsInline
          preload={priority ? "metadata" : "none"}
          poster={item.poster}
          aria-label={slide.alt || `${projectTitle} motion study`}
        >
          <source src={item.source} type={item.contentType ?? "video/mp4"} />
        </video>
      ) : (
        <img
          src={item.source}
          alt={slide.alt}
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
  const media = getProjectPresentation(projectSlug);
  const narrative = getProjectNarrative(projectSlug);
  const nextProject = getNextProject(projectSlug);
  const archiveProject = getArchiveProject(projectSlug);
  if (!archiveProject || archiveProject.slides.length !== media.length) notFound();

  const navigatorSlides = archiveProject.slides.map((slide) => ({
    id: slide.anchor,
    label: slide.shortLabel,
    order: slide.order,
  }));
  const seenSections = new Set<string>();
  const navigatorSections = archiveProject.slides.flatMap((slide) => {
    if (slide.section === "Project" || seenSections.has(slide.section)) return [];
    seenSections.add(slide.section);
    return [{ id: slide.anchor, label: slide.section, order: slide.order }];
  });

  return (
    <main className="project-page">
      <SiteHeader
        variant="detail"
        title={project.title}
        active="work"
        nextHref={`/projects/${nextProject.slug}`}
        nextLabel={nextProject.title}
      />

      <ProjectSectionNavigator
        projectTitle={project.title}
        slides={navigatorSlides}
        sections={navigatorSections}
      />

      <div className="project-workspace" id="main-content">
        <article
          className="project-canvas project-presentation"
          aria-labelledby="project-title"
          data-figma-page={project.figmaPage.id}
          data-figma-root={narrative.figmaRootId}
        >
          <h1 className="sr-only" id="project-title">{project.title}</h1>
          <section className="project-gallery" aria-label={`${project.title} project gallery`}>
            {media.map((item, index) => (
              <ProjectMedia
                item={item}
                slide={archiveProject.slides[index]}
                projectTitle={project.title}
                priority={index < 2}
                className={index === 0 ? "project-hero" : ""}
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
