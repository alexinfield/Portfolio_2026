"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CirclesThree,
  Desktop,
  FileText,
  FilmSlate,
  Folder,
  FolderOpen,
  GridFour,
  House,
  ImageSquare,
  MagnifyingGlass,
  MusicNote,
  Pause,
  Play,
  SidebarSimple,
  SkipBack,
  SkipForward,
  SpeakerHigh,
  SquaresFour,
  Waveform,
  X,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import styles from "./alex-os.module.css";

type WindowId = "finder" | "music" | "video";
type FinderLocation = "Alex Infield" | "RISD Projects";

const windowDefaults: Record<WindowId, { x: number; y: number; width: number; height: number; title: string }> = {
  finder: { x: 42, y: 58, width: 800, height: 520, title: "Alex Infield" },
  music: { x: 760, y: 248, width: 500, height: 360, title: "Music" },
  video: { x: 84, y: 520, width: 560, height: 330, title: "Video" },
};

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

function FinderApp({
  openApp,
  compact,
}: {
  openApp: (id: WindowId) => void;
  compact: boolean;
}) {
  const [location, setLocation] = useState<FinderLocation>("Alex Infield");
  const [selected, setSelected] = useState<string>();

  const folders = [
    { name: "Beats", icon: Waveform, action: () => openApp("music") },
    { name: "Video Work", icon: FilmSlate, action: () => openApp("video") },
    { name: "RISD Projects", icon: SquaresFour, action: () => setLocation("RISD Projects") },
    { name: "Experiments", icon: CirclesThree },
    { name: "Work in Progress", icon: FileText },
    { name: "Portfolio Archive", icon: FolderOpen },
  ];

  const projectFiles = [
    { name: "Off Campus", href: "/play/off-campus", image: "/play/off-campus.webp" },
    { name: "Inflating Chair", href: "/play/inflating-chair", image: "/play/inflating-chair.webp" },
    { name: "Mycelium Panels", href: "/play/mycelium-panels", image: "/play/mycelium-panels.webp" },
  ];

  return (
    <div className={styles.finder}>
      <aside className={styles.finderSidebar}>
        <span>Locations</span>
        <button className={location === "Alex Infield" ? styles.sidebarActive : undefined} type="button" onClick={() => setLocation("Alex Infield")}><House size={16} /> Alex Infield</button>
        <button className={location === "RISD Projects" ? styles.sidebarActive : undefined} type="button" onClick={() => setLocation("RISD Projects")}><Folder size={16} /> RISD Projects</button>
        <button type="button"><Folder size={16} /> Archive</button>
        <span>Favorites</span>
        <button type="button"><Desktop size={16} /> Desktop</button>
        <button type="button"><FileText size={16} /> Documents</button>
      </aside>

      <div className={styles.finderMain}>
        <div className={styles.finderControls}>
          <div>
            <button type="button" aria-label="Back" onClick={() => setLocation("Alex Infield")}><ArrowLeft size={16} /></button>
            <button type="button" aria-label="Forward"><ArrowRight size={16} /></button>
            <button type="button" aria-label="Grid view"><GridFour size={16} /></button>
            <button type="button" aria-label="List view"><SidebarSimple size={16} /></button>
          </div>
          <label><MagnifyingGlass size={16} /><input aria-label="Search files" placeholder="Search" /></label>
        </div>

        <div className={styles.finderTitle}><strong>{location}</strong><span>{location === "Alex Infield" ? "6 items" : "3 items"}</span></div>

        {location === "Alex Infield" ? (
          <div className={styles.fileGrid}>
            {folders.map(({ name, icon: Icon, action }) => (
              <button
                className={selected === name ? styles.fileSelected : undefined}
                type="button"
                onClick={() => { setSelected(name); if (compact && action) action(); }}
                onDoubleClick={action}
                onKeyDown={(event) => { if (event.key === "Enter" && action) action(); }}
                key={name}
              >
                <span className={styles.folderIcon}><Icon size={34} weight="regular" /></span>
                <strong>{name}</strong>
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.fileGrid}>
            {projectFiles.map((project) => (
              <a className={styles.projectFile} href={`../${project.href.replace(/^\//, "")}/`} key={project.name}>
                <img src={project.image} alt="" />
                <strong>{project.name}</strong>
              </a>
            ))}
          </div>
        )}
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
        src="/alex-os/audio/sketch-01.m4a"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onEnded={() => setPlaying(false)}
      />
      <div className={styles.albumArt}><Waveform size={64} weight="thin" /></div>
      <div className={styles.trackInfo}><span>Sketch 01</span><strong>Alex Infield</strong></div>
      <input
        className={styles.scrubber}
        type="range"
        min="0"
        max={duration || 1}
        value={time}
        step="0.1"
        aria-label="Track position"
        onChange={(event) => { if (audioRef.current) audioRef.current.currentTime = Number(event.target.value); }}
      />
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
      <video controls playsInline poster="/assets/niche/media/689b24381af8783a00ef221d_11-p-2600.webp">
        <source src="/assets/niche/media/15-transcode.mp4" type="video/mp4" />
      </video>
      <p><span>Video Work</span><strong>Niche motion study</strong></p>
    </div>
  );
}

export default function AlexOS() {
  const compact = useCompactDesktop();
  const [openWindows, setOpenWindows] = useState<WindowId[]>(["finder"]);
  const [minimized, setMinimized] = useState<WindowId[]>([]);
  const [active, setActive] = useState<WindowId>("finder");
  const [zOrder, setZOrder] = useState<Record<WindowId, number>>({ finder: 3, music: 2, video: 1 });
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
  ];

  return (
    <main className={`${styles.os} alex-os-desktop`}>
      <header className={styles.menuBar}>
        <div><strong>Alex OS</strong><span>File</span><span>Edit</span><span>View</span><span>Go</span><span>Window</span><span>Help</span></div>
        <div><a href="../">Back to Portfolio</a><MagnifyingGlass size={15} /><SpeakerHigh size={15} /><time suppressHydrationWarning>{clock}</time></div>
      </header>

      <div className={styles.desktopLabel}>
        <span>Alex Infield’s Computer</span>
        <strong>Files, sound, video, and experiments.</strong>
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
        <button type="button" onClick={() => openApp("finder")} aria-label="Open Finder"><FolderOpen size={30} weight="regular" /><span className={openWindows.includes("finder") ? styles.running : undefined} /></button>
        <button type="button" onClick={() => openApp("music")} aria-label="Open Music"><MusicNote size={29} weight="fill" /><span className={openWindows.includes("music") ? styles.running : undefined} /></button>
        <button type="button" onClick={() => openApp("video")} aria-label="Open Video"><Play size={29} weight="fill" /><span className={openWindows.includes("video") ? styles.running : undefined} /></button>
        <a href="../play/" aria-label="Open Play projects"><ImageSquare size={29} weight="regular" /></a>
        <a href="../" aria-label="Back to portfolio"><ArrowUpRight size={29} weight="regular" /></a>
      </nav>
    </main>
  );
}
