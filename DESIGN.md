# Portfolio design

Alex's approved October 28 critique spec owns this refinement of the October 27
image-led portfolio: Funktional Grotesk,
large original imagery, grayscale UI, borderless surfaces and 5 px corners.
The supplied case-study image panels retain their content.

- Palettes are fixed: Personal is light; every other page is dark. No appearance
  switch, system-following mode or preference storage. This is Alex's explicit
  portfolio exception to the general design-system appearance policy.
- Work: Molekule Go, Ping, Hyphae Light, Luma; name-only captions without
  underlines at rest or on hover and one quiet Personal action. No footer email.
- Personal: the verified 16-entry allowlist, existing Folio/Niche case links,
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
  Long films reveal play/pause, Compass slider, mute and fullscreen on desktop;
  small coarse-pointer screens use native controls. Telefoni
  stays on its poster with no source attachment until Play.
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
