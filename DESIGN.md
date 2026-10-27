# Portfolio design

Alex's October 27 refresh decisions own this implementation. This is an
image-led portfolio: black by default, Funktional Grotesk, large original
imagery, neutral controls and 5 px corners. The case image panels retain their
content; the surrounding interface uses the pinned Compass package and tokens.

- Work: Molekule Go, Ping, Hyphae Light, Luma; names only; Personal action and email.
- Personal: the verified 16-entry allowlist, existing case links, manual stable
  galleries, AND filters, inverse palette. Unknown years are omitted from dates.
- Info: the approved Brooklyn introduction, email, artwork, Light/Dark/System.
- Navigation: Work, Personal, disabled Professional, Info; saved site theme toggle.
- Cases/404/redirect fallbacks: shared Compass shell, type, spacing, focus and buttons.
- Media controls reveal on hover, touch or focus; one Compass play/pause icon,
  with previous/next icons for multi-image galleries. Reduced motion starts still.

All kit consumption goes through public exports and `styles.css`; no component
source is forked. `alex-tokens.css` comes from the approved Compass portfolio,
with local font URLs and swap loading. CSS outside the kit supplies composition,
intrinsic media framing, visibility and the explicit accessibility minimums.
Professional data, garden/flower and semantic case text are excluded.
