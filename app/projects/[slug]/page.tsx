import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import SiteShell from "@/app/site-shell";
import CaseNavigation from "@/app/case-navigation";
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

// Each case medium carries its intrinsic ratio; CSS uses it to trim the authored
// assets' translucent or off-colour outer pixels so stacked panels meet seamlessly.
const mediaRatio = (width: number, height: number) => ({"--media-ratio": String(height / width)}) as React.CSSProperties;

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
      mediaStyle={mediaRatio(item.width, item.height)}
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
      className="case-media"
      style={mediaRatio(item.width, item.height)}
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
    <div className="case-composite" style={{"--composite-columns": `minmax(0,${image.width / image.height}fr) minmax(0,${video.width / video.height}fr)`, "--composite-ratio": String(1 / (image.width / image.height + video.width / video.height))} as React.CSSProperties}>
      <ResponsiveImage
        src={image.source}
        alt={casePanel(image.source)?.alt ?? ""}
        width={image.width}
        height={image.height}
        sizes="100vw"
        loading="lazy"
        decoding="async"
        className="case-image case-media"
        style={mediaRatio(image.width, image.height)}
      />
      <div className="case-composite-video">
        <DeferredVideo
          className="case-video"
          source={video.source}
          poster={video.poster}
          label={casePanel(video.source)?.alt ?? "Hyphae video"}
          width={video.width}
          height={video.height}
          mediaStyle={mediaRatio(video.width, video.height)}
          previewTime={video.source.includes("growth-sim") ? 8 : undefined}
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
        className="case-media"
        style={mediaRatio(media[0].width, media[0].height)}
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
        className="case-media"
        style={mediaRatio(media[1].width, media[1].height)}
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
          mediaStyle={mediaRatio(1280, 720)}
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
          className="case-image case-media"
          style={mediaRatio(item.width, item.height)}
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
          className="case-image case-media"
          style={mediaRatio(item.width, item.height)}
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
          className="case-image case-media"
          style={mediaRatio(item.width, item.height)}
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
      <h1 className="sr-only">{project.title}</h1>
      <div className="portfolio-case-stack">{presentation}</div>
      <CaseNavigation slug={projectSlug} />
    </SiteShell>
  );
}
