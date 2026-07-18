import gallerySequences from "@/public/gallery-sequences.json";
import hyphae from "@/public/assets/hyphae/manifest.json";
import luma from "@/public/assets/luma/manifest.json";
import mode from "@/public/assets/mode/manifest.json";
import molekuleGo from "@/public/assets/molekule-go/manifest.json";
import niche from "@/public/assets/niche/manifest.json";
import ping from "@/public/assets/ping/manifest.json";

export type Asset = {
  id: string;
  kind: "image" | "video";
  name: string;
  path: string;
  url: string;
  contentType?: string;
};

export const projectDefinitions = [
  {
    title: "Molekule Go",
    slug: "molekule-go",
    cover: "/assets/home/media/67b7e8c2a408546fe61055f6_hero-hand.jpg",
    figmaPage: { id: "4576:675", name: "molekule portable air purifier" },
  },
  {
    title: "Luma",
    slug: "luma",
    cover: "/assets/home/media/68cc87ee027f56988fed41fe_hero.webp",
    figmaPage: { id: "5352:397", name: "luma" },
  },
  {
    title: "Niche",
    slug: "niche",
    cover: "/assets/home/media/689b274b032bfbc9129efc47_homePage.webp",
    figmaPage: { id: "3691:453", name: "phone booth" },
  },
  {
    title: "Hyphae Light",
    slug: "hyphae",
    cover: "/assets/home/media/673e50477b24902040693b05_15-hero.jpg",
    figmaPage: { id: "3408:453", name: "hyphae light" },
  },
  {
    title: "Ping",
    slug: "ping",
    cover: "/assets/home/media/692fb99b7ff154a13bde26f2_251202-Hero-Hand.webp",
    figmaPage: { id: "8095:319", name: "Ping" },
  },
  {
    title: "Mode",
    slug: "mode",
    cover: "/assets/home/media/665fb92ad4fed8da46bf0271_DSC_5550.avif",
    figmaPage: { id: "4859:659", name: "side table" },
  },
] as const;

export type ProjectSlug = (typeof projectDefinitions)[number]["slug"];

type Manifest = { assets: Asset[] };
type Sequence = { order: string[]; posters: Record<string, string> };

const manifests: Record<ProjectSlug, Manifest> = {
  "molekule-go": molekuleGo as Manifest,
  luma: luma as Manifest,
  niche: niche as Manifest,
  hyphae: hyphae as Manifest,
  ping: ping as Manifest,
  mode: mode as Manifest,
};

function assetKey(asset: Asset) {
  const sourceName = decodeURIComponent(asset.name).split("/").pop() ?? asset.name;
  const sourceId = sourceName.match(/[a-f\d]{24}/i)?.[0] ?? asset.id;
  return `${asset.kind}:${sourceId}`;
}

function sequenceFor(slug: ProjectSlug) {
  return gallerySequences[slug] as Sequence;
}

function assetsByKey(slug: ProjectSlug) {
  return new Map(manifests[slug].assets.map((asset) => [assetKey(asset), asset]));
}

function sourceFor(slug: ProjectSlug, asset: Asset) {
  return `/assets/${slug}/${asset.path}`;
}

export type Project = (typeof projectDefinitions)[number] & {
  description: string;
  hoverVideo?: string;
};

export const projects: Project[] = projectDefinitions.map((project) => {
  const lookup = assetsByKey(project.slug);
  const hoverKey = sequenceFor(project.slug).order.find((key) => key.startsWith("video:"));
  const hoverAsset = hoverKey ? lookup.get(hoverKey) : undefined;

  return {
    ...project,
    description: "Industrial design by Alex Infield.",
    hoverVideo: hoverAsset ? sourceFor(project.slug, hoverAsset) : undefined,
  };
});

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getProjectMedia(slug: ProjectSlug) {
  const lookup = assetsByKey(slug);
  const sequence = sequenceFor(slug);

  return sequence.order.map((key) => {
    const asset = lookup.get(key);
    if (!asset) throw new Error(`Missing gallery asset: ${key}`);
    const posterKey = sequence.posters[key];
    const poster = posterKey ? lookup.get(posterKey) : undefined;

    return {
      key,
      kind: asset.kind,
      source: sourceFor(slug, asset),
      poster: poster ? sourceFor(slug, poster) : undefined,
      contentType: asset.contentType,
    };
  });
}

export function getNextProject(slug: ProjectSlug) {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
}
