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
    title: "Wave Shaper",
    slug: "wave-shaper",
    domain: "Interaction Design",
    year: "2023",
    cover: "/play/wave-shaper.png",
    description:
      "A tactile interface study for shaping sound through direct, gestural control.",
    source:
      "Creative/Projects/waveshaper",
  },
  {
    title: "Juicebox",
    slug: "juicebox",
    domain: "Product + Service",
    year: "2022",
    cover: "/play/juicebox.png",
    description:
      "A campus charging system designed to make shared power easier to find, understand, and use.",
    source:
      "Alex Infield Portfolio.pdf",
  },
  {
    title: "Desk Pen",
    slug: "desk-pen",
    domain: "Object Study",
    year: "2025",
    cover: "/play/desk-pen.png",
    description:
      "A focused object study exploring proportion, machining, balance, and the ritual of a pen at rest.",
    source:
      "Creative/Projects/desk-pen",
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

export function getNextPlayProject(slug: PlaySlug) {
  const index = playProjects.findIndex((project) => project.slug === slug);
  return playProjects[(index + 1) % playProjects.length];
}
