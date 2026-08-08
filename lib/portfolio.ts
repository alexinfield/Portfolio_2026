import mediaRegistry from "./project-media.json";

export const projectDefinitions = [
  {
    title: "Ping",
    slug: "ping",
    cover: "/assets/home/media/692fb99b7ff154a13bde26f2_251202-Hero-Hand.webp",
    coverWidth: 2784,
    coverHeight: 1536,
  },
  {
    title: "Molekule Go",
    slug: "molekule-go",
    cover: "/assets/home/media/67b7e8c2a408546fe61055f6_hero-hand.jpg",
    coverWidth: 1600,
    coverHeight: 900,
  },
  {
    title: "Luma",
    slug: "luma",
    cover: "/assets/home/media/68cc87ee027f56988fed41fe_hero.webp",
    coverWidth: 2560,
    coverHeight: 1440,
  },
  {
    title: "Niche",
    slug: "niche",
    cover: "/assets/home/media/689b274b032bfbc9129efc47_homePage.webp",
    coverWidth: 7680,
    coverHeight: 4320,
  },
  {
    title: "Hyphae Light",
    slug: "hyphae",
    cover: "/assets/home/media/673e50477b24902040693b05_15-hero.jpg",
    coverWidth: 5760,
    coverHeight: 3817,
  },
  {
    title: "Mode",
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
