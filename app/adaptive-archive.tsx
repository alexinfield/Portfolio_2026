"use client";

import { DiceFive, Plus, X } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  collections,
  contentTypes,
  type ArchiveProject,
  type ArchiveSlide,
  type Collection,
  type ContentType,
} from "@/lib/archive";
import { curatedArchiveIndex, orderArchiveProjects } from "@/lib/archive-order.mjs";

type ArchiveFilter = "final" | "process" | ContentType | null;
type ArchiveSort = "curated" | "newest" | "relevance";

type ArchiveState = {
  collection: Collection;
  filter: ArchiveFilter;
  sort: ArchiveSort;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => unknown;
};

const defaultState: ArchiveState = {
  collection: "all",
  filter: null,
  sort: "curated",
};

const archiveSorts: readonly ArchiveSort[] = ["curated", "newest", "relevance"];

const sortLabels: Record<ArchiveSort, string> = {
  curated: "Curated",
  newest: "Newest",
  relevance: "Relevance",
};

const visibleCollections: readonly Collection[] = [
  "selected",
  "independent",
  "play",
  "archive",
];

const collectionLabels: Record<Collection, string> = {
  selected: "Selected",
  professional: "Professional",
  independent: "Independent",
  play: "Play",
  archive: "Archive",
  all: "All",
};

const contentLabels: Record<ContentType, string> = {
  render: "Rendering",
  photography: "Photo",
  motion: "Motion",
  sketch: "Sketches",
  prototype: "Prototypes",
  cad: "CAD",
  research: "Research",
  collaboration: "Team",
  production: "Making",
};

const filterOptions: readonly { value: Exclude<ArchiveFilter, null>; label: string }[] = [
  { value: "final", label: "Final" },
  { value: "process", label: "Process" },
  ...contentTypes.map((value) => ({ value, label: contentLabels[value] })),
];

function stateFromLocation(): ArchiveState {
  if (typeof window === "undefined") return defaultState;
  const params = new URLSearchParams(window.location.search);
  const collection = params.get("collection") as Collection | null;
  const phase = params.get("phase");
  const content = params.get("type") as ContentType | null;
  const sort = params.get("sort") as ArchiveSort | null;
  const filter: ArchiveFilter = phase === "final" || phase === "process"
    ? phase
    : content && contentTypes.includes(content)
      ? content
      : null;

  return {
    collection: collection && collections.includes(collection) ? collection : "all",
    filter,
    sort: sort && archiveSorts.includes(sort) ? sort : "curated",
  };
}

function stateParams(state: ArchiveState) {
  const params = new URLSearchParams();
  if (state.collection !== "all") params.set("collection", state.collection);
  if (state.filter === "final" || state.filter === "process") params.set("phase", state.filter);
  else if (state.filter) params.set("type", state.filter);
  if (state.sort !== "curated") params.set("sort", state.sort);
  return params;
}

function stateUrl(state: ArchiveState) {
  const params = stateParams(state);
  const query = params.toString();
  return `${window.location.pathname}${query ? `?${query}` : ""}`;
}

function slideHasFilter(slide: ArchiveSlide, filter: ArchiveFilter) {
  if (!filter) return true;
  if (filter === "final" || filter === "process") return slide.phase === filter;
  return slide.contentTypes.includes(filter);
}

function slidesForFilter(project: ArchiveProject, filter: ArchiveFilter) {
  return project.slides.filter((slide) => slideHasFilter(slide, filter));
}

function collectionIncludes(project: ArchiveProject, collection: Collection) {
  return collection === "all" || project.collections.includes(collection);
}

function filterLabel(filter: ArchiveFilter) {
  if (filter === "final") return "Final";
  if (filter === "process") return "Process";
  return filter ? contentLabels[filter] : "All media";
}

function projectHref(project: ArchiveProject) {
  return `.${project.href}`;
}

function slideHref(project: ArchiveProject, slide: ArchiveSlide, state: ArchiveState) {
  const params = stateParams(state);
  const query = params.toString();
  return `${projectHref(project)}${query ? `?${query}` : ""}#${slide.anchor}`;
}

function FilterControls({
  filter,
  available,
  onChange,
}: {
  filter: ArchiveFilter;
  available: Record<Exclude<ArchiveFilter, null>, boolean>;
  onChange: (filter: ArchiveFilter) => void;
}) {
  return (
    <div className="archive-filter-controls" aria-label="Portfolio filters">
      {filterOptions.map((option) => (
        <button
          type="button"
          aria-pressed={filter === option.value}
          className={filter === option.value ? "is-active" : undefined}
          disabled={!available[option.value]}
          onClick={() => onChange(filter === option.value ? null : option.value)}
          key={option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SortControls({
  sort,
  onChange,
}: {
  sort: ArchiveSort;
  onChange: (sort: ArchiveSort) => void;
}) {
  return (
    <div className="archive-sort-controls" aria-label="Project sorting">
      {archiveSorts.map((option) => (
        <button
          type="button"
          aria-pressed={sort === option}
          className={sort === option ? "is-active" : undefined}
          onClick={() => onChange(option)}
          key={option}
        >
          {sortLabels[option]}
        </button>
      ))}
    </div>
  );
}

function SlideList({
  project,
  slides,
  state,
}: {
  project: ArchiveProject;
  slides: readonly ArchiveSlide[];
  state: ArchiveState;
}) {
  if (slides.length < 2) return null;

  return (
    <details className="archive-slide-list">
      <summary>Browse slides</summary>
      <ol>
        {slides.map((slide) => (
          <li key={slide.id}>
            <a href={slideHref(project, slide, state)}>
              <span>{String(slide.order).padStart(2, "0")}</span>
              {slide.shortLabel}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}

function GridProject({
  project,
  state,
  slides,
  emphasized,
}: {
  project: ArchiveProject;
  state: ArchiveState;
  slides: readonly ArchiveSlide[];
  emphasized: boolean;
}) {
  const firstSlide = slides[0];

  return (
    <article
      className={`archive-project project-card${emphasized ? " is-emphasized" : " is-receded"}`}
      data-project={project.slug}
      style={{ viewTransitionName: `archive-card-${project.slug}` }}
    >
      <a className="archive-project-main" href={projectHref(project)} aria-label={`Open ${project.title} full project`}>
        <div className="archive-project-media project-card-media">
          <img src={project.cover} alt={`${project.title} project`} loading="lazy" decoding="async" />
          {project.hoverVideo ? (
            <video data-hover-video loop muted playsInline preload="none" poster={project.cover} aria-hidden="true">
              <source src={project.hoverVideo} type="video/mp4" />
            </video>
          ) : null}
        </div>
        <div className="archive-project-heading">
          <h2>{project.title}</h2>
        </div>
      </a>

      {state.filter && emphasized && firstSlide ? (
        <div className="archive-filter-result">
          <span>{filterLabel(state.filter)} · {slides.length} {slides.length === 1 ? "slide" : "slides"}</span>
          <a href={slideHref(project, firstSlide, state)}>{slides.length === 1 ? "Open slide" : "Open first"}</a>
          <SlideList project={project} slides={slides} state={state} />
        </div>
      ) : null}
    </article>
  );
}

export default function AdaptiveArchive({ projects }: { projects: readonly ArchiveProject[] }) {
  const [state, setState] = useState<ArchiveState>(defaultState);
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileMenuButton = useRef<HTMLButtonElement>(null);
  const mobilePanel = useRef<HTMLDivElement>(null);

  const applyState = useCallback((next: ArchiveState, history: "push" | "replace" = "push") => {
    const commit = () => {
      setState(next);
      const method = history === "replace" ? "replaceState" : "pushState";
      window.history[method]({ archive: next }, "", stateUrl(next));
    };
    const transitionDocument = document as ViewTransitionDocument;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (transitionDocument.startViewTransition && !reduceMotion) {
      transitionDocument.startViewTransition(() => new Promise<void>((resolve) => {
        commit();
        window.requestAnimationFrame(() => resolve());
      }));
      return;
    }

    commit();
  }, []);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => setState(stateFromLocation()), 0);
    const onPopState = () => setState(stateFromLocation());
    window.addEventListener("popstate", onPopState);
    return () => {
      window.clearTimeout(hydrationTimer);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    mobilePanel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        mobileMenuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const collectionProjects = useMemo(
    () => projects.filter((project) => collectionIncludes(project, state.collection)),
    [projects, state.collection],
  );

  const availableFilters = useMemo(() => Object.fromEntries(
    filterOptions.map(({ value }) => [
      value,
      collectionProjects.some((project) => project.slides.some((slide) => slideHasFilter(slide, value))),
    ]),
  ) as Record<Exclude<ArchiveFilter, null>, boolean>, [collectionProjects]);

  const projectStates = useMemo(() => orderArchiveProjects(
    projects.map((project, canonicalIndex) => {
      const slides = slidesForFilter(project, state.filter);
      const collectionMatch = collectionIncludes(project, state.collection);
      const filterMatch = !state.filter || slides.length > 0;
      const emphasized = collectionMatch && filterMatch;
      return {
        project,
        slides,
        emphasized,
        collectionMatch,
        filterMatch,
        canonicalIndex,
        curatedIndex: curatedArchiveIndex(project.slug, canonicalIndex),
        year: Number(project.year),
      };
    }),
    {
      hasFilter: Boolean(state.filter),
      sort: state.sort,
    },
  ), [projects, state]);

  const emphasizedCount = projectStates.filter((item) => item.emphasized).length;
  const announcement = state.filter
    ? `${filterLabel(state.filter)} in ${collectionLabels[state.collection]}. ${emphasizedCount} projects contain this content. Sorted by ${sortLabels[state.sort]}.`
    : `${collectionLabels[state.collection]} collection. ${emphasizedCount} projects. Sorted by ${sortLabels[state.sort]}.`;

  function changeCollection(collection: Collection) {
    const eligible = projects.filter((project) => collectionIncludes(project, collection));
    const filter = state.filter && eligible.some((project) => project.slides.some((slide) => slideHasFilter(slide, state.filter)))
      ? state.filter
      : null;
    applyState({ ...state, collection, filter });
  }

  function changeFilter(filter: ArchiveFilter) {
    applyState({ ...state, filter });
  }

  function changeSort(sort: ArchiveSort) {
    applyState({ ...state, sort });
  }

  function shuffle() {
    const eligible = projectStates.filter((item) => item.emphasized);
    if (!eligible.length) return;
    const selection = eligible[Math.floor(Math.random() * eligible.length)];
    const destination = state.filter && selection.slides[0]
      ? slideHref(selection.project, selection.slides[0], state)
      : projectHref(selection.project);
    window.location.assign(destination);
  }

  const filterControls = (
    <FilterControls filter={state.filter} available={availableFilters} onChange={changeFilter} />
  );
  const sortControls = (
    <SortControls sort={state.sort} onChange={changeSort} />
  );

  return (
    <main className="adaptive-archive-page">
      <a className="skip-link" href="#archive-feed">Skip to projects</a>

      <header className="adaptive-archive-header">
        <div className="archive-nav-row archive-nav-primary">
          <button
            className={`archive-wordmark${state.collection === "all" ? " is-active" : ""}`}
            type="button"
            aria-pressed={state.collection === "all"}
            aria-label="Alex Infield — show all projects"
            onClick={() => changeCollection("all")}
          >
            Alex Infield
          </button>

          <nav className="archive-collection-nav" aria-label="Portfolio collections">
            {visibleCollections.map((collection) => (
              <button
                type="button"
                aria-pressed={state.collection === collection}
                className={state.collection === collection ? "is-active" : undefined}
                onClick={() => changeCollection(collection)}
                key={collection}
              >
                {collectionLabels[collection]}
              </button>
            ))}
          </nav>

          <nav className="archive-destination-nav" aria-label="Info and contact">
            <a href="./info">Info</a>
            <a href="mailto:alex@infield.net">Contact</a>
          </nav>

          <button
            className="archive-mobile-sort-button"
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={`Change sorting. Currently ${sortLabels[state.sort]}`}
          >
            Sort · {sortLabels[state.sort]}
          </button>

          <button
            className="archive-mobile-menu-button"
            type="button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            ref={mobileMenuButton}
          >
            <span>Menu</span>
            <Plus size={17} aria-hidden="true" />
          </button>
        </div>

        <div className="archive-nav-row archive-nav-secondary">
          <div className="archive-filter-group">
            <span className="archive-control-label">Filter</span>
            {filterControls}
          </div>
          <div className="archive-sort-group">
            <span className="archive-control-label">Sort</span>
            {sortControls}
          </div>
          <div className="archive-utility-controls">
            <span>{emphasizedCount} / {projects.length} projects</span>
            {state.filter ? <button type="button" onClick={() => changeFilter(null)}>Clear</button> : null}
            <button type="button" onClick={shuffle} disabled={!emphasizedCount}>
              <DiceFive size={15} aria-hidden="true" /> Shuffle
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="archive-mobile-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setMenuOpen(false);
            mobileMenuButton.current?.focus();
          }
        }}>
          <div className="archive-mobile-panel" role="dialog" aria-modal="true" aria-label="Portfolio controls" ref={mobilePanel}>
            <div className="archive-mobile-panel-heading">
              <span>Portfolio</span>
              <button type="button" aria-label="Close menu" onClick={() => {
                setMenuOpen(false);
                mobileMenuButton.current?.focus();
              }}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <section>
              <h2>Collection</h2>
              <div className="archive-mobile-options">
                <button
                  type="button"
                  aria-pressed={state.collection === "all"}
                  className={state.collection === "all" ? "is-active" : undefined}
                  onClick={() => changeCollection("all")}
                >
                  All
                </button>
                {visibleCollections.map((collection) => (
                  <button
                    type="button"
                    aria-pressed={state.collection === collection}
                    className={state.collection === collection ? "is-active" : undefined}
                    onClick={() => changeCollection(collection)}
                    key={collection}
                  >
                    {collectionLabels[collection]}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2>Filter</h2>
              {filterControls}
              {state.filter ? <button className="archive-mobile-clear" type="button" onClick={() => changeFilter(null)}>Clear filter</button> : null}
            </section>

            <section>
              <h2>Sort</h2>
              {sortControls}
            </section>

            <nav className="archive-mobile-destinations" aria-label="Info and contact">
              <a href="./info">Info</a>
              <a href="mailto:alex@infield.net">Contact</a>
            </nav>
          </div>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">{announcement}</p>

      {emphasizedCount === 0 ? (
        <aside className="archive-empty-state">
          <p>No projects contain {filterLabel(state.filter)} in {collectionLabels[state.collection]}.</p>
          <button type="button" onClick={() => applyState(defaultState)}>Show all projects</button>
        </aside>
      ) : null}

      <section className="archive-feed archive-feed-grid" id="archive-feed" aria-label={`${collectionLabels[state.collection]} portfolio`}>
        {projectStates.map(({ project, slides, emphasized }) => (
          <GridProject project={project} state={state} slides={slides} emphasized={emphasized} key={`${project.kind}-${project.slug}`} />
        ))}
      </section>
    </main>
  );
}
