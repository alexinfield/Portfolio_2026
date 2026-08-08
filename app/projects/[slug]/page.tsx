import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import LiveHeader from "@/app/live-header";
import ResponsiveImage from "@/app/responsive-image";
import {
  getProject,
  getProjectMedia,
  projects,
  type ProjectSlug,
} from "@/lib/portfolio";

type MediaItem = ReturnType<typeof getProjectMedia>[number];

const liveTitles: Record<ProjectSlug, string> = {
  ping: "Ping",
  "molekule-go": "Molekule Go",
  luma: "Luma",
  niche: "pillar",
  hyphae: "hyphae",
  mode: "furniture",
};

const projectPageClasses: Record<ProjectSlug, string> = {
  ping: "body-molekule",
  "molekule-go": "body-molekule",
  luma: "luma-body",
  niche: "niche-body",
  hyphae: "hyphae-body",
  mode: "body-6",
};

function videoClassName(slug: ProjectSlug, index: number) {
  if (slug === "ping") {
    return ["background-video-11", "background-video-12-copy", "background-video-12"][index - 10];
  }
  if (slug === "luma") return index === 0 ? "luma" : "_1080-video-luma";
  return "_1080-video";
}

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
    <div className={`${videoClassName(slug, index)} w-background-video w-background-video-atom`}>
      <video
        data-autoplay-video
        autoPlay
        loop={!(slug === "luma" && index === 0)}
        muted
        playsInline
        preload={index === 0 ? "metadata" : "none"}
        poster={item.poster}
        width={item.width}
        height={item.height}
      >
        <source src={item.source} type={item.contentType ?? "video/mp4"} />
      </video>
    </div>
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
      alt=""
      width={item.width}
      height={item.height}
      sizes="100vw"
      loading={index === 0 ? "eager" : "lazy"}
      fetchPriority={index === 0 ? "high" : "auto"}
      decoding={index === 0 ? "sync" : "async"}
    />
  );
}

function HyphaeComposite({ image, video, second = false }: {
  image: MediaItem;
  video: MediaItem;
  second?: boolean;
}) {
  return (
    <div className={second ? "slide-video-right-hyphae-2" : "slide-video-right-hyphae"}>
      <ResponsiveImage
        src={image.source}
        alt=""
        width={image.width}
        height={image.height}
        sizes="100vw"
        loading="lazy"
        decoding="async"
        className={second ? "outline" : "outline-video"}
      />
      <div className={second ? "video-small-airchair-hyphae-2" : "video-small-airchair-hyphae"}>
        <div className={`${second ? "background-video-hyphae-2" : "background-video-hyphae"} w-background-video w-background-video-atom`}>
          <video
            data-autoplay-video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            poster={video.poster}
            width={video.width}
            height={video.height}
          >
            <source src={video.source} type={video.contentType ?? "video/mp4"} />
          </video>
        </div>
      </div>
    </div>
  );
}

function HyphaePresentation({ media }: { media: MediaItem[] }) {
  return (
    <>
      <ResponsiveImage
        src={media[0].source}
        alt=""
        width={media[0].width}
        height={media[0].height}
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        decoding="sync"
      />
      <ResponsiveImage
        src={media[1].source}
        alt=""
        width={media[1].width}
        height={media[1].height}
        sizes="100vw"
        loading="lazy"
        decoding="async"
      />
      <div className="w-embed hyphae-vimeo">
        <div className="hyphae-vimeo-frame">
          <video
            controls
            playsInline
            preload="metadata"
            poster="/assets/hyphae/media/hyphae-light-film-poster.jpg"
            aria-label="Hyphae Light film"
          >
            <source src="/assets/hyphae/media/hyphae-light-film.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
      {media.slice(2, 9).map((item, index) => (
        <ResponsiveImage
          src={item.source}
          alt=""
          width={item.width}
          height={item.height}
          sizes="100vw"
          loading="lazy"
          decoding="async"
          className={index > 1 ? "outline" : undefined}
          key={item.source}
        />
      ))}
      <HyphaeComposite image={media[9]} video={media[10]} />
      {media.slice(11, 13).map((item) => (
        <ResponsiveImage
          src={item.source}
          alt=""
          width={item.width}
          height={item.height}
          sizes="100vw"
          loading="lazy"
          decoding="async"
          className="outline"
          key={item.source}
        />
      ))}
      <HyphaeComposite image={media[13]} video={media[14]} second />
      {media.slice(15).map((item) => (
        <ResponsiveImage
          src={item.source}
          alt=""
          width={item.width}
          height={item.height}
          sizes="100vw"
          loading="lazy"
          decoding="async"
          className="outline"
          key={item.source}
        />
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
  return {
    title: project ? liveTitles[project.slug] : "Alex Infield",
    description: project ? `${project.title} — a project by Alex Infield.` : undefined,
  };
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
      <ProjectMedia item={item} slug={projectSlug} index={index} key={item.source} />
    ))
  );

  return (
    <main className={projectPageClasses[projectSlug]}>
      <LiveHeader />
      {projectSlug === "mode" ? <div className="furniture">{presentation}</div> : presentation}
    </main>
  );
}
