import type { Metadata } from "next";
import { projectDefinitions } from "./portfolio";

export function projectShareImage(project: (typeof projectDefinitions)[number]) {
  const width = 1200;
  return {
    url: `/assets/share/${project.slug}.webp`,
    width,
    height: 628,
    alt: project.coverAlt,
  };
}

export function socialMetadata(
  title: string,
  description: string,
  route: string,
  image: { url: string; width: number; height: number; alt: string } = projectShareImage(projectDefinitions[1]),
): Metadata {
  description=title;
  const absoluteImage = new URL(image.url, "https://alexinfield.com").href;
  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: "Alex Infield",
      title,
      description,
      url: new URL(route === "/" ? route : route.replace(/\/+$/, "") + "/", "https://alexinfield.com").href,
      images: [{ ...image, url: absoluteImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImage],
    },
  };
}
