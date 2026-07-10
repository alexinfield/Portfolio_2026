const projects = [
  ["Ping", "ping", "67b7e8c2a408546fe61055f6_hero-hand.jpg", "ping"],
  ["Molekule Go", "molekule-go", "68cc87ee027f56988fed41fe_hero.webp", "molekule"],
  ["Luma", "luma", "689b274b032bfbc9129efc47_homePage.webp", "luma"],
  ["Niche", "niche", "673e50477b24902040693b05_15-hero.jpg", "niche"],
  ["Hyphae Light", "hyphae", "692fb99b7ff154a13bde26f2_251202-Hero-Hand.webp", "hyphae"],
  ["Mode", "mode", "665fb92ad4fed8da46bf0271_DSC_5550.avif", "mode"],
];

const page = document.body.dataset.page;
const pageRoot = page === "project" ? "../../" : page === "info" ? "../" : "./";

function assetKey(asset) {
  const sourceName = decodeURIComponent(asset.name).split("/").pop();
  const sourceId = sourceName.match(/[a-f\d]{24}/i)?.[0] ?? asset.id;
  return `${asset.kind}:${sourceId}`;
}

function header() {
  return `
    <header class="site-header">
      <a class="wordmark" href="${pageRoot}" aria-label="Alex Infield home">Alex Infield</a>
      <nav aria-label="Primary navigation">
        <a href="${pageRoot}">Work</a>
        <a href="${pageRoot}info/">Info</a>
        <a href="mailto:alex@infield.net">Contact</a>
      </nav>
    </header>`;
}

function renderHome() {
  const cards = projects.map(([title, slug, image, className]) => `
    <article class="project">
      <a class="project-image ${className}" href="${pageRoot}projects/${slug}/" aria-label="View ${title}">
        <img src="${pageRoot}assets/home/media/${image}" alt="">
      </a>
      <h2>${title}</h2>
    </article>`).join("");
  document.querySelector("#app").innerHTML = `${header()}<main class="work-grid" aria-label="Selected work">${cards}</main>`;
}

function renderInfo() {
  document.querySelector("#app").innerHTML = `${header()}<main class="info-page" aria-label="Alex Infield information"><img src="${pageRoot}assets/info/media/67aca18a869f9276f4c0ef01_IMG_0019.png" alt=""></main>`;
}

async function renderProject() {
  const slug = document.body.dataset.slug;
  const project = projects.find(([, projectSlug]) => projectSlug === slug);
  if (!project) return;
  const [title] = project;
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
  document.querySelector("#app").innerHTML = `${header()}<main class="project-detail"><h1>${title}</h1><section class="project-gallery" aria-label="${title} gallery">${media}</section></main>`;
}

if (page === "home") renderHome();
if (page === "info") renderInfo();
if (page === "project") renderProject();
