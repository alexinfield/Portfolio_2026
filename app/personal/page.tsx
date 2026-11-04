import { socialMetadata } from "@/lib/social-metadata";
import { projectDefinitions } from "@/lib/portfolio";
import { projectShareImage } from "@/lib/social-metadata";
import SiteShell from "../site-shell";
import PersonalCollection from "./personal-collection";
import "./carousel.css";
const share=projectShareImage(projectDefinitions.find(item=>item.slug==="mode")!);
import { personalProjects } from "@/lib/personal";
export const metadata = socialMetadata("Personal", "Personal", "/personal", share);
export default function PersonalPage() {
  return <SiteShell current="personal"><h1 className="sr-only">Personal</h1><PersonalCollection projects={personalProjects} /></SiteShell>;
}
