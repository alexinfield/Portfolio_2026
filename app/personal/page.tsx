import { socialMetadata, projectShareImage } from "@/lib/social-metadata";
import { projectDefinitions } from "@/lib/portfolio";
import SiteShell from "../site-shell";
import PersonalCollection from "./personal-collection";
import "./carousel.css";
import { personalProjects } from "@/lib/personal";
const share=projectShareImage(projectDefinitions.find(item=>item.slug==="mode")!);
export const metadata = socialMetadata("Personal", "Personal", "/personal", share);
export default function PersonalPage() {
  return <SiteShell current="personal"><h1 className="sr-only">Personal</h1><PersonalCollection projects={personalProjects} /></SiteShell>;
}
