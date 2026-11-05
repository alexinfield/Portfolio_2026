import {mkdir,writeFile} from 'node:fs/promises';
export async function runExtendRegressions(launch,baseURL,{engine,artifacts}={}){
const out=artifacts,server={origin:baseURL},results=[];await mkdir(out,{recursive:true});
const rec=(name,pass,detail={})=>{results.push({name,pass,...detail});console.log(`${pass?'PASS':'FAIL'} ${name} ${JSON.stringify(detail).slice(0,400)}`);};
for(const [vpName,vp,dpr,touch] of [['phone-393',{width:393,height:852},2,true],['desktop-1440',{width:1440,height:900},1,false]])for(const scheme of ['light','dark'])for(const motion of ['no-preference','reduce'])for(const [name,path] of [['home','/'],['personal','/personal/'],['luma','/projects/luma/']]){
  const tag=`${engine} ${name} ${vpName} ${scheme} ${motion}`;
  const browser=await launch();
  try{
    const ctx=await browser.newContext({ignoreHTTPSErrors:true,viewport:vp,deviceScaleFactor:dpr,colorScheme:scheme,reducedMotion:motion,hasTouch:touch,isMobile:touch});
    await ctx.addInitScript(()=>{window.__cls=0;try{if(!PerformanceObserver.supportedEntryTypes?.includes('layout-shift')){window.__cls=null;return;}new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value;}).observe({type:'layout-shift',buffered:true});}catch{window.__cls=null;}});
    await ctx.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!==server.origin)return r.abort();
      if(r.request().resourceType()==='image'&&!/\/assets\/eb\//.test(u.pathname))await new Promise(d=>setTimeout(d,4000));
      return r.continue().catch(()=>{});});
    const page=await ctx.newPage();
    await page.goto(server.origin+path,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForTimeout(1800);
    const mid=await page.evaluate(()=>{const hosts=[...document.querySelectorAll('[data-eb-host]')].filter(h=>{const r=h.getBoundingClientRect();const c=h.closest(".ac-carousel-viewport")?.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>0&&r.right>0&&r.left<innerWidth&&(!c||(Math.min(r.right,c.right)-Math.max(r.left,c.left)>5&&Math.min(r.bottom,c.bottom)-Math.max(r.top,c.top)>5));});
      return {onScreen:hosts.length,waiting:hosts.filter(h=>h.dataset.eb==='wait').length,drifting:hosts.filter(h=>getComputedStyle(h,'::before').animationName==='eb-drift').length,
        fieldPainted:hosts.filter(h=>getComputedStyle(h,'::before').backgroundImage.includes('data:image/webp')).length,
        draft:document.querySelectorAll('[data-draft-review-panel]').length,telefoniField:document.querySelectorAll('#p041-telefoni [data-eb-host],#p041-telefoni [data-eb-self]').length};});
    await page.screenshot({path:`${out}/${engine}-${name}-${vpName}-${scheme}-${motion}-mid.png`,timeout:120000});
    await page.waitForLoadState('load',{timeout:120000}).catch(()=>{});await page.waitForTimeout(2500);
    const done=await page.evaluate(()=>{const hosts=[...document.querySelectorAll('[data-eb-host]')].filter(h=>{const r=h.getBoundingClientRect();const c=h.closest(".ac-carousel-viewport")?.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>0&&r.right>0&&r.left<innerWidth&&(!c||(Math.min(r.right,c.right)-Math.max(r.left,c.left)>5&&Math.min(r.bottom,c.bottom)-Math.max(r.top,c.top)>5));});
      const notDone=hosts.filter(h=>h.dataset.eb!=='done').length,hidden=hosts.filter(h=>{const m=h.querySelector(':scope>[data-eb-media]');return m&&Number(getComputedStyle(m).opacity)<1;}).length;
      return {onScreen:hosts.length,notDone,hidden,cls:window.__cls,sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth};});
    await page.screenshot({path:`${out}/${engine}-${name}-${vpName}-${scheme}-${motion}-loaded.png`,timeout:120000});
    const pass=mid.onScreen>0&&mid.waiting>0&&mid.fieldPainted>=mid.waiting&&(motion==='reduce'?mid.drifting===0:mid.drifting>0)&&mid.draft===0&&mid.telefoniField===0&&done.notDone===0&&done.hidden===0&&(done.cls===null||done.cls<0.001)&&done.sw===done.cw;
    rec(`${tag}: fields while waiting, media in and fields gone once loaded`,pass,{mid,done});
    await ctx.close();
  }catch(e){rec(`${tag}: error`,false,{error:e.message.slice(0,300)});}
  await browser.close().catch(()=>{});
}
await writeFile(`${out}/eb-${engine}.json`,JSON.stringify({results,pass:results.every(r=>r.pass)},null,1));
console.log(JSON.stringify({engine,checks:results.length,failures:results.filter(r=>!r.pass).length}));

return results;
}
