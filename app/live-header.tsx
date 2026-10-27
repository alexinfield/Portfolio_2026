/* eslint-disable @next/next/no-html-link-for-pages -- static Pages export requires native navigation */

type LiveHeaderProps = {
  current?: "work" | "info";
  light?: boolean;
};

const lightVariant = "w-variant-22095cef-840e-b01c-9554-e30a92fa6748";

export default function LiveHeader({ current, light = false }: LiveHeaderProps) {
  const variant = light ? ` ${lightVariant}` : "";

  return (
    <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className={`header${variant}`}>
      <div className="div-block-35">
        <h1 className={`heading${variant}`}>
          <a
            href="/"
            aria-current={current === "work" ? "page" : undefined}
            className={`link primary-link${variant}${current === "work" ? " w--current" : ""}`}
          >
            Alex Infield
          </a>
        </h1>
      </div>
      <nav className="div-block-36" aria-label="Primary">
        <ul className={`list-2 w-list-unstyled${variant}`} aria-hidden="true" />
        <ul className={`list-2 w-list-unstyled${variant}`}>
          <li>
            <a
              href="/"
              data-nav-link="work"
              aria-current={current === "work" ? "page" : undefined}
              className={`five link${variant}${current === "work" ? " w--current" : ""}`}
            >
              Work
            </a>
          </li>
          <li>
            <a
              href="/info"
              data-nav-link="info"
              aria-current={current === "info" ? "page" : undefined}
              className={`five link${variant}${current === "info" ? " w--current" : ""}`}
            >
              Info
            </a>
          </li>
          <li>
            <a href="mailto:alex@infield.net" data-nav-link="contact" className={`five link${variant}`}>
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </header>
    </>
  );
}
