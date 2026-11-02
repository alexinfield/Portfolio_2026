import assert from "node:assert/strict";
import {configureTelefoniCodecFixture} from "./native-film-browser.mjs";

// Video 2018 (Telefoni) starts muted; the Compass mute button toggles sound and
// full screen turns it on. Desktop uses the film bar; phones get the same two
// buttons once the film starts; iPhone's video-element full screen is emulated
// by removing element full screen and providing webkitEnterFullscreen.
const frameSel = "#p041-telefoni [data-video-frame]";
const isMuted = page => page.evaluate(s => document.querySelector(s + " video").muted, frameSel);

export async function runTelefoniSoundRegressions(browser, baseURL) {
  const results = [], origin = new URL(baseURL).origin;
  const check = async (name, action) => {
    try { const detail = await action(); results.push({suite: "telefoni-sound", name, pass: true, ...(detail ? {detail} : {})}); console.log(`telefoni-sound PASS: ${name}`); }
    catch (error) { results.push({suite: "telefoni-sound", name, pass: false, error: error.message.slice(0, 1800)}); console.log(`telefoni-sound FAIL: ${name}: ${error.message.slice(0, 200)}`); }
  };
  const open = async (options, init) => {
    const context = await browser.newContext(options);
    context.setDefaultTimeout(30000);
    await context.route("**/*", route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    if (init) await context.addInitScript(init);
    const page = await context.newPage();
    await page.goto(baseURL + "/personal/#p041-telefoni");
    await page.waitForFunction(() => document.querySelector("[data-personal-ready]")?.dataset.personalReady === "true");
    const frame = page.locator(frameSel); await frame.scrollIntoViewIfNeeded();
    return {context, page, frame};
  };
  {
    const {context, page, frame} = await open({viewport: {width: 1440, height: 900}});
    try {
      await check("desktop: Video 2018 starts muted with Compass mute and full-screen buttons", async () => {
        assert.equal(await isMuted(page), true);
        assert.equal(await page.evaluate(s => document.querySelector(s + " video").defaultMuted, frameSel), true);
        assert.equal(await frame.locator("video").getAttribute("data-start-muted"), "true");
        await frame.hover();
        const bar = frame.locator("[data-film-controls]");
        assert.equal(await bar.locator("[data-film-mute]").getAttribute("aria-label"), "Unmute " + await frame.locator("video").getAttribute("aria-label"));
        assert.equal(await bar.locator("[data-film-fullscreen]").isEnabled(), true);
        assert.equal(await frame.locator("[data-film-quick-controls]").isVisible(), false);
      });
      await check("desktop: Play keeps it muted; mute button turns sound on and off", async () => {
        await configureTelefoniCodecFixture(page, frame.locator("video"), baseURL);
        await frame.hover(); await frame.locator("[data-film-controls] [data-video-toggle]").click();
        await page.waitForFunction(s => { const v = document.querySelector(s + " video"); return !v.paused && v.currentTime > .1; }, frameSel);
        assert.equal(await isMuted(page), true);
        const mute = frame.locator("[data-film-controls] [data-film-mute]");
        await mute.click(); assert.equal(await isMuted(page), false);
        assert.match(await mute.getAttribute("aria-label"), /^Mute /);
        await mute.click(); assert.equal(await isMuted(page), true);
      });
      await check("desktop: full screen turns the sound on", async () => {
        await frame.hover(); await frame.locator("[data-film-controls] [data-film-fullscreen]").click();
        await page.waitForFunction(s => document.fullscreenElement === document.querySelector(s), frameSel);
        assert.equal(await isMuted(page), false);
        await page.evaluate(() => document.exitFullscreen()); await page.waitForFunction(() => !document.fullscreenElement);
      });
    } finally { await context.close(); }
  }
  {
    const {context, page, frame} = await open({viewport: {width: 393, height: 852}, isMobile: true, hasTouch: true, deviceScaleFactor: 2});
    try {
      await check("phone: after Play, compact mute and full-screen buttons work", async () => {
        assert.equal(await isMuted(page), true);
        assert.equal(await frame.locator("[data-film-quick-controls]").isVisible(), false);
        await configureTelefoniCodecFixture(page, frame.locator("video"), baseURL);
        await frame.locator("[data-native-film-play]").tap();
        await page.waitForFunction(s => { const v = document.querySelector(s + " video"); return !v.paused && v.currentTime > .1; }, frameSel);
        assert.equal(await isMuted(page), true);
        const quick = frame.locator("[data-film-quick-controls]");
        await frame.tap({position: {x: 60, y: 60}}).catch(() => {});
        await quick.locator("[data-film-mute]").tap(); assert.equal(await isMuted(page), false);
        await quick.locator("[data-film-mute]").tap(); assert.equal(await isMuted(page), true);
        const box = await quick.boundingBox(), video = await frame.locator("video").boundingBox();
        assert.ok(box.y < video.y + video.height / 2 && box.x + box.width > video.x + video.width / 2, "compact controls sit top-right");
        await quick.locator("[data-film-fullscreen]").tap();
        await page.waitForFunction(() => Boolean(document.fullscreenElement));
        assert.equal(await isMuted(page), false);
        await page.evaluate(() => document.exitFullscreen()); await page.waitForFunction(() => !document.fullscreenElement);
      });
    } finally { await context.close(); }
  }
  {
    const iphone = () => {
      Object.defineProperty(Element.prototype, "requestFullscreen", {value: undefined, configurable: true});
      Object.defineProperty(Document.prototype, "fullscreenEnabled", {get: () => false, configurable: true});
      HTMLVideoElement.prototype.webkitEnterFullscreen = function () { this.dataset.webkitFullscreen = "true"; this.dispatchEvent(new Event("webkitbeginfullscreen")); };
    };
    const {context, page, frame} = await open({viewport: {width: 393, height: 852}, isMobile: true, hasTouch: true, deviceScaleFactor: 3}, iphone);
    try {
      await check("iPhone path: full screen uses webkitEnterFullscreen and turns the sound on", async () => {
        await configureTelefoniCodecFixture(page, frame.locator("video"), baseURL);
        await frame.locator("[data-native-film-play]").tap();
        await page.waitForFunction(s => { const v = document.querySelector(s + " video"); return !v.paused && v.readyState >= 1; }, frameSel);
        assert.equal(await isMuted(page), true);
        const full = frame.locator("[data-film-quick-controls] [data-film-fullscreen]");
        assert.equal(await full.isEnabled(), true);
        await frame.tap({position: {x: 60, y: 60}}).catch(() => {});
        await full.tap();
        assert.equal(await frame.locator("video").getAttribute("data-webkit-fullscreen"), "true");
        assert.equal(await isMuted(page), false);
      });
    } finally { await context.close(); }
  }
  return results;
}
