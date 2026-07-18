const projects = [
  {
    title: "Ping",
    slug: "ping",
    description: "Industrial design by Alex Infield.",
    kind: "image",
    source: "assets/home/media/67b7e8c2a408546fe61055f6_hero-hand.jpg",
  },
  {
    title: "Molekule Go",
    slug: "molekule-go",
    description: "Industrial design by Alex Infield.",
    kind: "image",
    source: "assets/home/media/68cc87ee027f56988fed41fe_hero.webp",
  },
  {
    title: "Luma",
    slug: "luma",
    description: "Industrial design by Alex Infield.",
    kind: "image",
    source: "assets/home/media/689b274b032bfbc9129efc47_homePage.webp",
  },
  {
    title: "Niche",
    slug: "niche",
    description: "Industrial design by Alex Infield.",
    kind: "image",
    source: "assets/home/media/673e50477b24902040693b05_15-hero.jpg",
  },
  {
    title: "Hyphae Light",
    slug: "hyphae",
    description: "Industrial design by Alex Infield.",
    kind: "image",
    source: "assets/home/media/692fb99b7ff154a13bde26f2_251202-Hero-Hand.webp",
  },
  {
    title: "Mode",
    slug: "mode",
    description: "Industrial design by Alex Infield.",
    kind: "image",
    source: "assets/home/media/665fb92ad4fed8da46bf0271_DSC_5550.avif",
  },
];

const page = document.body.dataset.page;
const pageRoot = page === "project" ? "../../" : page === "info" ? "../" : "./";

function assetKey(asset) {
  const sourceName = decodeURIComponent(asset.name).split("/").pop();
  const sourceId = sourceName.match(/[a-f\d]{24}/i)?.[0] ?? asset.id;
  return `${asset.kind}:${sourceId}`;
}

function columnCount() {
  if (window.innerWidth < 700) return 1;
  if (window.innerWidth < 1020) return 2;
  if (window.innerWidth < 1320) return 3;
  return 4;
}

function projectCard(project) {
  const media = project.kind === "video"
    ? `<video autoplay loop muted playsinline preload="metadata" poster="${pageRoot}${project.poster}"><source src="${pageRoot}${project.source}" type="video/mp4"></video>`
    : `<img src="${pageRoot}${project.source}" alt="">`;

  return `<a class="index-card" href="${pageRoot}projects/${project.slug}/">${media}<h2>${project.title}</h2><p>${project.description}</p></a>`;
}

function renderHome() {
  document.querySelector("#app").innerHTML = `
    <main class="portfolio-index">
      <header class="index-controls">
        <label class="search-control">
          <span class="sr-only">Filter projects</span>
          <input type="search" placeholder="I want to see..." autocomplete="off">
          <img class="search-arrow" src="${pageRoot}icons/arrow-right.svg" alt="" aria-hidden="true">
        </label>
        <a class="close-control" href="${pageRoot}info/" aria-label="About Alex Infield"><img class="close-icon" src="${pageRoot}icons/x.svg" alt="" aria-hidden="true"></a>
      </header>
      <section class="portfolio-columns" aria-label="Selected work"></section>
      <p class="empty-state" hidden></p>
    </main>`;

  const input = document.querySelector(".search-control input");
  const grid = document.querySelector(".portfolio-columns");
  const empty = document.querySelector(".empty-state");

  const updateGrid = () => {
    const query = input.value.trim().toLowerCase();
    const filtered = query
      ? projects.filter((project) => `${project.title} ${project.description}`.toLowerCase().includes(query))
      : projects;
    const columns = Array.from({ length: columnCount() }, () => []);
    filtered.forEach((project, index) => columns[index % columns.length].push(project));
    grid.innerHTML = columns.map((column) => `<div class="portfolio-column">${column.map(projectCard).join("")}</div>`).join("");
    grid.hidden = filtered.length === 0;
    empty.hidden = filtered.length > 0;
    empty.textContent = filtered.length ? "" : `No projects match “${input.value}”.`;
  };

  input.addEventListener("input", updateGrid);
  window.addEventListener("resize", updateGrid);
  updateGrid();
}

function renderInfo() {
  document.querySelector("#app").innerHTML = `
    <main class="info-shell">
      <a class="detail-return" href="${pageRoot}">Show all projects</a>
      <section class="info-page" aria-label="About Alex Infield">
        <div class="info-copy">
          <h1>Alex<br>Infield</h1>
          <div>
            <p>Industrial designer.</p>
            <nav class="project-links" aria-label="Contact links"><a class="detail-link" href="mailto:alex@infield.net">Email</a></nav>
          </div>
        </div>
        <img src="${pageRoot}assets/info/media/67aca18a869f9276f4c0ef01_IMG_0019.png" alt="">
      </section>
    </main>`;
}

async function renderProject() {
  const slug = document.body.dataset.slug;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return;
  const [manifestResponse, sequenceResponse] = await Promise.all([
    fetch(`${pageRoot}assets/${slug}/manifest.json`),
    fetch(`${pageRoot}gallery-sequences.json`),
  ]);
  const [manifest, sequences] = await Promise.all([
    manifestResponse.json(),
    sequenceResponse.json(),
  ]);
  const sequence = sequences[slug];
  const assetsByKey = new Map(manifest.assets.map((asset) => [assetKey(asset), asset]));
  const media = sequence.order.map((key) => {
    const asset = assetsByKey.get(key);
    if (!asset) throw new Error(`Missing gallery asset: ${key}`);
    const source = `${pageRoot}assets/${slug}/${asset.path}`;
    const poster = sequence.posters[key] && assetsByKey.get(sequence.posters[key]);
    const posterSource = poster ? ` poster="${pageRoot}assets/${slug}/${poster.path}"` : "";
    return asset.kind === "video"
      ? `<video autoplay loop muted playsinline controls${posterSource}><source src="${source}" type="${asset.contentType || "video/mp4"}"></video>`
      : `<img src="${source}" alt="">`;
  }).join("");

  document.querySelector("#app").innerHTML = `
    <main class="detail-page">
      <a class="detail-return" href="${pageRoot}">Show all projects</a>
      <section class="project-detail" aria-label="${project.title}">
        <aside class="project-sidebar">
          <p class="project-wordmark">Alex Infield</p>
          <div><h1>${project.title}</h1><p>${project.description}</p></div>
          <nav class="project-links" aria-label="Project navigation">
            <a class="detail-link" href="${pageRoot}info/">Info</a>
            <a class="detail-link" href="mailto:alex@infield.net">Contact</a>
          </nav>
        </aside>
        <div class="project-gallery">${media}</div>
      </section>
    </main>`;
}

if (page === "home") renderHome();
if (page === "info") renderInfo();
if (page === "project") renderProject();
