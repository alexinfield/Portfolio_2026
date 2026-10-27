import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

// Run against a locally served Pages export on Infield. Reuse an installed
// Playwright module and Chromium binary; this script never installs either.
// PORTFOLIO_TEST_URL=http://127.0.0.1:PORT npm run test:browser
export async function runBrowserRegressions(browser, baseURL) {
  const checks = [];
  const record = (name, assertion) => {
    try {
      assertion();
      checks.push({ name, pass: true });
    } catch (error) {
      checks.push({ name, pass: false, error: error.message });
    }
  };
  const routes = ["/", "/info/", "/etc/", ...["ping", "molekule-go", "luma", "niche", "hyphae", "mode"].map((slug) => `/projects/${slug}/`)];
  const context = await browser.newContext({ viewport: { width: 393, height: 852 }, reducedMotion: "reduce" });
  // Keep verification out of analytics. No existing browser profile is reused.
  await context.route(/https:\/\//, (route) => route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    for (const route of routes) {
      await page.goto(baseURL + route, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      const links = await page.locator("header a").evaluateAll((items) => items.map((link) => {
        const box = link.getBoundingClientRect();
        return { name: link.innerText, width: box.width, height: box.height, visibleHeight: Math.min(box.bottom, innerHeight) - Math.max(box.top, 0) };
      }));
      record(`44px phone links: ${route}`, () => links.forEach((link) => {
        assert.ok(link.width >= 43.99 && link.height >= 43.99 && link.visibleHeight >= 43.99, JSON.stringify(link));
      }));
      const landmarks = await page.getByRole("navigation", { name: "Primary" }).count();
      record(`navigation landmark: ${route}`, () => assert.equal(landmarks, 1));
      await page.keyboard.press("Tab");
      const skip = await page.evaluate(() => {
        const element = document.activeElement;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return { text: element.textContent, outline: style.outlineStyle, width: style.outlineWidth, y: rect.y };
      });
      record(`visible skip focus: ${route}`, () => {
        assert.equal(skip.text, "Skip to content");
        assert.equal(skip.outline, "solid");
        assert.ok(parseFloat(skip.width) >= 2 && skip.y >= 0);
      });
      await page.keyboard.press("Enter");
      const target = await page.evaluate(() => document.activeElement.id);
      record(`skip moves focus: ${route}`, () => assert.equal(target, "main-content"));
      // focus-visible is a keyboard modality. Test the actual Tab sequence.
      await page.goto(baseURL + route, { waitUntil: "load" });
      await page.waitForTimeout(400);
      await page.keyboard.press("Tab");
      for (const link of await page.locator("header a").all()) {
        await page.keyboard.press("Tab");
        const style = await link.evaluate((element) => ({ focused: element === document.activeElement, outline: getComputedStyle(element).outlineStyle, width: getComputedStyle(element).outlineWidth }));
        record(`header focus ${await link.innerText()}: ${route}`, () => {
          assert.ok(style.focused);
          assert.equal(style.outline, "solid");
          assert.ok(parseFloat(style.width) >= 2);
        });
      }
      if (route.startsWith("/projects/")) {
        const panels = await page.locator(".case-text").evaluateAll((items) => items.map((element) => ({
          text: element.innerText, width: element.getBoundingClientRect().width, font: getComputedStyle(element).fontSize,
        })));
        record(`case text reflows: ${route}`, () => {
          assert.ok(panels.some((panel) => panel.text.length > 120));
          assert.ok(panels.every((panel) => panel.width > 300 && panel.width <= 393 && parseFloat(panel.font) >= 16));
        });
        const alts = await page.locator("main img").evaluateAll((items) => items.map((image) => image.alt));
        record(`image descriptions: ${route}`, () => assert.ok(alts.every((alt) => alt.length > 10)));
        const videos = await page.locator("video").evaluateAll((items) => items.map((video) => ({ paused: video.paused, time: video.currentTime, src: video.currentSrc })));
        record(`reduced motion leaves videos dormant: ${route}`, () => assert.ok(videos.every((video) => video.paused && video.time === 0 && video.src === "")));
      }
      const metadata = await page.locator('meta[property="og:title"]').getAttribute("content");
      const title = await page.title();
      const twitter = await page.locator('meta[name="twitter:card"]').getAttribute("content");
      record(`share metadata: ${route}`, () => {
        assert.equal(metadata, title);
        assert.equal(twitter, "summary_large_image");
      });
    }

    await page.goto(baseURL + "/etc/", { waitUntil: "load" });
    const carousel = page.locator(".exact-carousel").first();
    const activeLabel = () => carousel.locator(".is-active").getAttribute("aria-label");
    const first = await activeLabel();
    await page.waitForTimeout(3300);
    const stillFirst = await activeLabel();
    record("reduced motion stops carousel", () => {
      assert.equal(first, "1 of 5");
      assert.equal(stillFirst, first);
    });
    await carousel.getByRole("button", { name: "Next slide", exact: true }).click();
    const next = await activeLabel();
    record("carousel next", () => assert.equal(next, "2 of 5"));
    await carousel.getByRole("button", { name: "Previous slide", exact: true }).click();
    const previous = await activeLabel();
    record("carousel previous", () => assert.equal(previous, first));
    await carousel.focus();
    await page.keyboard.press("ArrowRight");
    const keyboardNext = await activeLabel();
    record("carousel keyboard", () => assert.equal(keyboardNext, "2 of 5"));
    await carousel.getByRole("button", { name: "Play slideshow", exact: true }).click();
    await page.waitForTimeout(3300);
    const played = await activeLabel();
    record("explicit slideshow play", () => assert.notEqual(played, keyboardNext));
    await carousel.getByRole("button", { name: "Pause slideshow", exact: true }).click();
    await page.waitForTimeout(3300);
    const paused = await activeLabel();
    record("persistent slideshow pause", () => assert.equal(paused, played));
    const buttonBoxes = await carousel.getByRole("button").evaluateAll((buttons) => buttons.map((button) => ({ width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height })));
    record("44px carousel controls", () => assert.ok(buttonBoxes.every((box) => box.width >= 44 && box.height >= 44)));

    await page.goto(baseURL + "/projects/ping/", { waitUntil: "load" });
    const pingFrame = page.locator("[data-video-frame]").first();
    await pingFrame.scrollIntoViewIfNeeded();
    await pingFrame.locator("[data-video-toggle]").click();
    await page.waitForTimeout(1000);
    const canDecodeH264 = await page.locator("video").first().evaluate((video) => video.canPlayType('video/mp4; codecs="avc1.42E01E"'));
    if (!canDecodeH264) {
      const unavailable = await pingFrame.locator("[data-video-status]").isVisible();
      const fileURL = await pingFrame.locator("[data-video-status] a").getAttribute("href");
      record("unsupported video has a visible explanation and file link", () => {
        assert.ok(unavailable);
        assert.ok(fileURL.endsWith(".mp4"));
      });
    }

    const missing = await page.goto(baseURL + "/projects/missing/deep/", { waitUntil: "load" });
    const workURL = await page.locator(".not-found-content a").first().evaluate((link) => link.href);
    const heading = await page.locator(".not-found-content h1").innerText();
    const font = await page.locator(".not-found-content").evaluate((element) => getComputedStyle(element).fontFamily);
    record("deep 404 keeps status, type and recovery", () => {
      assert.equal(missing.status(), 404);
      assert.equal(heading, "Page not found");
      assert.equal(workURL, new URL("/", baseURL).href);
      assert.match(font, /Funktionalgrotesk/);
    });
    record("no page JavaScript errors", () => assert.deepEqual(errors, []));
  } finally {
    await context.close();
  }

  const normal = await browser.newContext({ viewport: { width: 393, height: 852 } });
  await normal.route(/https:\/\//, (route) => route.abort());
  const mediaPage = await normal.newPage();
  try {
    for (const slug of ["molekule-go", "hyphae"]) {
      const mediaRequests = [];
      const listener = (request) => { if (/\.(mp4|webm)(?:\?|$)/.test(request.url())) mediaRequests.push(request.url()); };
      mediaPage.on("request", listener);
      await mediaPage.goto(`${baseURL}/projects/${slug}/`, { waitUntil: "load" });
      await mediaPage.waitForTimeout(900);
      const offscreen = await mediaPage.locator("video").evaluateAll((videos) => videos.filter((video) => {
        const box = video.getBoundingClientRect();
        return box.top >= innerHeight + 200 || box.bottom <= -200;
      }).map((video) => ({ source: video.currentSrc, sources: [...video.querySelectorAll("source")].map((source) => source.getAttribute("src")) })));
      record(`offscreen video sources stay dormant: ${slug}`, () => {
        assert.ok(offscreen.length > 0);
        assert.ok(offscreen.every((video) => video.source === "" && video.sources.every((source) => source === null)));
        if (slug === "molekule-go") assert.deepEqual(mediaRequests, []);
      });
      mediaPage.off("request", listener);
    }
    await mediaPage.goto(baseURL + "/projects/molekule-go/", { waitUntil: "load" });
    const video = mediaPage.locator("video").first();
    const frame = mediaPage.locator("[data-video-frame]").first();
    await frame.scrollIntoViewIfNeeded();
    await mediaPage.waitForFunction(() => {
      const video = document.querySelector("video");
      return !video.paused && video.currentTime > 0.1 && video.videoWidth > 0;
    }, null, { timeout: 10000 });
    const playback = await video.evaluate((element) => ({ source: element.currentSrc, width: element.videoWidth }));
    record("nearby web derivative really plays", () => {
      assert.match(playback.source, /uv-web\.(webm|mp4)$/);
      assert.equal(playback.width, 1280);
    });
    await frame.locator("[data-video-toggle]").click();
    await mediaPage.evaluate(() => scrollTo(0, 0));
    await frame.scrollIntoViewIfNeeded();
    await mediaPage.waitForTimeout(600);
    const persistentPause = await video.evaluate((element) => element.paused);
    record("video pause survives leaving and reentering viewport", () => assert.ok(persistentPause));
    await frame.locator("[data-video-toggle]").click();
    await mediaPage.waitForTimeout(500);
    const resumed = await video.evaluate((element) => !element.paused);
    record("explicit video play resumes", () => assert.ok(resumed));
    await mediaPage.emulateMedia({ reducedMotion: "reduce" });
    await mediaPage.waitForTimeout(300);
    const reducedPause = await video.evaluate((element) => element.paused);
    record("changed motion preference pauses playback", () => assert.ok(reducedPause));
  } finally {
    await normal.close();
  }
  return checks;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const baseURL = process.env.PORTFOLIO_TEST_URL;
  const modulePath = process.env.PORTFOLIO_PLAYWRIGHT_MODULE;
  const executablePath = process.env.PORTFOLIO_CHROMIUM_PATH;
  if (!baseURL || !modulePath || !executablePath) throw new Error("Set PORTFOLIO_TEST_URL, PORTFOLIO_PLAYWRIGHT_MODULE and PORTFOLIO_CHROMIUM_PATH to existing resources.");
  const require = createRequire(import.meta.url);
  const { chromium } = require(modulePath);
  const browser = await chromium.launch({ executablePath, headless: true, args: ["--no-sandbox", "--disable-gpu"] });
  try {
    const checks = await runBrowserRegressions(browser, baseURL);
    process.stdout.write(JSON.stringify(checks, null, 2) + "\n");
    if (checks.some((check) => !check.pass)) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}
