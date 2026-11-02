import type { CSSProperties, ReactNode } from "react";
import { Button, Card } from "./compass";

// A real anchor owns both picture and caption. No positioned overlay can move
// the hit area away from the image between pointer down and pointer up.
// frame: placeholder props from lqipFrameProps, computed by a server page (never import lib/lqip
// here: this card is also rendered by Personal's client island).
export default function ProjectCard({href,title,children,collection="work",frame}: {href:string;title:string;children:ReactNode;collection?:"work"|"personal";frame?:{style?:CSSProperties;"data-lqip-frame"?:string}}) {
  return <div className="portfolio-work-link">
    <Button asChild variant="link" className="portfolio-card-link">
      <a href={`${href}?from=${collection}`} data-case-origin={collection} aria-label={title}>
        <Card className="portfolio-work-card" {...frame}>{children}</Card>
        <h2 className="portfolio-card-label text-sm">{title}</h2>
      </a>
    </Button>
  </div>;
}
