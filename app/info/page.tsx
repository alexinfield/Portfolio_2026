export default function InfoPage() {
  return (
    <main className="info-shell">
      <a className="detail-return" href="/">Show all projects</a>
      <section className="info-page" aria-label="About Alex Infield">
        <div className="info-copy">
          <h1>Alex<br />Infield</h1>
          <div>
            <p>Industrial designer.</p>
            <nav className="project-links" aria-label="Contact links">
              <a className="detail-link" href="mailto:alex@infield.net">Email</a>
            </nav>
          </div>
        </div>
        <img
          src="/assets/info/media/67aca18a869f9276f4c0ef01_IMG_0019.png"
          alt=""
        />
      </section>
    </main>
  );
}
