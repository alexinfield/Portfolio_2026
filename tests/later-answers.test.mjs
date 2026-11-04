import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('six case share images have the chosen 1.91 ratio and page descriptions equal their titles',async()=>{
 for(const slug of ['ping','molekule-go','luma','niche','hyphae','mode']){
  const html=await read('gh-pages/projects/'+slug+'/index.html');const title=html.match(/<title>([^<]+)<\/title>/)[1];
  assert.ok(html.includes('name="description" content="'+title+'"'));assert.match(html,/property="og:image:width" content="1200"/);assert.match(html,/property="og:image:height" content="628"/);assert.ok(html.includes('/assets/share/'+slug+'.webp'));assert.doesNotMatch(html.match(/<meta[^>]+>/g).join(''),/—/);
 }
});
test('privacy notice exists only on Info and no page exports consent controls or a privacy footer',async()=>{
 for(const path of ['index.html','personal/index.html','info/index.html','404.html',...['ping','molekule-go','luma','niche','hyphae','mode'].map(s=>'projects/'+s+'/index.html')]){
  const html=await read('gh-pages/'+path);assert.doesNotMatch(html,/<footer|data-analytics-consent|data-analytics-status|Privacy settings|Allow analytics and session recording/);
  assert.equal(html.includes('class="portfolio-privacy-notice"'),path==='info/index.html');
 }
});
test('3840 candidates are restricted to the detailed board allowlist',async()=>{
 const approved=JSON.parse(await read('lib/detailed-boards.json')),media=JSON.parse(await read('lib/project-media.json'));
 let count=0;
 for(const [slug,items]of Object.entries(media)){
  const html=(await read('gh-pages/projects/'+slug+'/index.html')).split('</html>')[0];
  for(const item of items.filter(m=>m.kind==='image')){
   const candidate=item.source.replace(/\.[^.]+$/,'-w3840.webp');assert.equal(html.includes(candidate),approved.includes(item.source),item.source);if(approved.includes(item.source))count++;
  }
 }
 assert.equal(count,27);
});
