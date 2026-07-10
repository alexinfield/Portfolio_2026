export default function InfoPage() {
  return (
    <main className="detail-page">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Alex Infield home">
          Alex Infield
        </a>
        <nav aria-label="Primary navigation">
          <a href="/">Work</a>
          <a href="/info">Info</a>
          <a href="mailto:alex@infield.net">Contact</a>
        </nav>
      </header>
      <section className="info-page" aria-label="Alex Infield information">
        <img
          src="/assets/info/media/67aca18a869f9276f4c0ef01_IMG_0019.png"
          alt=""
        />
      </section>
    </main>
  );
}
