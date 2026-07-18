import { notFound } from "next/navigation";
import { getNextProject, getProject, getProjectMedia, projects, type ProjectSlug } from "@/lib/portfolio";
import SiteHeader from "@/app/site-header";

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
  const media = getProjectMedia(projectSlug);
  const nextProject = getNextProject(projectSlug);

  return (
    <main className="project-page">
      <SiteHeader variant="page" title={project.title} closeHref="/all" />

      <section className="project-overview" aria-labelledby="project-title">
        <p>Selected work</p>
        <h1 id="project-title">{project.title}</h1>
        <p>{project.description}</p>
      </section>

      <section className="project-gallery" aria-label={`${project.title} project gallery`}>
        {media.map((item, index) => (
          <figure className="project-slide" key={item.key}>
            {item.kind === "video" ? (
              <video
                data-autoplay-video
                loop
                muted
                playsInline
                preload={index < 2 ? "metadata" : "none"}
                poster={item.poster}
                aria-label={`${project.title} motion study`}
              >
                <source src={item.source} type={item.contentType ?? "video/mp4"} />
              </video>
            ) : (
              <img
                src={item.source}
                alt=""
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
              />
            )}
          </figure>
        ))}
      </section>

      <a className="next-project" href={`/projects/${nextProject.slug}`}>
        <span>Next project</span>
        <strong>{nextProject.title}</strong>
      </a>
    </main>
  );
}
