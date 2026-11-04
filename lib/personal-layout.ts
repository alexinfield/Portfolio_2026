import widths from "./personal-caption-widths.json";
import type {CSSProperties} from "react";
import type {PersonalProject} from "./personal-media";

export const PERSONAL_GUTTER=20;
// Stable caption lines keep the server's column geometry independent of image,
// font and hydration timing. Conservative advances are refined by render review.
function advance(c:string){return (widths as Record<string,number>)[c]??14;}
export function captionLines(text:string|null){
  if(!text)return [];
  const lines:string[]=[];let line="",width=0;
  for(const word of text.split(/\s+/)){
    const size=[...word].reduce((n,c)=>n+advance(c),0);
    if(line&&width+4+size>300){lines.push(line);line="";width=0;}
    if(size>300){for(const c of word){if(width+advance(c)>300){lines.push(line);line="";width=0;}line+=c;width+=advance(c);}}
    else{if(line){line+=" ";width+=4;}line+=word;width+=size;}
  }
  if(line)lines.push(line);return lines;
}
export function personalAspect(project:PersonalProject){
  if(project.link)return project.cover.width/project.cover.height;
  const media=project.gallery.length?project.gallery:[project.cover];
  const first=media[0].width/media[0].height,tallest=Math.min(...media.map(m=>m.width/m.height));
  const loss=(aspect:number)=>media.reduce((sum,m)=>{const framing=m.framing??project.framing;if(framing.fit==="pad")return sum;const r=m.width/m.height;return sum+1-Math.min(r/aspect,aspect/r);},0);
  return loss(first)<=loss(tallest)?first:tallest;
}
type Item={id:string;aspect:number;caption:number};
type Cell={column:number;media:number;pixels:number};
export function masonry(items:Item[]){
  const cells=new Map<string,CSSProperties>();const shell:Record<string,string|number>={};
  for(const count of [2,3]){
    const columns:Cell[]=Array.from({length:count},(_,column)=>({column,media:0,pixels:0}));
    // Pack only the final partial row by height to balance the final columns.
    // Earlier source order stays untouched; the phone always uses DOM order.
    const tail=count+1;
    const ordered=[...items.slice(0,-tail),...items.slice(-tail).sort((a,b)=>(400/b.aspect+b.caption)-(400/a.aspect+a.caption))];
    for(const item of ordered){
      const column=columns.reduce((best,c)=>c.media*400+c.pixels<best.media*400+best.pixels?c:best,columns[0]);
      const style=cells.get(item.id)??{};
      Object.assign(style,{[`--m${count}-column`]:column.column,[`--m${count}-media`]:column.media,[`--m${count}-pixels`]:column.pixels});cells.set(item.id,style);
      column.media+=1/item.aspect;column.pixels+=item.caption+PERSONAL_GUTTER;
    }
    for(const c of columns){shell[`--m${count}-h${c.column}-media`]=c.media;shell[`--m${count}-h${c.column}-pixels`]=c.pixels-PERSONAL_GUTTER;}
  }
  return{cells,shell:shell as CSSProperties};
}
