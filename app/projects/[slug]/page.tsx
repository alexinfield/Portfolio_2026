import { notFound } from "next/navigation";
import SiteHeader from "@/app/site-header";
import ProjectSectionNavigator from "@/app/project-section-navigator";
import { getArchiveProject, getProjectPresentation, type ArchiveSlide } from "@/lib/archive";
import { getNextProject, getProject, projects, type ProjectSlug } from "@/lib/portfolio";
import { getProjectNarrative, type ProjectNarrative, type ProjectSectionNote } from "@/lib/project-narratives";

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

function ProjectIntroduction({
  narrative,
  titleId,
}: {
  narrative: ProjectNarrative;
  titleId: string;
}) {
  return (
    <header className="figma-project-intro" data-figma-section="title" id="overview" data-archive-slide>
      <span className="figma-project-intro-label">Project overview</span>
      <h1 id={titleId}>{narrative.displayTitle}</h1>

      <div className="figma-project-intro-grid">
        <div className="figma-project-intro-copy">
          <p>{narrative.introduction}</p>
          {narrative.note ? <p>{narrative.note}</p> : null}
        </div>

        {narrative.meta.length ? (
          <dl>
            <div>
              <dt>{narrative.metaLabel ?? "Type"}</dt>
              <dd>{narrative.meta.map((item) => <span key={item}>{item}</span>)}</dd>
            </div>
          </dl>
        ) : <span aria-hidden="true" />}

        <dl>
          <div>
            <dt>Date</dt>
            <dd>{narrative.date}</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

function ProjectMediaSection({
  item,
  note,
  slide,
  projectTitle,
  index,
}: {
  item: MediaItem;
  note?: ProjectSectionNote;
  slide: ArchiveSlide;
  projectTitle: string;
  index: number;
}) {
  const hasTranscript = Boolean(note?.eyebrow || note?.title || note?.body);
  const hasMobileMedia = Boolean(note?.mobileMedia?.length);

  return (
    <section
      className={`figma-project-section${hasTranscript ? " has-transcript" : ""}${hasMobileMedia ? " has-mobile-deconstruction" : ""}${note?.hideCompositeOnMobile ? " hide-composite-on-mobile" : ""}`}
      data-project-section={index + 3}
    >
      <ProjectMedia item={item} slide={slide} projectTitle={projectTitle} priority={index < 2} />

      {hasMobileMedia ? (
        <div
          className={`figma-mobile-media${note?.mobileLayout === "stack" ? " is-stack" : note!.mobileMedia!.length > 1 ? " is-grid" : ""}`}
          aria-hidden="true"
        >
          {note!.mobileMedia!.map((source) => (
            <img src={source} alt="" loading="lazy" decoding="async" key={source} />
          ))}
        </div>
      ) : null}

      {hasTranscript ? (
        <div className="figma-project-transcript">
          {note?.eyebrow ? <span>{note.eyebrow}</span> : null}
          {note?.title ? <h2>{note.title}</h2> : null}
          {note?.body ? <p>{note.body}</p> : null}
        </div>
      ) : null}
    </section>
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
  const [hero, ...media] = getProjectPresentation(projectSlug);
  const narrative = getProjectNarrative(projectSlug);
  const nextProject = getNextProject(projectSlug);
  const archiveProject = getArchiveProject(projectSlug);
  if (!archiveProject) notFound();
  const [heroSlide, ...archiveSlides] = archiveProject.slides;
  const navigatorSlides = [
    { id: heroSlide.anchor, label: "Start", order: heroSlide.order },
    { id: "overview", label: "Overview", order: 1.5 },
    ...archiveSlides.map((slide) => ({ id: slide.anchor, label: slide.shortLabel, order: slide.order + 1 })),
  ];
  const seenSections = new Set<string>();
  const navigatorSections = [
    { id: "overview", label: "Overview", order: 1.5 },
    ...archiveSlides.flatMap((slide) => {
      if (seenSections.has(slide.section) || slide.section === "Project") return [];
      seenSections.add(slide.section);
      return [{ id: slide.anchor, label: slide.section, order: slide.order + 1 }];
    }),
  ];

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
          <section className="project-gallery" aria-label={`${project.title} project gallery`}>
            <ProjectMedia item={hero} slide={heroSlide} projectTitle={project.title} priority className="project-hero" />

            <ProjectIntroduction narrative={narrative} titleId="project-title" />

            {media.map((item, index) => (
              <ProjectMediaSection
                item={item}
                note={narrative.sections[index]}
                slide={archiveSlides[index]}
                projectTitle={project.title}
                index={index}
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
