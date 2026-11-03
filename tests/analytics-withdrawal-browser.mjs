import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const provider=host=>/(?:^|\.)(?:google-analytics\.com|analytics\.google\.com|googletagmanager\.com|google\.com|g\.doubleclick\.net|clarity\.ms|bing\.com)$/.test(host);
function sdk(type){return `(()=>{
 const type=${JSON.stringify(type)},ga=type!=='clarity',q=ga?(window.dataLayer||[]):(window.clarity?.q||[]);
 const saved={fetch:fetch.bind(window),beacon:navigator.sendBeacon.bind(navigator),XHR:XMLHttpRequest,Image,create:document.createElement.bind(document)};
 window.__sdk=window.__sdk||{};let allowed=[...q].some(a=>a[0]==='consent'&&a[2]?.analytics_storage==='granted'||a[0]==='consentv2'&&a[1]?.analytics_Storage==='granted');
 function send(phase){const query='?fixture='+type+'&phase='+phase;const base=ga?'https://www.google-analytics.com':'https://z.clarity.ms';
  saved.fetch(base+'/fetch'+query,{method:'POST',body:'synthetic',keepalive:true}).catch(()=>{});
  try{saved.beacon(base+'/beacon'+query,'synthetic');}catch{}
  try{const x=new saved.XHR();x.open('POST','https://www.google.com/xhr'+query);x.send('synthetic');}catch{}
  try{const image=new saved.Image();image.src='https://c.bing.com/pixel'+query;}catch{}
  try{const script=saved.create('script');script.src='https://www.googletagmanager.com/probe.js'+query;document.head.append(script);}catch{}
 }
 const fn=(...a)=>{if(a[0]==='consent'&&a[2]?.analytics_storage==='denied'||a[0]==='consentv2'&&a[1]?.analytics_Storage==='denied'){allowed=false;window.__denials=window.__denials||[];window.__denials.push(type);send('denial');}};
 if(ga)window.gtag=fn;else window.clarity=fn;
 window.__sdk[type]={send,queue:q};
 if(allowed){document.cookie=(ga?'_ga_fixture':'_clck')+'=synthetic; path=/';document.cookie='_ga_path_fixture=synthetic; path=/personal';localStorage.setItem('clarity:fixture','synthetic');sessionStorage.setItem('_cltk','synthetic');}
 send('loaded');setInterval(()=>send('timer'),70);
 addEventListener('beforeunload',()=>send('beforeunload'));addEventListener('pagehide',()=>{send('pagehide');try{document.cookie='_ga_unload_fixture=synthetic; path=/';}catch{}});
 if(type==='ga'&&window===top){const f=document.createElement('iframe');f.dataset.providerProbeFrame='';document.body.append(f);const s=f.contentDocument.createElement('script');s.src='https://www.googletagmanager.com/child-fixture.js';f.contentDocument.head.append(s);}
})();`;}
const cases=['mid-clarity','mid-google','loaded','other-tab','storage-clear','stale-grant','storage-failure','all-writes-fail'];

// Launch a fresh browser per case to bound media-cache memory on the test host.
export async function runAnalyticsWithdrawalRegressions(launch,baseURL,{artifacts:out,only}={}){
if(!out)throw Error('An evidence directory is required');await mkdir(out,{recursive:true});
const results=[];let engineName;
try {for(const name of cases.filter(n=>!only||n===only)){
 const browser=await launch();const engine=browser.browserType().name();engineName=engine;
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:393,height:852}});
 const hits=[],held=[];let hold=true,denyPhase=false,dialogs=0;
 const report={engine,name,pass:false,checks:[],hits:[],blockedAttempts:[],errors:[]};
 await context.addInitScript(()=>{
  window.__idle=[];window.requestIdleCallback=fn=>{window.__idle.push(fn);return window.__idle.length;};window.cancelIdleCallback=id=>{window.__idle[id-1]=null;};window.__runIdle=()=>{const jobs=window.__idle.splice(0);for(const f of jobs)f?.();};
  if(location.protocol==='https:')addEventListener('beforeunload',event=>{event.preventDefault();event.returnValue='';});
  document.addEventListener('securitypolicyviolation',event=>{window.__blocked=window.__blocked||[];window.__blocked.push({directive:event.effectiveDirective,url:event.blockedURI});});
 });
 await context.route('https://**/*',async route=>{
  const url=new URL(route.request().url());if(!provider(url.hostname))return route.continue();
  hits.push({host:url.hostname,path:url.pathname,query:url.search,after:denyPhase});
  let body='/* intercepted provider transport */';
  if(url.pathname==='/gtag/js')body=sdk('ga');else if(url.pathname.startsWith('/tag/'))body=sdk('clarity');else if(url.pathname==='/child-fixture.js')body=sdk('child');
  if(hold&&((name==='mid-clarity'&&url.pathname.startsWith('/tag/'))||(name==='mid-google'&&url.pathname==='/gtag/js'))){await new Promise(resolve=>held.push(resolve));}
  await route.fulfill({status:200,contentType:'application/javascript',headers:{'Access-Control-Allow-Origin':'*'},body}).catch(()=>{});
 });
 const pages=[];let control;
 const page=await context.newPage();pages.push(page);
 const watch=p=>{p.setDefaultNavigationTimeout(90000);p.on('dialog',async d=>{dialogs++;await d.dismiss();});p.on('pageerror',e=>report.errors.push(e.message));};watch(page);
 try {
  await page.goto(baseURL+'/personal/');await page.waitForFunction(()=>document.querySelector('[data-personal-ready]')?.dataset.personalReady==='true');
  await page.evaluate(()=>{document.cookie='portfolio-canary=synthetic; path=/';localStorage.setItem('portfolio-preference','synthetic');sessionStorage.setItem('portfolio:navigation','synthetic');});
  assert.equal(hits.length,0);report.checks.push('default denied: zero provider requests');
  await page.locator('summary').click();await page.locator('[data-analytics-consent]').check();assert.equal(hits.length,0);await page.evaluate(()=>window.__runIdle());
  await page.waitForTimeout(500);
  assert.ok(hits.some(h=>h.path==='/gtag/js')&&hits.some(h=>h.path.startsWith('/tag/')));report.checks.push('grant and idle insert both real-domain loaders');
  if(!name.startsWith('mid-'))await page.waitForFunction(()=>window.__sdk?.ga&&window.__sdk?.clarity);
  if(name==='other-tab'){
   const second=await context.newPage();watch(second);pages.push(second);await second.goto(baseURL+'/personal/');await second.evaluate(()=>window.__runIdle());await second.waitForFunction(()=>window.__sdk?.ga&&window.__sdk?.clarity);
  }
  if(name==='storage-clear'){control=await context.newPage();await control.goto(baseURL+'/404.html');}
  for(const p of pages)await p.evaluate(()=>{window.__oldGoogleQueue=window.dataLayer;window.__oldClarityQueue=window.clarity?.q;sessionStorage.setItem('portfolio:navigation','synthetic');});
  for(const p of pages)await p.evaluate(async()=>{
   for(const name of ['clarity-fixture','portfolio-original-files'])await new Promise((resolve,reject)=>{const request=indexedDB.open(name,1);request.onupgradeneeded=()=>request.result.createObjectStore('canary');request.onerror=()=>reject(request.error);request.onsuccess=()=>{request.result.close();resolve();};});
  });
  if(name==='storage-failure')await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(this===localStorage&&k==='portfolio:analytics-consent:v1'&&v==='denied')throw new DOMException('fixture write failure');return original.call(this,k,v);};});
  if(name==='all-writes-fail')await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='portfolio:analytics-revoked:v1'||k==='portfolio:analytics-consent:v1'&&v==='denied')throw new DOMException('fixture write failure');return original.call(this,k,v);};const native=Object.getOwnPropertyDescriptor(Document.prototype,'cookie');Object.defineProperty(document,'cookie',{configurable:true,get:()=>native.get.call(document),set:()=>{throw new DOMException('fixture cookie write failure');}});});
  const actor=control||pages.at(-1);
  if(name==='storage-clear')await actor.evaluate(()=>localStorage.clear());
  else {if(pages.length>1)await actor.locator('summary').click();await actor.locator('[data-analytics-consent]').uncheck({timeout:10000});}
  for(const p of pages)await p.waitForFunction(()=>!!document.querySelector('[data-analytics-stop]'));
  denyPhase=true;
  hold=false;for(const resolve of held)resolve();
  for(const p of pages){
   assert.equal(await p.evaluate(()=>window.__oldGoogleQueue?.length||0),0);assert.equal(await p.evaluate(()=>window.__oldClarityQueue?.length||0),0);
   if(!name.startsWith('mid-'))assert.ok((await p.evaluate(()=>window.__denials||[])).includes('ga')&&(await p.evaluate(()=>window.__denials||[])).includes('clarity'));
   await p.evaluate(()=>{for(const v of Object.values(window.__sdk||{}))v.send('manual-after');for(const f of document.querySelectorAll('iframe'))try{for(const v of Object.values(f.contentWindow.__sdk||{}))v.send('child-after');}catch{};window.__runIdle();});
  }
  if(name==='stale-grant')await page.evaluate(()=>dispatchEvent(new StorageEvent('storage',{key:'portfolio:analytics-consent:v1',newValue:'granted'})));
  await page.waitForTimeout(400);
  assert.equal(hits.filter(h=>h.after).length,0,JSON.stringify(hits.filter(h=>h.after)));
  assert.equal(hits.filter(h=>h.query.includes('phase=denial')||h.query.includes('phase=beforeunload')||h.query.includes('phase=pagehide')).length,0,'denial/unload attempts must be blocked too');
  assert.ok(dialogs>0,'old provider document kept alive by canceling real beforeunload');
  report.checks.push('cached fetch/XHR/beacon/Image/script calls fenced while old document remains alive','pending grants and starts invalidated','same shutdown for local and storage withdrawal');
  for(const p of pages){
   const snap=await p.evaluate(()=>({cookies:document.cookie.split(';').map(c=>c.split('=')[0].trim()).filter(n=>/^_(ga|cl)/.test(n)),local:localStorage.getItem('clarity:fixture'),session:sessionStorage.getItem('_cltk'),preference:localStorage.getItem('portfolio-preference'),navigation:sessionStorage.getItem('portfolio:navigation'),blocked:window.__blocked||[]}));
   if(name!=='all-writes-fail')assert.deepEqual(snap.cookies,[]);assert.equal(snap.local,null);assert.equal(snap.session,null);if(name!=='storage-clear'){assert.equal(snap.preference,'synthetic');assert.equal(snap.navigation,'synthetic');}report.blockedAttempts.push(...snap.blocked);
   await p.waitForFunction(async()=>{const names=(await indexedDB.databases()).map(db=>db.name);return !names.includes('clarity-fixture')&&names.includes('portfolio-original-files');});
   p.removeAllListeners('dialog');p.on('dialog',d=>d.accept());await p.reload({waitUntil:'load'});await p.waitForTimeout(250);await p.evaluate(()=>window.__runIdle());await p.waitForTimeout(150);
   assert.equal(await p.locator('script[src^="https://"]').count(),0);assert.equal(await p.locator('[data-analytics-consent]').isChecked(),false);
   assert.deepEqual(await p.evaluate(()=>document.cookie.split(';').map(c=>c.split('=')[0].trim()).filter(n=>/^_(ga|cl)/.test(n))),[],'unload-created cookies cleared by denied startup');
  }
  assert.equal(hits.filter(h=>h.after).length,0);report.checks.push('provider cookies/local/session/IndexedDB cleared; unrelated state preserved','real reload: zero provider scripts or requests');
  if(name==='loaded'){denyPhase=false;await page.locator('summary').click();await page.locator('[data-analytics-consent]').check();await page.evaluate(()=>window.__runIdle());await page.waitForFunction(()=>window.__sdk?.ga&&window.__sdk?.clarity);report.checks.push('explicit reconsent restores legitimate provider startup');}
  report.pass=true;
 }catch(error){report.error=error.stack;report.url=page.url();report.dialogs=dialogs;}
 finally{for(const resolve of held)resolve();report.hits=hits;await context.close();await browser.close();await writeFile(`${out}/consent-${engine}-${name}.json`,JSON.stringify(report,null,2));results.push(report);console.log(JSON.stringify({engine,name,pass:report.pass,checks:report.checks,error:report.error?.slice(0,700)}));}
}}finally{await writeFile(`${out}/consent-${engineName}-summary.json`,JSON.stringify(results.map(r=>({name:r.name,pass:r.pass,error:r.error})),null,2));}
return results;

}
