import type { Metadata } from "next";
import AlexOS from "./AlexOS";

export const metadata: Metadata = {
  title: "Alex OS — Alex Infield",
  description: "An interactive desktop archive of Alex Infield's music, video, experiments, and in-progress work.",
};

export default function AlexOSPage() {
  return <AlexOS />;
}
