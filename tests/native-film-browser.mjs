import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {join} from "node:path";

export async function configureTelefoniCodecFixture(page, video, baseURL) {
  const h264=await page.evaluate(()=>Boolean(document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"')));
  if(h264)return {h264:true,fixtureUsed:false,actualTelefoniPlayback:true};
  // This is a playback-UI fixture only. The immutable export and the original
  // MP4 sources are checked before substitution; no media file is rewritten.
  // Native H.264 decoding of the actual Telefoni film remains an owner check.
  await video.locator('source').first().evaluate((source,url)=>{
    source.src=url;source.dataset.src=url;source.type='video/webm';source.parentElement.load();
  },baseURL+'/assets/hyphae/media/film-web.webm');
  return {h264:false,fixtureUsed:true,fixture:'existing Hyphae WebM film in the cleared export',actualTelefoniPlayback:false};
}

export async function runNativeFilmRegressions(browser,baseURL,{artifacts}={}) {
  const results=[],origin=new URL(baseURL).origin;
  if(artifacts)await mkdir(artifacts,{recursive:true});
  for(const reducedMotion of ['no-preference','reduce'])for(const film of ['hyphae','telefoni']){
    const name=`phone ${film}: first Play tap and native Play resume, twice, motion=${reducedMotion}`;
    const context=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,reducedMotion});
    context.setDefaultTimeout(10000);
    await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
    const page=await context.newPage(),mediaRequests=[],attempts=[];
    page.on('request',request=>{if(/\.(mp4|webm)(?:[?#]|$)/.test(request.url()))mediaRequests.push(request.url());});
    try{
      for(const attempt of [1,2]){
        // Re-enter through a fresh document even when the target has a hash.
        // A same-hash goto may otherwise retain the previous codec fixture.
        await page.goto('about:blank');
        mediaRequests.length=0;
        await page.goto(baseURL+(film==='hyphae'?'/projects/hyphae/':'/personal/#p041-telefoni'));
        await page.evaluate(()=>document.fonts.ready);
        if(film==='telefoni')await page.waitForFunction(()=>document.querySelector('[data-personal-ready]')?.dataset.personalReady==='true');
        const frame=page.locator(film==='hyphae'?'.case-film [data-video-frame]':'#p041-telefoni [data-video-frame]'),video=frame.locator('video'),start=frame.locator('[data-native-film-play]');
        await video.scrollIntoViewIfNeeded();await page.waitForTimeout(150);
        const originalSources=await video.locator('source').evaluateAll(items=>items.map(item=>({src:item.getAttribute('src'),deferred:item.dataset.src,type:item.type})));
        assert.ok(originalSources.every(source=>source.src&&source.src===source.deferred));
        assert.equal(originalSources[0].type,'video/mp4');
        if(film==='hyphae')assert.equal(originalSources[1].type,'video/webm');
        assert.equal(await video.evaluate(video=>video.controls),false,'Native controls must not obscure the opening title at rest');
        assert.equal(await video.evaluate(video=>video.paused),true);assert.equal(await video.getAttribute('preload'),'none');
        assert.equal(await start.isVisible(),true);
        const box=await video.boundingBox(),playBox=await start.boundingBox();
        assert.ok(playBox.y+playBox.height<box.y+box.height-44,'Poster Play must stay above the burned-in title/control band');
        assert.deepEqual(mediaRequests.filter(url=>originalSources.some(source=>new URL(source.src,page.url()).href===url)),[],'No target-film transfer before demand');
        const codec=film==='telefoni'?await configureTelefoniCodecFixture(page,video,baseURL):{fixtureUsed:false,actualHyphaePlayback:true};
        if(artifacts&&attempt===1)await frame.screenshot({path:join(artifacts,`${film}-${reducedMotion}-phone-rest.png`)});
        await start.tap();
        await video.evaluate(video=>new Promise((resolve,reject)=>{
          const started=()=>{if(!video.paused&&video.readyState>=2&&video.currentTime>.15){clearTimeout(timer);video.removeEventListener('timeupdate',started);resolve();}};
          const timer=setTimeout(()=>{video.removeEventListener('timeupdate',started);reject(Error(JSON.stringify({paused:video.paused,ready:video.readyState,time:video.currentTime,network:video.networkState,error:video.error?.message})));},8000);
          video.addEventListener('timeupdate',started);started();
        }));
        assert.equal(await video.evaluate(video=>video.controls),true);assert.equal(await start.isVisible(),false);
        const state=()=>video.evaluate(video=>({time:video.currentTime,paused:video.paused,ready:video.readyState,src:video.currentSrc,controls:video.controls}));
        const firstTap=await state();
        const outcome={attempt,originalSources,codec,firstTap};attempts.push(outcome);
        if(artifacts&&attempt===1)await frame.screenshot({path:join(artifacts,`${film}-${codec.fixtureUsed?'fixture-':''}${reducedMotion}-phone-after-tap.png`)});
        // A playing native bar may auto-hide. Pause as test setup so its Play
        // glyph is visible, then tap that actual UA shadow control once. This
        // must not depend on any preceding page pointer event or source load.
        await video.evaluate(video=>video.pause());await page.waitForTimeout(150);
        await video.evaluate(video=>{video.nativePointerEvents=0;video.addEventListener('pointerdown',()=>video.nativePointerEvents++);});
        const nativeBox=await video.boundingBox();
        const paused=await state();
        await page.touchscreen.tap(nativeBox.x+24,nativeBox.y+nativeBox.height-50);
        await page.waitForFunction(({selector,time})=>{const video=document.querySelector(selector);return video&&!video.paused&&video.readyState>=2&&video.currentTime>time+.15;},{selector:film==='hyphae'?'.case-film video':'#p041-telefoni video',time:paused.time});
        outcome.pauseSetup='programmatic pause; native Play glyph resumes';outcome.nativeResume=await state();
        outcome.nativeResumePagePointerEvents=await video.evaluate(video=>video.nativePointerEvents);
      }
      results.push({device:'phone',name,pass:true,attempts});console.log(`phone PASS: ${name}`);
    }catch(error){results.push({device:'phone',name,pass:false,error:error.message.slice(0,2000),attempts});console.log(`phone FAIL: ${name}: ${error.message.slice(0,300)}`);if(artifacts)await page.screenshot({path:join(artifacts,`${film}-${reducedMotion}-native-failure.png`)}).catch(()=>{});}
    finally{await context.close();}
  }
  return results;
}
