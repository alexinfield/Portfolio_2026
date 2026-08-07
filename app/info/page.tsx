import type { Metadata } from "next";
import LiveHeader from "../live-header";

export const metadata: Metadata = { title: "Info" };

export default function InfoPage() {
  return (
    <main className="info">
      <LiveHeader current="info" />
      <div className="w-layout-grid grid-2" id="main-content">
        <p className="p2 info-spacer" aria-hidden="true">
          {"\u200d"}
          <br />
        </p>
        <img src="/assets/info/media/67aca18a869f9276f4c0ef01_IMG_0019.png" alt="" />
      </div>
    </main>
  );
}
