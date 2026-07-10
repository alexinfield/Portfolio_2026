const projects = [
  { title: "Ping", slug: "ping", image: "/assets/home/media/67b7e8c2a408546fe61055f6_hero-hand.jpg", className: "ping" },
  { title: "Molekule Go", slug: "molekule-go", image: "/assets/home/media/68cc87ee027f56988fed41fe_hero.webp", className: "molekule" },
  { title: "Luma", slug: "luma", image: "/assets/home/media/689b274b032bfbc9129efc47_homePage.webp", className: "luma" },
  { title: "Niche", slug: "niche", image: "/assets/home/media/673e50477b24902040693b05_15-hero.jpg", className: "niche" },
  { title: "Hyphae Light", slug: "hyphae", image: "/assets/home/media/692fb99b7ff154a13bde26f2_251202-Hero-Hand.webp", className: "hyphae" },
  { title: "Mode", slug: "mode", image: "/assets/home/media/665fb92ad4fed8da46bf0271_DSC_5550.avif", className: "mode" },
];

export default function Home() {
  return (
    <main>
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

      <section className="work-grid" id="work" aria-label="Selected work">
        {projects.map((project) => (
          <article className="project" key={project.title}>
            <a
              className={`project-image ${project.className}`}
              href={`/projects/${project.slug}`}
              aria-label={`View ${project.title}`}
            >
              <img src={project.image} alt="" />
            </a>
            <h2>{project.title}</h2>
          </article>
        ))}
      </section>

    </main>
  );
}
