import { readFile, readdir, lstat, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blocked = /professional|_professional-preview|__portfolio(?:-storage)?\/|portfolio[-_]private[-_]canary|(?:"|')audience(?:"|')\s*:\s*(?:"|')private/i;
const routes = ['index.html','etc/index.html','personal/index.html','info/index.html', ...['ping','molekule-go','luma','niche','hyphae','mode','pillar','furniture'].map(x=>`projects/${x}/index.html`),'play/index.html','404.html'];
// The one approved inert navigation label is UI, not a content record. Keep
// the exception exact, disabled and without an href; all other bytes are scanned.
function withoutInertNavLabel(text, sourcePath="") {
  if(sourcePath==="app/live-header.tsx")text=text.replace(/<Button\b(?=[^>]*\sdisabled(?:\s|>))(?=[^>]*aria-disabled="true")[^>]*>Professional<\/Button>/g,tag=>tag.replace(">Professional<",">Unavailable<"));
  text=text.replace(/<button\b(?=[^>]*\sdisabled="")(?=[^>]*aria-disabled="true")[^>]*>Professional<\/button>/g,tag=>tag.replace(">Professional<",">Unavailable<"));
  let props=JSON.stringify({type:"button",size:"sm",variant:"secondary","data-plain":"",disabled:true,"aria-disabled":"true",children:"Professional"});
  for(let layer=0;layer<3;layer++){text=text.replaceAll(props,props.replace("Professional","Unavailable"));props=JSON.stringify(props).slice(1,-1);}
  return text;
}
export async function checkBoundary(root, manifest, clientFiles = new Set()) {
  const errors = []; let files = 0, bytes = 0;
  async function walk(dir) {
    for (const name of (await readdir(dir)).sort()) {
      const p = join(dir,name), r = relative(root,p).replaceAll('\\','/'), st = await lstat(p);
      if (st.isSymbolicLink() || (!st.isFile() && !st.isDirectory())) { errors.push('unsafe-entry'); continue; }
      if (blocked.test(r)) { errors.push('private-path'); continue; }
      if (st.isDirectory()) { await walk(p); continue; }
      const b = await readFile(p); files++; bytes += b.length;
      const approved = manifest.files[r];
      const generated = routes.includes(r) || ['.nojekyll','robots.txt','sitemap.xml'].includes(r)
        || (clientFiles.has(r) && /^assets\/[^/]+\.(?:js|css|woff2)$/.test(r));
      if (approved ? sha(b) !== approved : !generated) errors.push('unapproved-file-or-hash');
      // Scan every shipped byte, including binaries, payloads and any source map.
      if (blocked.test(withoutInertNavLabel(b.toString('latin1')))) errors.push('private-marker');
      if (r.endsWith('.map')) errors.push('source-map');
    }
  }
  await walk(root);
  if (errors.length) throw new Error(`Public boundary failed: ${errors.length} violations (${[...new Set(errors)].join(', ')}); confidential values suppressed`);
  return { status:'passed', files, bytes, policy:'cleared public asset hashes, closed file/route list, all-byte private marker scan' };
}
export async function sourceBoundary(root) {
  for (const key of Object.keys(process.env).filter(key => /^PORTFOLIO_.*(?:PROFESSIONAL|PRIVATE|CONTENT_SOURCE)/i.test(key))) {
    const value = process.env[key];
    if (value && value !== 'false') throw new Error('Private source configuration rejected');
  }
  async function walk(p) {
    for (const entry of await readdir(p,{withFileTypes:true})) {
      const child=join(p,entry.name);
      if (entry.isSymbolicLink()) throw new Error('Source symlink rejected');
      if (blocked.test(entry.name)) throw new Error('Private source path rejected');
      if (entry.isDirectory()) await walk(child);
      else if (blocked.test(withoutInertNavLabel((await readFile(child)).toString('latin1'),relative(root,child).replaceAll('\\','/')))) throw new Error('Private source marker rejected; content suppressed');
    }
  }
  for (const dir of ['app','lib','public']) await walk(join(root,dir));
}
async function selfTest() {
  const dir = await mkdtemp(join(process.cwd(),'.boundary-fixture-'));
  const manifest = {files:{'public-image.bin':sha(Buffer.from('cleared'))}};
  await writeFile(join(dir,'public-image.bin'),'cleared');
  await writeFile(join(dir,'index.html'),'<html>public</html>');
  await checkBoundary(dir,manifest);
  let rejected=0;
  for (const [name,body] of [['record.json','{"audience":"Professional","canary":"portfolio-private-canary"}'],['renamed-image.bin','unknown media'],['index.html','<script>const record={classification:"Professional"}</script>'],['index.html','<a href="/professional/">Professional</a>'],['index.html','<button disabled="" aria-disabled="true" data-url="/professional/">Professional</button>']]) {
    const file=join(dir,name); const previous=await readFile(file).catch(()=>null);
    await writeFile(file,body);
    try { await checkBoundary(dir,manifest); } catch { rejected++; }
    if (previous) await writeFile(file,previous); else { const {unlink}=await import('node:fs/promises');await unlink(file); }
  }
  if (rejected !== 5) throw new Error('Boundary negative controls did not all fail');
  await rm(dir,{recursive:true,force:true});
  console.log(JSON.stringify({boundarySelfTest:'passed',cleanFixture:true,contaminatedFixturesRejected:rejected}));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--self-test')) await selfTest();
  else if (process.argv.includes('--source-only')) await sourceBoundary(resolve(fileURLToPath(new URL('../',import.meta.url))));
  else {
    const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
    await sourceBoundary(root);
    const manifest=JSON.parse(await readFile(new URL('public-assets.json',import.meta.url)));
    const assets=await readdir(join(root,'dist/client/assets'));
    const clientFiles=new Set(assets.map(x=>'assets/'+x));
    console.log(JSON.stringify({publicBoundary:await checkBoundary(join(root,'gh-pages'),manifest,clientFiles)}));
  }
}
