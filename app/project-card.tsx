import type { ReactNode } from "react";
import { Button, Card } from "./compass";

// A real anchor owns both picture and caption. No positioned overlay can move
// the hit area away from the image between pointer down and pointer up.
export default function ProjectCard({href,title,children}: {href:string;title:string;children:ReactNode}) {
  return <div className="portfolio-work-link">
    <Button asChild variant="link" className="portfolio-card-link">
      <a href={href} aria-label={title}>
        <Card className="portfolio-work-card">{children}</Card>
        <h2 className="portfolio-card-label text-sm">{title}</h2>
      </a>
    </Button>
  </div>;
}
