import { projects } from "@/lib/portfolio";
import PortfolioGrid from "../portfolio-grid";
import SiteHeader from "../site-header";

export default function AllProjectsPage() {
  return (
    <main className="portfolio-index-page">
      <SiteHeader variant="index" title="All projects" active="work" />
      <p className="portfolio-intro" id="main-content">Selected industrial design, product systems, and connected experiences.</p>
      <PortfolioGrid projects={projects} section="work" />
    </main>
  );
}
