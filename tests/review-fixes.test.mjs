import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {secureHtml} from '../scripts/meta-security.mjs';
const read=name=>readFile(new URL('../'+name,import.meta.url),'utf8');
test('baseline policy prevents provider worker escape and retains self-only audio',()=>{
  const html=secureHtml('<html><head><meta charset="utf-8"></head><body></body></html>');
  assert.match(html,/worker-src 'none'/);assert.match(html,/frame-src 'self'/);assert.match(html,/media-src 'self';/);assert.doesNotMatch(html,/media-src[^;]*blob:/);
});
test('public player has no local import, restoration or synthesized recording producer',async()=>{
  const app=await read('public/beats/app.js'),library=await read('public/beats/library.js'),html=await read('public/beats/index.html');
  assert.doesNotMatch(app+'\n'+library,/createObjectURL|revokeObjectURL|createDemo|openDatabase|importFiles|\.blob\b|new Blob\b/);
  assert.doesNotMatch(html,/type="file"|id="(?:files|folder|import-files|import-folder|focus-import|clear-library|demo)"/);
  assert.match(app,/HostedCatalog\.load/);
});
test('hosted catalog rejects blob and off-site URLs while accepting the included recordings',async()=>{
  const context=vm.createContext({URL,module:{exports:{}}});vm.runInContext(await read('public/beats/catalog.js'),context);
  const parse=context.module.exports.parseCatalog,base='https://portfolio.example/beats/';
  const catalog=JSON.parse(await read('public/beats/tracks.json'));assert.equal(parse(catalog,base).length,3);
  for(const url of ['blob:https://portfolio.example/canary','https://tracker.example/song.m4a','//tracker.example/song.m4a','../song.m4a']){
    assert.throws(()=>parse({version:1,tracks:[{id:'canary',name:'Canary',url}]},base));
  }
});
test('public player prose and attribution omit the prohibited marks while retaining the MIT notice',async()=>{
  for(const path of ['public/beats/index.html','public/beats/credits.html','public/beats/NOTICE-LAB.md','public/beats/THIRD_PARTY_NOTICES.md','public/beats/asset-provenance.json']){
    const body=(await read(path)).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]+>/g,'');
    assert.doesNotMatch(body,/\b(?:beats|ipod)\b/i,path);
  }
  const notice=await readFile(new URL('../public/beats/LICENSE',import.meta.url));
  assert.equal(createHash('sha256').update(notice).digest('hex'),'13b4b1da3c43dbf79bc0e358cc837be4e52d3aca47a5e000a2edf2f6f416921b');
});
