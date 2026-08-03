"use client";

import { useEffect, useMemo, useState } from "react";

export type ProjectNavigatorSlide = {
  id: string;
  label: string;
  order: number;
};

export type ProjectNavigatorSection = {
  id: string;
  label: string;
  order: number;
};

const contextLabels: Record<string, string> = {
  render: "Rendering",
  photography: "Photo",
  motion: "Motion",
  sketch: "Sketches",
  prototype: "Prototypes",
  cad: "CAD",
  research: "Research",
  collaboration: "Team",
  production: "Making",
};

function contextFromLocation() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  const phase = params.get("phase");
  const content = params.get("type");
  if (phase === "final") return "Final";
  if (phase === "process") return "Process";
  if (!content) return "";
  return contextLabels[content] ?? "";
}

export default function ProjectSectionNavigator({
  projectTitle,
  slides,
  sections,
}: {
  projectTitle: string;
  slides: readonly ProjectNavigatorSlide[];
  sections: readonly ProjectNavigatorSection[];
}) {
  const [activeId, setActiveId] = useState(slides[0]?.id ?? "project-start");
  const [entryContext, setEntryContext] = useState("");

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      setEntryContext(contextFromLocation());
      const initial = window.location.hash.slice(1);
      if (initial && slides.some((slide) => slide.id === initial)) setActiveId(initial);
    }, 0);

    const visible = new Map<string, IntersectionObserverEntry>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.set(entry.target.id, entry);
        else visible.delete(entry.target.id);
      });

      const next = [...visible.values()]
        .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];
      if (!next?.target.id) return;
      setActiveId(next.target.id);
      const url = `${window.location.pathname}${window.location.search}#${next.target.id}`;
      window.history.replaceState(window.history.state, "", url);
    }, { rootMargin: "-22% 0px -66%", threshold: [0, 0.01, 0.25] });

    slides.forEach((slide) => {
      const node = document.getElementById(slide.id);
      if (node) observer.observe(node);
    });

    return () => {
      window.clearTimeout(hydrationTimer);
      observer.disconnect();
    };
  }, [slides]);

  const activeIndex = Math.max(0, slides.findIndex((slide) => slide.id === activeId));
  const activeSlide = slides[activeIndex] ?? slides[0];
  const activeSection = useMemo(() => {
    const prior = sections.filter((section) => section.order <= (activeSlide?.order ?? 1));
    return prior.at(-1) ?? sections[0];
  }, [activeSlide, sections]);

  function goTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!slides.length) return null;

  return (
    <>
      <nav className="project-section-navigator" aria-label={`${projectTitle} sections`}>
        <div className="project-section-status">
          <strong>{projectTitle}</strong>
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
          <span>{activeSection?.label ?? activeSlide.label}</span>
        </div>

        <div className="project-section-links">
          {sections.map((section) => (
            <a
              href={`#${section.id}`}
              aria-current={activeSection?.id === section.id ? "location" : undefined}
              className={activeSection?.id === section.id ? "is-active" : undefined}
              key={section.id}
            >
              {section.label}
            </a>
          ))}
        </div>

        <label className="project-scrubber">
          <span className="sr-only">Project slide</span>
          <input
            type="range"
            min={0}
            max={slides.length - 1}
            value={activeIndex}
            aria-valuetext={`${activeSlide.label}, slide ${activeIndex + 1} of ${slides.length}`}
            onChange={(event) => goTo(slides[Number(event.currentTarget.value)].id)}
          />
        </label>

        <details className="project-section-mobile-menu">
          <summary>Sections</summary>
          <div>
            {sections.map((section) => (
              <a href={`#${section.id}`} aria-current={activeSection?.id === section.id ? "location" : undefined} key={section.id}>
                {section.label}
              </a>
            ))}
          </div>
        </details>
      </nav>

      {entryContext ? (
        <div className="project-entry-context" role="status">
          <span>Opened at {entryContext}</span>
          <a href="#project-start">Start from beginning</a>
          <button type="button" aria-label="Dismiss filter context" onClick={() => setEntryContext("")}>×</button>
        </div>
      ) : null}
    </>
  );
}
