import { Moon, Sun } from "lucide-react";
import { Button } from "./compass";

export default function LiveHeader({ current, base = "/" }: { current?: "work" | "personal" | "info"; base?: string }) {
  return <>
    <Button asChild variant="secondary" size="sm" className="portfolio-skip-link"><a href="#main-content">Skip to content</a></Button>
    <header className="portfolio-header">
      <div className="portfolio-header-content portfolio-shell">
        <Button asChild size="sm" variant="secondary" data-plain="" className="portfolio-wordmark"><a href={base}>Alex Infield</a></Button>
        <nav className="portfolio-nav" aria-label="Primary">
          <Button asChild size="sm" variant="secondary" data-plain={current === "work" ? undefined : ""}><a href={base} aria-current={current === "work" ? "page" : undefined}>Work</a></Button>
          <Button asChild size="sm" variant="secondary" data-plain={current === "personal" ? undefined : ""}><a href={`${base}personal/`} aria-current={current === "personal" ? "page" : undefined}>Personal</a></Button>
          <Button type="button" size="sm" variant="secondary" data-plain="" disabled aria-disabled="true">Professional</Button>
          <Button asChild size="sm" variant="secondary" data-plain={current === "info" ? undefined : ""}><a href={`${base}info/`} aria-current={current === "info" ? "page" : undefined}>Info</a></Button>
        </nav>
        <Button type="button" variant="secondary" data-plain="" size="icon-sm" data-theme-toggle
          aria-label="Dark site appearance" aria-pressed="true" title="Switch to Light" suppressHydrationWarning>
          <Sun data-site-dark-icon aria-hidden="true" /><Moon data-site-light-icon aria-hidden="true" />
        </Button>
      </div>
    </header>
  </>;
}
