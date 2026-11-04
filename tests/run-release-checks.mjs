import {createRequire} from 'node:module';
import {resolve,join} from 'node:path';
import {mkdir,writeFile,stat} from 'node:fs/promises';
import {serveExport} from './static-fixture.mjs';
import {runAnalyticsWithdrawalRegressions} from './analytics-withdrawal-browser.mjs';
import {runPersonalReleaseRegressions} from './personal-release-browser.mjs';
import {runBrowserRegressions} from './browser-regressions.mjs';
import {runSequenceGapRegressions} from './sequence-gap-browser.mjs';
import {runDecisionRegressions} from './decisions-browser.mjs';
import {runExtendRegressions} from './extend-browser.mjs';

const options={};for(let i=2;i<process.argv.length;i++){const arg=process.argv[i];if(!arg.startsWith('--'))throw Error('Expected --option value');const [key,inline]=arg.slice(2).split('=',2);options[key]=inline??(process.argv[i+1]?.startsWith('--')?'true':process.argv[++i])??'true';}
if(!options.out)throw Error('Provide --out /absolute/path/in/Scratch; no artifacts are written into the repo');
const root=resolve(options.export||'gh-pages'),out=resolve(options.out),suite=options.suite||'all',engines=(options.engines||'chromium,webkit').split(',');
if(!['all','consent','personal','preserved','gaps','extend'].includes(suite))throw Error('Suite must be all, consent, personal, preserved, gaps or extend');
if(engines.some(e=>!['chromium','webkit'].includes(e)))throw Error('Only Chromium and WebKit are supported');
if(options.case&&!['mid-clarity','mid-google','loaded','other-tab','storage-clear','stale-grant','storage-failure','all-writes-fail'].includes(options.case))throw Error('Unknown consent case');
for(const name of ['index.html','personal/index.html','portfolio-runtime.js'])await stat(join(root,name));
let pw;try{pw=createRequire(import.meta.url)(process.env.PORTFOLIO_PLAYWRIGHT_MODULE||'playwright');}catch{throw Error('Use the existing bench Playwright install via PORTFOLIO_PLAYWRIGHT_MODULE; this runner never installs packages or browsers');}
await mkdir(out,{recursive:true});const server=await serveExport(root),report={suite,export:root,started:new Date().toISOString(),engines:{}},openBrowsers=new Set();let completed=false;
const save=()=>writeFile(join(out,'release-checks.json'),JSON.stringify(report,null,2)+'\n');
try{for(const engine of engines){
 const launch=async()=>{const executablePath=process.env[engine==='chromium'?'PORTFOLIO_CHROMIUM_PATH':'PORTFOLIO_WEBKIT_PATH'];const browser=await pw[engine].launch({headless:true,...(executablePath?{executablePath}:{}),...(engine==='chromium'&&process.platform==='linux'?{args:['--no-sandbox','--disk-cache-size=1048576']}: {})});openBrowsers.add(browser);browser.on('disconnected',()=>openBrowsers.delete(browser));const context=browser.newContext.bind(browser);browser.newContext=async options=>{const c=await context({...options,ignoreHTTPSErrors:true});await c.route('https://**/*',route=>new URL(route.request().url()).origin===new URL(server.origin).origin?route.continue():route.fulfill({status:200,contentType:'application/javascript',body:'/* QA provider fixture */'}));return c;};return browser;};
 const results=report.engines[engine]={};
 if(suite==='all'||suite==='preserved'){
  const browser=await launch();try{results.browserVersion=browser.version();results.preserved=await runBrowserRegressions(browser,server.origin,{artifacts:join(out,engine,'preserved')});}finally{await browser.close();}await save();
 }
 if(suite==='all'||suite==='personal'){
  results.personal=await runPersonalReleaseRegressions(launch,server.origin,{engine,artifacts:join(out,engine,'personal'),captureOnly:options['capture-only']==='true'});await save();
 }
 if(suite==='all'){results.decisions=await runDecisionRegressions(launch,server.origin,{artifacts:join(out,engine,'decisions')});await save();}
 if(suite==='all'||suite==='consent'){
  results.consent=await runAnalyticsWithdrawalRegressions(launch,server.origin,{artifacts:join(out,engine,'consent'),only:options.case});await save();
 }
 if(suite==='all'||suite==='gaps'){results.gaps=await runSequenceGapRegressions(launch,server.origin,{engine,artifacts:join(out,engine,'gaps')});await save();}
 if(suite==='all'||suite==='extend'){results.extend=await runExtendRegressions(launch,server.origin,{engine,artifacts:join(out,engine,'extend')});await save();}
}completed=true;}
catch(error){report.error=error.stack;}
finally{await Promise.allSettled([...openBrowsers].map(b=>b.close()));report.finished=new Date().toISOString();report.pass=completed&&Object.values(report.engines).every(e=>['preserved','personal','decisions','consent','gaps','extend'].every(key=>!e[key]||e[key].every(r=>r.pass)));await save();await server.close();}
console.log(JSON.stringify(report,null,2));if(!report.pass)process.exitCode=1;
