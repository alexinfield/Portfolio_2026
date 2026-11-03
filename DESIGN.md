# Portfolio design

Alex's November 3 review of draft v28 requires the Luma and Molekule Go
sequences to pin while scrubbing, with neighbouring content touching them.
The sequence and up to four real panels on either side now stick as a
continuous strip for 125svh of native scroll. The rest of the case remains
outside the sticky layer to keep its painted area bounded on WebKit.
Luma opens against the header; Molekule Go enters fully and pins against the
viewport bottom, with preceding panels filling the space above. The sequence
blocks retain their full-width 16:9 geometry and seam trim. Stable viewport
units keep toolbar expansion out of the scrub mapping. Reduce Motion and
no-JS stills remain in flow. Evidence and the viewport matrix are in the
external `golive-261101/report-pr14-pin.md` handoff.

Alex's approved October 28 critique spec owns this refinement of the October 27
image-led portfolio: Funktional Grotesk,
large original imagery, grayscale UI, borderless surfaces and 5 px corners.
The supplied case-study image panels retain their content.

- Palettes are fixed: Personal is light; every other page is dark. No appearance
  switch, system-following mode or preference storage. This is Alex's explicit
  portfolio exception to the general design-system appearance policy.
- Work: Molekule Go, Ping, Hyphae Light, Luma; name-only captions without
  underlines at rest or on hover and one quiet Personal action. No footer email.
- Personal: the verified allowlist (15 shown; BioMaking hidden Nov 1 with its
  record and media kept but never exported; Telefoni shown as "Video 2018";
  Warp sits immediately before Mycelium), existing Folio/Niche case links,
  manual galleries and retained AND filter logic behind one hidden-UI flag.
  Uniform 4:3 frames; per-slide positions and source-derived edge extension
  preserve whole objects. Genuine descriptions reveal only in bottom image
  strips on hover/focus, with tap toggle and separate swipe navigation on touch.
  Dots/count persist below the strip; arrows reveal on hover/focus/touch.
- Info: the approved Brooklyn introduction, one secondary Contact mailto Button
  beneath it and the existing artwork. The desktop text group is centered.
  No footer email, appearance control or résumé link.
- Navigation uses the same Compass component, size, padding, weight and selected
  fill for Work, Personal and Info. The header is fixed, with production's
  #000000d9 / 24 px blur / z-index 100 treatment (#fffc on Personal), opaque
  fallback and measured content/anchor offset. Professional stays unavailable:
  a focusable aria-disabled Compass Button discloses a lock/status on hover,
  focus and tap; Escape dismisses it. Its small static status adapter avoids
  adding a React tooltip runtime to every exported document.
- Short silent loops reveal one Compass play/pause icon on hover, tap or focus.
  Long films reveal play/pause, Compass slider, mute and fullscreen on desktop.
  Small coarse-pointer screens show one poster Play button first, away from the
  opening title; its trusted tap starts playback and reveals native controls.
  Long-film source URLs are present with preload="none" and no autoplay, so
  native Play never depends on pointer events reaching page script. Native
  control rows stay outside the Personal description hit target. Media-control
  focus does not open a description. Video 2018 (Telefoni) stays paused on its
  poster until demand and starts muted; its mute and full-screen buttons turn
  the sound on (iPhone uses the video element's own full screen). Actual H.264 decoding requires a supporting browser; tests label the
  existing WebM fixture used for Telefoni UI coverage when H.264 is unavailable.
- Type: Funktional Grotesk uses font-display: block and the Regular/Medium
  faces are preloaded, so no fallback face is ever painted on first load.
- Case media runs edge to edge (no side padding) and stacks with no gap, border
  or radius. Many authored panels have translucent or off-colour outermost
  pixels, so each case medium trims 3 px top/bottom and 2 px each side with
  object-fit: cover (no transforms or clip paths); Hyphae's side-by-side rows
  size columns by aspect ratio so both halves share one height. A browser check
  measures zero gaps and scans every boundary for seam rows.
- Cases start with authored media at the header bottom and retain an accessible
  hidden heading/metadata. Bottom Previous/Back/Next stay inside Work or Personal
  and omit endpoints. Explicit query origin plus a consumed session entry allow
  contextual Back and a proven browser-history return; deep links use the natural
  collection. No raw email is printed on any page; 404 has one Work action.
- Clickable controls use restrained press-only transforms, cancel on gestures,
  and do not scale under reduced motion. Document navigation was checked with a
  page sentinel. SPEC K is skipped: a native 120 ms crossfade rehearsal produced
  "Transition was skipped" errors and unstable click/scroll checks in Chromium.
  Normal document navigation is retained; route palettes are set before first
  paint. No routing hook, animation delay or transition library is introduced.
- `/play` and `/etc` each lead directly to Personal. Case panels stay images;
  semantic text, lightboxes, new cases and Professional content remain deferred.

The pinned kit is consumed through public exports and styles.css only. No
component source is forked. Source-owned CSS supplies composition, image framing,
visibility and the specified accessibility minimums. Professional material,
garden/flower and semantic case text remain excluded.

The browser gate combines the critique checks with the restored ce35959
regressions: aliases, deep-404 skip, no-JS Personal, fixed palettes, navigation
style parity/44 px targets/focus at 320/390/1440 and 200 percent text, cached
image fills, Retry focus and explicit Telefoni playback. Phone film checks
actually advance currentTime after one Play tap, twice on fresh loads under
both motion preferences, then exercise native Play after a paused state.

## Personal carousel draft — November 2–3

Experience surface. Alex chose Compass 1.2.1, seamless gap=0 and the existing
4:3 photo framing. His later decision 24 chooses **Original Tracks** and a
visibly original device treatment. References: the incumbent Personal cards
and this document (retain composition); the reviewed kit HANDOFF (gesture and
native fallback contract); the working lab (circular navigation and classic
screen); and the November 2 look verdict (original materials, proportions,
type, icons and descriptive title). Anti-reference: another custom swipe engine
with features layered over the accepted cards.

The kit owns swipe, motion, keyboard navigation, end resistance and selection.
A small Info button replaces the full-frame description hit target. Descriptions
and video controls retain their coordinated lift. Dots are visual indicators,
as on the incumbent page; full 44px Prev/Next controls, keyboard and native swipe
provide navigation. The exact reviewed TGZ stays unmodified.

Each gallery preserves the kit's actual server markup as a native scroll list.
Its own React root hydrates those nodes in place when visible, keeping a native
selection made before enhancement. This avoids measuring offscreen carousels.
No custom drag physics or recreated kit markup is introduced. JS-enabled cards
reserve their 4:3 geometry and use automatic render containment; no-JS lists
remain ordinary native scrollers. The page bootstrap must stay when combining
with the Lighthouse branch's static-controller work.

Original Tracks opens a same-origin player only after a tap, without autoplay.
The initial preview matches the 4:3 grid; opening uses 520px height on phones,
up to 620px on desktop. Close unloads the frame. public/beats/tracks.json is the
catalog: three owner recordings now, later 6–10 through data/assets and rebuild,
without React changes. Without JS, native audio controls and direct open/download
links replace the inactive preview. No player code/audio is loaded initially.

The original device is 520×600, flat charcoal, with a 280px ring, 120px centre,
transport row below, neutral LCD and system monospace. There is no chrome,
reflection, fake battery or Chicago-style bitmap face. The icon is an original
waveform in SVG and PNG. New cover tiles use DejaVu Sans with its licence;
music/covers remain outside upstream MIT under owner permission. Current local
notices/inventories describe shipped assets; original lab inputs are preserved
outside the export and the live lab is unchanged.

Review findings and revisions: (1) the full-frame description target intercepted
swipes, replaced with Info; (2) a 4:3 open player made controls too small, so it
expands on tap; (3) site-wide minimum button sizing clipped the kit's dots,
restored to native pitch and centred; (4) the initial 620px phone opening was
too empty, reduced to 520px; (5) stable native video URLs survive enhancement;
(6) no-JS direct audio files cover browsers with unusable inline controls.
Performance review removed offscreen measurements and dense interactive dots;
the opener's accessible name includes its visible track count.

Matrix: Chromium/WebKit, 393/1440, light/dark system preferences (Personal's
approved palette remains light), reduced motion, no JS, native scroll handover,
swipe and play clips. Linux WebKit is not physical iPhone Safari; Alex's visual
acceptance and real-device playback remain separate.

RC2-01: native frame focus before enhancement, region focus afterward. RC2-02:
controls stay hidden until enhancement, with a scripting:none hide. RC2-03:
Content and mapped slides remain direct children, no Fragments. RC2-04: Linux
WebKit coverage, real Safari acceptance still separate. RC2-05: reviewed core
4.07KB gzip JS + 1.02KB CSS (5.1KB combined versus original ~4KB target), recorded
without a package fork or new dependency.
