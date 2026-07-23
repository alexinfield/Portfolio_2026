import { getProjectMedia, projects as workProjects, type ProjectSlug } from "@/lib/portfolio";
import { projectNarratives, type ProjectSectionNote } from "@/lib/project-narratives";
import { playProjects } from "@/lib/play";

export const collections = [
  "selected",
  "professional",
  "independent",
  "play",
  "archive",
  "all",
] as const;

export const contentTypes = [
  "render",
  "photography",
  "motion",
  "sketch",
  "prototype",
  "cad",
  "research",
  "collaboration",
  "production",
] as const;

export type Collection = (typeof collections)[number];
export type ContentType = (typeof contentTypes)[number];
export type SlidePhase = "intro" | "process" | "final" | "credits" | "neutral";
export type PhaseFilter = "final" | "process" | null;
export type PortfolioView = "grid" | "index";
export type ProjectPriority = "hero" | "standard" | "compact";

export type ArchiveSlide = {
  id: string;
  anchor: string;
  order: number;
  section: string;
  phase: SlidePhase;
  contentTypes: readonly ContentType[];
  title: string;
  shortLabel: string;
  alt: string;
  mediaKind: "image" | "video";
};

export type ArchiveProject = {
  title: string;
  slug: string;
  domain: string;
  year: string;
  description: string;
  cover: string;
  hoverVideo?: string;
  href: string;
  kind: "work" | "play";
  collections: readonly Collection[];
  priority: ProjectPriority;
  slides: readonly ArchiveSlide[];
};

type ProjectProfile = {
  collections: readonly Collection[];
  priority: ProjectPriority;
};

const projectProfiles: Record<ProjectSlug, ProjectProfile> = {
  "molekule-go": { collections: ["selected", "independent"], priority: "hero" },
  luma: { collections: ["selected", "independent"], priority: "standard" },
  niche: { collections: ["selected", "independent"], priority: "standard" },
  hyphae: { collections: ["selected", "independent", "archive"], priority: "standard" },
  ping: { collections: ["selected", "independent"], priority: "hero" },
  mode: { collections: ["selected", "independent", "archive"], priority: "standard" },
};

const sectionPhases: Record<ProjectSlug, readonly SlidePhase[]> = {
  "molekule-go": [
    "neutral", "process", "neutral", "process", "neutral", "process", "process",
    "final", "final", "final", "final", "final", "final", "final", "final",
  ],
  luma: [
    "neutral", "neutral", "process", "process", "process", "process", "process",
    "process", "process", "process", "process", "process", "final", "final",
    "final", "final", "final", "final", "final", "final",
  ],
  niche: [
    "process", "process", "process", "process", "process", "process", "process",
    "process", "process", "final", "final", "final", "final", "final", "final",
    "final", "final", "final",
  ],
  hyphae: [
    "neutral", "process", "process", "process", "process", "process", "process",
    "process", "process", "process", "process", "process", "process", "process",
    "final", "final", "final", "final", "final", "process", "final", "final",
    "final", "credits",
  ],
  ping: [
    "final", "final", "final", "final", "final", "final", "final", "final",
    "final", "process", "process", "process", "process", "final", "final",
  ],
  mode: [
    "process", "process", "process", "process", "process", "process", "process",
    "process", "process", "final", "final", "final", "final", "final", "final",
  ],
};

const sectionTypes: Record<ProjectSlug, Partial<Record<number, readonly ContentType[]>>> = {
  "molekule-go": {
    1: ["research", "photography"],
    2: ["research"],
    3: ["research"],
    4: ["research"],
    5: ["research"],
    6: ["sketch", "research"],
    7: ["render"],
    8: ["render"],
    9: ["motion"],
    10: ["motion"],
    11: ["render"],
    12: ["photography"],
    13: ["cad", "render"],
    14: ["photography"],
  },
  luma: {
    2: ["research"],
    3: ["research"],
    4: ["research"],
    5: ["research"],
    6: ["research"],
    7: ["research"],
    8: ["research"],
    10: ["render"],
    11: ["prototype", "photography"],
    12: ["photography"],
    13: ["photography"],
    14: ["render"],
    15: ["render"],
    16: ["motion"],
    17: ["render"],
    18: ["photography"],
    19: ["render"],
  },
  niche: {
    0: ["research"],
    1: ["research", "collaboration"],
    2: ["research"],
    3: ["research"],
    4: ["research"],
    5: ["research"],
    6: ["sketch"],
    7: ["prototype", "research"],
    8: ["prototype"],
    9: ["render"],
    10: ["render"],
    11: ["render"],
    12: ["motion", "render"],
    13: ["cad", "render"],
    14: ["render"],
    15: ["render"],
    16: ["render"],
    17: ["motion", "render"],
  },
  hyphae: {
    0: ["research"],
    1: ["research"],
    2: ["research", "photography"],
    3: ["research", "photography"],
    4: ["research"],
    5: ["research"],
    6: ["cad"],
    7: ["cad", "research"],
    8: ["cad", "motion"],
    9: ["prototype"],
    10: ["production", "prototype", "photography"],
    11: ["production", "prototype", "photography"],
    12: ["prototype", "photography"],
    13: ["production", "prototype", "motion"],
    14: ["production", "prototype", "photography"],
    15: ["prototype", "photography"],
    16: ["prototype", "photography"],
    17: ["production", "photography"],
    18: ["production", "photography"],
    19: ["production"],
    20: ["photography"],
    21: ["photography"],
    22: ["photography"],
  },
  ping: {
    0: ["photography"],
    1: ["photography"],
    2: ["render"],
    3: ["render"],
    4: ["render"],
    5: ["render"],
    6: ["render"],
    7: ["photography", "collaboration"],
    8: ["cad", "motion"],
    9: ["research", "motion"],
    10: ["research", "motion"],
    11: ["research"],
    12: ["research"],
    13: ["photography"],
    14: ["photography"],
  },
  mode: {
    0: ["research", "photography"],
    1: ["research"],
    2: ["sketch"],
    3: ["research"],
    4: ["sketch"],
    5: ["production"],
    6: ["production", "photography"],
    7: ["production", "photography"],
    8: ["production", "photography"],
    9: ["photography"],
    10: ["photography"],
    11: ["photography"],
    12: ["photography"],
    13: ["photography"],
    14: ["photography"],
  },
};

function compactText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function shortLabel(note: ProjectSectionNote | undefined, order: number) {
  const source = note?.title ?? note?.eyebrow ?? note?.body;
  if (!source) return `Slide ${String(order).padStart(2, "0")}`;
  const words = compactText(source).replace(/[?.!]$/, "").split(" ");
  return words.slice(0, 6).join(" ");
}

function anchorFor(label: string, order: number, used: Set<string>) {
  const base = label
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || `slide-${String(order).padStart(2, "0")}`;
  let anchor = base;
  if (used.has(anchor)) anchor = `${base}-${String(order).padStart(2, "0")}`;
  used.add(anchor);
  return anchor;
}

function buildWorkSlides(slug: ProjectSlug): ArchiveSlide[] {
  const media = getProjectMedia(slug);
  const visibleMedia = [media[0], ...media.slice(2)];
  const narrative = projectNarratives[slug];
  const usedAnchors = new Set<string>(["overview"]);

  return visibleMedia.map((item, index) => {
    const order = index + 1;
    const note = index === 0 ? undefined : narrative.sections[index - 1];
    const label = index === 0 ? `${narrative.displayTitle} opening` : shortLabel(note, order);
    const anchor = index === 0 ? "project-start" : anchorFor(label, order, usedAnchors);
    const phase = index === 0 ? "final" : sectionPhases[slug][index - 1] ?? "neutral";
    const taggedTypes = index === 0 ? (["photography"] as const) : (sectionTypes[slug][index - 1] ?? []);
    const contentTypeSet = new Set<ContentType>(taggedTypes);
    if (item.kind === "video") contentTypeSet.add("motion");
    const contentTypeList = [...contentTypeSet];
    const title = note?.title ?? note?.eyebrow ?? label;
    const body = note?.body ? ` ${compactText(note.body)}` : "";

    return {
      id: `${slug}-${String(order).padStart(2, "0")}`,
      anchor,
      order,
      section: note?.eyebrow ?? note?.title ?? (phase === "final" ? "Final" : phase === "process" ? "Process" : "Project"),
      phase,
      contentTypes: contentTypeList,
      title,
      shortLabel: label,
      alt: `${narrative.displayTitle}: ${label}.${body}`.trim(),
      mediaKind: item.kind,
    };
  });
}

const workArchiveProjects: ArchiveProject[] = workProjects.map((project) => ({
  title: project.title,
  slug: project.slug,
  domain: project.domain,
  year: project.year,
  description: project.description,
  cover: project.cover,
  hoverVideo: project.hoverVideo,
  href: `/projects/${project.slug}`,
  kind: "work",
  collections: projectProfiles[project.slug].collections,
  priority: projectProfiles[project.slug].priority,
  slides: buildWorkSlides(project.slug),
}));

const playArchiveProjects: ArchiveProject[] = playProjects.map((project) => {
  const isOlderArchive = Number(project.year) <= 2023;
  const contentTypeList: ContentType[] = [];
  if (project.slug === "desk-pen") contentTypeList.push("render");
  if (project.slug === "mycelium-panels") contentTypeList.push("photography", "prototype");

  return {
    title: project.title,
    slug: project.slug,
    domain: project.domain,
    year: project.year,
    description: project.description,
    cover: project.cover,
    href: `/play/${project.slug}`,
    kind: "play",
    collections: isOlderArchive ? ["play", "archive"] : ["play"],
    priority: "compact",
    slides: [
      {
        id: `${project.slug}-01`,
        anchor: "project-start",
        order: 1,
        section: "Final",
        phase: "final",
        contentTypes: contentTypeList,
        title: project.title,
        shortLabel: `${project.title} final`,
        alt: `${project.title}: ${project.description}`,
        mediaKind: "image",
      },
    ],
  };
});

export const archiveProjects: readonly ArchiveProject[] = [
  ...workArchiveProjects,
  ...playArchiveProjects,
];

export function getArchiveProject(slug: string) {
  return archiveProjects.find((project) => project.slug === slug);
}

export function getProjectPresentation(slug: ProjectSlug) {
  const media = getProjectMedia(slug);
  return [media[0], ...media.slice(2)];
}

