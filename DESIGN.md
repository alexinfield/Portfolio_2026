# Portfolio design

Alex's October 27 decisions own this image-led portfolio: Funktional Grotesk,
large original imagery, grayscale UI, borderless surfaces and 5 px corners.
The supplied case-study image panels retain their content.

- Palettes are fixed: Personal is light; every other page is dark. No appearance
  switch, system-following mode or preference storage. This is Alex's explicit
  portfolio exception to the general design-system appearance policy.
- Work: Molekule Go, Ping, Hyphae Light, Luma; name-only captions without
  underlines at rest or on hover, one quiet Personal action, footer email.
- Personal: the verified 16-entry allowlist, existing Folio/Niche case links,
  manual galleries and AND filters. Uniform 4:3 frames; per-entry positions and
  matching-background padding preserve complete objects where needed.
- Info: the approved Brooklyn introduction, email beneath it and existing artwork.
  No footer email, appearance control or résumé link.
- Navigation uses the same Compass component, size, padding, weight and selected
  fill for Work, Personal and Info; Professional remains disabled and empty.
- Short silent loops reveal one Compass play/pause icon on hover, tap or focus.
  Long films reveal play/pause, Compass slider, mute and fullscreen. Telefoni
  stays on its poster with no source attachment until Play.
- Cases, 404 and redirect fallbacks share the Compass shell, type, spacing,
  focus, buttons and footer. `/play` and `/etc` each lead directly to Personal.

The pinned kit is consumed through public exports and styles.css only. No
component source is forked. Source-owned CSS supplies composition, image framing,
visibility and the specified accessibility minimums. Professional material,
garden/flower and semantic case text remain excluded.
