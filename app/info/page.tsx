import type { Metadata } from "next";
import { socialMetadata } from "@/lib/social-metadata";
import SiteShell from "../site-shell";
import ResponsiveImage from "../responsive-image";
import AppearanceControl from "../appearance-control";
import { Button } from "../compass";

export const metadata: Metadata = socialMetadata("Info", "About Alex Infield.", "/info", {
  url: "/assets/info/media/67aca18a869f9276f4c0ef01_IMG_0019-w960.webp",
  width: 960, height: 960, alt: "White paper folded into a repeating grid of triangular shapes.",
});

export default function InfoPage() {
  return <SiteShell current="info">
    <h1 className="sr-only">Info</h1>
    <div className="portfolio-info-page">
      <div className="portfolio-info-copy">
        <p className="portfolio-intro">I&apos;m Alex Infield, an industrial designer based in Brooklyn, New York. My work spans product visualization, CAD, prototyping and fabrication for consumer goods, furniture and lighting.</p>
        <Button asChild variant="link"><a href="mailto:alex@infield.net">alex@infield.net</a></Button>
        <AppearanceControl />
      </div>
      <CardArtwork />
    </div>
  </SiteShell>;
}
function CardArtwork() {
  return <div className="portfolio-artwork"><ResponsiveImage src="/assets/info/media/67aca18a869f9276f4c0ef01_IMG_0019.png"
    alt="White paper folded into a repeating grid of triangular shapes." width={2000} height={2000}
    sizes="(max-width: 767px) 100vw, 50vw" fetchPriority="high" decoding="sync" /></div>;
}
