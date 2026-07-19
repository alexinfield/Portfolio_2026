import { notFound } from "next/navigation";
import ProjectRail from "@/app/project-rail";
import SiteHeader from "@/app/site-header";
import { getNextProject, getProject, getProjectMedia, projects, type ProjectSlug } from "@/lib/portfolio";
import { getProjectNarrative, type ProjectNarrative, type ProjectSectionNote } from "@/lib/project-narratives";

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

function ProjectIntroduction({
  narrative,
  titleId,
}: {
  narrative: ProjectNarrative;
  titleId: string;
}) {
  return (
    <header className="figma-project-intro" data-figma-section="title">
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
  projectTitle,
  index,
}: {
  item: MediaItem;
  note?: ProjectSectionNote;
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
      <ProjectMedia item={item} projectTitle={projectTitle} priority={index < 2} />

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
  const [hero, , ...media] = getProjectMedia(projectSlug);
  const narrative = getProjectNarrative(projectSlug);
  const nextProject = getNextProject(projectSlug);

  return (
    <main className="project-page">
      <SiteHeader variant="detail" title={project.title} closeHref="/all" />

      <div className="project-workspace">
        <ProjectRail activeSlug={project.slug} />

        <article
          className="project-canvas project-presentation"
          aria-labelledby="project-title"
          data-figma-page={project.figmaPage.id}
          data-figma-root={narrative.figmaRootId}
        >
          <section className="project-gallery" aria-label={`${project.title} project gallery`}>
            <ProjectMedia item={hero} projectTitle={project.title} priority className="project-hero" />

            <ProjectIntroduction narrative={narrative} titleId="project-title" />

            {media.map((item, index) => (
              <ProjectMediaSection
                item={item}
                note={narrative.sections[index]}
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
