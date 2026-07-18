import { PortfolioIdentity } from "../project-rail";
import SiteHeader from "../site-header";

export default function InfoPage() {
  return (
    <main className="info-page">
      <SiteHeader variant="detail" title="Info" closeHref="/" />

      <div className="info-workspace">
        <aside className="info-rail">
          <PortfolioIdentity />
          <div className="info-summary-card">
            <span>About</span>
            <p>Alex Infield works across physical products, digital interfaces, and the systems that connect them.</p>
          </div>
          <nav className="info-contact-card" aria-label="Contact links">
            <a href="mailto:alex@infield.net">alex@infield.net</a>
            <a href="/all">All projects</a>
          </nav>
        </aside>

        <section className="info-canvas" aria-labelledby="info-title">
          <img
            src="/assets/info/media/67aca18a869f9276f4c0ef01_IMG_0019.png"
            alt="Alex Infield"
          />
          <div className="info-copy-grid">
            <div>
              <span>Industrial designer</span>
              <h1 id="info-title">Alex Infield</h1>
            </div>
            <p>Selected work spanning objects, lighting, furniture, environments, and connected experiences.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
