"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import ResponsiveImage from "../responsive-image";
import DeferredVideo from "../deferred-video";

type CarouselItem = {
  kind: "image" | "video";
  src: string;
  alt: string;
  poster?: string;
  loop?: boolean;
  width: number;
  height: number;
};

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function reducedMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
function hiddenDocument() { return document.hidden; }
function initiallyPaused() { return true; }

export default function EtcCarousel({
  items,
  variant = "slider-2",
  label = "Desk pen",
}: {
  items: CarouselItem[];
  variant?: "slider-2" | "slider-5";
  label?: string;
}) {
  const [active, setActive] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [userStarted, setUserStarted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useSyncExternalStore(subscribeMotion, reducedMotion, initiallyPaused);
  const hidden = useSyncExternalStore(subscribeVisibility, hiddenDocument, initiallyPaused);
  const running = !paused && (!reduceMotion || userStarted);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || hidden || !running || items.length < 2) return;
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % items.length);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [isVisible, hidden, running, items.length]);

  function move(delta: number) {
    setPaused(true);
    setActive((current) => (current + delta + items.length) % items.length);
  }

  return (
    <div
      ref={rootRef}
      className={`${variant} exact-carousel`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
      onFocusCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(true);
      }}
    >
      {items.map((item, index) => (
        <div
          className={`exact-carousel-slide${index === active ? " is-active" : ""}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${items.length}`}
          aria-hidden={index !== active}
          inert={index !== active}
          key={`${item.src}-${index}`}
        >
          <div className={item.kind === "video" ? "div-block-38" : "div-block-37"}>
            {item.kind === "video" ? (
              <DeferredVideo
                className="carousel-video"
                source={item.src}
                label={item.alt}
                loop={item.loop ?? true}
                poster={item.poster}
                width={item.width}
                height={item.height}
                active={index === active}
                paused={!running}
              />
            ) : (
              <ResponsiveImage
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                sizes="(max-width: 991px) 100vw, 33vw"
                className="image-43-copy"
                loading="lazy"
                decoding="async"
              />
            )}
          </div>
        </div>
      ))}
      <div className="carousel-controls">
        <button type="button" aria-label="Previous slide" onClick={() => move(-1)}>Prev</button>
        <button type="button" aria-label={running ? "Pause slideshow" : "Play slideshow"} onClick={() => {
          setPaused(running);
          if (!running) setUserStarted(true);
        }}>{running ? "Pause" : "Play"}</button>
        <button type="button" aria-label="Next slide" onClick={() => move(1)}>Next</button>
        <span aria-live={running ? "off" : "polite"} aria-atomic="true">{active + 1}/{items.length}</span>
      </div>
    </div>
  );
}
