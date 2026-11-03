import { withBasePath } from "../lib/base-path";
import { Button } from "./compass";
import { LockKeyhole } from "lucide-react";

export default function LiveHeader({ current, base = "/" }: { current?: "work" | "personal" | "info"; base?: string }) {
  return <>
    <header className="portfolio-header">
      <div className="portfolio-header-content portfolio-shell">
        <Button asChild size="sm" variant="secondary" data-plain="" className="portfolio-wordmark"><a href={withBasePath(base)}>Alex Infield</a></Button>
        <nav className="portfolio-nav" aria-label="Primary">
          <Button asChild size="sm" variant="secondary" className="portfolio-nav-item" data-plain={current === "work" ? undefined : ""}><a href={withBasePath(base)} aria-current={current === "work" ? "page" : undefined}>Work</a></Button>
          <Button asChild size="sm" variant="secondary" className="portfolio-nav-item" data-plain={current === "personal" ? undefined : ""}><a href={withBasePath(`${base}personal/`)} aria-current={current === "personal" ? "page" : undefined}>Personal</a></Button>
          <Button type="button" size="sm" variant="secondary" data-plain="" data-unavailable-toggle
            aria-disabled="true" aria-describedby="unavailable-status" aria-expanded="false">Professional</Button>
          <Button asChild size="sm" variant="secondary" className="portfolio-nav-item" data-plain={current === "info" ? undefined : ""}><a href={withBasePath(`${base}info/`)} aria-current={current === "info" ? "page" : undefined}>Info</a></Button>
        </nav>
      </div>
    </header>
    <span id="unavailable-status" className="portfolio-unavailable-message" role="tooltip" hidden>
      <LockKeyhole aria-hidden="true" />Professional — unavailable for now
    </span>
  </>;
}
