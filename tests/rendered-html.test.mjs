import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
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
const caseSource = await read("app/case-text.tsx");
const CASE_TEXT_ENABLED = /export const CASE_TEXT_ENABLED = true\b/.test(caseSource);
const packageData = JSON.parse(await read("lib/personal.json"));
const overrides = {stool:"Kerf Stool","wall-mounts":"CNC Portrait Relief"};

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
  assert.match(html,/<footer[^>]*>[\s\S]*mailto:alex@infield.net/);
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
    assert.match(nav,/<button\b(?=[^>]*disabled="")(?=[^>]*aria-disabled="true")(?=[^>]*data-slot="button")[^>]*>Professional<\/button>/);
    assert.doesNotMatch(nav,/href="[^"]*professional|tabindex="0"[^>]*>Professional/);
    assert.match(html,/href="#main-content"[^>]*>Skip to content/);
    assert.match(html,/<main\b[^>]*id="main-content"[^>]*tabindex="-1"/);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,path);
    assert.doesNotMatch(html,/data-theme-toggle|portfolio-theme\.js|portfolio-compass-theme|Appearance/);
    const palette=path.startsWith("personal/")?"light":"dark";assert.match(html,new RegExp(`<html[^>]*data-theme="${palette}"`));
  }
});

test("Info contains the exact approved text, artwork, email once and no appearance control",async()=>{
  const html=documentOnly(await exported("info/index.html"));
  assert.match(html,/I&#x27;m Alex Infield, an industrial designer based in Brooklyn, New York\. My work spans product visualization, CAD, prototyping and fabrication for consumer goods, furniture and lighting\./);
  assert.match(html,/IMG_0019\.png/);
  assert.match(html,/mailto:alex@infield.net/);
  assert.equal((html.match(/href="mailto:alex@infield.net"/g)||[]).length,1);
  assert.doesNotMatch(html,/<footer|Appearance|data-slot="toggle-group"/);
  assert.doesNotMatch(html,/résumé|resume|flower|garden/i);
});

test("Personal exports exactly the package order, owner titles and existing case links",async()=>{
  const html=documentOnly(await exported("personal/index.html"));
  const ids=[...html.matchAll(/data-personal-id="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,16);
  assert.deepEqual(ids,packageData.items.map(item=>item.id));
  const headings=[...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map(match=>text(match[1]));
  assert.deepEqual(headings,packageData.items.map(item=>overrides[item.id]??item.title));
  assert.match(html,/href="\.\.\/projects\/mode\/"/);
  assert.match(html,/href="\.\.\/projects\/niche\/"/);
  assert.doesNotMatch(html,/>null<|>undefined<|JuiceBox|data-year="null"/);
  assert.match(text(html),/16 projects shown/);
  assert.match(html,/data-slot="select-trigger"[^>]*[\s\S]*Filter by year/);
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
  const actual=(await readdir(new URL("../public/assets/personal/media/",import.meta.url))).map(name=>"media/"+name);
  assert.deepEqual([...sources].sort(),actual.sort());
  for(const source of sources)await access(new URL(`../public/assets/personal/${source}`,import.meta.url));
});

test("all six cases preserve the complete ordered image content and descriptions",async()=>{
  const registry=JSON.parse(await read("lib/project-media.json"));
  const expected={ping:17,"molekule-go":17,luma:22,niche:20,hyphae:26,mode:17};
  for(const [index,slug] of slugs.entries()){
    assert.equal(registry[slug].length,expected[slug]);
    const html=documentOnly(await exported(`projects/${slug}/index.html`));
    assert.match(html,new RegExp(`<h1>${titles[index]}</h1>`));
    const tags=[...html.matchAll(/<img\b[^>]*>/g)].map(match=>match[0]);
    assert.deepEqual(tags.map(tag=>/\ssrc="([^"]+)"/.exec(tag)[1].replace(/^\.\.\/\.\.\//,"/")),registry[slug].filter(item=>item.kind==="image").map(item=>item.source),slug);
    for(const tag of tags)assert.ok(/\salt="([^"]+)"/.exec(tag)?.[1].length>10);
    assert.match(html,/portfolio-case-stack/);
    assert.match(html,/data-slot="button"[\s\S]*Back to Work/);
    assert.match(html,/<footer/);
    if(!CASE_TEXT_ENABLED)assert.doesNotMatch(html,/class="case-text"/);
    for(const item of registry[slug]){await access(new URL(`../public${item.source}`,import.meta.url));if(item.poster)await access(new URL(`../public${item.poster}`,import.meta.url));}
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
    mode:["Mode","2023","Folio is a bedside table designed for the routines of modern life."],
  };
  for(const slug of slugs){const html=await (await render(`/projects/${slug}`)).text();assert.match(html,new RegExp(`<section class="case-text"[^>]*><h2>${expected[slug][0]}</h2>`));for(const copy of expected[slug].slice(1))assert.ok(html.includes(copy),`${slug}: ${copy}`);}
});

test("deferred video keeps sources dormant, posters present and MP4 first",async()=>{
  for(const path of [...slugs.map(slug=>`projects/${slug}/index.html`),"personal/index.html"]){
    const html=documentOnly(await exported(path));
    for(const [video] of html.matchAll(/<video\b[\s\S]*?<\/video>/g)){
      assert.match(video,/preload="none"/);
      assert.match(video,/poster="[^"]+"/);
      assert.doesNotMatch(video,/<video[^>]*\sautoplay|<source[^>]*\ssrc=/i);
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
    assert.doesNotMatch(html,/<video[^>]*\scontrols/);
    if(html.includes("<video"))assert.match(html,/data-button-kind="icon"/);
    assert.doesNotMatch(html,/portfolio-video-controls|carousel-controls/);
    if(slug==="hyphae"){assert.match(html,/data-film-controls/);assert.match(html,/Mute Hyphae Light film/);assert.match(html,/Enter fullscreen: Hyphae Light film/);assert.match(html,/data-slot="slider"/);}
  }
});

test("404 retains a same-document skip target, one robots tag and no inherited URL or analytics",async()=>{
  assert.equal((await render("/missing/deep/route")).status,404);
  const html=await exported("404.html");
  assert.doesNotMatch(html,/<base\b|rel="canonical"|property="og:url"|googletagmanager|clarity|portfolio-analytics/);
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

test("hydration is retained only for Personal and the Hyphae film; preview remains noindex",async()=>{
  for(const path of ["personal/index.html","projects/hyphae/index.html"]){const html=await exported(path);assert.match(html,/__VINEXT_RSC_|id="_R_"/);}
  for(const path of ["index.html","info/index.html",...slugs.filter(slug=>slug!=="hyphae").map(slug=>`projects/${slug}/index.html`),"404.html"]){assert.doesNotMatch(await exported(path),/__VINEXT_RSC_|id="_R_"/);}
  for(const path of pages)assert.match(await exported(path),/name="robots" content="noindex,nofollow"/);
  assert.equal(await exported("robots.txt"),"User-agent: *\nDisallow: /\n");
  const sitemap=await exported("sitemap.xml");assert.match(sitemap,/<loc>https:\/\/alexinfield.com\/personal<\/loc>/);assert.doesNotMatch(sitemap,/\/etc|\/play|\/professional/);
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
  assert.equal(pkg.dependencies["@alex-infield/compass-augmentation"],"file:vendor/alex-infield-compass-augmentation-1.1.0.tgz");
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
  for(const path of pages){const html=await exported(path);assert.equal((html.match(/<script[^>]*src="https:\/\/www.googletagmanager.com\/gtag\/js/g)||[]).length,1);assert.match(html,/G-C6H8Q9R5B5/);assert.match(html,/xz6mz3a8cb/);assert.match(html,/portfolio-analytics.js/);assert.doesNotMatch(html,/G-171WY5DL4E/);}
  const runtime=await read("public/portfolio-analytics.js");assert.match(runtime,/portfolio_project_open/);assert.doesNotMatch(runtime,/recruiter|employer|company_name|email_address/i);
});

test("Personal frames carry reviewed positions and background-matched padding metadata",async()=>{
  for(const item of packageData.items){assert.match(item.framing.object_position,/^\d+% \d+%$/);assert.ok(["cover","pad"].includes(item.framing.fit));assert.ok(item.framing.background);}
  assert.equal(packageData.items.find(item=>item.id==="desk-pen").framing.background,"#F8F8F8");
  assert.equal(packageData.items.find(item=>item.id.includes("neighborhood")).framing.fit,"pad");
  const html=await exported("personal/index.html");assert.match(html,/property="og:image" content="https:\/\/alexinfield.com\/assets\/personal\/media\/stool-/);
  const telefoni=html.match(/<video\b[^>]*data-original-source="[^"]*telefoni[^"]*"[^>]*>/)[0];assert.match(telefoni,/data-demand-only="true"/);assert.doesNotMatch(telefoni,/data-autoplay-video/);assert.match(telefoni,/preload="none"/);
});

test("approved 1.1.0 package and unchanged 1.0.0 rollback tarball are retained",async()=>{
  const hash=async name=>createHash("sha256").update(await readFile(new URL(`../vendor/${name}`,import.meta.url))).digest("hex");
  assert.equal(await hash("alex-infield-compass-augmentation-1.1.0.tgz"),"dfb9a8e55fe4fcf476ca78bd9a296729bf55a3620df86515a562f2839f3a473c");
  assert.equal(await hash("alex-infield-compass-augmentation-1.0.0.tgz"),"58b382220404bfd2cc637110128899428a7bef936367f7d34999c4a50edc3151");
  for(const item of packageData.items.filter(item=>item.id==="desk-pen"||item.id.includes("neighborhood")))assert.equal(item.framing.fill,"edge-extend");
});
