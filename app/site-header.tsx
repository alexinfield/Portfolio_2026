import Link from "next/link";

type SiteHeaderProps =
  | { variant?: "home"; title?: never; closeHref?: never }
  | { variant: "page"; title: string; closeHref: string };

export default function SiteHeader(props: SiteHeaderProps) {
  const isPage = props.variant === "page";

  return (
    <header className={`site-header${isPage ? " site-header-page" : ""}`}>
      <div className="site-header-inner">
        <Link className="site-name" href="/" aria-label="Alex Infield home">
          Alex Infield
        </Link>

        {isPage ? (
          <p className="site-header-title">{props.title}</p>
        ) : (
          <nav className="site-header-nav site-header-nav-primary" aria-label="Portfolio">
            <Link href="/all">Work</Link><span>,</span><Link href="/">Etc.</Link>
          </nav>
        )}

        {isPage ? (
          <Link className="close-control" href={props.closeHref} aria-label={`Close ${props.title}`}>
            <img src="/icons/x.svg" alt="" aria-hidden="true" />
          </Link>
        ) : (
          <nav className="site-header-nav site-header-nav-secondary" aria-label="About and contact">
            <Link href="/info">Info</Link><span>,</span><a href="mailto:alex@infield.net">Contact</a>
          </nav>
        )}
      </div>
    </header>
  );
}
