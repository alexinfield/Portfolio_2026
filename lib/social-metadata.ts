import type { Metadata } from "next";
import { projectDefinitions } from "./portfolio";

export function projectShareImage(project: (typeof projectDefinitions)[number]) {
  const width = Math.min(1600, project.coverWidth);
  return {
    url: project.coverWidth > 1600 ? project.cover.replace(/\.[^.]+$/, "-w1600.webp") : project.cover,
    width,
    height: Math.round(project.coverHeight * width / project.coverWidth),
    alt: project.coverAlt,
  };
}

export function socialMetadata(
  title: string,
  description: string,
  route: string,
  image: { url: string; width: number; height: number; alt: string } = projectShareImage(projectDefinitions[0]),
): Metadata {
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
