import assert from "node:assert/strict";
import { access, readFile, readdir, stat, mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { copyDraftTree } from "../scripts/draft-media-copy.mjs";
import { createHash } from "node:crypto";
import { inflateSync } from "node:zlib";
import test from "node:test";

const slugs = ["ping", "molekule-go", "luma", "niche", "hyphae", "mode"];
const titles = ["Ping", "Molekule Go", "Luma", "Niche", "Hyphae Light", "Folio"];
const pages = ["index.html", "personal/index.html", "info/index.html", ...slugs.map(slug=>`projects/${slug}/index.html`)];
const read = path => readFile(new URL(`../${path}`,import.meta.url),"utf8");
const exported = path => read(`gh-pages/${path}`);
const documentOnly = html => html.slice(0,html.indexOf("</html>")+7);
const text = html => html.replace(/<[^>]+>/g,"").trim();
// Scroll sequences carry their own poster, still and placeholder (scroll-sequence.js).
const withoutSequences = html => html.replace(/<section class="ss[\s\S]*?<\/section>/g,"");
const caseSource = await read("app/case-text.tsx");
const CASE_TEXT_ENABLED = /export const CASE_TEXT_ENABLED = true\b/.test(caseSource);
const packageData = JSON.parse(await read("lib/personal.json"));
const overrides = {stool:"Kerf Stool","wall-mounts":"CNC Portrait Relief","p041-telefoni":"Video 2018"};
const visibleItems = packageData.items.filter(item=>!item.hidden);

test("draft media reuse preserves independent code and player assets",async()=>{
  const dir=await mkdtemp(join(tmpdir(),"personal-draft-copy-"));
  try {
    const source=join(dir,"source"),out=join(dir,"output");
    await mkdir(join(source,"assets"),{recursive:true});await mkdir(join(source,"fixture-audio"));
    for(const [file,value] of [["assets/image.webp","immutable image"],["app.js","original code"],["fixture-audio/song.m4a","owned recording"]])await writeFile(join(source,file),value);
    await copyDraftTree(source,out);
    assert.equal((await stat(join(source,"assets/image.webp"))).ino,(await stat(join(out,"assets/image.webp"))).ino);
    for(const file of ["app.js","fixture-audio/song.m4a"])assert.notEqual((await stat(join(source,file))).ino,(await stat(join(out,file))).ino);
    await writeFile(join(out,"app.js"),"patched export code");
    assert.equal(await readFile(join(source,"app.js"),"utf8"),"original code");
  } finally {await rm(dir,{recursive:true,force:true});}
});

async function render(path) {
  const app=(await import(new URL("../dist/server/index.js",import.meta.url))).default;
  return app.fetch(new Request(`http://localhost${path}`,{headers:{accept:"text/html"}}),
    {ASSETS:{fetch:async()=>new Response("Not found",{status:404})}}, {waitUntil(){},passThroughOnException(){}});
}
async function files(path="") {
  const list=[];
  for(const entry of await readdir(new URL(`../gh-pages/${path}`,import.meta.url),{withFileTypes:true})) {
    const child=path+entry.name;
    if(entry.isDirectory())list.push(...await files(child+"/")); else list.push(child);
  }
  return list;
}

test("home has exactly the four approved name-only captions in order",async()=>{
  const html=documentOnly(await exported("index.html"));
  const captions=[...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map(match=>text(match[1]));
  assert.deepEqual(captions,["Molekule Go","Ping","Hyphae Light","Luma"]);
  assert.equal((html.match(/>Personal work →<\/a>/g)||[]).length,1);
  assert.match(html,/href="\.\/personal\/"/);
  assert.doesNotMatch(html,/mailto:/);
  assert.doesNotMatch(html,/I'm Alex|I&#x27;m Alex|ASCII|Grow a flower|portfolio-gallery/);
  assert.match(html,/hero-hand-w768\.webp 768w/);
  assert.match(html,/sizes="\(max-width: 767px\) 100vw, 50vw"/);
});

test("every real page has the same Compass nav, disabled Professional and landmarks",async()=>{
  for(const path of [...pages,"404.html"]) {
    const html=documentOnly(await exported(path));
    const nav=/<nav\b[^>]*aria-label="Primary"[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1];
    assert.ok(nav,path);
    const items=[...nav.matchAll(/<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/g)].map(match=>text(match[2]));
    assert.deepEqual(items,["Work","Personal","Professional","Info"],path);
    assert.match(nav,/<button\b(?=[^>]*data-unavailable-toggle="true")(?=[^>]*aria-disabled="true")(?=[^>]*data-slot="button")[^>]*>Professional<\/button>/);
    const unavailable=nav.match(/<button\b[^>]*>Professional<\/button>/)[0];
    assert.doesNotMatch(unavailable,/\sdisabled=""|\shref=/);
    assert.match(html,/id="unavailable-status"[^>]*role="tooltip"/);
    assert.doesNotMatch(nav,/href="[^"]*professional|tabindex="0"[^>]*>Professional/);
    assert.match(html,/href="#main-content"[^>]*>Skip to content/);
    assert.match(html,/<main\b[^>]*id="main-content"[^>]*tabindex="-1"/);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,path);
    const footers=[...html.matchAll(/<footer\b[^>]*>[\s\S]*?<\/footer>/g)];
    assert.equal(footers.length,path==="404.html"?0:1,path);
    if(footers.length){assert.match(footers[0][0],/class="[^"]*portfolio-privacy/);assert.match(footers[0][0],/<summary>Privacy settings<\/summary>/);assert.equal((footers[0][0].match(/data-analytics-consent/g)||[]).length,1);}
    assert.doesNotMatch(html,/data-theme-toggle|portfolio-theme\.js|portfolio-compass-theme|Appearance/);
    const palette=path.startsWith("personal/")?"light":"dark";assert.match(html,new RegExp(`<html[^>]*data-theme="${palette}"`));
  }
});

test("Info contains the exact approved text, artwork and one secondary Contact mailto button",async()=>{
  const html=documentOnly(await exported("info/index.html"));
  assert.match(html,/I&#x27;m Alex Infield, an industrial designer based in Brooklyn, New York\. My work spans product visualization, CAD, prototyping and fabrication for consumer goods, furniture and lighting\./);
  assert.match(html,/IMG_0019-w(?:768|960|1600)\.webp/);
  assert.doesNotMatch(html,/\ssrc="[^"]*IMG_0019\.png/);
  assert.match(html,/mailto:alex@infield.net/);
  assert.equal((html.match(/href="mailto:alex@infield.net"/g)||[]).length,1);
  assert.match(html,/<a\b(?=[^>]*data-variant="secondary")(?=[^>]*href="mailto:alex@infield.net")[^>]*>Contact<\/a>/);
  assert.doesNotMatch(html,/Appearance|data-slot="toggle-group"/);
  assert.doesNotMatch(html,/résumé|resume|flower|garden/i);
});

test("Personal exports exactly the package order, owner titles and existing case links",async()=>{
  const html=documentOnly(await exported("personal/index.html"));
  const ids=[...html.matchAll(/data-personal-id="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,15);
  assert.deepEqual(ids,visibleItems.map(item=>item.id));
  assert.equal(ids.indexOf("p025-warp-paper-light-and-shadow-relief")+1,ids.indexOf("mycelium"));
  const headings=[...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map(match=>text(match[1]));
  assert.deepEqual(headings,visibleItems.map(item=>overrides[item.id]??item.title));
  assert.ok(headings.includes("Video 2018"));
  assert.match(html,/href="\.\.\/projects\/mode\/\?from=personal"/);
  assert.match(html,/href="\.\.\/projects\/niche\/\?from=personal"/);
  assert.doesNotMatch(html,/>null<|>undefined<|JuiceBox|data-year="null"/);
  assert.doesNotMatch(html,/data-slot="select-trigger"|Filter by year|Filter by category|projects shown|>Reset</);
  const source=await read("app/personal/personal-collection.tsx");
  assert.match(source,/PERSONAL_FILTERS_VISIBLE = false/);
  assert.match(source,/PERSONAL_FILTERS_VISIBLE &&/);
  assert.match(source,/const matches = [\s\S]*year === "all"[\s\S]*category === "all"/);
  assert.match(html,/complete collection is shown below/);
  assert.match(html,/data-portfolio-boundary="true"/);
  assert.match(html,/data-theme="light"/);
});

test("every package media path is local and its exact variants exist",async()=>{
  const sources=new Set();
  function visit(media) {
    assert.match(media.src,/^media\/[a-z0-9-]+\.(webp|mp4)$/);
    assert.ok(media.width>0&&media.height>0&&media.alt.length>10);
    sources.add(media.src);
    for(const variant of media.variants??[]){assert.ok(variant.width>0&&variant.width<=1920);sources.add(variant.src);}
    if(media.poster)visit(media.poster);
  }
  for(const item of packageData.items){visit(item.cover);item.gallery.forEach(visit);}
  for(const source of packageData.retired_media??[])sources.add(source);
  const actual=(await readdir(new URL("../public/assets/personal/media/",import.meta.url))).map(name=>"media/"+name);
  assert.deepEqual([...sources].sort(),actual.sort());
  for(const source of sources)await access(new URL(`../public/assets/personal/${source}`,import.meta.url));
});

test("Personal carousel SSR retains its usable deferred fallback",async()=>{
  const html=documentOnly(await exported("personal/index.html"));
  assert.match(html,/data-slot="carousel-content"/);
  assert.match(html,/data-seamless="true"/);
  assert.doesNotMatch(html,/aria-label="\d+ of 0"/);
  assert.doesNotMatch(html,/<iframe\b|<audio\b/);
  assert.equal((await files()).filter(path=>/original-tracks|^beats\//.test(path)).length,0);
  assert.doesNotMatch(html,/Original Tracks|original-tracks|tracks-stage/);
});

test("Molekule phone cover embeds exact cleared pixels and retains its field and larger candidates",async()=>{
  const html=documentOnly(await exported('projects/molekule-go/index.html'));
  const inline=[...html.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=]+) 768w/g)];
  assert.equal(inline.length,1,'the document carries the cover once');
  const registry=JSON.parse(await read('lib/project-media.json'));
  const cover=registry['molekule-go'][0].source.replace(/\.[^.]+$/, '-w768.webp');
  assert.deepEqual(Buffer.from(inline[0][1],'base64'),await readFile(new URL('../public'+cover,import.meta.url)));
  assert.match(html,/<img data-eb-native="" data-eb-media=""[^>]*fetchpriority="high"/i);
  assert.match(html,/-w1600\.webp 1600w/);
});
test("all six cases preserve the complete ordered image content and descriptions",async()=>{
  const registry=JSON.parse(await read("lib/project-media.json"));
  const expected={ping:17,"molekule-go":18,luma:22,niche:20,hyphae:26,mode:17};
  for(const [index,slug] of slugs.entries()){
    assert.equal(registry[slug].length,expected[slug]);
    const html=documentOnly(await exported(`projects/${slug}/index.html`));
    assert.match(html,new RegExp(`<h1 class="sr-only">${titles[index]}</h1>`));
    assert.doesNotMatch(html,/portfolio-case-heading|Back to Work/);
    const tags=[...withoutSequences(html).replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/g,'').matchAll(/<img\b[^>]*>/g)].map(match=>match[0]);
    const identity = source => source.replace(/\.[^/.]+$/, "").replace(/-w(?:768|960|1600|2600)$/, "");
    assert.deepEqual(tags.map(tag=>identity(/\s(?:src|data-critical-src)="([^"]+)"/.exec(tag)[1].replace(/^\.\.\/\.\.\//,"/"))),registry[slug].filter(item=>item.kind==="image").map(item=>identity(item.source)),slug);
    for(const tag of tags)assert.ok(/\salt="([^"]+)"/.exec(tag)?.[1].length>10);
    assert.match(html,/portfolio-case-stack/);
    assert.match(html,/aria-label="Case navigation"/);
    assert.equal((html.match(/<footer/g)||[]).length,1); assert.match(html,/portfolio-privacy/);
    if(!CASE_TEXT_ENABLED)assert.doesNotMatch(html,/class="case-text"/);
    for(const item of registry[slug].filter(item=>item.kind!=="sequence")){await access(new URL(`../public${item.source}`,import.meta.url));if(item.poster)await access(new URL(`../public${item.poster}`,import.meta.url));}
  }
});

// Alex deferred semantic copy to the later rebuild. Flip CASE_TEXT_ENABLED and
// these two authored-text checks resume; alt/image-order checks always run.
test("Ping exposes its authored narrative as semantic HTML",{skip:CASE_TEXT_ENABLED ? false : "Alex deferred case text to the later rebuild"},async()=>{
  const html=await (await render("/projects/ping")).text();
  assert.match(html,/<section class="case-text"[^>]*><h2>Ping<\/h2>/);
  assert.match(html,/voice messaging device that keeps families connected without smartphone distractions/);
  assert.match(html,/<dt>Role<\/dt><dd>Industrial Design/);
  assert.match(html,/<dt>Date<\/dt><dd>2025<\/dd>/);
  assert.match(html,/Why do families give their kids mobile devices\?/);
  assert.match(html,/Location is revealed progressively/);
});
test("all cases expose authored summaries, dates and research captions",{skip:CASE_TEXT_ENABLED ? false : "Alex deferred case text to the later rebuild"},async()=>{
  const expected={
    ping:["Ping","2025","Why do families give their kids mobile devices?"],
    "molekule-go":["Molekule Go","2025","This is a student project and is not affiliated with Molekule."],
    luma:["Luma","2024","I visited 2 smart homes to see the problems for myself."],
    niche:["Niche","2024","Quotes from interviews with 2 employers, 3 employees, and a 10-person survey."],
    hyphae:["Hyphae","2023","Extracting form from nature"],
    mode:["Folio","2023","Folio is a bedside table designed for the routines of modern life."],
  };
  for(const slug of slugs){const html=await (await render(`/projects/${slug}`)).text();assert.match(html,new RegExp(`<section class="case-text"[^>]*><h2>${expected[slug][0]}</h2>`));for(const copy of expected[slug].slice(1))assert.ok(html.includes(copy),`${slug}: ${copy}`);}
});

test("video preserves preload none, posters, no autoplay and MP4 first; long films expose real sources",async()=>{
  for(const path of [...slugs.map(slug=>`projects/${slug}/index.html`),"personal/index.html"]){
    const html=documentOnly(await exported(path));
    for(const [video] of html.matchAll(/<video\b[\s\S]*?<\/video>/g)){
      assert.match(video,/preload="none"/);
      assert.match(video,/poster="[^"]+"/);
      assert.doesNotMatch(video,/<video[^>]*\sautoplay/i);
      if(video.includes('data-demand-only="true"') || video.includes('data-native-fallback="true"')){
        for(const [source] of video.matchAll(/<source\b[^>]*>/g)){
          assert.equal(/\ssrc="([^"]+)"/.exec(source)?.[1],/data-src="([^"]+)"/.exec(source)?.[1]);
        }
      }else assert.doesNotMatch(video,/<source[^>]*\ssrc=/i);
      assert.match(video,/<source[^>]*data-src="[^"]+\.mp4" type="video\/mp4"/);
      assert.match(video.match(/<source\b[^>]*>/)[0],/type="video\/mp4"/);
    }
  }
  for(const [slug,name,original] of [["molekule-go","uv-web","UV-animation-transcode"],["molekule-go","aq-web","aq-indicator-transcode"],["hyphae","growth-web","growth-sim-transcode"],["hyphae","making-web","673e9d3ff35335eb252fe856_img-0469-transcode"],["hyphae","film-web","hyphae-light-film"]]){
    const smaller=await stat(new URL(`../public/assets/${slug}/media/${name}.mp4`,import.meta.url));
    const originalFile=await stat(new URL(`../public/assets/${slug}/media/${original}.mp4`,import.meta.url));
    assert.ok(smaller.size<originalFile.size);
  }
});

test("all video players use Compass icons; long films add timeline, mute and fullscreen",async()=>{
  for(const slug of slugs){
    const html=documentOnly(await exported(`projects/${slug}/index.html`));
    assert.equal((html.match(/data-video-toggle="true"/g)||[]).length,(html.match(/<video\b/g)||[]).length,slug);
    for(const [video] of html.matchAll(/<video\b[^>]*>/g)){
      assert.doesNotMatch(video,/\scontrols=""/);
    }
    if(html.includes("<video"))assert.match(html,/data-button-kind="icon"/);
    assert.doesNotMatch(html,/portfolio-video-controls|carousel-controls/);
    if(slug==="hyphae"){assert.match(html,/data-film-controls/);assert.match(html,/data-native-film-play/);assert.match(html,/Mute Hyphae Light film/);assert.match(html,/Enter fullscreen: Hyphae Light film/);assert.match(html,/data-slot="slider"/);}
  }
});

test("404 retains a same-document skip target, one robots tag and no inherited URL or analytics",async()=>{
  assert.equal((await render("/missing/deep/route")).status,404);
  const html=await exported("404.html");
  assert.doesNotMatch(html,/<base\b|rel="canonical"|property="og:url"|<script[^>]*(?:googletagmanager|clarity|portfolio-analytics)/);
  assert.match(html,/href="#main-content"/);
  assert.equal((html.match(/name="robots"/g)||[]).length,1);
  assert.match(html,/<title>Page not found — Alex Infield<\/title>/);
  assert.match(html,/property="og:title" content="Page not found — Alex Infield"/);
  assert.doesNotMatch(html,/portfolio-theme/);
  assert.match(html,/href="\/"[^>]*>Work<\/a>/);
});

test("redirects and aliases have real targets and Compass fallback controls",async()=>{
  for(const [route,target] of [["etc","../personal/"],["play","../personal/"],["projects/pillar","../niche/"],["projects/furniture","../mode/"]]){
    const html=await exported(`${route}/index.html`);
    assert.ok(html.includes(`content="0;url=${target}"`));
    assert.ok(new RegExp(`href="${target}"[^>]*>Continue to`).test(html));
    assert.match(html,/data-slot="button"/);
    assert.doesNotMatch(html,/portfolio-theme/);
    assert.match(html,/Page moved/);
    assert.doesNotMatch(html,/<base\b/);
  }
  for(const [route,target] of [["/etc","/personal/"],["/play","/personal/"],["/projects/pillar","/projects/niche"],["/projects/furniture","/projects/mode"]]){
    const response=await render(route);assert.ok([307,308].includes(response.status));assert.equal(new URL(response.headers.get("location"),"http://localhost").pathname,target);
  }
});

test("Personal and Hyphae keep Compass hydration; indexing follows export flag",async()=>{
  for(const path of ["personal/index.html","projects/hyphae/index.html"]){const html=await exported(path);assert.match(html,/__VINEXT_RSC_|id="_R_"/);}
  for(const path of ["index.html","info/index.html",...slugs.filter(slug=>slug!=="hyphae").map(slug=>`projects/${slug}/index.html`),"404.html"]){assert.doesNotMatch(await exported(path),/__VINEXT_RSC_|id="_R_"/);}
  for(const path of pages)assert.equal(/name="robots" content="noindex,nofollow"/.test(await exported(path)),process.env.PORTFOLIO_ALLOW_INDEXING !== "true");
  assert.equal(await exported("robots.txt"),process.env.PORTFOLIO_ALLOW_INDEXING === "true" ? "User-agent: *\nAllow: /\nSitemap: https://alexinfield.com/sitemap.xml\n" : "User-agent: *\nDisallow: /\n");
  const sitemap=await exported("sitemap.xml");assert.match(sitemap,/<loc>https:\/\/alexinfield.com\/personal\/<\/loc>/);assert.doesNotMatch(sitemap,/\/etc|\/play|\/professional/);
  const workflow=await read(".github/workflows/deploy-pages.yml");assert.match(workflow,/actions\/deploy-pages@v4/);assert.match(workflow,/PORTFOLIO_ALLOW_INDEXING: "true"/);
});

test("Professional material, legacy UI and discarded extras are absent from the build",async()=>{
  const all=await files();
  assert.ok(!all.some(path=>/professional|protected|garden|delight|flower|portfolio-source\.min\.css|google-fonts\.css/i.test(path)));
  for(const path of pages){const html=await exported(path);assert.doesNotMatch(html,/\/api\/|\/professional\/|Grow a flower|ASCII garden|w-layout|w-background-video|portfolio-source\.min\.css/);}
  for(const path of all.filter(path=>/\.js$/.test(path))){assert.doesNotMatch(await exported(path),/api\/professional|professional-content|protected-media|PersonalGarden|InfoFlower/);}
  let bytes=0;for(const path of all)bytes+=(await stat(new URL(`../gh-pages/${path}`,import.meta.url))).size;
  assert.ok(bytes<1_000_000_000);
});

test("only public Compass exports are consumed and the tarball is pinned",async()=>{
  const pkg=JSON.parse(await read("package.json"));
  assert.equal(pkg.dependencies["@alex-infield/compass-augmentation"],"file:vendor/alex-infield-compass-augmentation-1.2.1.tgz");
  assert.equal(pkg.dependencies["lucide-react"],"1.52.0");
  const wrapper=await read("app/compass.tsx");assert.match(wrapper,/^"use client"/);assert.match(wrapper,/from "@alex-infield\/compass-augmentation"/);
  const layout=await read("app/layout.tsx");assert.ok(layout.indexOf("augmentation/styles.css")<layout.indexOf("alex-tokens.css"));
  assert.doesNotMatch(layout,/portfolio-source/);
});

test("share metadata resolves to retained covers and Folio everywhere displayed",async()=>{
  for(const [path,title] of [["index.html","Alex Infield"],["info/index.html","Info"],["personal/index.html","Personal"],...slugs.map((slug,index)=>[`projects/${slug}/index.html`,titles[index]])]){
    const html=await exported(path);assert.ok(html.includes(`<title>${title}</title>`));assert.ok(html.includes(`property="og:title" content="${title}"`));assert.match(html,/name="twitter:card" content="summary_large_image"/);
    const image=/property="og:image" content="https:\/\/alexinfield.com([^\"]+)"/.exec(html)?.[1];assert.ok(image);await access(new URL(`../public${image}`,import.meta.url));
  }
  assert.doesNotMatch(documentOnly(await exported("projects/mode/index.html")),/>Mode<|content="Mode"/);
});

test("favicon is a plain white dot on black",async()=>{
  const data=await readFile(new URL("../public/favicon.png",import.meta.url));
  assert.equal(data.readUInt32BE(16),32);assert.equal(data.readUInt32BE(20),32);
  let offset=8,idat=[];while(offset<data.length){const size=data.readUInt32BE(offset),type=data.toString("ascii",offset+4,offset+8);if(type==="IDAT")idat.push(data.subarray(offset+8,offset+8+size));offset+=size+12;}
  const pixels=inflateSync(Buffer.concat(idat));
  const at=(x,y)=>[...pixels.subarray(y*97+1+x*3,y*97+4+x*3)];
  assert.deepEqual(at(0,0),[0,0,0]);assert.deepEqual(at(16,16),[255,255,255]);assert.deepEqual(at(24,16),[0,0,0]);
});

test("analytics identity is preserved on content pages, with no duplicate tags",async()=>{
  for(const path of pages){const html=await exported(path);assert.equal((html.match(/<script[^>]*src="https:\/\/www.googletagmanager.com\/gtag\/js/g)||[]).length,0);assert.match(html,/G-C6H8Q9R5B5/);assert.match(html,/xz6mz3a8cb/);assert.match(html,/portfolio-analytics.js/);assert.doesNotMatch(html,/G-171WY5DL4E/);}
  const runtime=await read("public/portfolio-analytics.js");assert.match(runtime,/portfolio_project_open/);assert.doesNotMatch(runtime,/recruiter|employer|company_name|email_address/i);
});

test("Personal frames carry reviewed positions and background-matched padding metadata",async()=>{
  for(const item of packageData.items){assert.match(item.framing.object_position,/^\d+% \d+%$/);assert.ok(["cover","pad"].includes(item.framing.fit));assert.ok(item.framing.background);}
  assert.equal(packageData.items.find(item=>item.id==="desk-pen").framing.background,"#F8F8F8");
  assert.equal(packageData.items.find(item=>item.id.includes("neighborhood")).framing.fit,"pad");
  const html=await exported("personal/index.html");assert.match(html,/property="og:image" content="https:\/\/alexinfield.com\/assets\/personal\/media\/stool-/);
  const telefoni=html.match(/<video\b[^>]*data-original-source="[^"]*telefoni[^"]*"[^>]*>/)[0];assert.match(telefoni,/data-original-source="[^"]*p041-telefoni-01-audio\.mp4"/);assert.match(telefoni,/data-start-muted="true"/);assert.match(telefoni,/data-demand-only="true"/);assert.doesNotMatch(telefoni,/data-autoplay-video/);assert.match(telefoni,/preload="none"/);
});

test("approved 1.1.0 package and unchanged 1.0.0 rollback tarball are retained",async()=>{
  const hash=async name=>createHash("sha256").update(await readFile(new URL(`../vendor/${name}`,import.meta.url))).digest("hex");
  assert.equal(await hash("alex-infield-compass-augmentation-1.1.0.tgz"),"dfb9a8e55fe4fcf476ca78bd9a296729bf55a3620df86515a562f2839f3a473c");
  assert.equal(await hash("alex-infield-compass-augmentation-1.0.0.tgz"),"58b382220404bfd2cc637110128899428a7bef936367f7d34999c4a50edc3151");
  for(const item of packageData.items.filter(item=>item.id==="desk-pen"||item.id.includes("neighborhood")))assert.equal(item.framing.fill,"edge-extend");
});

test("no export document prints a raw email address",async()=>{
  for(const path of (await files()).filter(name=>name.endsWith(".html"))){
    const html=documentOnly(await exported(path));
    const visible=html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,"").replace(/<[^>]+>/g,"");
    assert.doesNotMatch(visible,/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,path);
    if(path!=="info/index.html")assert.doesNotMatch(html,/mailto:/,path);
  }
});

test("bottom case actions stay inside their collection and omit endpoints",async()=>{
  for(const sequence of [["molekule-go","ping","hyphae","luma"],["mode","niche"]]){
    const collection=sequence[0]==="mode"?"personal":"work";
    for(const [index,slug] of sequence.entries()){
      const html=documentOnly(await exported(`projects/${slug}/index.html`));
      const nav=/<nav\b[^>]*aria-label="Case navigation"[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1];
      assert.ok(nav,slug);
      assert.ok(html.indexOf('aria-label="Case navigation"')>html.indexOf('class="portfolio-case-stack"'));
      const links=[...nav.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(match=>({href:match[1],name:text(match[2])}));
      assert.deepEqual(links.map(link=>link.name),[...(index>0?["Previous"]:[]),"Back",...(index<sequence.length-1?["Next"]:[])],slug);
      for(const link of links){
        const url=new URL(link.href,`https://alexinfield.com/projects/${slug}/`);
        if(link.name==="Back")assert.equal(url.pathname,collection==="personal"?"/personal/":"/");
        else {assert.equal(url.pathname,`/projects/${sequence[index+(link.name==="Next"?1:-1)]}/`);assert.equal(url.searchParams.get("from"),collection);}
      }
      assert.doesNotMatch(nav,/\s(?:aria-)?disabled=|<img|carousel/);
    }
  }
});

test("404 offers just one Work action and Personal uses genuine descriptions without About labels",async()=>{
  const missing=documentOnly(await exported("404.html"));
  const actions=/<div class="portfolio-actions">([\s\S]*?)<\/div>/.exec(missing)[1];
  assert.deepEqual([...actions.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)].map(match=>text(match[1])),["Work"]);
  assert.doesNotMatch(missing,/Contact|mailto:/);
  const personal=documentOnly(await exported("personal/index.html"));
  assert.doesNotMatch(personal,/portfolio-about-label|portfolio-card-notes|>About</);
  assert.equal((personal.match(/class="personal-description"/g)||[]).length,visibleItems.filter(item=>item.short_text).length);
  assert.doesNotMatch(personal,/desk-pen-description|portfolio-description-strip/);
  assert.match(personal,/personal-masonry-shell/);
});

test("hidden BioMaking and the old Telefoni name never reach the public export",async()=>{
  const hidden=packageData.items.filter(item=>item.hidden).map(item=>item.id);
  assert.deepEqual(hidden,["p016-biomaking-gelatin-wrap-materials-study"]);
  for(const path of await files()){
    assert.doesNotMatch(path,/biomaking/i,path);
    if(/\.(html|js|css|json|xml|txt)$/.test(path)){
      const body=await exported(path);
      assert.doesNotMatch(body,/biomaking|gelatin/i,path);
      assert.doesNotMatch(body,/Telefoni/,path);
      assert.doesNotMatch(body,/p041-telefoni-01-poster-w(640|1280)/,path);
    }
  }
  await access(new URL("../public/assets/personal/media/p016-biomaking-gelatin-wrap-materials-study-01-w768.webp",import.meta.url));
  await access(new URL("../public/assets/personal/media/p041-telefoni-01-poster-w1280.webp",import.meta.url));
  for(const path of await files())assert.doesNotMatch(path,/p041-telefoni-01-poster-w/,path);
});

test("Video 2018 ships with its sound track and starts muted with mute and full-screen controls",async()=>{
  const film=await readFile(new URL("../public/assets/personal/media/p041-telefoni-01-audio.mp4",import.meta.url));
  const moov=film.indexOf("moov"),mdat=film.indexOf("mdat");
  assert.ok(moov>0&&moov<mdat,"fast-start: moov before mdat");
  const header=film.subarray(moov,mdat).toString("latin1");
  assert.match(header,/soun/);assert.match(header,/mp4a/);assert.match(header,/vide/);
  const item=packageData.items.find(entry=>entry.id==="p041-telefoni");
  assert.equal(item.gallery[0].has_audio,true);
  assert.ok((packageData.retired_media??[]).includes("media/p041-telefoni-01.mp4"));
  for(const path of await files())assert.doesNotMatch(path,/p041-telefoni-01\.mp4$/,path);
  const html=documentOnly(await exported("personal/index.html"));
  const frame=html.match(/<div[^>]*data-long-film="true"[^>]*>(?:(?!<\/video>)[\s\S])*data-start-muted="true"[\s\S]*?data-film-quick-controls/);
  assert.ok(frame,"start-muted film renders compact phone controls");
  assert.match(html,/aria-label="Unmute An edited sequence/);
  assert.match(html,/aria-label="Enter fullscreen: An edited sequence/);
  const runtime=await read("public/portfolio-runtime.js");
  assert.match(runtime,/webkitbeginfullscreen/);assert.match(runtime,/video\.muted = true/);
});

test("every exported page references the runtime and analytics scripts by their current content hash",async()=>{
  const version=async name=>createHash("sha256").update(await readFile(new URL(`../gh-pages/${name}`,import.meta.url))).digest("hex").slice(0,8);
  const runtime=await version("portfolio-runtime.js"),analytics=await version("portfolio-analytics.js");
  const html=(await files()).filter(path=>path.endsWith(".html"));
  assert.ok(html.length>=12);
  let runtimeRefs=0;
  for(const path of html){
    const body=await exported(path);
    for(const match of body.matchAll(/portfolio-(runtime|analytics)\.js(\?v=[0-9a-f]+)?/g)){
      assert.equal(match[2],`?v=${match[1]==="runtime"?runtime:analytics}`,`${path}: ${match[0]}`);
      if(match[1]==="runtime")runtimeRefs++;
    }
    assert.match(body,new RegExp(`portfolio-runtime\\.js\\?v=${runtime}`),path);
  }
  assert.ok(runtimeRefs>=html.length);
  for(const path of (await files()).filter(path=>path.startsWith("beats/")&&path.endsWith(".html")))assert.doesNotMatch(await exported(path),/portfolio-runtime\.js|portfolio-analytics\.js/);
});

// PR #14 ships with no blurred loading placeholders (Alex, Nov 2: "ship #14 first, blur
// later"); the Apple Extend-style blur returns as PR #15. Scroll sequences paint their poster.
test("no blurred loading placeholders ship: no inline placeholder images, attributes or rules",async()=>{
  for(const path of pages){
    const html=documentOnly(await exported(path));
    assert.doesNotMatch(html,/data-lqip|--lqip|--ss-lqip|feGaussianBlur/,path);
  }
  const assets=(await readdir(new URL("../gh-pages/assets/",import.meta.url))).filter(name=>/\.(css|js)$/.test(name));
  for(const name of assets)assert.doesNotMatch(await exported("assets/"+name),/data-lqip|--lqip|feGaussianBlur/,name);
  assert.doesNotMatch(await read("public/portfolio-runtime.js"),/lqip/i);
});

test("Luma opens and Molekule Go panel 19 plays as scroll sequences with versioned module, poster, still and frames",async()=>{
  const registry=JSON.parse(await read("lib/project-media.json"));
  assert.deepEqual(registry.luma[0],{kind:"sequence",source:"sequence:luma",sequence:"luma",width:1440,height:810});
  const mg=registry["molekule-go"].map(item=>item.source);
  assert.equal(mg[mg.indexOf("sequence:molekule-go")-1],"/assets/molekule-go/media/67b7c8cb7571d49d5ac98813_18.webp");
  assert.equal(mg[mg.indexOf("sequence:molekule-go")+1],"/assets/molekule-go/media/67b7c8d47a4f2aac5389bc87_20.webp");
  const version=async path=>createHash("sha256").update(await readFile(new URL(`../gh-pages/${path}`,import.meta.url))).digest("hex").slice(0,8);
  const js=await version("assets/scroll-sequence/scroll-sequence.js"),css=await version("assets/scroll-sequence/scroll-sequence.css");
  for(const [slug,stackIndex] of [["luma",0],["molekule-go",null]]){
    const html=documentOnly(await exported(`projects/${slug}/index.html`));
    const sections=[...html.matchAll(/<div class="case-sequence"><section class="ss[^"]*"[\s\S]*?<\/section><\/div>/g)].map(m=>m[0]);
    assert.equal(sections.length,1,slug);
    const section=sections[0];
    if(stackIndex===0)assert.match(html,/<div class="portfolio-case-stack"><div class="case-scroll-track"><div class="case-pin-strip"><div class="case-panel"><div class="case-sequence">/);
    assert.match(section,/role="img" aria-label="[^"]{30,}"/);
    assert.match(section,/<img\b[^>]*\ssrc="[^"]*sequence-[0-9a-f]{8}\/landscape\/jpg\/001\.jpg"/);
    assert.match(section,slug === "luma" ? /fetchpriority="high"/ : /loading="lazy" fetchpriority="low"/);
    assert.match(section,/<noscript><picture\b[^>]*\sclass="ss-still"/);
    assert.doesNotMatch(section,/--ss-lqip|class="ss-lqip"/);
    // 16:9 landscape frames at every size: no portrait crop on phones.
    assert.doesNotMatch(section,/portrait|ss-fade/);
    assert.match(html,new RegExp(`scroll-sequence\\.js\\?v=${js}`));assert.match(html,new RegExp(`scroll-sequence\\.css\\?v=${css}`));
    const config=JSON.parse(section.match(/<script type="application\/json" class="ss-config">([\s\S]*?)<\/script>/)[1]);
    assert.equal(config.count,90);
    // Three 16:9 sets by width; the player picks by the frame's device pixels (phones get 720).
    assert.deepEqual(Object.entries(config.sets).map(([name,set])=>[name,set.w]).sort((a,b)=>a[1]-b[1]),[["landscape-720",720],["landscape-1080",1080],["landscape",1440]]);
    for(const set of Object.values(config.sets))assert.ok(Math.abs(set.w/set.h-16/9)<.005,JSON.stringify(set));
    for(const set of Object.values(config.sets)){
      const dir=set.path.replace(/^(\.\.\/)+/,"");
      for(const fmt of config.formats){
        for(const n of [1,45,90])await access(new URL(`../gh-pages/${dir}/${fmt}/${String(n).padStart(3,"0")}.${fmt}`,import.meta.url));
        await access(new URL(`../gh-pages/${dir}/low.${fmt}`,import.meta.url));
      }
    }
    assert.doesNotMatch(section,/DESCRIBE THE ANIMATION|frames\//);
  }
  // Memory (Lighthouse fix 1): full frames only after the first scroll, a +-10 window, 3 at a time.
  const player=await exported("assets/scroll-sequence/scroll-sequence.js");
  assert.match(player,/WINDOW = 10, KEEP = 12, CONCURRENT = 3/);assert.doesNotMatch(player,/fetchAll/);
  const luma=documentOnly(await exported("projects/luma/index.html"));
  assert.doesNotMatch(luma,/11-transcode\.mp4/);
  for(const slug of ["ping","niche","hyphae","mode"])assert.doesNotMatch(await exported(`projects/${slug}/index.html`),/scroll-sequence\.js/);
});

// Extend blur (Alex approved, Nov 2): build-time colour fields, the approved lab recipe.
test("framed media carry Extend fields: none missing, none on Video 2018 or transparent art, no draft controls",async()=>{
  const report=JSON.parse(await read("dist/extend-blur.json"));
  assert.deepEqual(report.missing,[],"regenerate lib/extend-fields.json (scripts/extend-fields/gen_fields.py)");
  const sizes=[];
  for(const path of pages){
    const html=documentOnly(await exported(path));
    assert.doesNotMatch(html,/data-draft-review-panel|data-eb-slow|eb-review|data-eb-held/,path);
    const vars=[...html.matchAll(/--eb-c:#[0-9a-f]{6};--eb-img:url\((data:image\/webp;base64,[A-Za-z0-9+/=]+)\)/g)];
    vars.forEach(m=>sizes.push(m[0].length));
    if(vars.length){
      assert.match(html,/<link rel="stylesheet" href="[^"]*assets\/eb\/extend\.css\?v=[0-9a-f]{8}"\/>/,path);
      assert.match(html,/<script src="[^"]*assets\/eb\/extend\.js\?v=[0-9a-f]{8}" defer=""><\/script>/,path);
      assert.equal((html.match(/data-eb-host=""/g)||[]).length,(html.match(/data-eb-media=""/g)||[]).length,path);
    }
    // Video 2018 keeps its black bars: no field on its frame or media
    for(const tag of html.match(/<(?:img|video)\b[^>]*p041-telefoni[^>]*>/g)||[])assert.doesNotMatch(tag,/data-eb-/,path);
  }
  for(const path of ["index.html","personal/index.html","projects/luma/index.html","projects/molekule-go/index.html"])
    assert.match(await exported(path),/data-eb-host=""/,path);
  // the scroll-sequence posters are hosts
  for(const slug of ["luma","molekule-go"])assert.match(await exported(`projects/${slug}/index.html`),/<picture\b(?=[^>]*\sdata-eb-host="")(?=[^>]*\sclass="ss-poster")/,slug);
  // real transparency gets none: the Info artwork and Book
  assert.doesNotMatch((await exported("info/index.html")).match(/<div class="portfolio-artwork"[^>]*>/)?.[0]??"",/data-eb/);
  sizes.sort((a,b)=>a-b);
  assert.ok(sizes.length>50&&sizes[Math.floor(sizes.length/2)]<900&&sizes[sizes.length-1]<1500,JSON.stringify({n:sizes.length,median:sizes[Math.floor(sizes.length/2)],max:sizes.at(-1)}));
  const css=await exported("assets/eb/extend.css");
  assert.match(css,/eb-drift 9s/);assert.match(css,/opacity \.5s/);assert.match(css,/prefers-reduced-motion: no-preference/);
  assert.doesNotMatch(css+await exported("assets/eb/extend.js"),/radial-gradient|draft-review|slow/i);
});
