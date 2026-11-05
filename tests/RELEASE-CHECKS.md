# Next release checks

Use the committed head supplied with the handoff. These are local export checks;
they never push, deploy, install packages or browsers, use owner browser profiles,
or send real analytics. The provider-domain probe fulfils requests with synthetic
SDKs and records requests, CSP blocks, cookies and same-origin storage.

Use the Mac bench's existing Playwright package. Set
`PORTFOLIO_PLAYWRIGHT_MODULE` to its package directory if it is outside this repo.
Use its existing `PLAYWRIGHT_BROWSERS_PATH` when applicable. Optional
`PORTFOLIO_CHROMIUM_PATH` and `PORTFOLIO_WEBKIT_PATH` select cached executables.
The runner creates ephemeral loopback TLS with the system `openssl`; it does not
install a certificate or change trust. Browser contexts ignore only that fixture's
certificate error. The output directory must be in Scratch, outside the repo.

Build and static checks:

```sh
PORTFOLIO_ALLOW_INDEXING=true npm run build:github
node --test tests/rendered-html.test.mjs tests/meta-security.test.mjs tests/review-fixes.test.mjs
npm run lint
```

Run both engines, sequentially, with the new executable runner:

```sh
npm run test:browser -- --export gh-pages --out "$PORTFOLIO_TEST_OUT" --engines chromium,webkit
```

This runs the retained case/navigation/film suites, the current Personal matrix,
eight consent cases per engine, strict zero-gap checks, and delayed-image Extend
checks. The previous Infield-only `verify-browser.mjs` and `verify-mounted.mjs`
wrappers are historical tools; use this runner for the Mac. At 244c1d0 the old
`test:browser` command only imported an export-only module; the new command
actually executes the checks and returns nonzero for failure or interruption.

Focused commands, useful for splitting the Mac receipt:

```sh
npm run test:consent -- --export gh-pages --out "$PORTFOLIO_CONSENT_OUT" --engines chromium,webkit
npm run test:personal -- --export gh-pages --out "$PORTFOLIO_PERSONAL_OUT" --engines chromium,webkit
node tests/run-release-checks.mjs --suite preserved --export gh-pages --out "$PORTFOLIO_PRESERVED_OUT" --engines chromium,webkit
node tests/run-release-checks.mjs --suite gaps --export gh-pages --out "$PORTFOLIO_GAPS_OUT" --engines chromium,webkit
node tests/run-release-checks.mjs --suite extend --export gh-pages --out "$PORTFOLIO_EXTEND_OUT" --engines chromium,webkit
```

Choose the complete command or the split commands; running both repeats work.
For a consent reproducer, add `--case mid-clarity` or `--case mid-google`.
For just the canonical screenshot set, use Personal with `--capture-only`.

The Personal matrix covers 393, 1024 and 1440, light/dark and both motion
preferences, plus no-JS fallback. It checks natural reserved media ratios,
caption placement, top-aligned balanced columns and 20px gutters, fixed swipe
geometry/gap 0, native film controls, near-view script/font loading, original
materials and font, keyboard focus, touch/mouse wheel navigation, selection
without recording transfer, explicit Play, pause and all three hosted files.
Chromium's wheel and gallery swipes use native CDP touch input; WebKit uses native
touch taps and mouse dragging because Playwright has no WebKit touch-move API.
Both engines exercise keyboard and mouse input. No physical phone is claimed.

Old uniform-4:3 and Info-overlay assertions are updated to Alex's Nov 3 natural
heights and below-media descriptions. The original software/font MIT notices are
retained. No local imports, blobs, generated demo recordings or player page are
part of the build.

`release-checks.json` is the aggregate result. Per-engine folders contain raw
results, requested screenshots, keyboard/player states and the Chromium phone
screen recording. `personal/video-times.json` marks Play and swipe offsets in
`personal/play-and-swipe.webm` for short clips. The capture helper stitches normal
viewports and requires no Pillow or other image package. It records the fixed
header once. CLS is reported numerically only when the browser exposes its API;
both engines also compare actual card geometry. Lighthouse's CLS target is 0.

Return the source head, export identity, exact commands, browser versions,
aggregate JSON and failures rather than only the process exit code. Keep source,
build/browser evidence, real-device verification and Alex's acceptance separate.
Lighthouse stays on Outfield: Personal and Molekule Go mobile, three runs each,
with the retained method and raw reports. No broad Outfield browser reruns.
