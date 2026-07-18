import Link from "next/link";

type SiteHeaderProps =
  | { variant: "home" }
  | { variant: "index"; title?: string }
  | { variant: "detail"; title: string; closeHref?: string };

export default function SiteHeader(props: SiteHeaderProps) {
  const isHome = props.variant === "home";
  const isIndex = props.variant === "index";
  const label = isIndex ? "Alex Infield" : "All projects";
  const labelHref = isIndex ? "/" : "/all";
  const closeHref = isHome ? "/info" : props.variant === "detail" ? props.closeHref ?? "/all" : "/";
  const closeLabel = isHome
    ? "About Alex Infield"
    : isIndex
      ? "Close all projects"
      : `Close ${props.title}`;

  return (
    <header className={`site-header site-header-${props.variant}`}>
      <Link className="nav-pill" href={labelHref}>
        {label}
      </Link>

      {props.variant === "detail" ? (
        <p className="site-header-title">{props.title}</p>
      ) : null}

      <Link className="close-control" href={closeHref} aria-label={closeLabel}>
        <img src="/icons/x.svg" alt="" aria-hidden="true" />
      </Link>
    </header>
  );
}
