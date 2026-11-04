import test from 'node:test';
import assert from 'node:assert/strict';
import {secureHtml} from '../scripts/meta-security.mjs';
test('baseline policy prevents provider worker escape and retains self-only audio',()=>{
  const html=secureHtml('<html><head><meta charset="utf-8"></head><body></body></html>');
  assert.match(html,/worker-src 'none'/);assert.match(html,/frame-src 'self'/);assert.match(html,/media-src 'self';/);assert.doesNotMatch(html,/media-src[^;]*blob:/);
});
