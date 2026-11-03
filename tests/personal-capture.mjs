import {writeFile} from 'node:fs/promises';
import {decodePng,encodePng} from './png-capture.mjs';
// Evidence only: native-size viewport strips avoid giant WebKit surfaces and
// preserve carousel controls at their real viewport size. The fixed header is
// included once, at the top. No card geometry or product styles are changed.
export async function paintCards(page){
 await page.addStyleTag({content:'.compass-personal-gallery{content-visibility:visible!important}'});
 for(const card of await page.locator('.portfolio-project').all()){
  await card.scrollIntoViewIfNeeded();await page.waitForTimeout(100);
  await card.evaluate(async e=>{const frame=e.querySelector('.ac-carousel-viewport')?.getBoundingClientRect();const images=[...e.querySelectorAll('img')].filter(i=>{const r=i.getBoundingClientRect();return r.width>0&&(!frame||r.left<frame.right&&r.right>frame.left);});await Promise.all(images.map(i=>i.decode().catch(()=>{})));const v=e.querySelector('video[poster]');if(v){const i=new Image();i.src=v.poster;await i.decode().catch(()=>{});}});
  await page.waitForTimeout(550);
 }
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);
}
export async function fullPageCapture(page,path){
 const viewport=page.viewportSize(),height=await page.evaluate(()=>Math.ceil(document.documentElement.scrollHeight));
 const header=await page.locator('.portfolio-header').evaluate(e=>Math.ceil(e.getBoundingClientRect().bottom));
 const pixels=Buffer.alloc(viewport.width*height*3);let end=0;
 while(end<height){
  await page.evaluate(y=>scrollTo(0,y),end===0?0:end-header);await page.waitForTimeout(220);
  const scroll=await page.evaluate(()=>scrollY),top=end===0?0:end-scroll,take=Math.min(viewport.height-top,height-end);
  if(take<=0)throw Error('Capture strip made no progress');const image=decodePng(await page.screenshot({fullPage:false}));if(image.width!==viewport.width)throw Error('Capture requires DPR 1');
  image.data.copy(pixels,end*viewport.width*3,top*viewport.width*3,(top+take)*viewport.width*3);end+=take;
 }
 await writeFile(path,encodePng({width:viewport.width,height,data:pixels}));await page.evaluate(()=>scrollTo(0,0));
}
