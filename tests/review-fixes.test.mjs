import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {secureHtml} from '../scripts/meta-security.mjs';
const read=name=>readFile(new URL('../'+name,import.meta.url),'utf8');
test('baseline policy prevents provider worker escape and retains self-only audio',()=>{
  const html=secureHtml('<html><head><meta charset="utf-8"></head><body></body></html>');
  assert.match(html,/worker-src 'none'/);assert.match(html,/frame-src 'self'/);assert.match(html,/media-src 'self';/);assert.doesNotMatch(html,/media-src[^;]*blob:/);
});
test('public player has no local import, restoration or synthesized recording producer',async()=>{
  const app=await read('public/assets/original-tracks/boot.js'),library=await read('public/assets/original-tracks/library.js'),html=await read('app/personal/original-tracks-card.tsx');
  assert.doesNotMatch(app+'\n'+library,/createObjectURL|revokeObjectURL|createDemo|openDatabase|importFiles|\.blob\b|new Blob\b/);
  assert.doesNotMatch(html,/type="file"|id="(?:files|folder|import-files|import-folder|focus-import|clear-library|demo)"/);
  assert.match(app,/HostedCatalog\.parseCatalog/);
  assert.match(html,/rootMargin:'300px'/);assert.doesNotMatch(html,/<iframe|<audio|Close player/);
});
test('hosted catalog rejects blob and off-site URLs while accepting the included recordings',async()=>{
  const context=vm.createContext({URL,module:{exports:{}}});vm.runInContext(await read('public/assets/original-tracks/catalog.js'),context);
  const parse=context.module.exports.parseCatalog,base='https://portfolio.example/assets/original-tracks/';
  const catalog=JSON.parse(await read('public/assets/original-tracks/tracks.json'));assert.equal(parse(catalog,base).length,3);
  for(const url of ['blob:https://portfolio.example/canary','https://tracker.example/song.m4a','//tracker.example/song.m4a','../song.m4a']){
    assert.throws(()=>parse({version:1,tracks:[{id:'canary',name:'Canary',url}]},base));
  }
});
test('public player prose and attribution omit the prohibited marks while retaining the MIT notice',async()=>{
  async function walk(path){for(const entry of await readdir(new URL('../'+path,import.meta.url),{withFileTypes:true})){const name=path+'/'+entry.name;assert.doesNotMatch(name,/beats|ipod/i);if(entry.isDirectory())await walk(name);else if(/\.(js|css|json|txt)$/.test(name))assert.doesNotMatch(await read(name),/\b(?:beats|ipod)\b/i,name);}}
  await walk('public/assets/original-tracks');
  for(const path of ['app/personal/original-tracks-card.tsx','app/footer.tsx']){
    // Footer may live in the common shell; inspect it when present.
    try{assert.doesNotMatch(await read(path),/\b(?:beats|ipod)\b/i,path);}catch(e){if(e.code!=='ENOENT')throw e;}
  }
  const notice=await readFile(new URL('../public/assets/original-tracks/LICENSE',import.meta.url));
  assert.equal(createHash('sha256').update(notice).digest('hex'),'13b4b1da3c43dbf79bc0e358cc837be4e52d3aca47a5e000a2edf2f6f416921b');
  assert.match(await read('public/assets/original-tracks/appearance/LICENSE-ChicagoKare-MIT.txt'),/Copyright \(c\) 2024 Duane King/);
});
