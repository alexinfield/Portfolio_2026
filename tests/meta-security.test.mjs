import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,readdir} from 'node:fs/promises';
import {secureHtml} from '../scripts/meta-security.mjs';

test('CSP hashes final executable bytes and rejects reuse after an edit',()=>{
  const input='<html><head></head><body><script>window.probe="<ok>";</script></body></html>';
  const hash=createHash('sha256').update('window.probe="<ok>";').digest('base64');
  assert.ok(secureHtml(input).includes(`'sha256-${hash}'`));
  assert.ok(!secureHtml(input.replace('<ok>','changed')).includes(`'sha256-${hash}'`));
  assert.equal(secureHtml(secureHtml(input)),secureHtml(input));
});
test('every export has a leading CSP, valid inline hashes, and no release-only draft controls',async()=>{
  async function visit(url) {
    for(const entry of await readdir(url,{withFileTypes:true})) {
      const child=new URL(entry.name+(entry.isDirectory()?'/':''),url);
      if(entry.isDirectory()){await visit(child);continue;}
      if(!entry.name.endsWith('.html'))continue;
      const html=await readFile(child,'utf8');
      assert.match(html,/<head><meta http-equiv="Content-Security-Policy"/);
      const policy=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
      assert.doesNotMatch(policy,/script-src[^;]*'unsafe-inline'|frame-ancestors|report-uri/);
      for(const [,attrs,body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if(/\bsrc\s*=/i.test(attrs)||!body)continue;
        assert.ok(policy.includes(`'sha256-${createHash('sha256').update(body).digest('base64')}'`),child.pathname);
      }
      assert.doesNotMatch(html,/data-draft-review-panel|In review \(draft only\)|Slow loading/);
      assert.doesNotMatch(html,/<script[^>]*src="https:\/\//);
      assert.doesNotMatch(html,/<[a-z][^>]*\son[a-z]+\s*=/i,'event handlers use the external runtime');
    }
  }
  await visit(new URL('../gh-pages/',import.meta.url));
});
