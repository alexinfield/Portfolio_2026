import mediaRegistry from "./project-media.json";

export const projectDefinitions = [
  {
    title: "Ping",
    coverAlt: "A hand holding a black Ping device against a blue sky.",
    slug: "ping",
    cover: "/assets/home/media/692fb99b7ff154a13bde26f2_251202-Hero-Hand.webp",
    coverWidth: 2784,
    coverHeight: 1536,
  },
  {
    title: "Molekule Go",
    coverAlt: "A hand holding a tall silver Molekule Go purifier against a black background.",
    slug: "molekule-go",
    cover: "/assets/home/media/67b7e8c2a408546fe61055f6_hero-hand.jpg",
    coverWidth: 1600,
    coverHeight: 900,
  },
  {
    title: "Luma",
    coverAlt: "A round white Luma control mounted on a wall beside green leaves.",
    slug: "luma",
    cover: "/assets/home/media/68cc87ee027f56988fed41fe_hero.webp",
    coverWidth: 2560,
    coverHeight: 1440,
  },
  {
    title: "Niche",
    coverAlt: "A curved translucent Niche booth with a door and vertical handle.",
    slug: "niche",
    cover: "/assets/home/media/689b274b032bfbc9129efc47_homePage.webp",
    coverWidth: 7680,
    coverHeight: 4320,
  },
  {
    title: "Hyphae Light",
    coverAlt: "A branching light sculpture with small lights at its tips in blue light.",
    slug: "hyphae",
    cover: "/assets/home/media/673e50477b24902040693b05_15-hero.jpg",
    coverWidth: 5760,
    coverHeight: 3817,
  },
  {
    title: "Mode",
    coverAlt: "A wooden bedside table with angled legs and two lower shelves.",
    slug: "mode",
    cover: "/assets/home/media/665fb92ad4fed8da46bf0271_DSC_5550.avif",
    coverWidth: 4928,
    coverHeight: 3264,
  },
] as const;

export type ProjectSlug = (typeof projectDefinitions)[number]["slug"];

export type ProjectMedia = {
  kind: "image" | "video";
  source: string;
  poster?: string;
  contentType?: string;
  width: number;
  height: number;
};

export const projects = [...projectDefinitions];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getProjectMedia(slug: ProjectSlug): ProjectMedia[] {
  return mediaRegistry[slug] as ProjectMedia[];
}
