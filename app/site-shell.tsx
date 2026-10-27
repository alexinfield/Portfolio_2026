import type { ReactNode } from "react";
import { Button } from "./compass";
import PaletteBoundary from "./palette-boundary";
import LiveHeader from "./live-header";

export default function SiteShell({ current, children, casePage = false }: {
  current?: "work" | "personal" | "info"; children: ReactNode; casePage?: boolean;
}) {
  return <PaletteBoundary light={current === "personal"}>
    <LiveHeader current={current} base={casePage ? "../../" : current === "work" ? "./" : current ? "../" : "/"} />
    <main id="main-content" tabIndex={-1} className={`portfolio-main portfolio-shell${casePage ? " portfolio-case-page" : ""}`}>
      {children}
    </main>
    {current !== "info" && <footer className="portfolio-footer portfolio-shell">
      <Button asChild variant="link" size="sm"><a href="mailto:alex@infield.net">alex@infield.net</a></Button>
    </footer>}
  </PaletteBoundary>;
}
