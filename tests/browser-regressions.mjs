import assert from "node:assert/strict";

export async function runBrowserRegressions(browser, baseURL, {caseTextEnabled=false}={}) {
  const checks=[];
  const check=async(name,run)=>{try{await run();checks.push({name,pass:true});}catch(error){checks.push({name,pass:false,error:error.message.slice(0,2000)});}};
  const newContext=async options=>{const context=await browser.newContext({viewport:{width:393,height:852},...options});context.setDefaultTimeout(7000);await context.route(/https:\/\//,route=>route.abort());return context;};
  const goto=async(page,route)=>{await page.goto(baseURL+route,{waitUntil:"load"});await page.evaluate(()=>document.fonts.ready);if(route.startsWith("/personal"))await page.waitForFunction(()=>document.querySelector("[data-slot=select-trigger]")?.disabled===false);};
  const expectTheme=async(page,value)=>{await page.waitForFunction(value=>document.documentElement.dataset.theme===value,value);assert.equal(await page.locator("[data-portfolio-boundary]").first().getAttribute("data-theme"),value);};
  const choose=async(page,label,option)=>{await page.getByRole("combobox",{name:label}).click();await page.getByRole("option",{name:option,exact:true}).click();};
  const context=await newContext({reducedMotion:"reduce",colorScheme:"light"});
  const page=await context.newPage();const errors=[];let h264=false;
  page.on("pageerror",error=>errors.push(error.message));
  page.on("console",message=>{if(message.type()==="error"&&!/Failed to load resource|net::ERR_FAILED/.test(message.text()))errors.push(message.text());});
  try {
    await goto(page,"/");
    h264=await page.evaluate(()=>Boolean(document.createElement("video").canPlayType('video/mp4; codecs="avc1.42E01E"')));
    checks.push({name:"installed Chromium codec capability",pass:true,h264,limitation:h264?null:"H.264 is unavailable; native WebM exercises the playback lifecycle, and MP4 fallbacks are checked separately."});
    await check("dark first paint even with a light OS",async()=>{await expectTheme(page,"dark");assert.equal(await page.evaluate(()=>localStorage.getItem("portfolio-compass-theme")),null);});
    await check("one delegated header toggle, persisted on reload",async()=>{await page.locator("[data-theme-toggle]").click();await expectTheme(page,"light");assert.equal(await page.evaluate(()=>localStorage.getItem("portfolio-compass-theme")),"light");await page.reload();await expectTheme(page,"light");});
    await check("Personal is inverse without changing the preference",async()=>{await goto(page,"/personal/");await expectTheme(page,"dark");assert.equal(await page.evaluate(()=>localStorage.getItem("portfolio-compass-theme")),"light");assert.equal(await page.locator("[data-theme-toggle]").getAttribute("aria-pressed"),"false");});
    await check("Personal AND filters, null years, order, reset and empty state",async()=>{
      await choose(page,"Filter by year","2024");
      const years=await page.locator("[data-personal-id]:visible").evaluateAll(items=>items.map(item=>item.dataset.year));assert.ok(years.length>0&&years.every(year=>year==="2024"));
      await choose(page,"Filter by category","Materials");assert.deepEqual(await page.locator("[data-personal-id]:visible").evaluateAll(items=>items.map(item=>item.id)),["p016-biomaking-gelatin-wrap-materials-study"]);
      await choose(page,"Filter by year","2026");assert.equal(await page.locator("[data-personal-id]:visible").count(),0);assert.ok(await page.getByText("No projects match these filters.").isVisible());
      await page.getByRole("button",{name:"Show all projects"}).click();assert.equal(await page.locator("[data-personal-id]:visible").count(),16);
      await choose(page,"Filter by year","Year not recorded");const unknown=await page.locator("[data-personal-id]:visible").evaluateAll(items=>items.map(item=>item.getAttribute("data-year")));assert.ok(unknown.length>0&&unknown.every(year=>year===null));
      await page.getByRole("button",{name:"Reset",exact:true}).click();assert.equal(await page.locator("[data-personal-id]:visible").count(),16);
      assert.match(await page.locator(".portfolio-filters [role=status]").textContent(),/16 projects shown/);
    });
    await check("Select rows meet 44px and portal shares the inverse palette",async()=>{
      await page.getByRole("combobox",{name:"Filter by year"}).click();const menu=page.getByRole("listbox");
      assert.equal(await menu.evaluate(element=>element.closest("[data-portfolio-boundary]")?.dataset.theme),"dark");
      const boxes=await page.getByRole("option").evaluateAll(items=>items.map(item=>({w:item.getBoundingClientRect().width,h:item.getBoundingClientRect().height})));assert.ok(boxes.every(box=>box.w>=44&&box.h>=44));await page.keyboard.press("Escape");
    });
    await check("manual gallery keyboard, stable frame, mouse and swipe",async()=>{
      const gallery=page.getByRole("region",{name:"Desk Pen images"});await gallery.scrollIntoViewIfNeeded();
      const initial=await gallery.boundingBox();await gallery.click({position:{x:initial.width/2,y:initial.height/2}});
      await gallery.focus();await page.keyboard.press("ArrowRight");await gallery.getByRole("group",{name:"2 of 6",exact:true}).waitFor({state:"visible"});
      const second=await gallery.boundingBox();assert.equal(second.height,initial.height);
      await page.keyboard.press("Home");await gallery.getByRole("group",{name:"1 of 6",exact:true}).waitFor({state:"visible"});
      await gallery.locator(".portfolio-gallery-stage").dispatchEvent("touchstart",{touches:[{identifier:1,clientX:250,clientY:200}]});await gallery.locator(".portfolio-gallery-stage").dispatchEvent("touchend",{changedTouches:[{identifier:1,clientX:100,clientY:210}]});await gallery.getByRole("group",{name:"2 of 6",exact:true}).waitFor({state:"visible"});
      const video=gallery.locator("video").first();assert.equal(await video.evaluate(element=>element.currentSrc),"");assert.ok(await video.evaluate(element=>element.paused),"explicit pause/reduced motion keeps video paused");
      if(!h264)await video.evaluate((element,source)=>{const item=element.querySelector("source");item.dataset.src=source;item.type="video/webm";},baseURL+"/assets/molekule-go/media/uv-web.webm");
      await gallery.locator("[data-video-toggle]").first().click();await page.waitForFunction(()=>{const video=document.querySelector("#desk-pen video");return video&&!video.paused&&video.currentTime>0.05;});
      await gallery.locator("[data-video-toggle]").first().click();assert.ok(await video.evaluate(element=>element.paused),"explicit pause/reduced motion keeps video paused");
    });
    await check("image retry preserves the frame and puts focus back in its gallery",async()=>{
      const image=page.locator("#server-rack .portfolio-gallery-slide").first().locator("img");await image.evaluate(element=>element.dispatchEvent(new Event("error")));
      const gallery=page.locator("#server-rack .portfolio-gallery");const before=await gallery.boundingBox();await gallery.getByRole("button",{name:/Retry image/}).click();const after=await gallery.boundingBox();assert.equal(before.height,after.height);assert.ok(await gallery.evaluate(element=>element===document.activeElement));
    });
    await check("Info segmented control persists System and tracks OS changes",async()=>{
      await goto(page,"/info/");await page.getByRole("radio",{name:"System",exact:true}).click();await expectTheme(page,"light");await page.emulateMedia({colorScheme:"dark"});await expectTheme(page,"dark");assert.equal(await page.evaluate(()=>localStorage.getItem("portfolio-compass-theme")),"system");await page.reload();await expectTheme(page,"dark");
    });
    await check("cross-tab storage synchronization and back navigation",async()=>{
      const other=await context.newPage();await goto(other,"/");await other.evaluate(()=>window.PortfolioTheme.set("light"));await expectTheme(page,"light");await goto(page,"/personal/");await expectTheme(page,"dark");await page.goBack();await expectTheme(page,"light");await other.close();
    });
    await check("deep 404 skip stays on that URL and moves focus",async()=>{
      const route="/projects/unknown/deep/";const response=await page.goto(baseURL+route);assert.equal(response.status(),404);await page.keyboard.press("Tab");assert.equal(await page.evaluate(()=>document.activeElement.textContent),"Skip to content");await page.keyboard.press("Enter");assert.equal(page.url(),baseURL+route+"#main-content");assert.equal(await page.evaluate(()=>document.activeElement.id),"main-content");
    });
    await check("all aliases navigate to the approved existing destination",async()=>{
      for(const [alias,target]of[["/etc/","/personal/"],["/play/","/personal/"],["/projects/pillar/","/projects/niche/"],["/projects/furniture/","/projects/mode/"]]){await page.goto(baseURL+alias);await page.waitForURL(baseURL+target);}
      await goto(page,"/");const homeCover=await page.locator(".portfolio-work-card img").first().boundingBox();await page.mouse.click(homeCover.x+homeCover.width/2,homeCover.y+homeCover.height/2);await page.waitForURL(baseURL+"/projects/molekule-go/");assert.equal(page.url(),baseURL+"/projects/molekule-go/");
      await goto(page,"/personal/");await page.locator("#folio img").scrollIntoViewIfNeeded();const personalCover=await page.locator("#folio img").boundingBox();await page.mouse.click(personalCover.x+personalCover.width/2,personalCover.y+personalCover.height/2);await page.waitForURL(baseURL+"/projects/mode/");assert.equal(page.url(),baseURL+"/projects/mode/");
    });
    for(const width of [320,390,1440])for(const theme of ["dark","light"])for(const scale of [100,200]){
      await check(`reachable header and 44px focus/targets: ${width}, ${theme}, ${scale}%`,async()=>{
        await page.setViewportSize({width,height:900});await goto(page,`/info/?targets=${width}-${theme}-${scale}`);await page.evaluate(({theme,scale})=>{window.PortfolioTheme.set(theme);document.documentElement.style.fontSize=scale===200?"200%":"100%";},{theme,scale});
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
        const buttons=await page.locator("header [data-slot=button]").evaluateAll(items=>items.map(item=>({text:item.textContent,w:item.getBoundingClientRect().width,h:item.getBoundingClientRect().height,radius:parseFloat(getComputedStyle(item).borderRadius)})));assert.ok(buttons.every(button=>button.w>=43.99&&button.h>=43.99&&button.radius===5),JSON.stringify(buttons));
        await page.keyboard.press("Tab");assert.equal(await page.evaluate(()=>document.activeElement.textContent),"Skip to content");
        const count=await page.locator("header a, header button:not(:disabled)").count();
        for(let index=0;index<count;index++){
          await page.keyboard.press("Tab");const focus=await page.evaluate(()=>{const element=document.activeElement,bounds=element.getBoundingClientRect(),header=element.closest("header").getBoundingClientRect(),style=getComputedStyle(element);return {left:bounds.left-header.left,right:header.right-bounds.right,outline:style.outlineStyle,width:parseFloat(style.outlineWidth)};});assert.equal(focus.outline,"solid");assert.ok(focus.width>=2&&focus.left>=2&&focus.right>=2,JSON.stringify(focus));
        }
      });
    }
    await page.setViewportSize({width:393,height:852});
    for(const theme of ["dark","light"])await check(`actual palette text/control contrast: ${theme}`,async()=>{
      await goto(page,"/info/");await page.evaluate(theme=>window.PortfolioTheme.set(theme),theme);
      const colors=await page.evaluate(()=>{
        const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d");canvas.width=canvas.height=1;
        const rgba=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];};
        const backdrop=element=>{for(let node=element;node;node=node.parentElement){const color=rgba(getComputedStyle(node).backgroundColor);if(color[3]===255)return color;}return rgba(getComputedStyle(document.documentElement).backgroundColor);};
        return [...document.querySelectorAll(".portfolio-intro,header [data-slot=button],.portfolio-appearance [data-slot=toggle-group-item]")].map(element=>({name:element.textContent||element.getAttribute("aria-label"),fg:rgba(getComputedStyle(element).color),bg:backdrop(element)}));
      });
      const lum=rgba=>rgba.slice(0,3).map(value=>{const s=value/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4;}).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
      for(const pair of colors){const a=lum(pair.fg),b=lum(pair.bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert.ok(ratio>=4.5,`${pair.name}: ${ratio}; ${JSON.stringify(pair)}`);}
    });
    // Alex deferred this layout; the exported flag automatically restores the
    // browser reflow check when semantic case copy is enabled again.
    if(caseTextEnabled)for(const slug of["ping","molekule-go","luma","niche","hyphae","mode"]){
      await check(`case text reflows: ${slug}`,async()=>{await goto(page,`/projects/${slug}/`);const panels=await page.locator(".case-text").evaluateAll(items=>items.map(element=>({text:element.textContent,width:element.getBoundingClientRect().width,font:parseFloat(getComputedStyle(element).fontSize)})));assert.ok(panels.some(panel=>panel.text.length>120));assert.ok(panels.every(panel=>panel.width>300&&panel.width<=393&&panel.font>=16));});
    }
    await check("no hydration/page errors on interactive routes",()=>assert.deepEqual(errors,[]));
  } finally {await context.close();}

  const noJS=await newContext({javaScriptEnabled:false});
  try{await check("no-JS Personal has all 16 entries and existing native case links",async()=>{const p=await noJS.newPage();await p.goto(baseURL+"/personal/");assert.equal(await p.locator("[data-personal-id]").count(),16);assert.ok(await p.getByRole("link",{name:"Folio",exact:true}).isVisible());await p.getByRole("link",{name:"Folio",exact:true}).click();assert.ok(p.url().endsWith("/projects/mode/"));});}finally{await noJS.close();}
  const denied=await newContext();
  try{await denied.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error("Storage unavailable");};Storage.prototype.setItem=()=>{throw Error("Storage unavailable");};});await check("storage denial leaves theme controls usable",async()=>{const p=await denied.newPage();await goto(p,"/info/");await p.locator("[data-theme-toggle]").click();await expectTheme(p,"light");await p.getByRole("radio",{name:"Dark",exact:true}).click();await expectTheme(p,"dark");});}finally{await denied.close();}
  const media=await newContext();
  const p=await media.newPage();
  try{
    await check("offscreen video requests remain deferred",async()=>{await goto(p,"/projects/molekule-go/");await p.waitForTimeout(400);const sources=await p.locator("video").evaluateAll(items=>items.map(video=>video.currentSrc));assert.ok(sources.every(source=>source===""));});
    await check("native playback, MP4 preference or WebM codec fallback, reveal and persistent pause",async()=>{
      const frame=p.locator("[data-video-frame]").first();await frame.scrollIntoViewIfNeeded();await p.mouse.move(0,0);assert.equal(await frame.locator(".media-controls").evaluate(element=>getComputedStyle(element).opacity),"0");await frame.hover();assert.equal(await frame.locator(".media-controls").evaluate(element=>getComputedStyle(element).opacity),"1");
      await p.waitForFunction(()=>{const video=document.querySelector("video");return video&&!video.paused&&video.currentTime>.05&&video.videoWidth===1280;});assert.ok((await frame.locator("video").evaluate(element=>element.currentSrc)).endsWith(h264?"uv-web.mp4":"uv-web.webm"));
      assert.equal(await frame.locator("[data-video-toggle]").innerText(),"");await frame.locator("[data-video-toggle]").click();await p.evaluate(()=>scrollTo(0,0));await frame.scrollIntoViewIfNeeded();assert.ok(await frame.locator("video").evaluate(element=>element.paused));await frame.locator("[data-video-toggle]").click();await p.waitForTimeout(250);assert.ok(await frame.locator("video").evaluate(element=>!element.paused));
      await p.emulateMedia({reducedMotion:"reduce"});await p.waitForTimeout(100);assert.ok(await frame.locator("video").evaluate(element=>element.paused));
    });
    await check("short Personal clips replay after leaving a slide; mouse focus does not pause",async()=>{
      await p.emulateMedia({reducedMotion:"reduce"});await goto(p,"/personal/");const gallery=p.getByRole("region",{name:"Desk Pen images"});
      if(!h264)await gallery.locator("video").first().evaluate((element,source)=>{const item=element.querySelector("source");item.dataset.src=source;item.type="video/webm";},baseURL+"/assets/molekule-go/media/uv-web.webm");
      await p.emulateMedia({reducedMotion:"no-preference"});await gallery.focus();await p.keyboard.press("ArrowRight");await gallery.scrollIntoViewIfNeeded();
      await p.waitForFunction(()=>{const video=document.querySelector("#desk-pen video");return video&&!video.paused&&video.currentTime>.05;});const video=gallery.locator("video").first();await gallery.click({position:{x:120,y:90}});assert.ok(await video.evaluate(element=>!element.paused),"video is playing after mouse focus / slide re-entry");await video.evaluate(element=>{element.addEventListener("ended",()=>{element.dataset.testEnded="true";},{once:true});element.loop=false;element.currentTime=Math.max(0,element.duration-.1);});await p.waitForFunction(()=>document.querySelector("#desk-pen video").dataset.testEnded==="true");
      await gallery.getByRole("button",{name:"Next image for Desk Pen"}).click();await gallery.getByRole("button",{name:"Previous image for Desk Pen"}).click();await p.waitForTimeout(300);assert.ok(await video.evaluate(element=>!element.paused),"video is playing after mouse focus / slide re-entry");
      await gallery.locator("[data-video-toggle]").first().click();assert.ok(await video.evaluate(element=>element.paused),"explicit pause/reduced motion keeps video paused");await gallery.getByRole("button",{name:"Next image for Desk Pen"}).click();await gallery.getByRole("button",{name:"Previous image for Desk Pen"}).click();await p.waitForTimeout(300);assert.ok(await video.evaluate(element=>!element.paused),"video is playing after mouse focus / slide re-entry");
    });
    if(!h264)await check("unmodified Personal MP4 has an accessible unavailable fallback on this decoder",async()=>{
      await p.emulateMedia({reducedMotion:"reduce"});await goto(p,"/personal/");const gallery=p.getByRole("region",{name:"Desk Pen images"});await gallery.focus();await p.keyboard.press("ArrowRight");await gallery.locator("[data-video-toggle]").first().click();await gallery.locator("[data-video-status]").first().waitFor({state:"visible"});assert.ok((await gallery.locator("[data-video-status] a").first().getAttribute("href")).endsWith("desk-pen-02.mp4"));
    });
    await check("missing controls-only sources expose the unavailable message",async()=>{
      await p.route(/film-web\.(mp4|webm)/,route=>route.abort());await goto(p,"/projects/hyphae/");const film=p.locator(".case-film video");await film.scrollIntoViewIfNeeded();await film.evaluate(element=>{element.controls=true;element.dispatchEvent(new PointerEvent("pointerdown"));});await p.locator(".case-film [data-video-status]").waitFor({state:"visible",timeout:8000});assert.match(await p.locator(".case-film [data-video-status]").textContent(),/Video unavailable/);assert.ok((await p.locator(".case-film [data-video-status] a").getAttribute("href")).endsWith("film-web.mp4"));
    });
    await check("video retry recovers a failed source without moving frame or losing focus",async()=>{
      let attempts=0;await p.route(/uv-web\.webm$/,route=>attempts++===0?route.abort():route.continue());await p.emulateMedia({reducedMotion:"reduce"});await goto(p,"/projects/molekule-go/");const frame=p.locator("[data-video-frame]").first();await frame.scrollIntoViewIfNeeded();await frame.locator("[data-video-toggle]").click();await frame.locator("[data-video-status]").waitFor({state:"visible"});const before=await frame.boundingBox();await frame.locator("[data-video-retry]").click();await p.waitForFunction(()=>{const video=document.querySelector("video");return video&&!video.paused&&video.currentTime>.05;});const after=await frame.boundingBox();assert.equal(before.height,after.height);assert.ok(await frame.locator("[data-video-toggle]").evaluate(element=>element===document.activeElement));
    });
    await check("without IntersectionObserver the nearby fallback still plays",async()=>{
      const fallback=await newContext();try{await fallback.addInitScript(()=>{delete window.IntersectionObserver;});const q=await fallback.newPage();await goto(q,"/projects/molekule-go/");await q.waitForFunction(()=>[...document.querySelectorAll("video")].some(video=>!video.paused&&video.currentTime>0));}finally{await fallback.close();}
    });
  }finally{await media.close();}
  const touch=await newContext({hasTouch:true,isMobile:true,reducedMotion:"reduce"});
  try{await check("tap and keyboard focus reveal icon controls with 44px targets",async()=>{const p=await touch.newPage();await goto(p,"/projects/molekule-go/");const frame=p.locator("[data-video-frame]").first();await frame.scrollIntoViewIfNeeded();await frame.tap({position:{x:100,y:50}});await p.waitForFunction(()=>document.querySelector("[data-video-frame]").dataset.controlsRevealed==="true"&&getComputedStyle(document.querySelector("[data-video-frame] .media-controls")).opacity==="1");assert.equal(await frame.locator(".media-controls").evaluate(element=>getComputedStyle(element).opacity),"1");const button=frame.locator("[data-video-toggle]");const box=await button.boundingBox();assert.ok(box.width>=44&&box.height>=44);await p.evaluate(()=>document.querySelector("[data-video-frame]").removeAttribute("data-controls-revealed"));await button.focus();await p.waitForFunction(()=>document.querySelector("[data-video-frame]").matches(":focus-within")&&getComputedStyle(document.querySelector("[data-video-frame] .media-controls")).opacity==="1");assert.equal(await frame.locator(".media-controls").evaluate(element=>getComputedStyle(element).opacity),"1");await goto(p,"/personal/");const gallery=p.getByRole("region",{name:"Desk Pen images"});await gallery.focus();await p.keyboard.press("ArrowRight");await gallery.getByRole("group",{name:"2 of 6",exact:true}).waitFor({state:"visible"});await gallery.evaluate(element=>{document.activeElement.blur();element.removeAttribute("data-controls-revealed");});await gallery.locator("video").first().tap({position:{x:100,y:50}});assert.equal(await gallery.getAttribute("data-controls-revealed"),"true");await p.waitForFunction(()=>getComputedStyle(document.querySelector("#desk-pen .gallery-navigation")).opacity==="1");});}finally{await touch.close();}
  return checks;
}
