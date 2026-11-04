import type {CSSProperties} from "react";
import type {PersonalProject} from "./personal-media";

export const PERSONAL_GUTTER=20;
export const TRACKS_ASPECT=415/1042;
// Owner chose hand-set gallery frames. Tweak each gallery here; slide framing
// still preserves padded media and the ratio stays fixed while swiping.
export const PERSONAL_GALLERY_ASPECTS:Record<string,number>={
  "server-rack":4/3,
  stool:1,
  "desk-pen":9/16,
  "p025-warp-paper-light-and-shadow-relief":1,
  mycelium:3/4,
  "reusable-wall-hooks":16/9,
  "p019-neighborhood-cnc-relief-map-study":3/4,
  book:1,
  "wall-mounts":3/4,
  "off-campus":16/9,
  "p021-gravity-synth-bouncing-ball-musical-interface":411/640,
  "p024-contrast-exploratory-photoshop-series":309/400,
  "p041-telefoni":16/9,
};
export function personalAspect(project:PersonalProject){
  if(project.link)return project.cover.width/project.cover.height;
  return PERSONAL_GALLERY_ASPECTS[project.id]??project.cover.width/project.cover.height;
}
type Item={id:string;aspect:number;caption:number;player?:boolean};
type Cell={column:number;media:number;pixels:number;player?:boolean};
export function masonry(items:Item[]){
  const cells=new Map<string,CSSProperties>();const shell:Record<string,string|number>={};
  for(const count of [2,3]){
    const columns:Cell[]=Array.from({length:count},(_,column)=>({column,media:0,pixels:0}));
    // Place every item in source order, including the final partial row.
    for(const item of items){
      const column=columns.reduce((best,c)=>c.media*400+c.pixels<best.media*400+best.pixels?c:best,columns[0]);
      const style=cells.get(item.id)??{};
      Object.assign(style,{[`--m${count}-column`]:column.column,[`--m${count}-media`]:column.media,[`--m${count}-pixels`]:column.pixels,[`--m${count}-extra`]:column.player?1:0});cells.set(item.id,style);
      column.media+=1/item.aspect;column.pixels+=item.caption+PERSONAL_GUTTER;
      if(item.player){shell[`--m${count}-player`]=column.column;column.player=true;}
    }
    for(const c of columns){shell[`--m${count}-h${c.column}-media`]=c.media;shell[`--m${count}-h${c.column}-pixels`]=c.pixels-PERSONAL_GUTTER;shell[`--m${count}-h${c.column}-extra`]=shell[`--m${count}-player`]===c.column?1:0;}
  }
  return{cells,shell:shell as CSSProperties};
}
