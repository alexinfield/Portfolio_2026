"use client";

import { ArrowUpRight, LockSimple, X } from "@phosphor-icons/react";
import ThemeToggle from "./theme-toggle";

type Section = "work" | "play" | "professional" | "info" | "os";

type SiteHeaderProps =
  | { variant: "home"; active?: Section }
  | { variant: "index"; title?: string; active?: Section; closeHref?: string }
  | { variant: "detail"; title: string; active?: Section; closeHref?: string };

const navItems: { label: string; href: string; section: Section; locked?: boolean; launcher?: boolean }[] = [
  { label: "Work", href: "/", section: "work" },
  { label: "Play", href: "/play", section: "play" },
  { label: "Professional Work", href: "/professional-work", section: "professional", locked: true },
  { label: "Info", href: "/info", section: "info" },
  { label: "Alex OS", href: "/alex-os", section: "os", launcher: true },
];

export default function SiteHeader(props: SiteHeaderProps) {
  const active = props.active;
  const closeHref = props.variant === "home" ? undefined : props.closeHref ?? "/";
  const closeLabel = props.variant === "detail"
    ? `Close ${props.title}`
    : props.variant === "index" && props.title
      ? `Close ${props.title}`
      : "Close page";
  const root = props.variant === "home" ? "./" : props.variant === "detail" ? "../../" : "../";
  const routeHref = (href: string) => href === "/" ? root : `${root}${href.replace(/^\//, "")}/`;

  return (
    <header className={`site-header site-header-${props.variant} portfolio-site-header`}>
      <a className="portfolio-name" href={root}>Alex Infield</a>

      <nav className="portfolio-nav" aria-label="Portfolio sections">
        {navItems.map((item) => (
          <a
            className={active === item.section ? "is-active" : undefined}
            href={routeHref(item.href)}
            aria-current={active === item.section ? "page" : undefined}
            key={item.section}
          >
            {item.label}
            {item.locked ? <LockSimple size={12} weight="regular" aria-hidden="true" /> : null}
            {item.launcher ? <ArrowUpRight size={13} weight="regular" aria-hidden="true" /> : null}
          </a>
        ))}
      </nav>

      <div className="portfolio-header-actions">
        <ThemeToggle />
        {closeHref ? (
          <a className="portfolio-close" href={routeHref(closeHref)} aria-label={closeLabel}>
            <X size={20} weight="regular" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </header>
  );
}
