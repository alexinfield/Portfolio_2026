import type { Metadata } from "next";
import LiveHeader from "../live-header";
import ResponsiveImage from "../responsive-image";

export const metadata: Metadata = {
  title: "Info",
  description: "About Alex Infield.",
};

export default function InfoPage() {
  return (
    <main className="info">
      <LiveHeader current="info" />
      <div className="w-layout-grid grid-2" id="main-content">
        <p className="p2 info-spacer" aria-hidden="true">
          {"\u200d"}
          <br />
        </p>
        <ResponsiveImage
          src="/assets/info/media/67aca18a869f9276f4c0ef01_IMG_0019.png"
          alt=""
          width={2000}
          height={2000}
          sizes="(max-width: 767px) 100vw, 50vw"
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </main>
  );
}
