"use client";

import { CaretLeft, CaretRight, LockSimple } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { projects } from "@/lib/portfolio";

const drawerStorageKey = "alex-portfolio-project-drawer";

const routeFromProject = (path: string) => path === "/" ? "../../" : `../../${path.replace(/^\//, "")}/`;
const assetFromProject = (path: string) => path.startsWith("/") ? `../..${path}` : path;

export default function ProjectRail({ activeSlug }: { activeSlug?: string }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const saved = window.sessionStorage.getItem(drawerStorageKey);
    const shouldOpen = saved ? saved === "open" : !window.matchMedia("(max-width: 980px)").matches;
    if (shouldOpen) return;

    const frame = window.requestAnimationFrame(() => setOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawer(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  function setDrawer(next: boolean) {
    setOpen(next);
    window.sessionStorage.setItem(drawerStorageKey, next ? "open" : "closed");
  }

  const sectionLinks = [
    { label: "Work", href: routeFromProject("/"), active: true },
    { label: "play", href: routeFromProject("/play") },
    { label: "pro", href: routeFromProject("/professional-work"), locked: true },
    { label: "info", href: routeFromProject("/info") },
  ];

  return (
    <div className={`project-drawer-shell ${open ? "is-open" : "is-closed"}`}>
      {open ? (
        <button
          className="project-drawer-scrim"
          type="button"
          onClick={() => setDrawer(false)}
          aria-label="Close project navigation"
        />
      ) : null}

      <aside
        className="project-rail project-drawer"
        aria-label="Portfolio navigation"
        aria-hidden={!open}
        inert={open ? undefined : true}
      >
        <a className="project-drawer-wordmark" href={routeFromProject("/")}>Alex Infield</a>

        <nav className="project-drawer-sections" aria-label="Portfolio sections">
          {sectionLinks.map((item) => (
            <a className={item.active ? "is-active" : undefined} href={item.href} key={item.label}>
              <span>{item.label}</span>
              {item.locked ? <LockSimple size={16} weight="regular" aria-hidden="true" /> : null}
            </a>
          ))}
        </nav>

        <a className="rail-card rail-about-card" href={routeFromProject("/info")}>
          <span>
            <strong>About Alex</strong>
            <small>Industrial designer working across products, interfaces, and the systems between them.</small>
          </span>
        </a>

        <nav className="rail-card-list" aria-label="Work projects">
          {projects.map((project) => (
            <a
              className={`rail-card rail-project-card${activeSlug === project.slug ? " is-current" : ""}`}
              href={routeFromProject(`/projects/${project.slug}`)}
              key={project.slug}
              aria-current={activeSlug === project.slug ? "page" : undefined}
            >
              <img src={assetFromProject(project.cover)} alt="" aria-hidden="true" />
              <span>
                <strong>{project.title}</strong>
                <small>{project.description}</small>
              </span>
            </a>
          ))}
        </nav>
      </aside>

      <button
        className="project-drawer-handle"
        type="button"
        onClick={() => setDrawer(!open)}
        aria-label={open ? "Collapse project navigation" : "Open project navigation"}
        aria-expanded={open}
      >
        {open ? <CaretLeft size={26} weight="regular" /> : <CaretRight size={26} weight="regular" />}
      </button>
    </div>
  );
}
