/* eslint-disable @next/next/no-html-link-for-pages -- static Pages export requires native navigation */

import type { Metadata } from "next";
import { socialMetadata, projectShareImage } from "@/lib/social-metadata";
import { projectDefinitions } from "@/lib/portfolio";
import LiveHeader from "../live-header";
import ResponsiveImage from "../responsive-image";
import EtcCarousel from "./etc-carousel";

export const metadata: Metadata = socialMetadata(
  "Etc", "Experiments and additional work by Alex Infield.", "/etc",
  projectShareImage(projectDefinitions[4]),
);

const deskPenItems = [
  {
    kind: "image" as const,
    src: "/assets/etc/media/desk-pen.png",
    alt: "A desk pen standing upright in its base.",
    width: 3840,
    height: 6827,
  },
  {
    kind: "video" as const,
    src: "/assets/etc/media/desk-pen-a31.mp4",
    alt: "Animation of the desk pen and its base.",
    poster: "/assets/etc/media/desk-pen-a31-poster.jpg",
    loop: false,
    width: 2560,
    height: 2560,
  },
  {
    kind: "video" as const,
    src: "/assets/etc/media/desk-pen-a2.mp4",
    alt: "Animation of a desk pen rotating.",
    poster: "/assets/etc/media/desk-pen-a2-poster.jpg",
    width: 3840,
    height: 3840,
  },
  {
    kind: "video" as const,
    src: "/assets/etc/media/desk-pen-img-1421-web.mp4",
    alt: "Video demonstrating a desk pen prototype.",
    poster: "/assets/etc/media/desk-pen-img-1421-poster.jpg",
    width: 1920,
    height: 1080,
  },
  {
    kind: "image" as const,
    src: "/assets/etc/media/desk-pen-img-1741-poster.jpg",
    alt: "A still photograph of a desk pen prototype.",
    width: 404,
    height: 720,
  },
];

function CardLabel({ children, hidden = false }: { children: React.ReactNode; hidden?: boolean }) {
  return (
    <div className={`w-layout-hflex flex-block${hidden ? " exact-hidden-label" : ""}`}>
      <div className="play-card-subdiv">
        <div className="play-card-text">{children}</div>
      </div>
    </div>
  );
}

export default function EtcPage() {
  return (
    <main className="play-body">
      <LiveHeader light />
      <div className="play-columns w-row" id="main-content" tabIndex={-1}>
        <div className="play-column w-col w-col-4 w-col-stack">
          <div className="cell-play">
            <EtcCarousel items={deskPenItems} />
            <CardLabel>Desk pen</CardLabel>
          </div>

          <a href="/projects/hyphae" className="link-hyphae w-inline-block">
            <div className="home-project-cell">
              <div className="content-2">
                <ResponsiveImage
                  src="/assets/home/media/673e50477b24902040693b05_15-hero.jpg"
                  alt="A branching light sculpture with small lights at its tips in blue light."
                  className="home-image-hero-hyphae"
                  loading="lazy"
                  width={5760}
                  height={3817}
                  sizes="(max-width: 991px) 100vw, 33vw"
                  decoding="async"
                />
                <div className="text-5">
                  <div className="frame-39">
                    <div className="home-project-title">Hyphae Light</div>
                  </div>
                </div>
              </div>
            </div>
          </a>

          <div className="cell-play exact-hover-card">
            <EtcCarousel items={deskPenItems} label="Desk pen, alternate view" />
            <CardLabel hidden>Desk pen</CardLabel>
          </div>

          <div className="cell-play-casestudy exact-hover-card">
            <EtcCarousel
              variant="slider-5"
              label="Stool and CNC"
              items={[
                { kind: "image", src: "/assets/etc/media/stool.avif", alt: "A stool assembled from slotted, curved panels.", width: 3707, height: 3263 },
                { kind: "image", src: "/assets/etc/media/cnc.avif", alt: "Close-up of the stool’s slotted panel and curved top.", width: 2936, height: 2936 },
              ]}
            />
            <div className="w-layout-hflex flex-block exact-hidden-label exact-label-pair">
              <div className="play-card-subdiv"><div className="play-card-text">Stool</div></div>
              <div className="play-card-subdiv"><div className="play-card-text">CNC</div></div>
            </div>
          </div>
        </div>

        <div className="play-column w-col w-col-4 w-col-stack">
          <div className="cell-play-casestudy exact-hover-card">
            <ResponsiveImage
              src="/assets/info/media/67aca18a869f9276f4c0ef01_IMG_0019.png"
              alt="White paper folded into a repeating grid of triangular shapes."
              className="image-43"
              loading="lazy"
              width={2000}
              height={2000}
              sizes="(max-width: 991px) 100vw, 33vw"
              decoding="async"
            />
            <CardLabel hidden>Book</CardLabel>
          </div>
          <div className="cell-play exact-hover-card">
            <ResponsiveImage
              src="/assets/etc/media/wall-mounts.jpeg"
              alt="A relief of a face on a CNC machine bed beneath the cutting tool."
              className="image-fullwidth"
              loading="lazy"
              width={480}
              height={640}
              sizes="(max-width: 991px) 100vw, 33vw"
              decoding="async"
            />
            <CardLabel hidden>Wall mounts</CardLabel>
          </div>
        </div>

        <div className="play-column w-col w-col-4 w-col-stack">
          <div className="cell-play exact-hover-card">
            <picture className="motion-picture">
            <source media="(prefers-reduced-motion: reduce)" srcSet="/assets/etc/media/hyundai-research-still.webp" />
            <ResponsiveImage
              src="/assets/etc/media/hyundai-research.gif"
              alt="Animated rows of small red and pale blue squares on a black background."
              className="image-43"
              loading="lazy"
              width={800}
              height={422}
              sizes="(max-width: 991px) 100vw, 33vw"
              decoding="async"
            />
            </picture>
            <CardLabel hidden>Hyundai, research</CardLabel>
          </div>
          <div className="cell-play exact-hover-card">
            <ResponsiveImage
              src="/assets/etc/media/mycelium.jpeg"
              alt="Close-up of a pale, mottled surface with concentric curved lines."
              className="image-fullwidth"
              loading="lazy"
              width={480}
              height={640}
              sizes="(max-width: 991px) 100vw, 33vw"
              decoding="async"
            />
            <CardLabel hidden>Mycelium</CardLabel>
          </div>
        </div>
      </div>
    </main>
  );
}
