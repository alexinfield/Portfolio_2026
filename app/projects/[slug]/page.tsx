import { notFound } from "next/navigation";
import hyphae from "@/public/assets/hyphae/manifest.json";
import luma from "@/public/assets/luma/manifest.json";
import mode from "@/public/assets/mode/manifest.json";
import molekuleGo from "@/public/assets/molekule-go/manifest.json";
import niche from "@/public/assets/niche/manifest.json";
import ping from "@/public/assets/ping/manifest.json";

const projects = {
  ping: { title: "Ping", assets: ping.assets },
  "molekule-go": { title: "Molekule Go", assets: molekuleGo.assets },
  luma: { title: "Luma", assets: luma.assets },
  niche: { title: "Niche", assets: niche.assets },
  hyphae: { title: "Hyphae Light", assets: hyphae.assets },
  mode: { title: "Mode", assets: mode.assets },
} as const;

export function generateStaticParams() {
  return Object.keys(projects).map((slug) => ({ slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects[slug as keyof typeof projects];

  if (!project) notFound();

  return (
    <main className="detail-page">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Alex Infield home">
          Alex Infield
        </a>
        <nav aria-label="Primary navigation">
          <a href="/">Work</a>
          <a href="/info">Info</a>
          <a href="mailto:alex@infield.net">Contact</a>
        </nav>
      </header>
      <section className="project-detail" aria-label={project.title}>
        <h1>{project.title}</h1>
        <div className="project-gallery">
          {project.assets.map((asset) => {
            const source = `/assets/${slug}/${asset.path}`;

            return asset.kind === "video" ? (
              <video key={asset.url} autoPlay loop muted playsInline controls>
                <source src={source} type={asset.contentType ?? "video/mp4"} />
              </video>
            ) : (
              <img key={asset.url} src={source} alt="" />
            );
          })}
        </div>
      </section>
    </main>
  );
}
