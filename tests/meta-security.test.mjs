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
test('companion HTML with an implicit head receives a leading policy',()=>{
  const input='<!doctype html><html lang="en"><meta charset="utf-8"><title>Credits</title><body><script>window.credit=true</script></body></html>';
  const html=secureHtml(input);
  assert.match(html, /<head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy"/);
  assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<script'));
  assert.ok(html.includes(createHash('sha256').update('window.credit=true').digest('base64')));
  assert.equal(secureHtml(html),html);
});
test('long per-page policies preserve early UTF-8 and precede resource discovery',()=>{
  const scripts=Array.from({length:30},(_,i)=>`<script>window.probe=${i}</script>`).join('');
  const html=secureHtml(`<html><head><meta charset="utf-8"/><link rel="stylesheet" href="/site.css"/></head><body>${scripts}</body></html>`);
  assert.ok(Buffer.byteLength(html.slice(0,html.indexOf('/>')+2))<1024);
  assert.ok(html.indexOf('charset=')<html.indexOf('Content-Security-Policy'));
  assert.ok(html.indexOf('Content-Security-Policy')<html.indexOf('<link'));
  assert.equal(secureHtml(html),html);
});
test('every export has a leading CSP, valid inline hashes, and no release-only draft controls',async()=>{
  async function visit(url) {
    for(const entry of await readdir(url,{withFileTypes:true})) {
      const child=new URL(entry.name+(entry.isDirectory()?'/':''),url);
      if(entry.isDirectory()){await visit(child);continue;}
      if(!entry.name.endsWith('.html'))continue;
      const html=await readFile(child,'utf8');
      assert.match(html,/<head>\s*<meta\b[^>]*charset[^>]*><meta http-equiv="Content-Security-Policy"/i);
      assert.doesNotMatch((html.match(/<meta[^>]*>/g)||[]).join(''),/—/,'all exported meta including aliases and 404 use no em dashes');
      const charset=/<meta\s+charset=[^>]*>/i.exec(html);assert.ok(charset);assert.ok(Buffer.byteLength(html.slice(0,charset.index+charset[0].length))<=1024);
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
