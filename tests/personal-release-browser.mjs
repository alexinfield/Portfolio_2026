import {mkdir,writeFile} from 'node:fs/promises';
import {paintCards,fullPageCapture} from './personal-capture.mjs';
// Fresh browser per case bounds caches and keeps before-Play request checks cold.
export async function runPersonalReleaseRegressions(launch,baseURL,{artifacts,engine,captureOnly=false,widths=[393,1024,1440]}={}){
 if(!artifacts||!engine)throw Error('artifacts and engine are required');
 const out=artifacts,capture=captureOnly,rows=[],server={origin:baseURL};await mkdir(out,{recursive:true});
function geometry(){const root=document.querySelector('.personal-masonry'),rr=root.getBoundingClientRect();return {root:{width:rr.width,height:rr.height,top:rr.top+scrollY},cards:[...root.children].map(e=>{const r=e.getBoundingClientRect(),media=e.querySelector('.ac-carousel-viewport,.portfolio-image'),m=media.getBoundingClientRect(),text=e.querySelector('h2').getBoundingClientRect();return {id:e.id,x:r.x,y:r.y+scrollY,w:r.width,h:r.height,b:r.bottom+scrollY,mediaH:m.height,mediaW:m.width,captionTop:text.top+scrollY,mediaBottom:m.bottom+scrollY,aspect:Number(e.dataset.frameAspect)};})};}
function gridOK(g,width){const groups=new Map();for(const e of g.cards){const x=Math.round(e.x*10)/10;const group=groups.get(x)||[];group.push(e);groups.set(x,group);}const count=width<768?1:width<1200?2:3;if(groups.size!==count)return {ok:false,why:'column count',groups:[...groups.keys()]};let okay=true;const values=[...groups].sort((a,b)=>a[0]-b[0]);for(let k=0;k<values.length;k++){const [x,cards]=values[k];cards.sort((a,b)=>a.y-b.y);okay&&=Math.abs(cards[0].y-g.root.top)<1;for(let i=1;i<cards.length;i++)okay&&=Math.abs(cards[i].y-cards[i-1].b-20)<1;for(const card of cards)okay&&=Math.abs(card.w-values[0][1][0].w)<1;if(k)okay&&=Math.abs(x-values[k-1][0]-values[k-1][1][0].w-20)<1;}okay&&=Math.abs(Math.max(...g.cards.map(c=>c.b))-g.root.top-g.root.height)<1;return {ok:okay,columns:values.map(([x,c])=>({x,ids:c.map(e=>e.id),bottom:c.at(-1).b}))};}
try{for(const width of widths)for(const theme of ['light','dark'])for(const motion of capture?['reduce']:['no-preference','reduce']){
 const tag=`${engine}-${width}-${theme}-${motion}`,checks=[],requests=[],errors=[];const b=await launch(),c=await b.newContext({ignoreHTTPSErrors:true,viewport:{width,height:900},colorScheme:theme,reducedMotion:motion,deviceScaleFactor:1,hasTouch:width===393,isMobile:width===393,recordVideo:!capture&&tag==='chromium-393-dark-no-preference'?{dir:out+'/clips',size:{width:393,height:900}}:undefined}),p=await c.newPage();
 const startedAt=Date.now(),videoTimes={};const check=(name,ok,data)=>{checks.push({name,pass:!!ok,...(data===undefined?{}:{data})});if(!ok)console.log('FAIL '+tag+' '+name+' '+JSON.stringify(data));};
 p.on('request',r=>requests.push(r.url()));p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(/hydration|Minified React error/i.test(m.text()))errors.push(m.text());});
 await p.addInitScript(()=>{window.__shifts=[];window.__csp=[];window.__clsSupported=PerformanceObserver.supportedEntryTypes?.includes('layout-shift')??false;try{if(window.__clsSupported)new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__shifts.push({value:e.value,sources:e.sources?.map(s=>s.node?.id||s.node?.className)});}).observe({type:'layout-shift',buffered:true});}catch{}document.addEventListener('securitypolicyviolation',e=>window.__csp.push({directive:e.effectiveDirective,blocked:e.blockedURI}));});
 try{
  await p.goto(server.origin+'/personal/',{waitUntil:'load',timeout:120000});await p.locator('.ac-carousel-viewport[data-enhanced]').first().waitFor({timeout:60000});await p.waitForTimeout(300);
  check('no audio request on page load',!requests.some(u=>/\.m4a(?:[?#]|$)/.test(u)));
  check('no horizontal overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const initial=await p.evaluate(geometry);check('reserved natural media ratios',initial.cards.every(e=>Math.abs(e.mediaW/e.mediaH-e.aspect)<.01),initial.cards.map(({id,aspect,mediaW,mediaH})=>({id,aspect,mediaW,mediaH})));
  check('titles below media',initial.cards.every(e=>Math.abs(e.captionTop-e.mediaBottom)<1));
  check('balanced top-aligned columns with 20 px gutters and no internal holes',gridOK(initial,width).ok,gridOK(initial,width));
  check('all caption lines fit their columns',await p.locator('.personal-description span').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth)));
  check('native film controls retained',await p.locator('[data-film-quick-controls]').count()>0&&await p.locator('video source:not([src])').count()===0);
  check('only the fifteen collection cards remain',await p.locator('.personal-masonry > .masonry-card').count()===15);
  if(!capture){
   const carousel=p.locator('[data-slot=carousel]').filter({has:p.locator('[data-slot=carousel-slide][aria-label^="3 of"]')}).first();await carousel.scrollIntoViewIfNeeded();await carousel.locator('.ac-carousel-viewport[data-enhanced]').waitFor();await p.waitForTimeout(150);
   const before=await p.evaluate(geometry),next=carousel.getByRole('button',{name:/Next image for/});await next.focus();await next.click({force:true});await p.waitForTimeout(450);
   check('carousel next advances',/^2 of/.test(await carousel.locator('.ac-carousel-sr').innerText()));
   const frame=await carousel.locator('.ac-carousel-viewport').boundingBox(),y=frame.y+Math.min(frame.height*.4,300);
   videoTimes.swipe=(Date.now()-startedAt)/1000;if(engine==='chromium'&&width===393){const d=await c.newCDPSession(p);await d.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:frame.x+frame.width*.8,y}]});for(let i=1;i<=12;i++){await d.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:frame.x+frame.width*(.8-.6*i/12),y}]});await p.waitForTimeout(20);}await d.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await d.detach();}
   else{await p.mouse.move(frame.x+frame.width*.8,y);await p.mouse.down();await p.mouse.move(frame.x+frame.width*.2,y,{steps:15});await p.mouse.up();}await p.waitForTimeout(450);
   check('carousel swipe advances',/^3 of/.test(await carousel.locator('.ac-carousel-sr').innerText()));
   const after=await p.evaluate(geometry);check('swiping never changes card or neighbour geometry',before.cards.every((e,i)=>Math.abs(e.y-after.cards[i].y)<.2&&Math.abs(e.h-after.cards[i].h)<.2));
   check('carousel gap stays zero',await carousel.evaluate(e=>{const r=[...e.querySelectorAll('[data-slot=carousel-slide]')].map(n=>n.getBoundingClientRect());return r.length<2||Math.abs(r[1].left-r[0].right)<.5;}));
   const dots=await carousel.locator('.ac-carousel-dots').evaluate(e=>{const w=e.querySelector(':scope > div').getBoundingClientRect();return [...e.querySelectorAll('button')].filter(b=>b.tabIndex>=0).every(b=>{const r=b.getBoundingClientRect();return r.left>=w.left-.5&&r.right<=w.right+.5;});});check('pagination dots fit their window',dots);
  }
  check('no audio or player requests after carousel interaction',!requests.some(u=>/original-tracks|\.m4a(?:[?#]|$)/.test(u)));
  check('no CSP violation',!(await p.evaluate(()=>window.__csp)).length,await p.evaluate(()=>window.__csp));
  check('no JavaScript or hydration error',errors.length===0,errors);
  check('CLS is zero where measurable; geometry is stable in both engines',await p.evaluate(()=>!window.__clsSupported||window.__shifts.reduce((a,e)=>a+e.value,0)===0),await p.evaluate(()=>({supported:window.__clsSupported,shifts:window.__clsSupported?window.__shifts:null})));
  await paintCards(p);if(capture)await fullPageCapture(p,out+'/'+tag+'-personal.png');else await p.screenshot({path:out+'/'+tag+'-personal.png'});
  await writeFile(out+'/'+tag+'-geometry.json',JSON.stringify(await p.evaluate(geometry),null,2));
 }catch(e){check('runner completed',false,e.stack);check('captured JavaScript errors',errors.length===0,errors);await p.screenshot({path:out+'/'+tag+'-error.png',fullPage:false}).catch(()=>{});}finally{const video=p.video();await c.close();if(video){await video.saveAs(out+'/play-and-swipe.webm');await writeFile(out+'/video-times.json',JSON.stringify(videoTimes));}await b.close();rows.push({tag,browserVersion:b.version(),checks,pass:checks.every(e=>e.pass)});console.log(JSON.stringify({tag,checks:checks.length,failures:checks.filter(e=>!e.pass)}));}
}
if(!capture)for(const width of widths){
 const b=await launch(),c=await b.newContext({ignoreHTTPSErrors:true,javaScriptEnabled:false,viewport:{width,height:900}}),p=await c.newPage(),checks=[];try{await p.goto(server.origin+'/personal/');const g=await p.evaluate(geometry);checks.push({name:'no-JS natural columns and complete height',pass:gridOK(g,width).ok,data:gridOK(g,width)});checks.push({name:'no-JS complete collection',pass:await p.locator('.personal-masonry > .masonry-card').count()===15});const frames=p.locator('.ac-carousel-viewport');checks.push({name:'no-JS keyboard gallery focus',pass:await frames.first().getAttribute('tabindex')==='0'});const frame=frames.filter({has:p.locator('[data-slot=carousel-slide][aria-label^="3 of"]')}).first();await frame.focus();await p.keyboard.press('ArrowRight');await p.waitForTimeout(500);checks.push({name:'no-JS keyboard native scroll',pass:await frame.evaluate(e=>e.scrollLeft)>0});checks.push({name:'no-JS slides exposed',pass:await p.locator('[data-slot=carousel-slide][inert]').count()===0});await p.screenshot({path:out+`/${engine}-${width}-nojs.png`,fullPage:true});}catch(e){checks.push({name:'no-JS runner completed',pass:false,error:e.message});}finally{await c.close();await b.close();rows.push({tag:`${engine}-${width}-nojs`,checks,pass:checks.every(e=>e.pass)});console.log(JSON.stringify(rows.at(-1)));}
}
}finally{await writeFile(out+'/'+engine+'-results.json',JSON.stringify(rows,null,2));}
return rows;

}
