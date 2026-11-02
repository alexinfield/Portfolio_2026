import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {join} from "node:path";
import {runBrowserRegressions as runCritiqueRegressions} from "./critique-browser.mjs";
import {runNativeFilmRegressions,configureTelefoniCodecFixture} from "./native-film-browser.mjs";
import {runCaseStackRegressions} from "./case-stack-browser.mjs";

// Keep the ce35959 regression coverage alongside the critique-specific checks.
// Filters are deliberately hidden by the approved design; their retained flag
// and AND logic are checked by rendered-html.test.mjs instead of clicking UI.
export async function runPreservedRegressions(browser,baseURL,{artifacts}={}) {
  const results=[],origin=new URL(baseURL).origin;
  if(artifacts)await mkdir(artifacts,{recursive:true});
  const context=await browser.newContext({viewport:{width:393,height:852},reducedMotion:"reduce",colorScheme:"light"});
  context.setDefaultTimeout(10000);
  await context.route("**/*",route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  await context.addInitScript(()=>localStorage.setItem("portfolio-compass-theme","light"));
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  const goto=async route=>{await page.goto(baseURL+route);await page.evaluate(()=>document.fonts.ready);if(route.startsWith('/personal'))await page.waitForFunction(()=>document.querySelector('[data-personal-ready]')?.dataset.personalReady==='true');};
  const check=async(name,action)=>{
    try{const detail=await action();results.push({suite:'preserved',name,pass:true,...(detail?{detail}:{})});console.log(`preserved PASS: ${name}`);}
    catch(error){results.push({suite:'preserved',name,pass:false,error:error.message.slice(0,1800)});console.log(`preserved FAIL: ${name}: ${error.message.slice(0,200)}`);if(artifacts)await page.screenshot({path:join(artifacts,`preserved-failure-${results.length}.png`)}).catch(()=>{});}
  };
  try{
    for(const route of ['/','/personal/','/info/','/projects/ping/','/projects/hyphae/','/missing/deep/']){
      await check(`fixed palette and no appearance controls: ${route}`,async()=>{
        await goto(route);const expected=route==='/personal/'?'light':'dark';
        assert.equal(await page.locator('html').getAttribute('data-theme'),expected);
        assert.equal(await page.locator('[data-portfolio-boundary]').getAttribute('data-theme'),expected);
        assert.equal(await page.locator('[data-theme-toggle],.portfolio-appearance').count(),0);
        await page.emulateMedia({colorScheme:'dark'});assert.equal(await page.locator('html').getAttribute('data-theme'),expected);
      });
    }
    await check('navigation style parity, including selected Info fill and secondary Contact',async()=>{
      const metrics=()=>page.locator('.portfolio-nav a').evaluateAll(items=>items.map(element=>{const s=getComputedStyle(element);return{name:element.textContent,font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,line:s.lineHeight,padding:s.padding,height:element.getBoundingClientRect().height,radius:s.borderRadius,bg:s.backgroundColor,current:element.hasAttribute('aria-current')};}));
      const style=item=>Object.fromEntries(Object.entries(item).filter(([key])=>!['name','bg','current'].includes(key)));
      await goto('/');const work=await metrics();assert.deepEqual(style(work[0]),style(work[1]));assert.deepEqual(style(work[1]),style(work[2]));
      await goto('/info/');const info=await metrics();assert.deepEqual(style(info[0]),style(info[2]));assert.equal(info.find(item=>item.current).bg,work.find(item=>item.current).bg);
      assert.equal(await page.getByRole('link',{name:'Contact',exact:true}).count(),1);
      assert.equal(await page.getByRole('link',{name:'Contact',exact:true}).getAttribute('data-variant'),'secondary');
    });
    for(const width of [1440,393])await check(`cached edge fills, source aspect and caption links: ${width}`,async()=>{
      await page.setViewportSize({width,height:900});await goto('/personal/');
      for(const id of ['desk-pen','p019-neighborhood-cnc-relief-map-study']){
        const image=page.locator(`#${id} img`).first();await image.scrollIntoViewIfNeeded();
        await page.waitForFunction(id=>{const image=document.querySelector(`#${id} img`);return image?.complete&&image.naturalWidth>0&&[...document.querySelectorAll(`#${id} .portfolio-gallery-slide:first-child .portfolio-edge-fill`)].every(fill=>getComputedStyle(fill).backgroundImage!=='none');},id);
        const ratio=await image.evaluate(element=>{const r=element.getBoundingClientRect();return{rendered:r.width/r.height,source:Number(element.getAttribute('width'))/Number(element.getAttribute('height'))};});
        assert.ok(Math.abs(ratio.rendered-ratio.source)<.01);assert.equal(await page.locator(`#${id} .portfolio-gallery-slide`).first().locator('.portfolio-edge-fill').count(),2);
      }
      const link=page.locator('#folio a');await link.hover();assert.equal(await link.evaluate(element=>getComputedStyle(element).textDecorationLine),'none');
    });
    await check('image Retry restores gallery focus and retains its frame',async()=>{
      await goto('/personal/');const gallery=page.locator('#server-rack .portfolio-gallery');await gallery.scrollIntoViewIfNeeded();
      const before=await gallery.boundingBox();await gallery.locator('img').first().evaluate(image=>image.dispatchEvent(new Event('error')));
      await gallery.getByRole('button',{name:/Retry image/}).click();
      assert.ok(await gallery.evaluate(element=>element===document.activeElement));assert.equal((await gallery.boundingBox()).height,before.height);
    });
    await check('Telefoni desktop explicit Play advances playback with Compass controls',async()=>{
      await page.setViewportSize({width:1440,height:900});await goto('/personal/');const frame=page.locator('#p041-telefoni [data-video-frame]'),video=frame.locator('video');await video.scrollIntoViewIfNeeded();
      const codec=await configureTelefoniCodecFixture(page,video,baseURL);await page.locator('#p041-telefoni .portfolio-gallery').hover();await frame.locator('[data-video-toggle]').click();
      await page.waitForFunction(()=>{const video=document.querySelector('#p041-telefoni video');return video&&!video.paused&&video.readyState>=2&&video.currentTime>.15;});
      assert.equal(await video.evaluate(video=>video.controls),false);await frame.locator('[data-video-toggle]').click();assert.equal(await video.evaluate(video=>video.paused),true);return codec;
    });
    for(const width of [320,390,1440])for(const scale of [100,200]){
      await check(`44 px nav targets, focus and overflow: ${width}, ${scale}% text`,async()=>{
        await page.setViewportSize({width,height:900});await goto(`/info/?focus=${width}-${scale}`);
        await page.evaluate(scale=>document.documentElement.style.fontSize=scale===200?'200%':'100%',scale);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
        const sizes=await page.locator('header [data-slot="button"]').evaluateAll(items=>items.map(item=>{const r=item.getBoundingClientRect();return{w:r.width,h:r.height};}));
        assert.ok(sizes.every(size=>size.w>=43.99&&size.h>=43.99));
        await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Skip to content');
        for(let i=0;i<5;i++){
          await page.keyboard.press('Tab');const focus=await page.evaluate(()=>{const r=document.activeElement.getBoundingClientRect(),s=getComputedStyle(document.activeElement);return{left:r.left,right:innerWidth-r.right,outline:s.outlineStyle,width:parseFloat(s.outlineWidth)};});
          assert.equal(focus.outline,'solid');assert.ok(focus.width>=2&&focus.left>=2&&focus.right>=2,JSON.stringify(focus));
        }
      });
    }
    for(const [from,to]of [['/play/','/personal/'],['/etc/','/personal/'],['/projects/pillar/','/projects/niche/'],['/projects/furniture/','/projects/mode/']]){
      await check(`native alias: ${from} → ${to}`,async()=>{await goto(from);await page.waitForURL(baseURL+to);});
    }
    await check('deep 404 skip link stays on the missing document and focuses main',async()=>{
      await page.setViewportSize({width:393,height:852});const missing=await page.goto(baseURL+'/missing/deep/');assert.equal(missing.status(),404);
      await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Skip to content');await page.keyboard.press('Enter');
      await page.waitForURL(baseURL+'/missing/deep/#main-content');assert.equal(await page.evaluate(()=>document.activeElement.id),'main-content');
    });
    await check('preserved scenarios produce no application errors',()=>assert.deepEqual(errors,[]));
  }finally{await context.close();}
  const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:393,height:852}});
  try{
    await noJS.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
    await check('no-JS Personal retains fifteen entries and a working Folio case link',async()=>{
      const p=await noJS.newPage();await p.goto(baseURL+'/personal/');assert.equal(await p.locator('[data-personal-id]').count(),15);
      await p.getByRole('link',{name:'Folio',exact:true}).click();await p.waitForURL(baseURL+'/projects/mode/?from=personal');
    });
  }finally{await noJS.close();}
  return results;
}

export async function runBrowserRegressions(browser,baseURL,options={}) {
  return [
    ...await runNativeFilmRegressions(browser,baseURL,options),
    ...await runCritiqueRegressions(browser,baseURL,options),
    ...await runPreservedRegressions(browser,baseURL,options),
    ...await runCaseStackRegressions(browser,baseURL),
  ];
}
