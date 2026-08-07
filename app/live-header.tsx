import Link from "next/link";

type LiveHeaderProps = {
  current?: "work" | "info";
  light?: boolean;
};

const lightVariant = "w-variant-22095cef-840e-b01c-9554-e30a92fa6748";

export default function LiveHeader({ current, light = false }: LiveHeaderProps) {
  const variant = light ? ` ${lightVariant}` : "";

  return (
    <header className={`header${variant}`}>
      <div className="div-block-35">
        <h1 className={`heading${variant}`}>
          <Link
            href="/"
            aria-current={current === "work" ? "page" : undefined}
            className={`link primary-link${variant}${current === "work" ? " w--current" : ""}`}
          >
            Alex Infield
          </Link>
        </h1>
      </div>
      <div className="div-block-36">
        <ul className={`list-2 w-list-unstyled${variant}`} aria-hidden="true" />
        <ul className={`list-2 w-list-unstyled${variant}`}>
          <li>
            <Link
              href="/"
              aria-current={current === "work" ? "page" : undefined}
              className={`five link${variant}${current === "work" ? " w--current" : ""}`}
            >
              Work
            </Link>
          </li>
          <li>
            <Link
              href="/info"
              aria-current={current === "info" ? "page" : undefined}
              className={`five link${variant}${current === "info" ? " w--current" : ""}`}
            >
              Info
            </Link>
          </li>
          <li>
            <a href="mailto:alex@infield.net" className={`five link${variant}`}>
              Contact
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
