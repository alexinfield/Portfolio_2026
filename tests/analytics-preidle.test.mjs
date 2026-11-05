import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../public/portfolio-analytics.js',import.meta.url),'utf8');
const consentKey='portfolio:analytics-consent:v1';
// Executes the real source with controlled idle and failing persistence. This
// models document replacement, not provider execution or network ingestion.
function page(href,persisted){
 let failWrites=false,cookie='',reloads=0,stopped=false,nextIdle=0;
 const idle=new Map(),loaders=[],listeners=new Map();
 const setting={checked:false,addEventListener:(name,fn)=>listeners.set(name,fn)};
 const storage=data=>({getItem:key=>data.get(key)??null,setItem:(key,value)=>{if(failWrites)throw Error('synthetic write failure');data.set(key,value);},removeItem:key=>{if(failWrites)throw Error('synthetic removal failure');data.delete(key);}});
 const location=new URL(href);location.reload=()=>{reloads++;};
 const document={readyState:'complete',referrer:'',currentScript:{dataset:{gaId:'synthetic',clarityId:'synthetic'}},
  querySelector:selector=>selector==='[data-analytics-consent]'?setting:selector==='[data-analytics-status]'?{}:selector==='[data-analytics-stop]'&&stopped?{}:null,
  querySelectorAll:()=>[],addEventListener:()=>{},
  createElement:()=>({dataset:{},remove:()=>{}}),
  head:{append:node=>{if(node.src)loaders.push(node.src);if('analyticsStop'in node.dataset)stopped=true;}}
 };
 Object.defineProperty(document,'cookie',{get:()=>cookie,set:value=>{if(failWrites)throw Error('synthetic cookie failure');cookie=value;}});
 const environment={document,location,localStorage:storage(persisted),sessionStorage:storage(new Map()),
  URL,URLSearchParams,addEventListener:()=>{},setTimeout:()=>1,clearTimeout:()=>{},
  requestIdleCallback:fn=>{const id=++nextIdle;idle.set(id,fn);return id;},cancelIdleCallback:id=>idle.delete(id),
  history:{state:null,replaceState:(...args)=>{location.href=args[2];}}
 };
 environment.window=environment;vm.runInNewContext(source,environment);
 return {setting,location,loaders,idle,fail:()=>{failWrites=true;},withdraw:()=>{setting.checked=false;environment.portfolioAnalytics.withdraw();},reloads:()=>reloads,runIdle:()=>{for(const fn of [...idle.values()])fn();}};
}
test('pre-idle withdrawal with all writes failing survives a fresh load through its URL marker',()=>{
 const persisted=new Map([[consentKey,'granted']]);
 const first=page('https://portfolio.example/personal/?ref=synthetic#original-tracks',persisted);
 assert.equal(first.idle.size,1);assert.equal(first.loaders.length,0);
 const pending=[...first.idle.values()];first.fail();first.withdraw();
 assert.equal(first.reloads(),0,'pre-start withdrawal must not force reload');
 assert.equal(persisted.get(consentKey),'granted','fixture must retain the old grant');
 assert.equal(first.location.searchParams.get('analytics'),'off');
 assert.equal(first.location.searchParams.get('ref'),'synthetic');assert.equal(first.location.hash,'#original-tracks');
 for(const callback of pending)callback();assert.equal(first.loaders.length,0,'stale idle callback stays invalidated');
 const fresh=page(first.location.href,persisted);fresh.runIdle();
 assert.equal(fresh.loaders.length,0,'fresh document must insert no provider loaders');
 // Positive control: the same retained grant on an unmarked URL starts both.
 const control=page('https://portfolio.example/personal/',persisted);control.runIdle();assert.equal(control.loaders.length,2);
});

test('a fresh visitor starts both analytics providers by default without UI or storage writes',()=>{
 const p=page('https://portfolio.example/',new Map());assert.equal(p.loaders.length,0);p.runIdle();assert.equal(p.loaders.length,2);
});
