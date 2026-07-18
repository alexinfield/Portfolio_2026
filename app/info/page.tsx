import SiteHeader from "../site-header";

export default function InfoPage() {
  return (
    <main className="info-page">
      <SiteHeader variant="page" title="Info" closeHref="/" />

      <section className="info-intro" aria-labelledby="info-title">
        <p>Industrial designer</p>
        <h1 id="info-title">
          Alex Infield works across physical products, digital interfaces, and the
          systems that connect them.
        </h1>
      </section>

      <section className="info-profile">
        <img
          src="/assets/info/media/67aca18a869f9276f4c0ef01_IMG_0019.png"
          alt="Alex Infield"
        />
        <div className="info-contact">
          <p>Selected industrial design work.</p>
          <nav aria-label="Contact links">
            <a href="mailto:alex@infield.net">Email</a>
            <a href="/all">All projects</a>
          </nav>
        </div>
      </section>

      <footer className="site-footer">
        <a href="mailto:alex@infield.net">alex@infield.net</a>
        <span>Alex Infield</span>
        <span>2026</span>
      </footer>
    </main>
  );
}
