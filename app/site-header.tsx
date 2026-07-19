"use client";

import { ArrowUpRight, Desktop, LockSimple, X } from "@phosphor-icons/react";
import ThemeToggle from "./theme-toggle";

type Section = "work" | "play" | "professional" | "info";

type SiteHeaderProps =
  | { variant: "home"; active?: Section }
  | { variant: "index"; title?: string; active?: Section; closeHref?: string }
  | { variant: "detail"; title: string; closeHref?: string };

const navItems: { label: string; href: string; section: Section; locked?: boolean }[] = [
  { label: "Work", href: "/", section: "work" },
  { label: "Play", href: "/play", section: "play" },
  { label: "Professional Work", href: "/professional-work", section: "professional", locked: true },
  { label: "Info", href: "/info", section: "info" },
];

export default function SiteHeader(props: SiteHeaderProps) {
  const isDetail = props.variant === "detail";
  const active = props.variant === "detail" ? undefined : props.active;
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

      {isDetail ? (
        <p className="portfolio-header-title">{props.title}</p>
      ) : (
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
            </a>
          ))}
        </nav>
      )}

      <div className="portfolio-header-actions">
        <ThemeToggle />
        {!isDetail ? (
          <a className="alex-os-launcher" href={routeHref("/alex-os")}>
            <Desktop size={19} weight="regular" aria-hidden="true" />
            <span>Alex OS</span>
            <ArrowUpRight size={15} weight="regular" aria-hidden="true" />
          </a>
        ) : null}
        {closeHref ? (
          <a className="portfolio-close" href={routeHref(closeHref)} aria-label={closeLabel}>
            <X size={20} weight="regular" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </header>
  );
}
