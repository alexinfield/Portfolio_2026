/* eslint-disable @next/next/no-html-link-for-pages -- static Pages export requires native navigation */

import type { Metadata } from "next";
import LiveHeader from "../live-header";
import EtcCarousel from "./etc-carousel";

export const metadata: Metadata = {
  title: "Etc",
  description: "Experiments and additional work by Alex Infield.",
};

const deskPenItems = [
  {
    kind: "image" as const,
    src: "/assets/etc/media/desk-pen.png",
    width: 3840,
    height: 6827,
  },
  {
    kind: "video" as const,
    src: "/assets/etc/media/desk-pen-a31.mp4",
    poster: "/assets/etc/media/desk-pen-a31-poster.jpg",
    loop: false,
    width: 2560,
    height: 2560,
  },
  {
    kind: "video" as const,
    src: "/assets/etc/media/desk-pen-a2.mp4",
    poster: "/assets/etc/media/desk-pen-a2-poster.jpg",
    width: 3840,
    height: 3840,
  },
  {
    kind: "video" as const,
    src: "/assets/etc/media/desk-pen-img-1421-web.mp4",
    poster: "/assets/etc/media/desk-pen-img-1421-poster.jpg",
    width: 1920,
    height: 1080,
  },
  {
    kind: "image" as const,
    src: "/assets/etc/media/desk-pen-img-1741-poster.jpg",
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
      <div className="play-columns w-row" id="main-content">
        <div className="play-column w-col w-col-4 w-col-stack">
          <div className="cell-play">
            <EtcCarousel items={deskPenItems} />
            <CardLabel>Desk pen</CardLabel>
          </div>

          <a href="/projects/hyphae" className="link-hyphae w-inline-block">
            <div className="home-project-cell">
              <div className="content-2">
                <img
                  src="/assets/home/media/673e50477b24902040693b05_15-hero.jpg"
                  alt=""
                  className="home-image-hero-hyphae"
                  loading="lazy"
                  width={5760}
                  height={3817}
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
            <EtcCarousel items={deskPenItems} />
            <CardLabel hidden>Desk pen</CardLabel>
          </div>

          <div className="cell-play-casestudy exact-hover-card">
            <EtcCarousel
              variant="slider-5"
              items={[
                { kind: "image", src: "/assets/etc/media/stool.avif", width: 3707, height: 3263 },
                { kind: "image", src: "/assets/etc/media/cnc.avif", width: 2936, height: 2936 },
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
            <img
              src="/assets/info/media/67aca18a869f9276f4c0ef01_IMG_0019.png"
              alt=""
              className="image-43"
              loading="lazy"
              width={2000}
              height={2000}
              decoding="async"
            />
            <CardLabel hidden>Book</CardLabel>
          </div>
          <div className="cell-play exact-hover-card">
            <img
              src="/assets/etc/media/wall-mounts.jpeg"
              alt=""
              className="image-fullwidth"
              loading="lazy"
              width={480}
              height={640}
              decoding="async"
            />
            <CardLabel hidden>Wall mounts</CardLabel>
          </div>
        </div>

        <div className="play-column w-col w-col-4 w-col-stack">
          <div className="cell-play exact-hover-card">
            <img
              src="/assets/etc/media/hyundai-research.gif"
              alt=""
              className="image-43"
              loading="lazy"
              width={800}
              height={422}
              decoding="async"
            />
            <CardLabel hidden>Hyundai, research</CardLabel>
          </div>
          <div className="cell-play exact-hover-card">
            <img
              src="/assets/etc/media/mycelium.jpeg"
              alt=""
              className="image-fullwidth"
              loading="lazy"
              width={480}
              height={640}
              decoding="async"
            />
            <CardLabel hidden>Mycelium</CardLabel>
          </div>
        </div>
      </div>
    </main>
  );
}
