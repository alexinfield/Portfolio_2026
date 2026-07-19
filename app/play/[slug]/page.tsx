import { notFound } from "next/navigation";
import { getNextPlayProject, getPlayProject, playProjects, type PlaySlug } from "@/lib/play";
import SiteHeader from "@/app/site-header";

export function generateStaticParams() {
  return playProjects.map(({ slug }) => ({ slug }));
}

export default async function PlayProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getPlayProject(slug);
  if (!project) notFound();
  const nextProject = getNextPlayProject(project.slug as PlaySlug);

  return (
    <main className="play-detail-page">
      <SiteHeader
        variant="detail"
        title={project.title}
        active="play"
        backHref="/play"
        backLabel="Back to play"
        nextHref={`/play/${nextProject.slug}`}
        nextLabel={nextProject.title}
      />
      <article className="play-detail-card" id="main-content">
        <img src={project.cover} alt={`${project.title} project`} />
        <div className="play-detail-copy">
          <div>
            <span>{project.domain}</span>
            <h1>{project.title}</h1>
          </div>
          <p>{project.description}</p>
          <p>{project.year}</p>
        </div>
      </article>
    </main>
  );
}
