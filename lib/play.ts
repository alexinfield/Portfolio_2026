export const playProjects = [
  {
    title: "Off Campus",
    slug: "off-campus",
    domain: "Digital Product",
    year: "2024",
    cover: "/play/off-campus.webp",
    description:
      "A housing-search concept built around the questions students actually ask when they move off campus.",
    source:
      "Creative/Projects/Off Campus/presentation v1/240707/Opening slide.jpg",
  },
  {
    title: "Inflating Chair",
    slug: "inflating-chair",
    domain: "Product Design",
    year: "2024",
    cover: "/play/inflating-chair.webp",
    description:
      "An experimental portable chair exploring inflatable structure, compact storage, and outdoor use.",
    source:
      "Creative/Projects/Inflating Chair/Keyshot/240531 photoshop/exports/airChairOutsideForest-ColorCorrected.jpg",
  },
  {
    title: "Mycelium Panels",
    slug: "mycelium-panels",
    domain: "Material Research",
    year: "2024",
    cover: "/play/mycelium-panels.webp",
    description:
      "A material study using grown mycelium to test texture, pattern, and lightweight panel construction.",
    source:
      "Creative/Projects/portfolio archive/250212 mycelium panels/IMG_7355.jpeg",
  },
] as const;

export type PlaySlug = (typeof playProjects)[number]["slug"];

export function getPlayProject(slug: string) {
  return playProjects.find((project) => project.slug === slug);
}
