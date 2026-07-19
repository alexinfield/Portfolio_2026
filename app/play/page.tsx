import { playProjects } from "@/lib/play";
import PortfolioGrid from "../portfolio-grid";
import SiteHeader from "../site-header";

export default function PlayPage() {
  return (
    <main className="portfolio-index-page">
      <SiteHeader variant="index" title="Play" active="play" closeHref="/" />
      <p className="portfolio-intro">
        Smaller studies, experiments, and projects that sit<br className="desktop-break" /> between process and finished work.
      </p>
      <PortfolioGrid projects={playProjects} section="play" />
    </main>
  );
}
