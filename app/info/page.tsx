import artwork from "@/lib/info-artwork.json";
import type { Metadata } from "next";
import { socialMetadata } from "@/lib/social-metadata";
import SiteShell from "../site-shell";
import ResponsiveImage from "../responsive-image";
import { Button } from "../compass";

export const metadata: Metadata = socialMetadata("Info", "Info", "/info", {
  url: "/assets/info/media/67aca18a869f9276f4c0ef01_IMG_0019-w960.webp",
  width: 960, height: 960, alt: "White paper folded into a repeating grid of triangular shapes.",
});

export default function InfoPage() {
  return <SiteShell current="info">
    <h1 className="sr-only">Info</h1>
    <div className="portfolio-info-page">
      <div className="portfolio-info-copy">
        <p className="portfolio-intro">I&apos;m Alex Infield, an industrial designer based in Brooklyn, New York. My work spans product visualization, CAD, prototyping and fabrication for consumer goods, furniture and lighting.</p>
        <Button asChild variant="secondary"><a href="mailto:alex@infield.net">Contact</a></Button>
      </div>
      <CardArtwork />
      <p className="portfolio-privacy-notice">This site uses Google Analytics and Microsoft Clarity, including session recording, to understand visits and improve the site. <a href="https://policies.google.com/privacy">Google privacy policy</a> · <a href="https://privacy.microsoft.com/privacystatement">Microsoft privacy policy</a>.</p>
    </div>
  </SiteShell>;
}
function CardArtwork() {
  return <div className="portfolio-artwork"><ResponsiveImage src={artwork.src}
    alt="White paper folded into a repeating grid of triangular shapes." width={artwork.width} height={artwork.height}
    sizes="(max-width: 767px) 100vw, 50vw" fetchPriority="high" decoding="sync" /></div>;
}
