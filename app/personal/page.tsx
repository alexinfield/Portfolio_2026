import { socialMetadata } from "@/lib/social-metadata";
import { personalProjects } from "@/lib/personal";
import SiteShell from "../site-shell";
import PersonalCollection from "./personal-collection";
export const metadata = socialMetadata("Personal", "Personal work by Alex Infield.", "/personal");
export default function PersonalPage() {
  return <SiteShell current="personal"><h1 className="sr-only">Personal</h1><PersonalCollection projects={personalProjects} /></SiteShell>;
}
