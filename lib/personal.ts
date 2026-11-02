import collection from "./personal.json";
import type { PersonalMedia, PersonalProject } from "./personal-media";
import { lqipFor } from "./lqip";
export * from "./personal-media";
// Owner display names; package ids, media and URLs stay stable.
export const personalTitleOverrides: Record<string,string> = {stool: "Kerf Stool", "wall-mounts": "CNC Portrait Relief", "p041-telefoni": "Video 2018"};
// Entries marked hidden keep their package record and media but are never rendered or exported.
export const personalProjects: PersonalProject[] = (collection.items as PersonalProject[])
  .filter(item => !item.hidden)
  .map(item => ({...item, title: personalTitleOverrides[item.id] ?? item.title, cover: withLqip(item.cover), gallery: item.gallery.map(withLqip)}));
function withLqip(media: PersonalMedia): PersonalMedia {
  return {...media, lqip: media.kind === "image" ? lqipFor(`/assets/personal/${media.src}`) : undefined, poster: media.poster ? withLqip(media.poster) : undefined};
}
