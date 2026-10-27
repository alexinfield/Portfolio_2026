import { withBasePath } from "@/lib/base-path";
import SiteShell from "./site-shell";
import { Button } from "./compass";
export default function NotFound() {
  return <SiteShell><div className="portfolio-not-found">
    <h1>Page not found</h1><p className="text-muted">404</p>
    <div className="portfolio-actions">
      <Button asChild variant="secondary"><a href={withBasePath("/")}>Work</a></Button>
      <Button asChild variant="secondary" data-plain=""><a href="mailto:alex@infield.net">Contact</a></Button>
    </div>
  </div></SiteShell>;
}
