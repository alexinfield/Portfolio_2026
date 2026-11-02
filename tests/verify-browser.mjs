import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { hostname } from "node:os";
import { extname, join, resolve, sep } from "node:path";
import { runBrowserRegressions } from "./browser-regressions.mjs";

// This verifier never installs a package/browser and refuses Mac automation.
if(hostname()!=="infield")throw Error("Run headless verification on Infield only.");
const root=resolve(process.argv[2]),out=resolve(process.argv[3]);
const preview=process.argv[4]?resolve(process.argv[4]):null;
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PORTFOLIO_PLAYWRIGHT_MODULE);
const executablePath=process.env.PORTFOLIO_CHROMIUM_PATH;
await stat(executablePath);await mkdir(join(out,"screens"),{recursive:true});
const report={host:hostname(),time:new Date().toISOString(),captures:[],checks:[],weight:[]};
const save=()=>writeFile(join(out,"browser.json"),JSON.stringify(report,null,2)+"\n");
const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".png":"image/png",".avif":"image/avif",".gif":"image/gif",".svg":"image/svg+xml",".mp4":"video/mp4",".webm":"video/webm",".woff2":"font/woff2"};
const server=createServer(async(req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);}catch{res.writeHead(400).end();return;}
  const mounted=preview&&(pathname==="/next"||pathname.startsWith("/next/"));
  const base=mounted?preview:root;if(mounted)pathname=pathname.slice(5)||"/";
  let file=resolve(base,"."+pathname),status=200;
  if(!file.startsWith(base+sep)&&file!==base){res.writeHead(403).end();return;}
  try{if((await stat(file)).isDirectory())file=join(file,"index.html");if(!(await stat(file)).isFile())throw Error();}catch{file=join(base,"404.html");status=404;}
  const size=(await stat(file)).size,headers={"Content-Type":types[extname(file)]||"application/octet-stream","Cache-Control":"no-store","Accept-Ranges":"bytes"};
  const range=/bytes=(\d+)-(\d*)/.exec(req.headers.range||"");let start=0,end=size-1;
  if(range&&status===200){start=Number(range[1]);end=range[2]?Math.min(Number(range[2]),size-1):size-1;headers["Content-Range"]=`bytes ${start}-${end}/${size}`;status=206;}
  headers["Content-Length"]=Math.max(0,end-start+1);res.writeHead(status,headers);if(req.method==="HEAD"||size===0){res.end();return;}
  const stream=createReadStream(file,{start,end});stream.on("error",()=>res.destroy());res.on("close",()=>stream.destroy());stream.pipe(res);
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const baseURL=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath,headless:true,args:["--no-sandbox","--disable-gpu","--disable-background-networking"]});
report.browser=browser.version();
async function context(options={}){const context=await browser.newContext(options);await context.route(/https:\/\//,route=>route.abort());return context;}
try{
  const routes=[["home","/"],["personal","/personal/"],["info","/info/"],["ping","/projects/ping/"],["hyphae","/projects/hyphae/"]];
  if(!process.env.PORTFOLIO_SKIP_CAPTURES)for(const [device,viewport]of[["desktop",{width:1440,height:900}],["phone",{width:393,height:852}]])for(const[name,route]of routes){
    const c=await context({viewport,deviceScaleFactor:1,isMobile:device==="phone",hasTouch:device==="phone",reducedMotion:"reduce"});
    const page=await c.newPage(),errors=[],bad=[];
    page.on("pageerror",error=>errors.push(error.message));page.on("console",message=>{if(message.type()==="error"&&!/Failed to load resource|net::ERR_FAILED/.test(message.text()))errors.push(message.text());});
    page.on("response",response=>{if(response.status()>=400)bad.push({url:response.url(),status:response.status()});});
    const response=await page.goto(baseURL+route,{waitUntil:"load"});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(350);
    const stem=`${name}-${device}`;await page.screenshot({path:join(out,"screens",stem+"-viewport.png")});
    const initial=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,title:document.title,height:document.documentElement.scrollHeight,boundary:document.querySelector("[data-portfolio-boundary]").dataset.theme}));
    for(let i=0;i<90;i++){const end=await page.evaluate(()=>{scrollBy(0,innerHeight*.8);return scrollY+innerHeight>=document.documentElement.scrollHeight-2;});await page.waitForTimeout(55);if(end)break;}
    await page.waitForTimeout(200);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:join(out,"screens",stem+"-full.png"),fullPage:true});
    if(name==="hyphae"){const frame=page.locator(".case-film [data-video-frame]");await frame.scrollIntoViewIfNeeded();await frame.hover();await page.waitForFunction(()=>getComputedStyle(document.querySelector(".case-film .film-controls")).opacity==="1");await frame.screenshot({path:join(out,"screens",`hyphae-controls-${device}.png`)});}
    if(name==="personal")for(const id of["desk-pen","p019-neighborhood-cnc-relief-map-study"]){const card=page.locator(`#${id}`);await card.scrollIntoViewIfNeeded();await card.screenshot({path:join(out,"screens",`${id}-${device}.png`)});}
    report.captures.push({name,route,device,status:response.status(),initial,errors,bad});await save();console.log("capture",stem);await c.close();
  }
  report.checks.push(...await runBrowserRegressions(browser,baseURL));await save();
  if(preview){
    const c=await context({viewport:{width:393,height:852},reducedMotion:"reduce"});const p=await c.newPage(),errors=[],requests=[];p.on("pageerror",error=>errors.push(error.message));p.on("console",message=>{if(message.type()==="error"&&!/Failed to load resource|net::ERR_FAILED/.test(message.text()))errors.push(message.text());});p.on("request",request=>{if(request.url().startsWith(baseURL)&&!new URL(request.url()).pathname.startsWith("/next/"))requests.push(request.url());});
    for(const route of["/","/personal/","/info/","/projects/mode/","/missing/deep/"]){await p.goto(baseURL+"/next"+route);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(250);if(route==="/personal/"){await p.getByRole("combobox",{name:"Filter by year"}).click();await p.getByRole("option",{name:"2024",exact:true}).click();}report.checks.push({name:`/next route assets/chunks/filters: ${route}`,pass:errors.length===0&&requests.length===0,errors:[...errors],outsideMount:[...requests]});}
    await c.close();
  }
  if(!process.env.PORTFOLIO_SKIP_CAPTURES)for(const[name,route]of[["home","/"],["personal","/personal/"]]){
    const c=await context({viewport:{width:393,height:852},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage(),cdp=await c.newCDPSession(p),requests=new Map();await cdp.send("Network.enable");await cdp.send("Network.setCacheDisabled",{cacheDisabled:true});
    cdp.on("Network.requestWillBeSent",event=>requests.set(event.requestId,{url:event.request.url.replace(baseURL,""),type:event.type,dataBytes:0}));
    cdp.on("Network.dataReceived",event=>{const item=requests.get(event.requestId);if(item)item.dataBytes+=event.encodedDataLength;});
    cdp.on("Network.loadingFinished",event=>{const item=requests.get(event.requestId);if(item)item.finishedBytes=event.encodedDataLength;});
    const snap=()=>[...requests.values()].filter(item=>item.url.startsWith("/")).map(item=>({...item,bytes:item.finishedBytes??item.dataBytes}));
    await p.goto(baseURL+route);await p.waitForTimeout(4000);const initial=snap();
    const start=Date.now();let steps=0;while(steps<90&&Date.now()-start<25000){const end=await p.evaluate(()=>{scrollBy(0,innerHeight*.8);return scrollY+innerHeight>=document.documentElement.scrollHeight-2;});steps++;await p.waitForTimeout(100);if(end)break;}await p.waitForTimeout(2000);const scrolled=snap();
    report.weight.push({name,viewport:{width:393,height:852},dpr:1,initialBytes:initial.reduce((sum,item)=>sum+item.bytes,0),scrolledBytes:scrolled.reduce((sum,item)=>sum+item.bytes,0),initial,scrolled,steps});await save();await c.close();
  }
  const failures=report.checks.filter(check=>!check.pass);console.log(JSON.stringify({checks:report.checks.length,passed:report.checks.length-failures.length,failures,captures:report.captures.length,weight:report.weight.map(({name,initialBytes,scrolledBytes})=>({name,initialBytes,scrolledBytes}))},null,2));
  if(failures.length||report.captures.some(capture=>capture.errors.length||capture.bad.length))process.exitCode=1;
}finally{await browser.close();await new Promise(done=>server.close(done));await save();}
