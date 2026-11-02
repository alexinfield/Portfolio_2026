import type { ReactNode } from "react";
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
  </PaletteBoundary>;
}
