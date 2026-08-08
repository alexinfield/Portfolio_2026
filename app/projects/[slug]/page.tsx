import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import LiveHeader from "@/app/live-header";
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

  return <img src={item.source} alt="" loading={index < 2 ? "eager" : "lazy"} />;
}

function HyphaeComposite({ image, video, second = false }: {
  image: MediaItem;
  video: MediaItem;
  second?: boolean;
}) {
  return (
    <div className={second ? "slide-video-right-hyphae-2" : "slide-video-right-hyphae"}>
      <img src={image.source} alt="" loading="lazy" className={second ? "outline" : "outline-video"} />
      <div className={second ? "video-small-airchair-hyphae-2" : "video-small-airchair-hyphae"}>
        <div className={`${second ? "background-video-hyphae-2" : "background-video-hyphae"} w-background-video w-background-video-atom`}>
          <video data-autoplay-video autoPlay loop muted playsInline preload="none" poster={video.poster}>
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
      <img src={media[0].source} alt="" loading="eager" />
      <img src={media[1].source} alt="" loading="eager" />
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
        <img src={item.source} alt="" loading="lazy" className={index > 1 ? "outline" : undefined} key={item.key} />
      ))}
      <HyphaeComposite image={media[9]} video={media[10]} />
      {media.slice(11, 13).map((item) => (
        <img src={item.source} alt="" loading="lazy" className="outline" key={item.key} />
      ))}
      <HyphaeComposite image={media[13]} video={media[14]} second />
      {media.slice(15).map((item) => (
        <img src={item.source} alt="" loading="lazy" className="outline" key={item.key} />
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
  return { title: project ? liveTitles[project.slug] : "Alex Infield" };
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
      <ProjectMedia item={item} slug={projectSlug} index={index} key={item.key} />
    ))
  );

  return (
    <main className={projectPageClasses[projectSlug]}>
      <LiveHeader />
      {projectSlug === "mode" ? <div className="furniture">{presentation}</div> : presentation}
    </main>
  );
}
