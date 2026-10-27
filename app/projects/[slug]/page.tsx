/* eslint-disable @next/next/no-html-link-for-pages -- native navigation for static Pages */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import SiteShell from "@/app/site-shell";
import { Button } from "@/app/compass";
import { ArrowLeft } from "lucide-react";
import ResponsiveImage from "@/app/responsive-image";
import CaseText, { casePanel } from "@/app/case-text";
import DeferredVideo from "@/app/deferred-video";
import { socialMetadata, projectShareImage } from "@/lib/social-metadata";
import {
  getProject,
  getProjectMedia,
  projects,
  type ProjectSlug,
} from "@/lib/portfolio";

type MediaItem = ReturnType<typeof getProjectMedia>[number];

function ProjectVideo({
  item,
  slug,
  index,
}: {
  item: MediaItem;
  slug: ProjectSlug;
  index: number;
}) {
  return (
    <DeferredVideo
      className="case-video"
      source={item.source}
      poster={item.poster}
      label={casePanel(item.source)?.alt ?? "Project video"}
      loop={!(slug === "luma" && index === 0)}
      width={item.width}
      height={item.height}
    />
  );
}

function ProjectMedia({
  item,
  slug,
  index,
}: {
  item: MediaItem;
  slug: ProjectSlug;
  index: number;
}) {
  if (item.kind === "video") {
    return <ProjectVideo item={item} slug={slug} index={index} />;
  }

  return (
    <ResponsiveImage
      src={item.source}
      alt={casePanel(item.source)?.alt ?? ""}
      width={item.width}
      height={item.height}
      sizes="100vw"
      loading={index === 0 ? "eager" : "lazy"}
      fetchPriority={index === 0 ? "high" : "auto"}
      decoding={index === 0 ? "sync" : "async"}
    />
  );
}

function HyphaeComposite({ image, video }: {
  image: MediaItem;
  video: MediaItem;
}) {
  return (
    <div className="case-composite">
      <ResponsiveImage
        src={image.source}
        alt={casePanel(image.source)?.alt ?? ""}
        width={image.width}
        height={image.height}
        sizes="100vw"
        loading="lazy"
        decoding="async"
        className="case-image"
      />
      <div className="case-composite-video">
        <DeferredVideo
          className="case-video"
          source={video.source}
          poster={video.poster}
          label={casePanel(video.source)?.alt ?? "Hyphae video"}
          width={video.width}
          height={video.height}
        />
      </div>
    </div>
  );
}

function HyphaePresentation({ media }: { media: MediaItem[] }) {
  return (
    <>
      <ResponsiveImage
        src={media[0].source}
        alt={casePanel(media[0].source)?.alt ?? ""}
        width={media[0].width}
        height={media[0].height}
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        decoding="sync"
      />
      <ResponsiveImage
        src={media[1].source}
        alt={casePanel(media[1].source)?.alt ?? ""}
        width={media[1].width}
        height={media[1].height}
        sizes="100vw"
        loading="lazy"
        decoding="async"
      />
      <CaseText source={media[1].source} />
      <div className="case-film">
        <DeferredVideo
          className="case-video"
          source="/assets/hyphae/media/hyphae-light-film.mp4"
          poster="/assets/hyphae/media/hyphae-light-film-poster.jpg"
          label="Hyphae Light film"
          longFilm
          durationSeconds={86}
          width={1280}
          height={720}
          autoplay={false}
          loop={false}
        />
      </div>
      {media.slice(2, 9).map((item) => (
        <div className="case-panel" key={item.source}>
        <ResponsiveImage
          src={item.source}
          alt={casePanel(item.source)?.alt ?? ""}
          width={item.width}
          height={item.height}
          sizes="100vw"
          loading="lazy"
          decoding="async"
          className="case-image"
        />
        <CaseText source={item.source} />
        </div>
      ))}
      <HyphaeComposite image={media[9]} video={media[10]} />
      <CaseText source={media[9].source} />
      {media.slice(11, 13).map((item) => (
        <div className="case-panel" key={item.source}>
        <ResponsiveImage
          src={item.source}
          alt={casePanel(item.source)?.alt ?? ""}
          width={item.width}
          height={item.height}
          sizes="100vw"
          loading="lazy"
          decoding="async"
          className="case-image"
        />
        <CaseText source={item.source} />
        </div>
      ))}
      <HyphaeComposite image={media[13]} video={media[14]} />
      {media.slice(15).map((item) => (
        <div className="case-panel" key={item.source}>
        <ResponsiveImage
          src={item.source}
          alt={casePanel(item.source)?.alt ?? ""}
          width={item.width}
          height={item.height}
          sizes="100vw"
          loading="lazy"
          decoding="async"
          className="case-image"
        />
        <CaseText source={item.source} />
        </div>
      ))}
    </>
  );
}

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return project ? socialMetadata(
    project.title,
    `${project.title} — a project by Alex Infield.`,
    `/projects/${project.slug}`,
    projectShareImage(project),
  ) : { title: "Alex Infield" };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "pillar") redirect("/projects/niche");
  if (slug === "furniture") redirect("/projects/mode");

  const project = getProject(slug);
  if (!project) notFound();

  const projectSlug = project.slug as ProjectSlug;
  const media = getProjectMedia(projectSlug);
  const presentation = projectSlug === "hyphae" ? (
    <HyphaePresentation media={media} />
  ) : (
    media.map((item, index) => (
      <div className="case-panel" key={item.source}>
        <ProjectMedia item={item} slug={projectSlug} index={index} />
        <CaseText source={item.source} />
      </div>
    ))
  );

  return (
    <SiteShell casePage>
      <div className="portfolio-case-heading">
        <Button asChild variant="secondary" data-plain="" size="sm"><a href="/"><ArrowLeft aria-hidden="true" />Back to Work</a></Button>
        <h1>{project.title}</h1>
      </div>
      <div className="portfolio-case-stack">{presentation}</div>
      <div className="portfolio-case-back"><Button asChild variant="secondary" data-plain=""><a href="/"><ArrowLeft aria-hidden="true" />Back to Work</a></Button></div>
    </SiteShell>
  );
}
