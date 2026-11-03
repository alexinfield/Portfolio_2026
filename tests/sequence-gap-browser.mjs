import {mkdir,writeFile} from 'node:fs/promises';
export async function runSequenceGapRegressions(launch,baseURL,{engine,artifacts}={}){
const out=artifacts,server={origin:baseURL},rows=[];await mkdir(out,{recursive:true});
const measure=()=>{const s=document.querySelector('.case-sequence'),r=s.getBoundingClientRect(),panel=s.closest('.case-panel');
  const vis=e=>e&&e.getClientRects().length&&!e.closest('noscript');
  const mediaBox=el=>{if(!el)return null;const m=[...el.querySelectorAll('img,video,.case-sequence,.case-composite')].filter(vis);const pick=m.find(()=>true);return pick?(pick.closest('.case-video,.case-composite')||pick):null;};
  const prevPanel=panel?.previousElementSibling,nextPanel=panel?.nextElementSibling;
  let above;
  if(prevPanel){const ms=[...prevPanel.querySelectorAll('img,video,.case-composite')].filter(vis).map(e=>e.closest('.case-video,.case-composite')||e);const b=Math.max(...ms.map(e=>e.getBoundingClientRect().bottom));above={prev:'panel',gap:+(r.top-b).toFixed(2)};}
  // the header is fixed: compare document positions (the block's top in the page vs the header's height)
  else above={prev:'header',gap:+(r.top+scrollY-document.querySelector('.portfolio-header').getBoundingClientRect().bottom).toFixed(2)};
  const nb=mediaBox(nextPanel);
  return {gapAbove:above.gap,prev:above.prev,gapBelow:nb?+(nb.getBoundingClientRect().top-r.bottom).toFixed(2):null,blockH:+r.height.toFixed(2),frameH:+s.querySelector('.ss-stage').getBoundingClientRect().height.toFixed(2),expectedH:+((document.documentElement.clientWidth+4)*.5625-6).toFixed(2)};};
for(const [vpName,vp,dpr] of [['phone-393',{width:393,height:852},2],['desktop-1440',{width:1440,height:900},1]])for(const theme of ['light','dark'])for(const motion of ['no-preference','reduce']){
  const browser=await launch();
  try{for(const slug of ['luma','molekule-go']){
    const touch=vpName!=='desktop-1440';
    const ctx=await browser.newContext({ignoreHTTPSErrors:true,colorScheme:theme,viewport:vp,deviceScaleFactor:dpr,reducedMotion:motion,hasTouch:touch,isMobile:touch});
    await ctx.route('**/*',r=>new URL(r.request().url()).origin===server.origin?r.continue():r.abort());
    const page=await ctx.newPage();
    await page.goto(server.origin+`/projects/${slug}/`,{waitUntil:'load',timeout:120000});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(800);
    const atLoad=await page.evaluate(measure);
    await page.evaluate(()=>{const s=document.querySelector('.case-sequence');scrollTo(0,s.getBoundingClientRect().top+scrollY+s.offsetHeight/2-innerHeight/2);});await page.waitForTimeout(900);
    const midScrub=await page.evaluate(measure);
    const ok=[atLoad,midScrub].every(m=>m.gapAbove===0&&(m.gapBelow===null||m.gapBelow===0)&&Math.abs(m.blockH-m.frameH)<=0.5&&Math.abs(m.blockH-m.expectedH)<=1.5);
    const row={engine,theme,slug,viewport:vpName,dpr,motion,atLoad,midScrub,pass:ok};rows.push(row);console.log(`${ok?'PASS':'FAIL'} ${JSON.stringify(row)}`);
    await ctx.close();
  }}catch(e){console.log(`FAIL ${engine} ${vpName} ${motion} error ${e.message.slice(0,200)}`);rows.push({engine,viewport:vpName,motion,error:e.message.slice(0,200),pass:false});}
  await browser.close().catch(()=>{});
}
await writeFile(`${out}/gaps-${engine}.json`,JSON.stringify({rows,pass:rows.every(r=>r.pass)},null,1));
console.log(JSON.stringify({engine,checks:rows.length,failures:rows.filter(r=>!r.pass).length}));

return rows;
}
