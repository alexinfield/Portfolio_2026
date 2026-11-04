import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {join} from "node:path";

export async function runBrowserRegressions(browser,baseURL,{artifacts,include}={}) {
  const results=[];
  const origin=new URL(baseURL).origin;
  if(artifacts)await mkdir(artifacts,{recursive:true});
  for(const [device,viewport] of [["desktop",{width:1440,height:900}],["phone",{width:393,height:852}]]){
    const context=await browser.newContext({viewport,isMobile:device==="phone",hasTouch:device==="phone",reducedMotion:"no-preference"});
    context.setDefaultTimeout(8000);
    await context.route("**/*",route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
    const page=await context.newPage(),errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    page.on("console",message=>{if(message.type()==="error"&&!/Failed to load resource|net::ERR_FAILED/.test(message.text()))errors.push(message.text());});
    const goto=async route=>{await page.goto(baseURL+route,{waitUntil:"load"});await page.evaluate(()=>document.fonts.ready);if(route.startsWith("/personal"))await page.waitForFunction(()=>document.querySelector("[data-personal-ready]")?.dataset.personalReady==="true");};
    const check=async(name,action)=>{
      if(include&&!include.test(name))return;
      try{const detail=await action();results.push({device,name,pass:true,...(detail?{detail}:{})});console.log(`${device} PASS: ${name}`);}
      catch(error){results.push({device,name,pass:false,error:error.message.slice(0,1800)});console.log(`${device} FAIL: ${name}: ${error.message.slice(0,240)}`);if(artifacts)await page.screenshot({path:join(artifacts,`${device}-failure-${results.length}.png`)}).catch(()=>{});}
    };
    try{
      for(const path of ["/","/personal/","/projects/ping/","/info/"]){
        await check(`fixed production header and fixed palette after scroll: ${path}`,async()=>{
          await goto(path);
          const expected=path==="/personal/"?"light":"dark";
          assert.equal(await page.locator("html").getAttribute("data-theme"),expected);
          await page.evaluate(()=>scrollTo(0,600));
          const detail=await page.locator("header").evaluate(header=>{const s=getComputedStyle(header),r=header.getBoundingClientRect();return{position:s.position,top:r.top,bottom:r.bottom,z:s.zIndex,blur:s.backdropFilter||s.webkitBackdropFilter,background:s.backgroundColor,scrollY,maxScroll:document.documentElement.scrollHeight-innerHeight};});
          assert.equal(detail.position,"fixed");assert.equal(detail.top,0);assert.equal(detail.z,"100");assert.equal(detail.blur,"blur(24px)");
          assert.equal(detail.background,expected==="light"?"rgba(255, 255, 255, 0.8)":"rgba(0, 0, 0, 0.85)");
          return detail;
        });
      }
      await check("opening media is flush with the header on all six cases and Personal",async()=>{
        for(const slug of ["molekule-go","ping","hyphae","luma","mode","niche"]){
          await goto(`/projects/${slug}/`);
          const bottom=await page.locator("header").evaluate(element=>element.getBoundingClientRect().bottom);
          const top=await page.locator(".portfolio-case-stack .case-sequence,.portfolio-case-stack img:not(.ss img),.portfolio-case-stack video:not(.ss video)").first().evaluate(element=>element.getBoundingClientRect().top);
          assert.ok(Math.abs(top-bottom)<.6,`${slug}: ${top} vs ${bottom}`);
          assert.equal(await page.locator("h1").getAttribute("class"),"sr-only");
        }
        await goto("/personal/");
        const bounds=await page.evaluate(()=>({header:document.querySelector("header").getBoundingClientRect().bottom,first:document.querySelector(".portfolio-personal-front").getBoundingClientRect().top}));
        assert.ok(Math.abs(bounds.header-bounds.first)<.6);
      });
      await check("Professional discloses a lock through hover, keyboard focus and tap, without navigation",async()=>{
        await goto("/");
        const button=page.getByRole("button",{name:"Professional",exact:true}),tip=page.locator("#unavailable-status");let url=page.url();
        assert.equal(await button.getAttribute("aria-disabled"),"true");assert.equal(await button.evaluate(element=>element.disabled),false);
        if(device==="desktop"){
          await button.hover();await tip.waitFor({state:"visible"});assert.equal(await tip.locator("svg").count(),1);
          await button.click({force:true});assert.equal(await tip.isVisible(),true,'Click while hovered must pin the disclosure');
          await page.mouse.move(0,0);assert.equal(await tip.isVisible(),true);
          await page.keyboard.press("Escape");await tip.waitFor({state:"hidden"});
        }
        // Start keyboard traversal in a fresh document after the hover/click
        // probe; blur alone preserves the browser's sequential focus origin.
        await page.mouse.move(0,0);await goto('/?professional=keyboard');url=page.url();
        await page.keyboard.press("Tab");
        for(let i=0;i<8&&await button.evaluate(element=>element!==document.activeElement);i++)await page.keyboard.press("Tab");
        assert.ok(await button.evaluate(element=>element===document.activeElement));await tip.waitFor({state:"visible"});
        await page.keyboard.press("Escape");await tip.waitFor({state:"hidden"});
        await page.keyboard.press('Enter');await tip.waitFor({state:'visible'});
        await page.keyboard.press('Enter');await tip.waitFor({state:'hidden'});
        await page.keyboard.press(' ');await tip.waitFor({state:'visible'});
        await page.keyboard.press('Escape');await tip.waitFor({state:'hidden'});
        await page.evaluate(()=>document.activeElement?.blur());
        if(device==="phone")await button.tap({force:true});else {await button.hover();await page.keyboard.press("Escape");await button.click({force:true});}
        await tip.waitFor({state:"visible"});assert.equal(page.url(),url);assert.equal(await button.getAttribute("href"),null);
        if(device==='phone'){
          await button.tap({force:true});await tip.waitFor({state:'hidden'});
          await button.tap({force:true});await tip.waitFor({state:'visible'});
          const outside=await page.evaluate(()=>{const r=document.querySelector('header').getBoundingClientRect();for(const y of [r.bottom-2,r.height/2])for(let x=2;x<innerWidth-2;x+=4){const hit=document.elementFromPoint(x,y);if(hit&&!hit.closest('a,button,#unavailable-status'))return{x,y};}throw Error('No noninteractive header point');});
          await page.touchscreen.tap(outside.x,outside.y);await tip.waitFor({state:'hidden'});assert.equal(page.url(),url);
        }
        await page.keyboard.press("Escape");
      });
      await check("Personal has fifteen reserved natural frames, hidden filters and no permanent About labels",async()=>{
        await goto("/personal/");assert.equal(await page.locator("[data-personal-id]").count(),15);
        assert.equal(await page.getByRole("combobox").count(),0);assert.equal(await page.locator("main details,.portfolio-about-label").count(),0);
        const boxes=await page.locator('[data-personal-id]').evaluateAll(items=>items.map(item=>{const r=(item.querySelector('.ac-carousel-viewport')||item.querySelector('.portfolio-image')).getBoundingClientRect();return{w:r.width,h:r.height,aspect:Number(item.dataset.frameAspect)};}));
        assert.ok(boxes.every(box=>Math.abs(box.w/box.h-box.aspect)<.01),JSON.stringify(boxes));
        assert.equal(await page.locator('#original-tracks').count(),1);
      });
      await check("descriptions stay below media through hover, focus and Escape without covering controls",async()=>{
        await goto('/personal/');const card=page.locator('#desk-pen'),gallery=card.locator('.portfolio-gallery'),description=card.locator('.personal-description');await gallery.scrollIntoViewIfNeeded();await gallery.locator('.ac-carousel-viewport[data-enhanced]').waitFor();
        assert.equal(await gallery.locator('[data-gallery-description-toggle],.portfolio-description-strip').count(),0);assert.equal(await description.isVisible(),true);
        const position=()=>card.evaluate(e=>{const frame=e.querySelector('.ac-carousel-viewport').getBoundingClientRect(),text=e.querySelector('.personal-description').getBoundingClientRect();return{frameBottom:frame.bottom+scrollY,textTop:text.top+scrollY,height:e.getBoundingClientRect().height};});const before=await position();assert.ok(before.textTop>=before.frameBottom);
        if(device==='desktop')await gallery.hover();await gallery.locator('[data-slot=carousel]').focus();await page.keyboard.press('Escape');const after=await position();assert.equal(after.height,before.height);assert.equal(after.textTop,before.textTop);assert.equal(await description.isVisible(),true);
        if(artifacts)await card.screenshot({path:join(artifacts,`description-${device}.png`)});
      });
      await check("gallery keyboard, persistent pagination/live count and single-image navigation",async()=>{
        await goto("/personal/");const gallery=page.locator("#desk-pen .portfolio-gallery");await gallery.scrollIntoViewIfNeeded();await gallery.locator('.ac-carousel-viewport[data-enhanced]').waitFor();await gallery.locator('[data-slot=carousel]').focus();
        await page.keyboard.press("ArrowRight");await gallery.getByRole("group",{name:"2 of 6",exact:true}).waitFor({state:"visible"});assert.equal(await gallery.locator(".ac-carousel-sr").textContent(),"2 of 6");
        await page.keyboard.press("Home");assert.equal(await gallery.locator(".ac-carousel-sr").textContent(),"1 of 6");
        assert.equal(await page.locator("#book [data-slot=carousel-controls],#book [data-slot=carousel-controls]").count(),0);
        await page.evaluate(()=>document.activeElement?.blur());await page.mouse.move(0,0);assert.equal(await gallery.locator("[data-slot=carousel-controls]").isVisible(),true);
      });
      if(device==="phone")await check("phone pointer swipe changes a slide; tap and vertical movement retain the slide and below-media text",async()=>{
        await goto("/personal/");const gallery=page.locator("#desk-pen .portfolio-gallery");await gallery.scrollIntoViewIfNeeded();
        await gallery.locator('.ac-carousel-viewport[data-enhanced]').waitFor();
        const box=await gallery.locator('.ac-carousel-viewport').boundingBox(),x=box.x+box.width*.8,y=box.y+box.height*.4;
        const session=browser.browserType().name()==='chromium'?await context.newCDPSession(page):null;
        async function gesture(dx,dy){if(session){await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=12;i++){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/12,y:y+dy*i/12}]});await page.waitForTimeout(25);}await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else{await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y+dy,{steps:12});await page.mouse.up();}await page.waitForTimeout(450);}
        await gesture(-box.width*.6,0);await gallery.getByRole('group',{name:'2 of 6',exact:true}).waitFor({state:'visible'});await page.touchscreen.tap(x,y);assert.equal(await gallery.locator('.ac-carousel-sr').textContent(),'2 of 6');await gesture(0,-70);assert.equal(await gallery.locator('.ac-carousel-sr').textContent(),'2 of 6');assert.equal(await page.locator('#desk-pen .personal-description').isVisible(),true);
        assert.equal(await gallery.locator('[data-pressed="true"]').count(),0);await session?.detach();
      });
      await check("Folio and Niche picture/caption links open their actual cases; Back restores Personal",async()=>{
        for(const [id,slug]of [['folio','mode'],['niche','niche']]){
          await goto('/personal/');const link=page.locator('#'+id+' a');
          if(device==='phone')await link.tap();else {await link.focus();await page.keyboard.press('Enter');}
          await page.waitForURL(baseURL+`/projects/${slug}/?from=personal`);
          const back=page.locator('[data-case-back]');assert.equal(new URL(await back.getAttribute('href'),page.url()).pathname,new URL(baseURL+'/personal/').pathname);
          await back.click();await page.waitForURL(baseURL+'/personal/');
        }
      });
      await check("Work entry, explicit alternate collection, deep-link fallbacks and history scroll restore",async()=>{
        await goto('/');await page.evaluate(()=>scrollTo(0,160));const before=await page.evaluate(()=>scrollY),entryCard=await page.getByRole('link',{name:'Ping',exact:true}).boundingBox();
        const x=entryCard.x+entryCard.width/2,y=Math.max(80,entryCard.y+entryCard.height/2);
        // A physical coordinate click preserves the user's scrolled position;
        // locator.click() would first scroll the whole partly visible card in.
        if(device==='phone')await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);
        await page.waitForURL(baseURL+'/projects/ping/?from=work');assert.equal(await page.evaluate(()=>history.state?.portfolioReturn?.scroll),before);
        await page.locator('[data-case-back]').click();await page.waitForURL(baseURL+'/');await page.waitForFunction(expected=>Math.abs(scrollY-expected)<3,before);
        for(const [route,target]of [['/projects/ping/','/'],['/projects/mode/','/personal/'],['/projects/ping/?from=personal','/personal/'],['/projects/niche/?from=work','/']]){
          await goto(route);assert.equal(new URL(await page.locator('[data-case-back]').getAttribute('href'),page.url()).pathname,new URL(baseURL+target).pathname);
        }
      });
      await check("press compression is restrained, release restores it, reduced motion prevents it",async()=>{
        await goto('/');const card=page.getByRole('link',{name:'Ping',exact:true});await card.scrollIntoViewIfNeeded();const box=await card.boundingBox();
        if(device==='phone' && browser.browserType().name()==='chromium'){
          const session=await context.newCDPSession(page);await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+30}]});await page.waitForTimeout(170);
          const matrix=await card.evaluate(element=>getComputedStyle(element).transform);assert.notEqual(matrix,'none');assert.ok(Number(matrix.match(/matrix\(([^,]+)/)?.[1])>.97,matrix);
          await session.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await session.detach();
        }else if(device==='phone'){
          // WebKit has no CDP touch driver. Exercise the real DOM pointer listener;
          // Chromium above retains native touch input, and real-phone acceptance stays separate.
          await card.dispatchEvent('pointerdown',{pointerType:'touch',pointerId:1,button:0,clientX:box.x+box.width/2,clientY:box.y+30,isPrimary:true});await page.waitForTimeout(170);
          const matrix=await card.evaluate(element=>getComputedStyle(element).transform);assert.notEqual(matrix,'none');assert.ok(Number(matrix.match(/matrix\(([^,]+)/)?.[1])>.97,matrix);
          await card.dispatchEvent('pointercancel',{pointerType:'touch',pointerId:1});
        }else{await page.mouse.move(box.x+box.width/2,box.y+30);await page.mouse.down();await page.waitForTimeout(170);const matrix=await card.evaluate(element=>getComputedStyle(element).transform);assert.notEqual(matrix,'none');assert.ok(Number(matrix.match(/matrix\(([^,]+)/)?.[1])>.97,matrix);await page.mouse.move(0,0);await page.mouse.up();}
        await page.waitForTimeout(250);assert.ok(await card.evaluate(element=>{const value=getComputedStyle(element).transform;return value==='none'||new DOMMatrix(value).isIdentity;}));
        await page.emulateMedia({reducedMotion:'reduce'});await card.focus();await page.mouse.move(box.x+box.width/2,box.y+30);await page.mouse.down();await page.waitForTimeout(150);assert.ok(await card.evaluate(element=>{const value=getComputedStyle(element).transform;return value==='none'||new DOMMatrix(value).isIdentity;}));await page.mouse.move(0,0);await page.mouse.up();await page.emulateMedia({reducedMotion:'no-preference'});
        return {touchDriver:device!=='phone'?'mouse':browser.browserType().name()==='chromium'?'native CDP touch':'DOM pointer events'};
      });
      await check("Hyphae uses native long-film controls on phone and Compass controls on desktop, with original MP4/WebM order",async()=>{
        await goto('/projects/hyphae/');const frame=page.locator('.case-film [data-video-frame]'),video=frame.locator('video');await frame.scrollIntoViewIfNeeded();
        assert.equal(await video.evaluate(video=>video.controls),false);assert.equal(await video.evaluate(video=>video.paused),true);
        const types=await video.locator('source').evaluateAll(items=>items.map(item=>item.type));assert.deepEqual(types,['video/mp4','video/webm']);
        if(device==='desktop'){
          await page.mouse.move(0,0);assert.equal(await frame.locator('.film-controls').evaluate(element=>getComputedStyle(element).opacity),'0');await frame.hover();
          await frame.locator('[data-video-toggle]').click();await page.waitForFunction(()=>{const video=document.querySelector('.case-film video');return video.readyState>=1&&!video.paused&&video.currentTime>.05;});
          await frame.locator('[data-video-toggle]').click();const slider=frame.getByRole('slider',{name:'Seek Hyphae Light film'});await slider.focus();await page.keyboard.press('End');assert.ok(await video.evaluate(video=>video.currentTime>video.duration-.5));await page.keyboard.press('Home');assert.ok(await video.evaluate(video=>video.currentTime<.5));
          await frame.getByRole('button',{name:'Mute Hyphae Light film',exact:true}).click();assert.equal(await video.evaluate(video=>video.muted),true);await frame.getByRole('button',{name:'Unmute Hyphae Light film',exact:true}).click();assert.equal(await video.evaluate(video=>video.muted),false);
          await frame.getByRole('button',{name:'Enter fullscreen: Hyphae Light film',exact:true}).click();await page.waitForFunction(()=>document.fullscreenElement!==null);await frame.getByRole('button',{name:'Exit fullscreen: Hyphae Light film',exact:true}).click();await page.waitForFunction(()=>document.fullscreenElement===null);
        }else{
          assert.equal(await frame.locator('.film-controls').evaluate(element=>getComputedStyle(element).display),'none');
          assert.equal(await frame.locator('[data-native-film-play]').isVisible(),true);
        }
        if(artifacts)await frame.screenshot({path:join(artifacts,`hyphae-controls-${device}.png`)});
        return {h264:await page.evaluate(()=>Boolean(document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"')))};
      });
      await check("Hyphae Process shows a decoded nonempty growth still under reduced motion",async()=>{
        await page.emulateMedia({reducedMotion:'reduce'});await goto('/projects/hyphae/');const video=page.locator('video[data-preview-time]'),frame=video.locator('..');await video.scrollIntoViewIfNeeded();
        await page.waitForFunction(()=>document.querySelector('video[data-preview-time]')?.closest('[data-video-frame]').dataset.previewReady==='true');
        assert.equal(await video.evaluate(video=>video.paused),true);assert.ok(await video.evaluate(video=>video.currentTime>=7.9));
        const range=await video.evaluate(video=>{const canvas=document.createElement('canvas');canvas.width=160;canvas.height=100;const c=canvas.getContext('2d');c.drawImage(video,0,0,160,100);const d=c.getImageData(0,0,160,100).data;let min=255,max=0,count=0;for(let i=0;i<d.length;i+=4){min=Math.min(min,d[i]);max=Math.max(max,d[i]);if(d[i]<180)count++;}return{min,max,darkPixels:count};});
        assert.ok(range.max-range.min>60&&range.darkPixels>30,JSON.stringify(range));if(artifacts)await frame.screenshot({path:join(artifacts,`hyphae-process-${device}.png`)});await page.emulateMedia({reducedMotion:'no-preference'});return range;
      });
      await check("Telefoni remains dormant with real preload-none sources and native control space reserved",async()=>{
        await goto('/personal/');const video=page.locator('#p041-telefoni video');await video.scrollIntoViewIfNeeded();await page.mouse.move(0,0);await page.waitForTimeout(150);
        const state=await video.evaluate(video=>({src:video.currentSrc,paused:video.paused,sources:[...video.querySelectorAll('source')].map(source=>source.getAttribute('src'))}));
        assert.equal(state.paused,true);assert.ok(state.sources.every(source=>source!==null));
        assert.equal(await video.getAttribute('preload'),'none');assert.equal(await video.evaluate(video=>video.controls),false);
        if(device==='phone'){
          const bounds=await page.evaluate(()=>{const video=document.querySelector('#p041-telefoni video'),v=video.getBoundingClientRect(),toggle=document.querySelector('#p041-telefoni [data-native-film-play]').getBoundingClientRect();return{toggleBottom:toggle.bottom,controlsTop:v.bottom-44,targetIsVideo:document.elementFromPoint(v.left+24,v.bottom-20)===video};});
          assert.ok(bounds.toggleBottom<=bounds.controlsTop+.5,JSON.stringify(bounds));assert.ok(bounds.targetIsVideo);
        }
      });
      await check("Info text group is centered on desktop, Contact stays secondary, 404 has one action",async()=>{
        await goto('/info/');const contact=page.getByRole('link',{name:'Contact',exact:true});assert.equal(await contact.getAttribute('href'),'mailto:alex@infield.net');assert.equal(await contact.getAttribute('data-variant'),'secondary');
        if(device==='desktop'){const alignment=await page.evaluate(()=>{const a=document.querySelector('.portfolio-info-copy').getBoundingClientRect(),b=document.querySelector('.portfolio-artwork').getBoundingClientRect();return Math.abs((a.top+a.bottom)/2-(b.top+b.bottom)/2);});assert.ok(alignment<1);}
        await goto('/404.html');assert.deepEqual(await page.locator('.portfolio-actions a').allTextContents(),['Work']);
      });
      await check("static export uses full-document navigation with the correct palette on arrival",async()=>{
        await goto('/');await page.evaluate(()=>{window.__documentSentinel='home';});await page.getByRole('link',{name:'Personal',exact:true}).click();await page.waitForURL(baseURL+'/personal/');
        const homeToPersonal=await page.evaluate(()=>({sentinel:window.__documentSentinel??null,palette:document.documentElement.dataset.theme,type:performance.getEntriesByType('navigation')[0].type}));
        assert.equal(homeToPersonal.sentinel,null);assert.equal(homeToPersonal.palette,'light');
        await page.evaluate(()=>{window.__documentSentinel='personal';});await page.getByRole('link',{name:'Info',exact:true}).click();await page.waitForURL(baseURL+'/info/');assert.equal(await page.evaluate(()=>window.__documentSentinel??null),null);assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');return homeToPersonal;
      });
      await check("200% text keeps the header visible through actual Info scrolling and keyboard targets in view",async()=>{
        await goto('/info/');await page.evaluate(()=>document.documentElement.style.fontSize='200%');await page.waitForTimeout(80);await page.evaluate(()=>scrollTo(0,800));
        const scroll=await page.evaluate(()=>({scrollY,header:document.querySelector('header').getBoundingClientRect().top,horizontal:document.documentElement.scrollWidth-innerWidth}));
        assert.equal(scroll.header,0);assert.ok(scroll.horizontal<=1);
        await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Skip to content');
        for(let i=0;i<5;i++){await page.keyboard.press('Tab');const focus=await page.evaluate(()=>{const r=document.activeElement.getBoundingClientRect(),s=getComputedStyle(document.activeElement);return{left:r.left,right:innerWidth-r.right,h:r.height,w:r.width,outline:s.outlineStyle};});assert.ok(focus.h>=44&&focus.w>=44&&focus.left>=2&&focus.right>=2,JSON.stringify(focus));assert.equal(focus.outline,'solid');}
        await page.evaluate(()=>document.documentElement.style.fontSize='');return scroll;
      });
      await check("no hydration or application errors",()=>assert.deepEqual(errors,[]));
    }finally{await context.close();}
  }
  return results;
}
