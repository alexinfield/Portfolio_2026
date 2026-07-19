import { projects } from "@/lib/portfolio";
import PortfolioGrid from "./portfolio-grid";
import SiteHeader from "./site-header";

export default function Home() {
  return (
    <main className="portfolio-index-page">
      <SiteHeader variant="home" active="work" />
      <p className="portfolio-intro" id="main-content">
        Industrial designer working across products, interfaces,<br className="desktop-break" /> and the systems between them.
      </p>
      <PortfolioGrid projects={projects} section="work" />
    </main>
  );
}
