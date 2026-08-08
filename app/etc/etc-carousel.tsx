"use client";

import { useEffect, useRef, useState } from "react";

type CarouselItem = {
  kind: "image" | "video";
  src: string;
  poster?: string;
  loop?: boolean;
  width: number;
  height: number;
};

export default function EtcCarousel({
  items,
  variant = "slider-2",
}: {
  items: CarouselItem[];
  variant?: "slider-2" | "slider-5";
}) {
  const [active, setActive] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "200px 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || items.length < 2) return;
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % items.length);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [isVisible, items.length]);

  useEffect(() => {
    const slides = rootRef.current?.querySelectorAll<HTMLElement>(".exact-carousel-slide");
    if (!slides) return;

    slides.forEach((slide, slideIndex) => {
      slide.querySelectorAll<HTMLVideoElement>("video").forEach((video) => {
        video.pause();
        video.currentTime = 0;

        if (isVisible && slideIndex === active) {
          void video.play().catch(() => {
            // Muted inline playback is allowed in normal browsers. If a browser
            // still blocks it, the poster remains visible until the next cycle.
          });
        }
      });
    });

    return () => {
      slides.forEach((slide) => {
        slide.querySelectorAll<HTMLVideoElement>("video").forEach((video) => video.pause());
      });
    };
  }, [active, isVisible]);

  return (
    <div ref={rootRef} className={`${variant} exact-carousel`} role="region" aria-label="carousel">
      {items.map((item, index) => (
        <div
          className={`exact-carousel-slide${index === active ? " is-active" : ""}`}
          aria-hidden={index !== active}
          key={`${item.src}-${index}`}
        >
          <div className={item.kind === "video" ? "div-block-38" : "div-block-37"}>
            {item.kind === "video" ? (
              <video
                loop={item.loop ?? true}
                muted
                playsInline
                preload="none"
                poster={item.poster}
                width={item.width}
                height={item.height}
              >
                <source src={item.src} type="video/mp4" />
              </video>
            ) : (
              <img
                src={item.src}
                alt=""
                width={item.width}
                height={item.height}
                className="image-43-copy"
                loading="lazy"
                decoding="async"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
