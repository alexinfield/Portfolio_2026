import collection from "./personal.json";
export type PersonalMedia = {
  id: string; kind: "image" | "video"; src: string; width: number; height: number; alt: string;
  variants?: {src: string; width: number; height: number; bytes: number}[];
  poster?: PersonalMedia;
};
export type PersonalProject = {
  id: string; title: string; year: number | null; category: string | null; link: string | null;
  cover: PersonalMedia; gallery: PersonalMedia[]; short_text: string | null;
};
const titleOverrides: Record<string,string> = {stool: "Kerf Stool", "wall-mounts": "CNC Portrait Relief"};
export const personalProjects: PersonalProject[] = (collection.items as PersonalProject[]).map(item => ({...item, title: titleOverrides[item.id] ?? item.title}));
export const personalAsset = (source: string) => `../assets/personal/${source}`;
