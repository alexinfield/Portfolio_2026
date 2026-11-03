import type { CSSProperties } from "react";
// Client-safe Personal media helpers. Kept apart from the package JSON so
// client chunks never bundle hidden entries' records.
export type PersonalFraming = {fit:"cover"|"pad";object_position:string;background:string;fill?:"edge-extend"};
export type PersonalMedia = {
  id: string; kind: "image" | "video"; src: string; width: number; height: number; alt: string;
  variants?: {src: string; width: number; height: number; bytes: number}[];
  poster?: PersonalMedia;
  duration_seconds?: number;
  has_audio?: boolean;
  framing?: PersonalFraming;
};
export type PersonalProject = {
  id: string; title: string; year: number | null; category: string | null; link: string | null;
  framing: PersonalFraming;
  cover: PersonalMedia; gallery: PersonalMedia[]; short_text: string | null;
  hidden?: boolean;
};
export const personalAsset = (source: string) => `../assets/personal/${source}`;

export function personalMediaStyle(media:PersonalMedia, framing:PersonalFraming,target=4/3):CSSProperties {
  const ratio=media.width/media.height, padded=framing.fit==="pad";
  return {objectFit:"cover",objectPosition:framing.object_position,
    width:padded&&ratio<target?`${ratio/target*100}%`:"100%",
    height:padded&&ratio>target?`${target/ratio*100}%`:"100%"};
}
