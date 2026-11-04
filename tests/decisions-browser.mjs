import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
export async function runDecisionRegressions(launch,baseURL,{artifacts}={}){
 await mkdir(artifacts,{recursive:true});const rows=[],browser=await launch();
 const check=async(name,fn)=>{try{await fn();rows.push({name,pass:true});}catch(e){rows.push({name,pass:false,error:e.stack});}};
 try{
 const c=await browser.newContext({viewport:{width:393,height:900},reducedMotion:'reduce'}),p=await c.newPage();
 for(const route of ['/','/personal/','/info/','/projects/ping/'])await check('Info-only disclosure and no consent controls: '+route,async()=>{
  await p.goto(baseURL+route);assert.equal(await p.locator('footer,.portfolio-privacy,[data-analytics-consent],[data-analytics-status]').count(),0);
  assert.equal(await p.locator('.portfolio-privacy-notice').count(),route==='/info/'?1:0);
  if(route==='/info/'){assert.match(await p.locator('.portfolio-privacy-notice').innerText(),/Google Analytics.*Microsoft Clarity.*session recording/);assert.equal(await p.locator('.portfolio-privacy-notice a').count(),2);}
 });
 for(const width of [393,1440])await check('404 centered: '+width,async()=>{
  await p.setViewportSize({width,height:900});await p.goto(baseURL+'/missing/');const r=await p.locator('.portfolio-not-found').boundingBox(),h=await p.locator('header').boundingBox();assert.ok(Math.abs(r.x+r.width/2-width/2)<2);assert.ok(Math.abs(r.y+r.height/2-(900+h.height)/2)<2);
 });
 await check('player About contains licences without an external caption link',async()=>{
  await p.goto(baseURL+'/personal/');await p.locator('#original-tracks').scrollIntoViewIfNeeded();await p.locator('.tracks-stage[data-ready=true]').waitFor();
  const player=p.locator('original-tracks-player');await player.evaluate(e=>{e.view={type:'about',index:0};e.render();});
  assert.equal(await player.getByRole('link',{name:'Licences'}).count(),1);assert.equal(await p.locator('#original-tracks .tracks-caption a').count(),0);assert.equal(await player.getByRole('link',{name:'Licences'}).isVisible(),true);
 });
 await check('video failures preserve their poster and expose Try video again',async()=>{
  await p.goto(baseURL+'/personal/');const frame=p.locator('#p041-telefoni [data-video-frame]');await frame.scrollIntoViewIfNeeded();
  await frame.locator('video').evaluate(v=>{Object.defineProperty(v,'networkState',{value:3,configurable:true});v.dispatchEvent(new Event('error'));});
  await frame.locator('[data-video-status]:not([hidden])').waitFor();assert.ok(await frame.locator('video').getAttribute('poster'));assert.equal(await frame.getByRole('button',{name:/Try video again/}).isVisible(),true);
 });
 await c.close();
 await check('failed music enhancement keeps the poster and recovery links below it',async()=>{
  const c=await browser.newContext({viewport:{width:393,height:900}});await c.route('**/assets/original-tracks/boot.js*',route=>route.abort());const p=await c.newPage();
  try{await p.goto(baseURL+'/personal/');await p.locator('#original-tracks').scrollIntoViewIfNeeded();await p.locator('.tracks-error').waitFor();assert.equal(await p.locator('.tracks-poster img').isVisible(),true);assert.equal(await p.locator('.tracks-error .tracks-file-links a').count(),3);const poster=await p.locator('.tracks-stage').boundingBox(),error=await p.locator('.tracks-error').boundingBox();assert.ok(error.y>=poster.y+poster.height);await p.screenshot({path:artifacts+'/player-failure.png'});}finally{await c.close();}
 });
 }finally{await browser.close();await writeFile(artifacts+'/results.json',JSON.stringify(rows,null,2));}
 return rows;
}
