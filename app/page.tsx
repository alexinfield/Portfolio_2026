import LiveHeader from "./live-header";
import { projects } from "@/lib/portfolio";

const projectClassNames: Record<string, string> = {
  ping: "home-project-ping",
  "molekule-go": "home-project-luma",
  luma: "home-project-luma",
  niche: "home-project-cell",
  hyphae: "home-project-cell",
  mode: "home-project-luma",
};

const imageClassNames: Record<string, string> = {
  ping: "home-image-hero-hyphae",
  "molekule-go": "home-image-hero-hyphae",
  luma: "home-image-hero",
  niche: "home-image-hero-niche",
  hyphae: "home-image-hero-hyphae",
  mode: "home-image-hero-hyphae",
};

export default function Home() {
  return (
    <main className="home-body">
      <LiveHeader current="work" />
      <div className="w-layout-grid grid" id="main-content">
        {projects.map((project, index) => (
          <a
            href={`/projects/${project.slug}`}
            className={`link-${project.slug} w-inline-block`}
            key={project.slug}
          >
            <div className={projectClassNames[project.slug]}>
              <div className="content-2">
                <img
                  src={project.cover}
                  alt=""
                  className={imageClassNames[project.slug]}
                  width={project.coverWidth}
                  height={project.coverHeight}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                />
                <div className="text-5">
                  <div className="frame-39">
                    <div className="home-project-title">{project.title}</div>
                  </div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
