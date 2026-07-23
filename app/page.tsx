import { archiveProjects } from "@/lib/archive";
import AdaptiveArchive from "./adaptive-archive";

export default function Home() {
  return <AdaptiveArchive projects={archiveProjects} />;
}
