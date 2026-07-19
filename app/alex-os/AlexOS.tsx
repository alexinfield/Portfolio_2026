"use client";

import {
  AppleLogo,
  Archive,
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  Books,
  Briefcase,
  CaretRight,
  Code,
  Desktop,
  FilmSlate,
  FloppyDisk,
  Folder,
  FolderOpen,
  GameController,
  GridFour,
  HardDrive,
  Headphones,
  House,
  Images,
  List,
  MagnifyingGlass,
  MonitorPlay,
  MusicNote,
  NotePencil,
  Palette,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  SpeakerHigh,
  Trash,
  Waveform,
  X,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import styles from "./alex-os.module.css";

type WindowId = "finder" | "music" | "video" | "classic";
type FinderLocation = "Macintosh HD" | "Creative" | "Projects" | "RISD" | "Media" | "Archive";
type FinderItem = {
  name: string;
  detail: string;
  icon: React.ElementType;
  location?: FinderLocation;
  app?: WindowId;
  href?: string;
  image?: string;
};

const classicMacUrl = "https://infinitemac.org/embed?disk=Mac+OS+9.0&infinite_hd=true&machine=Power+Macintosh+9500&auto_pause=true";

const windowDefaults: Record<WindowId, { x: number; y: number; width: number; height: number; title: string }> = {
  finder: { x: 44, y: 66, width: 780, height: 548, title: "Macintosh HD" },
  music: { x: 690, y: 250, width: 500, height: 370, title: "Music" },
  video: { x: 94, y: 476, width: 580, height: 350, title: "Video Work" },
  classic: { x: 104, y: 62, width: 850, height: 682, title: "Classic Mac" },
};

const locationItems: Record<FinderLocation, FinderItem[]> = {
  "Macintosh HD": [
    { name: "Creative", detail: "Projects, school, and experiments", icon: Palette, location: "Creative" },
    { name: "Projects", detail: "Selected portfolio work", icon: Briefcase, location: "Projects" },
    { name: "RISD", detail: "School projects and studies", icon: Books, location: "RISD" },
    { name: "Media", detail: "Sound, video, and images", icon: Images, location: "Media" },
    { name: "Archive", detail: "Dated backups and older work", icon: Archive, location: "Archive" },
    { name: "Classic Mac", detail: "Mac OS 9 with Infinite HD", icon: GameController, app: "classic" },
  ],
  Creative: [
    { name: "Projects", detail: "Portfolio and product work", icon: Briefcase, location: "Projects" },
    { name: "RISD", detail: "School projects", icon: Books, location: "RISD" },
    { name: "Beats", detail: "Audio sketches", icon: Headphones, app: "music" },
    { name: "Video Work", detail: "Motion and edits", icon: FilmSlate, app: "video" },
    { name: "Code Experiments", detail: "Interfaces and prototypes", icon: Code },
    { name: "Material Studies", detail: "Processes and tests", icon: Palette },
  ],
  Projects: [
    { name: "Molekule Go", detail: "Product Design · 2025", icon: Folder, href: "/projects/molekule-go", image: "/work/molekule-go.webp" },
    { name: "Luma", detail: "Product Design · 2024", icon: Folder, href: "/projects/luma", image: "/work/luma.webp" },
    { name: "Niche", detail: "Product Design · 2024", icon: Folder, href: "/projects/niche", image: "/work/niche.jpg" },
    { name: "Hyphae Light", detail: "Material Research · 2023", icon: Folder, href: "/projects/hyphae", image: "/work/hyphae-light.webp" },
    { name: "Ping", detail: "Industrial Design · 2025", icon: Folder, href: "/projects/ping", image: "/work/ping.jpg" },
    { name: "Portfolio Website", detail: "Current build", icon: MonitorPlay, href: "/" },
  ],
  RISD: [
    { name: "Off Campus", detail: "Digital Product · 2023", icon: Folder, href: "/play/off-campus", image: "/play/off-campus.webp" },
    { name: "Desk Pen", detail: "Object Study · 2025", icon: Folder, href: "/play/desk-pen", image: "/play/desk-pen.png" },
    { name: "Mycelium Panels", detail: "Material Research · 2022", icon: Folder, href: "/play/mycelium-panels", image: "/play/mycelium-panels.webp" },
    { name: "Sketchbooks", detail: "Process archive", icon: NotePencil },
  ],
  Media: [
    { name: "Beats", detail: "Audio sketches", icon: MusicNote, app: "music" },
    { name: "Video Work", detail: "Motion and edits", icon: FilmSlate, app: "video" },
    { name: "Image Library", detail: "Selected visual studies", icon: Images },
  ],
  Archive: [
    { name: "260719 Portfolio", detail: "Current site checkpoint", icon: FloppyDisk },
    { name: "250404 Studies", detail: "Older experiments", icon: FloppyDisk },
    { name: "Portfolio Archive", detail: "Previous portfolio versions", icon: Archive },
    { name: "Legacy Web", detail: "Earlier digital work", icon: Code },
  ],
};

const desktopAsset = (path: string) => path.startsWith("/") ? `..${path}` : path;

function useCompactDesktop() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const sync = () => setCompact(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return compact;
}

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function WindowControls({
  title,
  maximized,
  close,
  minimize,
  maximize,
}: {
  title: string;
  maximized: boolean;
  close: () => void;
  minimize: () => void;
  maximize: () => void;
}) {
  return (
    <div className={`${styles.windowToolbar} alex-os-window-handle`}>
      <div className={styles.trafficLights}>
        <button className={styles.closeLight} type="button" onClick={close} aria-label={`Close ${title}`}><X size={9} weight="bold" /></button>
        <button className={styles.minimizeLight} type="button" onClick={minimize} aria-label={`Minimize ${title}`} />
        <button className={styles.maximizeLight} type="button" onClick={maximize} aria-label={`${maximized ? "Restore" : "Maximize"} ${title}`} />
      </div>
      <strong>{title}</strong>
      <span aria-hidden="true" />
    </div>
  );
}

function MacWindow({
  id,
  title,
  zIndex,
  compact,
  isActive,
  focus,
  close,
  minimize,
  children,
}: {
  id: WindowId;
  title: string;
  zIndex: number;
  compact: boolean;
  isActive: boolean;
  focus: () => void;
  close: () => void;
  minimize: () => void;
  children: React.ReactNode;
}) {
  const [maximized, setMaximized] = useState(false);
  const [viewport, setViewport] = useState({ width: 1280, height: 720 });

  useEffect(() => {
    const sync = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const frame = (
    <section
      className={`${styles.window} ${maximized ? styles.maximizedWindow : ""}`}
      data-window={id}
      aria-label={`${title} window`}
      onPointerDown={focus}
      style={{ zIndex }}
    >
      <WindowControls title={title} maximized={maximized} close={close} minimize={minimize} maximize={() => setMaximized((value) => !value)} />
      <div className={styles.windowBody}>{children}</div>
    </section>
  );

  if (compact) return isActive ? <div className={styles.compactWindow}>{frame}</div> : null;

  const initial = windowDefaults[id];
  return (
    <Rnd
      default={{ x: initial.x, y: initial.y, width: initial.width, height: initial.height }}
      minWidth={360}
      minHeight={260}
      bounds="parent"
      dragHandleClassName="alex-os-window-handle"
      disableDragging={maximized}
      enableResizing={!maximized}
      size={maximized ? { width: Math.max(360, viewport.width - 24), height: Math.max(260, viewport.height - 114) } : undefined}
      position={maximized ? { x: 12, y: 44 } : undefined}
      onDragStart={focus}
      onResizeStart={focus}
      style={{ zIndex }}
    >
      {frame}
    </Rnd>
  );
}

function FinderApp({ openApp, compact }: { openApp: (id: WindowId) => void; compact: boolean }) {
  const [history, setHistory] = useState<FinderLocation[]>(["Macintosh HD"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selected, setSelected] = useState<string>();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const location = history[historyIndex];
  const items = locationItems[location].filter((item) => `${item.name} ${item.detail}`.toLowerCase().includes(query.toLowerCase()));

  function navigate(next: FinderLocation) {
    if (next === location) return;
    const nextHistory = [...history.slice(0, historyIndex + 1), next];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setSelected(undefined);
    setQuery("");
  }

  function openItem(item: FinderItem) {
    if (item.location) navigate(item.location);
    else if (item.app) openApp(item.app);
  }

  return (
    <div className={styles.finder}>
      <aside className={styles.finderSidebar}>
        <span>Favorites</span>
        <button className={location === "Macintosh HD" ? styles.sidebarActive : undefined} type="button" onClick={() => navigate("Macintosh HD")}><House size={16} /> Alex</button>
        <button className={location === "Creative" ? styles.sidebarActive : undefined} type="button" onClick={() => navigate("Creative")}><Palette size={16} /> Creative</button>
        <button className={location === "Projects" ? styles.sidebarActive : undefined} type="button" onClick={() => navigate("Projects")}><Briefcase size={16} /> Projects</button>
        <button className={location === "RISD" ? styles.sidebarActive : undefined} type="button" onClick={() => navigate("RISD")}><Books size={16} /> RISD</button>
        <span>Locations</span>
        <button className={location === "Media" ? styles.sidebarActive : undefined} type="button" onClick={() => navigate("Media")}><Images size={16} /> Media</button>
        <button className={location === "Archive" ? styles.sidebarActive : undefined} type="button" onClick={() => navigate("Archive")}><Archive size={16} /> Archive</button>
        <button type="button" onClick={() => openApp("classic")}><GameController size={16} /> Classic Mac</button>
      </aside>

      <div className={styles.finderMain}>
        <div className={styles.finderControls}>
          <div>
            <button type="button" aria-label="Back" disabled={historyIndex === 0} onClick={() => setHistoryIndex((index) => Math.max(0, index - 1))}><ArrowLeft size={16} /></button>
            <button type="button" aria-label="Forward" disabled={historyIndex === history.length - 1} onClick={() => setHistoryIndex((index) => Math.min(history.length - 1, index + 1))}><ArrowRight size={16} /></button>
            <button className={view === "grid" ? styles.controlActive : undefined} type="button" aria-label="Grid view" onClick={() => setView("grid")}><GridFour size={16} /></button>
            <button className={view === "list" ? styles.controlActive : undefined} type="button" aria-label="List view" onClick={() => setView("list")}><List size={16} /></button>
          </div>
          <label><MagnifyingGlass size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search files" placeholder="Search" /></label>
        </div>

        <div className={styles.finderTitle}>
          <div><HardDrive size={17} /><strong>{location}</strong></div>
          <span>{items.length} {items.length === 1 ? "item" : "items"}</span>
        </div>

        <div className={`${styles.fileGrid} ${view === "list" ? styles.fileList : ""}`}>
          {items.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                {item.image ? <img className={styles.filePreview} src={desktopAsset(item.image)} alt="" /> : <Icon className={styles.fileIcon} size={view === "grid" ? 56 : 24} weight="regular" />}
                <span><strong>{item.name}</strong><small>{item.detail}</small></span>
                {view === "list" ? <CaretRight size={14} aria-hidden="true" /> : null}
              </>
            );

            if (item.href) {
              return <a className={`${styles.fileItem} ${selected === item.name ? styles.fileSelected : ""}`} href={desktopAsset(item.href)} key={item.name}>{content}</a>;
            }

            return (
              <button
                className={`${styles.fileItem} ${selected === item.name ? styles.fileSelected : ""}`}
                type="button"
                onClick={() => { setSelected(item.name); if (compact) openItem(item); }}
                onDoubleClick={() => openItem(item)}
                onKeyDown={(event) => { if (event.key === "Enter") openItem(item); }}
                key={item.name}
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MusicApp() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) await audio.play();
    else audio.pause();
  }

  return (
    <div className={styles.musicApp}>
      <audio
        ref={audioRef}
        src="../alex-os/audio/sketch-01.m4a"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onEnded={() => setPlaying(false)}
      />
      <div className={styles.albumArt}><Waveform size={64} weight="thin" /></div>
      <div className={styles.trackInfo}><span>Sketch 01</span><strong>Alex Infield</strong></div>
      <input className={styles.scrubber} type="range" min="0" max={duration || 1} value={time} step="0.1" aria-label="Track position" onChange={(event) => { if (audioRef.current) audioRef.current.currentTime = Number(event.target.value); }} />
      <div className={styles.timeRow}><span>{formatTime(time)}</span><span>-{formatTime(Math.max(0, duration - time))}</span></div>
      <div className={styles.playbackControls}>
        <button type="button" aria-label="Previous track"><SkipBack size={22} weight="fill" /></button>
        <button className={styles.playButton} type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}</button>
        <button type="button" aria-label="Next track"><SkipForward size={22} weight="fill" /></button>
      </div>
      <div className={styles.volumeRow}><SpeakerHigh size={16} /><input type="range" min="0" max="1" step="0.05" defaultValue="0.8" aria-label="Volume" onChange={(event) => { if (audioRef.current) audioRef.current.volume = Number(event.target.value); }} /></div>
    </div>
  );
}

function VideoApp() {
  return (
    <div className={styles.videoApp}>
      <video controls playsInline poster="../assets/niche/media/689b24381af8783a00ef221d_11-p-2600.webp">
        <source src="../assets/niche/media/15-transcode.mp4" type="video/mp4" />
      </video>
      <p><span>Video Work</span><strong>Niche motion study</strong></p>
    </div>
  );
}

function ClassicMacApp() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className={styles.classicWelcome}>
        <GameController size={54} weight="thin" />
        <div>
          <span>Authentic browser emulation</span>
          <h2>Start Mac OS 9</h2>
          <p>A real Power Macintosh 9500 environment with Infinite HD’s library of period software, utilities, and games.</p>
        </div>
        <button type="button" onClick={() => setStarted(true)}>Start computer <Play size={16} weight="fill" /></button>
        <small>Loads from Infinite Mac. Personal files are not shared with the emulator.</small>
      </div>
    );
  }

  return (
    <div className={styles.classicMac}>
      <div className={styles.classicStatus}>
        <span>Mac OS 9.0 · Power Macintosh 9500 · Infinite HD</span>
        <a href={classicMacUrl} target="_blank" rel="noreferrer">Open full screen <ArrowSquareOut size={14} /></a>
      </div>
      <iframe
        src={classicMacUrl}
        title="Mac OS 9 emulator"
        allow="cross-origin-isolated"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export default function AlexOS() {
  const compact = useCompactDesktop();
  const [openWindows, setOpenWindows] = useState<WindowId[]>(["finder"]);
  const [minimized, setMinimized] = useState<WindowId[]>([]);
  const [active, setActive] = useState<WindowId>("finder");
  const [zOrder, setZOrder] = useState<Record<WindowId, number>>({ finder: 4, music: 2, video: 1, classic: 3 });
  const [clock, setClock] = useState("");

  useEffect(() => {
    const update = () => setClock(new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date()));
    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const highestZ = useMemo(() => Math.max(...Object.values(zOrder)), [zOrder]);

  function focus(id: WindowId) {
    setActive(id);
    setMinimized((items) => items.filter((item) => item !== id));
    setZOrder((order) => ({ ...order, [id]: Math.max(...Object.values(order)) + 1 }));
  }

  function openApp(id: WindowId) {
    setOpenWindows((items) => items.includes(id) ? items : [...items, id]);
    focus(id);
  }

  function closeApp(id: WindowId) {
    setOpenWindows((items) => items.filter((item) => item !== id));
    setMinimized((items) => items.filter((item) => item !== id));
    if (active === id) setActive("finder");
  }

  function minimizeApp(id: WindowId) {
    setMinimized((items) => [...new Set([...items, id])]);
    const next = openWindows.find((item) => item !== id && !minimized.includes(item));
    if (next) setActive(next);
  }

  const windows: { id: WindowId; content: React.ReactNode }[] = [
    { id: "finder", content: <FinderApp openApp={openApp} compact={compact} /> },
    { id: "music", content: <MusicApp /> },
    { id: "video", content: <VideoApp /> },
    { id: "classic", content: <ClassicMacApp /> },
  ];

  return (
    <main className={`${styles.os} alex-os-desktop`}>
      <header className={styles.menuBar}>
        <div><AppleLogo size={15} weight="fill" /><strong>{windowDefaults[active].title}</strong><span>File</span><span>Edit</span><span>View</span><span>Go</span><span>Window</span><span>Help</span></div>
        <div><a href="../">Portfolio</a><MagnifyingGlass size={15} /><SpeakerHigh size={15} /><time suppressHydrationWarning>{clock}</time></div>
      </header>

      <div className={styles.desktopIcons} aria-label="Desktop shortcuts">
        <button type="button" onDoubleClick={() => openApp("finder")} onClick={() => compact && openApp("finder")}><HardDrive size={45} weight="fill" /><span>Macintosh HD</span></button>
        <button type="button" onDoubleClick={() => openApp("classic")} onClick={() => compact && openApp("classic")}><GameController size={45} weight="fill" /><span>Classic Mac</span></button>
        <a href="../play/"><FolderOpen size={45} weight="fill" /><span>RISD Projects</span></a>
        <a href="../"><Desktop size={45} weight="fill" /><span>Portfolio</span></a>
      </div>

      {windows.map(({ id, content }) => openWindows.includes(id) && !minimized.includes(id) ? (
        <MacWindow
          id={id}
          title={windowDefaults[id].title}
          zIndex={zOrder[id]}
          compact={compact}
          isActive={active === id || zOrder[id] === highestZ}
          focus={() => focus(id)}
          close={() => closeApp(id)}
          minimize={() => minimizeApp(id)}
          key={id}
        >
          {content}
        </MacWindow>
      ) : null)}

      <nav className={styles.dock} aria-label="Alex OS applications">
        <button type="button" onClick={() => openApp("finder")} aria-label="Open Finder"><FolderOpen size={30} weight="fill" /><span className={openWindows.includes("finder") && !minimized.includes("finder") ? styles.running : undefined} /></button>
        <button type="button" onClick={() => openApp("music")} aria-label="Open Music"><MusicNote size={29} weight="fill" /><span className={openWindows.includes("music") && !minimized.includes("music") ? styles.running : undefined} /></button>
        <button type="button" onClick={() => openApp("video")} aria-label="Open Video"><Play size={29} weight="fill" /><span className={openWindows.includes("video") && !minimized.includes("video") ? styles.running : undefined} /></button>
        <button type="button" onClick={() => openApp("classic")} aria-label="Open Classic Mac"><GameController size={30} weight="fill" /><span className={openWindows.includes("classic") && !minimized.includes("classic") ? styles.running : undefined} /></button>
        <a href="../play/" aria-label="Open Play projects"><Images size={29} weight="regular" /></a>
        <a href="../" aria-label="Back to portfolio"><ArrowSquareOut size={29} weight="regular" /></a>
        <span className={styles.dockDivider} aria-hidden="true" />
        <button type="button" aria-label="Trash"><Trash size={29} weight="regular" /></button>
      </nav>

      <a className={styles.wallpaperCredit} href="https://science.nasa.gov/image-detail/m90_0/" target="_blank" rel="noreferrer">M90 · NASA / ESA / STScI</a>
    </main>
  );
}
