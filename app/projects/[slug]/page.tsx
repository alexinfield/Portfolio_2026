import { notFound } from "next/navigation";
import hyphae from "@/public/assets/hyphae/manifest.json";
import luma from "@/public/assets/luma/manifest.json";
import mode from "@/public/assets/mode/manifest.json";
import molekuleGo from "@/public/assets/molekule-go/manifest.json";
import niche from "@/public/assets/niche/manifest.json";
import ping from "@/public/assets/ping/manifest.json";
import gallerySequences from "@/public/gallery-sequences.json";

type Asset = {
  id: string;
  kind: string;
  name: string;
  path: string;
  url: string;
  contentType?: string;
};

function assetKey(asset: Asset) {
  const sourceName = decodeURIComponent(asset.name).split("/").pop();
  const sourceId = sourceName.match(/[a-f\d]{24}/i)?.[0] ?? asset.id;
  return `${asset.kind}:${sourceId}`;
}

function orderedAssets(assets: readonly Asset[], slug: keyof typeof gallerySequences) {
  const assetsByKey = new Map(assets.map((asset) => [assetKey(asset), asset]));
  const sequence = gallerySequences[slug];

  return sequence.order.map((key) => {
    const asset = assetsByKey.get(key);
    if (!asset) throw new Error(`Missing gallery asset: ${key}`);

    const posterKey = sequence.posters[key as keyof typeof sequence.posters];
    return { asset, poster: posterKey ? assetsByKey.get(posterKey) : undefined };
  });
}

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

  const media = orderedAssets(project.assets, slug as keyof typeof gallerySequences);

  return (
    <main className="detail-page">
      <a className="detail-return" href="/">Show all projects</a>
      <section className="project-detail" aria-label={project.title}>
        <aside className="project-sidebar">
          <p className="project-wordmark">Alex Infield</p>
          <div>
            <h1>{project.title}</h1>
            <p>Industrial design by Alex Infield.</p>
          </div>
          <nav className="project-links" aria-label="Project navigation">
            <a className="detail-link" href="/info">Info</a>
            <a className="detail-link" href="mailto:alex@infield.net">Contact</a>
          </nav>
        </aside>
        <div className="project-gallery">
          {media.map(({ asset, poster }) => {
            const source = `/assets/${slug}/${asset.path}`;
            const posterSource = poster ? `/assets/${slug}/${poster.path}` : undefined;

            return asset.kind === "video" ? (
              <video key={asset.url} autoPlay loop muted playsInline controls poster={posterSource}>
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
