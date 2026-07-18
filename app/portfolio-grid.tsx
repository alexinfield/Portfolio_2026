"use client";

import { useEffect, useMemo, useState } from "react";

type Project = {
  title: string;
  slug: string;
  description: string;
  kind: "image" | "video";
  source: string;
  poster?: string;
};

const projects: Project[] = [
  {
    title: "Ping",
    slug: "ping",
    description: "Industrial design by Alex Infield.",
    kind: "video",
    source: "/assets/ping/media/ping-functions.mp4",
    poster: "/assets/ping/media/6954c0b14010a0624b61e67e_ping-functions_poster.0000000.jpg",
  },
  {
    title: "Molekule Go",
    slug: "molekule-go",
    description: "Industrial design by Alex Infield.",
    kind: "video",
    source: "/assets/molekule-go/media/UV-animation-transcode.mp4",
    poster: "/assets/molekule-go/media/67b7caa46fb082fcc8c86951_UV-animation-poster-00001.jpg",
  },
  {
    title: "Luma",
    slug: "luma",
    description: "Industrial design by Alex Infield.",
    kind: "video",
    source: "/assets/luma/media/11-transcode.mp4",
    poster: "/assets/luma/media/68cc895c3452528c1dc05ba2_11-poster-00001.jpg",
  },
  {
    title: "Niche",
    slug: "niche",
    description: "Industrial design by Alex Infield.",
    kind: "video",
    source: "/assets/niche/media/1-transcode.mp4",
    poster: "/assets/niche/media/689b2578633ba1f8a80670bb_1-poster-00001.jpg",
  },
  {
    title: "Hyphae Light",
    slug: "hyphae",
    description: "Industrial design by Alex Infield.",
    kind: "video",
    source: "/assets/hyphae/media/growth-sim-transcode.mp4",
    poster: "/assets/hyphae/media/673e99ecf734e9a1b53d585c_growth-sim-poster-00001.jpg",
  },
  {
    title: "Mode",
    slug: "mode",
    description: "Industrial design by Alex Infield.",
    kind: "image",
    source: "/assets/home/media/665fb92ad4fed8da46bf0271_DSC_5550.avif",
  },
];

function getColumnCount() {
  if (typeof window === "undefined") return 1;
  if (window.innerWidth < 700) return 1;
  if (window.innerWidth < 1020) return 2;
  if (window.innerWidth < 1320) return 3;
  return 4;
}

export default function PortfolioGrid() {
  const [query, setQuery] = useState("");
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const updateColumns = () => setColumnCount(getColumnCount());
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const filteredProjects = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return projects;
    return projects.filter((project) =>
      `${project.title} ${project.description}`.toLowerCase().includes(search),
    );
  }, [query]);

  const columns = Array.from({ length: columnCount }, () => [] as Project[]);
  filteredProjects.forEach((project, index) => columns[index % columnCount].push(project));

  return (
    <main className="portfolio-index">
      <header className="index-controls">
        <label className="search-control">
          <span className="sr-only">Filter projects</span>
          <input
            type="search"
            placeholder="I want to see..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
          <img className="search-arrow" src="/icons/arrow-right.svg" alt="" aria-hidden="true" />
        </label>
        <a className="close-control" href="/info" aria-label="About Alex Infield">
          <img className="close-icon" src="/icons/x.svg" alt="" aria-hidden="true" />
        </a>
      </header>

      {filteredProjects.length ? (
        <section className="portfolio-columns" aria-label="Selected work">
          {columns.map((column, columnIndex) => (
            <div className="portfolio-column" key={columnIndex}>
              {column.map((project) => (
                <a className="index-card" href={`/projects/${project.slug}`} key={project.slug}>
                  {project.kind === "video" ? (
                    <video autoPlay loop muted playsInline preload="metadata" poster={project.poster}>
                      <source src={project.source} type="video/mp4" />
                    </video>
                  ) : (
                    <img src={project.source} alt="" />
                  )}
                  <h2>{project.title}</h2>
                  <p>{project.description}</p>
                </a>
              ))}
            </div>
          ))}
        </section>
      ) : (
        <p className="empty-state">No projects match “{query}”.</p>
      )}
    </main>
  );
}
