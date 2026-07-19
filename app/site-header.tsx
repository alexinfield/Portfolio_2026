"use client";

import { ArrowLeft, ArrowRight, CaretDown } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import ThemeToggle from "./theme-toggle";

type Section = "work" | "play" | "professional" | "info";

type SiteHeaderProps =
  | { variant: "home"; active?: Section }
  | { variant: "index"; title?: string; active?: Section }
  | {
      variant: "detail";
      title: string;
      active?: Section;
      backHref?: string;
      backLabel?: string;
      nextHref?: string;
      nextLabel?: string;
    };

const navItems: { label: string; href: string; section: Section }[] = [
  { label: "Work", href: "/", section: "work" },
  { label: "Play", href: "/play", section: "play" },
  { label: "Professional", href: "/professional-work", section: "professional" },
  { label: "Info", href: "/info", section: "info" },
];

export default function SiteHeader(props: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const active = props.active;
  const root = props.variant === "home" ? "./" : props.variant === "detail" ? "../../" : "../";
  const routeHref = (href: string) => href === "/" ? root : `${root}${href.replace(/^\//, "")}/`;

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header className={`site-header site-header-${props.variant} portfolio-site-header`}>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <div className="portfolio-header-primary">
        <a className="portfolio-name" href={root}>Alex Infield</a>

        <nav className="portfolio-nav portfolio-nav-desktop" aria-label="Portfolio sections">
          {navItems.map((item) => (
            <a
              className={active === item.section ? "is-active" : undefined}
              href={routeHref(item.href)}
              aria-current={active === item.section ? "page" : undefined}
              key={item.section}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="portfolio-header-actions">
          <ThemeToggle />
          <button
            className="portfolio-menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            Menu
            <CaretDown size={14} weight="regular" aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav
        className="portfolio-nav-mobile"
        id="site-mobile-navigation"
        aria-label="Portfolio sections"
        hidden={!menuOpen}
      >
        {navItems.map((item) => (
          <a
            className={active === item.section ? "is-active" : undefined}
            href={routeHref(item.href)}
            aria-current={active === item.section ? "page" : undefined}
            key={item.section}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {props.variant === "detail" ? (
        <nav className="project-context-nav" aria-label={`${props.title} project navigation`}>
          <span className="project-context-title">{props.title}</span>
          <div className="project-context-links">
            <a href={routeHref(props.backHref ?? (active === "play" ? "/play" : "/"))}>
              <ArrowLeft size={15} weight="regular" aria-hidden="true" />
              {props.backLabel ?? (active === "play" ? "Back to play" : "Back to work")}
            </a>
            {props.nextHref && props.nextLabel ? (
              <a className="project-context-next" href={routeHref(props.nextHref)}>
                <span>{`Next: ${props.nextLabel}`}</span>
                <ArrowRight size={15} weight="regular" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
