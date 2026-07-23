"use client";

import { CaretDown, DiceFive, X } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ThemeToggle from "./theme-toggle";
import {
  collections,
  contentTypes,
  type ArchiveProject,
  type ArchiveSlide,
  type Collection,
  type ContentType,
  type PhaseFilter,
  type PortfolioView,
} from "@/lib/archive";

type ArchiveState = {
  collection: Collection;
  phase: PhaseFilter;
  content: ContentType | null;
  view: PortfolioView;
};

const defaultState: ArchiveState = {
  collection: "selected",
  phase: null,
  content: null,
  view: "grid",
};

const collectionLabels: Record<Collection, string> = {
  selected: "Selected",
  professional: "Professional",
  independent: "Independent",
  play: "Play",
  archive: "Archive",
  all: "All",
};

const contentLabels: Record<ContentType, string> = {
  render: "Render",
  photography: "Photography",
  motion: "Motion",
  sketch: "Sketch",
  prototype: "Prototype",
  cad: "CAD",
  research: "Research",
  collaboration: "Collaboration",
  production: "Production",
};

function stateFromLocation(): ArchiveState {
  if (typeof window === "undefined") return defaultState;
  const params = new URLSearchParams(window.location.search);
  const collection = params.get("collection") as Collection | null;
  const phase = params.get("phase") as PhaseFilter;
  const content = params.get("type") as ContentType | null;
  const view = params.get("view") as PortfolioView | null;

  return {
    collection: collection && collections.includes(collection) ? collection : "selected",
    phase: phase === "final" || phase === "process" ? phase : null,
    content: content && contentTypes.includes(content) ? content : null,
    view: view === "index" ? "index" : "grid",
  };
}

function stateUrl(state: ArchiveState) {
  const params = new URLSearchParams();
  if (state.collection !== "selected") params.set("collection", state.collection);
  if (state.phase) params.set("phase", state.phase);
  if (state.content) params.set("type", state.content);
  if (state.view !== "grid") params.set("view", state.view);
  const query = params.toString();
  return `${window.location.pathname}${query ? `?${query}` : ""}`;
}

function slidesMatching(project: ArchiveProject, state: ArchiveState) {
  return project.slides.filter((slide) => {
    const phaseMatches = !state.phase || slide.phase === state.phase;
    const contentMatches = !state.content || slide.contentTypes.includes(state.content);
    return phaseMatches && contentMatches;
  });
}

function collectionMatches(project: ArchiveProject, collection: Collection) {
  return collection === "all" || project.collections.includes(collection);
}

function filterSummary(state: ArchiveState) {
  const labels: string[] = [];
  if (state.phase) labels.push(state.phase === "final" ? "Final" : "Process");
  if (state.content) labels.push(contentLabels[state.content]);
  return labels.length ? labels.join(" + ") : "No content filter";
}

function matchQuery(state: ArchiveState) {
  const params = new URLSearchParams();
  params.set("collection", state.collection);
  if (state.phase) params.set("phase", state.phase);
  if (state.content) params.set("type", state.content);
  return params.toString();
}

function projectHref(project: ArchiveProject) {
  return `.${project.href}`;
}

function matchHref(project: ArchiveProject, slide: ArchiveSlide, state: ArchiveState) {
  return `${projectHref(project)}?${matchQuery(state)}#${slide.anchor}`;
}

function PhaseControls({
  phase,
  setPhase,
  available,
}: {
  phase: PhaseFilter;
  setPhase: (phase: PhaseFilter) => void;
  available: Record<"final" | "process", boolean>;
}) {
  return (
    <div className="archive-phase-controls" aria-label="Project phase filters">
      {(["final", "process"] as const).map((item) => (
        <button
          type="button"
          aria-pressed={phase === item}
          className={phase === item ? "is-active" : undefined}
          disabled={!available[item]}
          onClick={() => setPhase(phase === item ? null : item)}
          key={item}
        >
          {item === "final" ? "Final" : "Process"}
        </button>
      ))}
    </div>
  );
}

function ContentControls({
  content,
  setContent,
  available,
}: {
  content: ContentType | null;
  setContent: (content: ContentType | null) => void;
  available: Record<ContentType, boolean>;
}) {
  return (
    <div className="archive-content-controls" aria-label="Content filters">
      {contentTypes.map((item) => (
        <button
          type="button"
          aria-pressed={content === item}
          className={content === item ? "is-active" : undefined}
          disabled={!available[item]}
          title={!available[item] ? `No ${contentLabels[item]} slides in this collection` : undefined}
          onClick={() => setContent(content === item ? null : item)}
          key={item}
        >
          {contentLabels[item]}
        </button>
      ))}
    </div>
  );
}

function MatchList({
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
    <details className="archive-match-list">
      <summary>All {slides.length} matches</summary>
      <ol>
        {slides.map((slide) => (
          <li key={slide.id}>
            <a href={matchHref(project, slide, state)}>
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
  matches,
  emphasized,
}: {
  project: ArchiveProject;
  state: ArchiveState;
  matches: readonly ArchiveSlide[];
  emphasized: boolean;
}) {
  const hasContentFilter = Boolean(state.phase || state.content);
  const firstMatch = matches[0];

  return (
    <article
      className={`archive-project archive-project-${project.priority}${emphasized ? " is-emphasized" : " is-receded"}`}
      data-project={project.slug}
    >
      <a className="archive-project-main" href={projectHref(project)} aria-label={`Open ${project.title} full project`}>
        <div className="archive-project-media project-card-media">
          <img src={project.cover} alt={`${project.title} project`} loading="lazy" decoding="async" />
          {project.hoverVideo ? (
            <video data-hover-video loop muted playsInline preload="none" poster={project.cover} aria-hidden="true">
              <source src={project.hoverVideo} type="video/mp4" />
            </video>
          ) : null}
          {emphasized && hasContentFilter ? <span className="archive-match-marker">Match</span> : null}
        </div>
        <div className="archive-project-heading">
          <div>
            <h2>{project.title}</h2>
            <p>{project.description}</p>
          </div>
          <span>{project.domain} · {project.year}</span>
        </div>
      </a>

      {emphasized && hasContentFilter && firstMatch ? (
        <div className="archive-project-matches">
          <a className="archive-first-match" href={matchHref(project, firstMatch, state)}>
            <span>{filterSummary(state)} · {matches.length}</span>
            <strong>Open {firstMatch.shortLabel} →</strong>
          </a>
          <MatchList project={project} slides={matches} state={state} />
        </div>
      ) : (
        <a className="archive-full-project-label" href={projectHref(project)}>Full project ↗</a>
      )}
    </article>
  );
}

function IndexProject({
  project,
  index,
  state,
  matches,
  emphasized,
}: {
  project: ArchiveProject;
  index: number;
  state: ArchiveState;
  matches: readonly ArchiveSlide[];
  emphasized: boolean;
}) {
  const hasContentFilter = Boolean(state.phase || state.content);
  const firstMatch = matches[0];

  return (
    <article className={`archive-index-row archive-index-${project.priority}${emphasized ? " is-emphasized" : " is-receded"}`}>
      <span className="archive-index-number">{String(index + 1).padStart(2, "0")}</span>
      <a className="archive-index-title" href={projectHref(project)}>
        <strong>{project.title}</strong>
        <span>{project.description}</span>
      </a>
      <span className="archive-index-domain">{project.domain}</span>
      <span className="archive-index-year">{project.year}</span>
      <div className="archive-index-match">
        {emphasized && hasContentFilter && firstMatch ? (
          <>
            <a href={matchHref(project, firstMatch, state)}>{filterSummary(state)} · {matches.length} →</a>
            <MatchList project={project} slides={matches} state={state} />
          </>
        ) : (
          <span>{project.collections.filter((item) => item !== "all").map((item) => collectionLabels[item]).join(" · ")}</span>
        )}
      </div>
    </article>
  );
}

export default function AdaptiveArchive({ projects }: { projects: readonly ArchiveProject[] }) {
  const [state, setState] = useState<ArchiveState>(defaultState);
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileMenuButton = useRef<HTMLButtonElement>(null);
  const mobilePanel = useRef<HTMLDivElement>(null);

  const applyState = useCallback((next: ArchiveState, history: "push" | "replace" = "push") => {
    setState(next);
    const method = history === "replace" ? "replaceState" : "pushState";
    window.history[method]({ archive: next }, "", stateUrl(next));
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
    () => projects.filter((project) => collectionMatches(project, state.collection)),
    [projects, state.collection],
  );

  const availableContent = useMemo(() => Object.fromEntries(
    contentTypes.map((content) => [
      content,
      collectionProjects.some((project) => project.slides.some((slide) => slide.contentTypes.includes(content))),
    ]),
  ) as Record<ContentType, boolean>, [collectionProjects]);

  const availablePhases = useMemo(() => ({
    final: collectionProjects.some((project) => project.slides.some((slide) => slide.phase === "final")),
    process: collectionProjects.some((project) => project.slides.some((slide) => slide.phase === "process")),
  }), [collectionProjects]);

  const projectStates = useMemo(() => projects.map((project) => {
    const matches = slidesMatching(project, state);
    const emphasized = collectionMatches(project, state.collection)
      && (!(state.phase || state.content) || matches.length > 0);
    return { project, matches, emphasized };
  }), [projects, state]);

  const matchCount = projectStates.filter((item) => item.emphasized).length;
  const announcement = `${filterSummary(state)} applied to ${collectionLabels[state.collection]}. ${matchCount} ${matchCount === 1 ? "project contains" : "projects contain"} matching content.`;

  function changeCollection(collection: Collection) {
    const eligible = projects.filter((project) => collectionMatches(project, collection));
    const phase = state.phase && eligible.some((project) => project.slides.some((slide) => slide.phase === state.phase))
      ? state.phase
      : null;
    const content = state.content && eligible.some((project) => project.slides.some((slide) => slide.contentTypes.includes(state.content!)))
      ? state.content
      : null;
    applyState({ ...state, collection, phase, content });
  }

  function clearFilters() {
    applyState({ ...state, phase: null, content: null });
  }

  function surpriseMe() {
    const eligible = projectStates.filter((item) => item.emphasized);
    if (!eligible.length) return;
    const selection = eligible[Math.floor(Math.random() * eligible.length)];
    const destination = (state.phase || state.content) && selection.matches[0]
      ? matchHref(selection.project, selection.matches[0], state)
      : projectHref(selection.project);
    window.location.assign(destination);
  }

  const controls = {
    phase: state.phase,
    setPhase: (phase: PhaseFilter) => applyState({ ...state, phase }),
    available: availablePhases,
  };

  return (
    <main className="adaptive-archive-page">
      <a className="skip-link" href="#archive-feed">Skip to projects</a>

      <header className="adaptive-archive-header">
        <div className="archive-nav-row archive-nav-primary">
          <a className="archive-wordmark" href="./">Alex Infield</a>

          <nav className="archive-collection-nav" aria-label="Portfolio collections">
            {collections.map((collection) => (
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

          <nav className="archive-destination-nav" aria-label="About and contact">
            <a href="./info">About</a>
            <a href="./professional-work">Experience</a>
            <a href="mailto:alex@infield.net">Contact</a>
            <ThemeToggle />
          </nav>

          <button
            className="archive-mobile-menu-button"
            type="button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            ref={mobileMenuButton}
          >
            Menu <CaretDown size={14} aria-hidden="true" />
          </button>
        </div>

        <div className="archive-nav-row archive-nav-filters">
          <PhaseControls {...controls} />
          <button
            className={`archive-filter-toggle${filterOpen ? " is-active" : ""}`}
            type="button"
            aria-expanded={filterOpen}
            aria-controls="archive-extra-filters"
            onClick={() => setFilterOpen((open) => !open)}
          >
            Filter +
          </button>
          <span className="archive-active-summary">{filterSummary(state)}</span>
          {(state.phase || state.content) ? <button className="archive-clear" type="button" onClick={clearFilters}>Clear</button> : null}
        </div>

        <div className="archive-extra-filter-row" id="archive-extra-filters" hidden={!filterOpen}>
          <ContentControls content={state.content} setContent={(content) => applyState({ ...state, content })} available={availableContent} />
        </div>

        <div className="archive-nav-row archive-nav-utility">
          <span>{projects.length} projects · {matchCount} {state.phase || state.content ? "matches" : "in collection"}</span>
          <div className="archive-view-controls" aria-label="Portfolio view">
            {(["grid", "index"] as const).map((view) => (
              <button
                type="button"
                aria-pressed={state.view === view}
                className={state.view === view ? "is-active" : undefined}
                onClick={() => applyState({ ...state, view })}
                key={view}
              >
                {view === "grid" ? "Grid" : "Index"}
              </button>
            ))}
            <button type="button" className="archive-surprise" onClick={surpriseMe} disabled={!matchCount}>
              <DiceFive size={15} aria-hidden="true" /> Surprise Me
            </button>
          </div>
        </div>

        <div className="archive-mobile-state" aria-hidden="true">
          <span>{collectionLabels[state.collection]}</span>
          <span>{filterSummary(state)}</span>
          <span>{state.view === "grid" ? "Grid" : "Index"}</span>
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
              <span>Explore the archive</span>
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
                {collections.map((collection) => (
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
              <h2>Content</h2>
              <PhaseControls {...controls} />
              <ContentControls content={state.content} setContent={(content) => applyState({ ...state, content })} available={availableContent} />
              {(state.phase || state.content) ? <button className="archive-mobile-clear" type="button" onClick={clearFilters}>Clear content filters</button> : null}
            </section>

            <section>
              <h2>View</h2>
              <div className="archive-mobile-options">
                {(["grid", "index"] as const).map((view) => (
                  <button
                    type="button"
                    aria-pressed={state.view === view}
                    className={state.view === view ? "is-active" : undefined}
                    onClick={() => applyState({ ...state, view })}
                    key={view}
                  >
                    {view === "grid" ? "Grid" : "Index"}
                  </button>
                ))}
                <button type="button" onClick={surpriseMe} disabled={!matchCount}>Surprise Me</button>
              </div>
            </section>

            <nav className="archive-mobile-destinations" aria-label="About and contact">
              <a href="./info">About</a>
              <a href="./professional-work">Experience</a>
              <a href="mailto:alex@infield.net">Contact</a>
            </nav>
          </div>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">{announcement}</p>

      <section className="archive-introduction" aria-labelledby="archive-title">
        <p className="archive-kicker">Adaptive archive · Industrial design</p>
        <h1 id="archive-title">Industrial designer working across products, interfaces, and the systems between them.</h1>
        <p>Choose a collection, then follow Final, Process, or a specific kind of work into the existing project presentations.</p>
      </section>

      {matchCount === 0 ? (
        <aside className="archive-empty-state">
          <p>No projects match {filterSummary(state)} in {collectionLabels[state.collection]}.</p>
          {state.collection === "professional" ? <a href="./professional-work">View professional experience and request private work →</a> : <button type="button" onClick={clearFilters}>Clear content filters</button>}
        </aside>
      ) : null}

      <section className={`archive-feed archive-feed-${state.view}`} id="archive-feed" aria-label={`${collectionLabels[state.collection]} portfolio, ${state.view} view`}>
        {state.view === "grid" ? projectStates.map(({ project, matches, emphasized }) => (
          <GridProject project={project} state={state} matches={matches} emphasized={emphasized} key={`${project.kind}-${project.slug}`} />
        )) : projectStates.map(({ project, matches, emphasized }, index) => (
          <IndexProject project={project} index={index} state={state} matches={matches} emphasized={emphasized} key={`${project.kind}-${project.slug}`} />
        ))}
      </section>
    </main>
  );
}
