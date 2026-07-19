import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import SiteHeader from "../site-header";

export default function InfoPage() {
  return (
    <main className="info-page portfolio-info-page">
      <SiteHeader variant="index" title="Info" active="info" closeHref="/" />
      <section className="portfolio-info-layout" aria-labelledby="info-title">
        <img src="/assets/info/media/67aca18a869f9276f4c0ef01_IMG_0019.png" alt="Alex Infield" />
        <div className="portfolio-info-copy">
          <span>Industrial designer · New York</span>
          <h1 id="info-title">Alex Infield works across physical products, digital interfaces, and the systems that connect them.</h1>
          <p>Selected work spanning objects, lighting, furniture, environments, and connected experiences.</p>
          <a href="mailto:alex@infield.net">
            alex@infield.net <ArrowUpRight size={16} weight="regular" aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
